// ============================================================
// SCREEN: Order Tracking (Realistic UI)
// ============================================================
// Real-time order status with progress timeline + rider info
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@hooks/useTheme';
import { typography, spacing, borderRadius, shadows } from '@theme/index';
import { Icon, Button } from '@components/index';
import { ORDER_STEPS } from '@services/mockData';
import { useSocketStore } from '@store/index';
import { scheduleLocalNotification } from '../../services/notificationManager';

const TimelineIcon = ({ 
  isCompleted, 
  isCurrent, 
  icon, 
  colors 
}: { 
  isCompleted: boolean; 
  isCurrent: boolean; 
  icon: string; 
  colors: any; 
}) => {
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isCurrent) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, {
            toValue: 1.18,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulse, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulse.setValue(1);
    }
  }, [isCurrent]);

  return (
    <Animated.View
      style={[
        styles.timelineIconWrap,
        {
          backgroundColor: isCompleted || isCurrent ? colors.primary : colors.surfaceAlt,
          borderColor: isCompleted || isCurrent ? colors.primary : colors.border,
          transform: [{ scale: pulse }],
        },
      ]}
    >
      {isCompleted ? (
        <Icon name="check" set="feather" size={14} color="#FFFFFF" />
      ) : (
        <Icon
          name={icon}
          set="material"
          size={16}
          color={isCurrent ? '#FFFFFF' : colors.textTertiary}
        />
      )}
    </Animated.View>
  );
};

const PICKUP_STEPS = [
  { id: 0, title: 'Order Placed', description: 'Restaurant has received your order', icon: 'receipt' },
  { id: 1, title: 'Preparing', description: 'Restaurant is preparing your food', icon: 'chef-hat' },
  { id: 2, title: 'Ready for Pickup', description: 'Your food is hot and ready for collection!', icon: 'shopping-bag' },
  { id: 3, title: 'Picked Up', description: 'You have collected your order in person. Enjoy!', icon: 'check-circle' },
];

const GIFT_STEPS = [
  { id: 0, title: 'Gift Order Placed', description: 'Your gift meal order has been received 🎁', icon: 'receipt' },
  { id: 1, title: 'Preparing with Love', description: 'The restaurant is preparing a special meal 💕', icon: 'chef-hat' },
  { id: 2, title: 'Gift Wrapped', description: 'Your gift has been beautifully packaged 🎀', icon: 'gift-outline' },
  { id: 3, title: 'On the Way', description: 'A rider is delivering the surprise to your recipient', icon: 'motorbike' },
  { id: 4, title: 'Gift Delivered!', description: 'Your gift has been delivered! 🎉', icon: 'check-circle' },
];

interface OrderTrackingScreenProps {
  route: any;
  navigation: any;
}

export const OrderTrackingScreen: React.FC<OrderTrackingScreenProps> = ({
  route,
  navigation,
}) => {
  const { colors, isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const isPickup = route.params?.orderType === 'PICKUP';
  const isGift = route.params?.orderType === 'GIFT';
  const steps = isGift ? GIFT_STEPS : isPickup ? PICKUP_STEPS : ORDER_STEPS;
  const accentColor = isGift ? '#E91E63' : colors.foodOrange;

  const getStepIndex = (statusStr: string) => {
    const s = (statusStr || '').toUpperCase();
    switch (s) {
      case 'PLACED': return 0;
      case 'PREPARING': return 1;
      case 'READY': return 1;
      case 'PICKED_UP': return 2;
      case 'DELIVERED': return 3;
      default: return 0;
    }
  };

  // Listen to order progress updates from backend WebSockets
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let isMounted = true;
    let pollInterval: NodeJS.Timeout | null = null;

    // Connect to WebSocket updates
    unsubscribe = useSocketStore.getState().subscribe('ORDER_STATUS_UPDATE', (payload) => {
      const orderData = payload.data;
      const targetOrderId = route.params?.orderId;
      console.log('OrderTrackingScreen received WebSocket status update:', orderData);
      
      if (isMounted && orderData && String(orderData.id) === String(targetOrderId)) {
        setCurrentStep((prevStep) => {
          const newStep = getStepIndex(orderData.status);
          if (newStep !== prevStep) {
            scheduleLocalNotification(
              'GoBite Order Status',
              `Your order from ${route.params?.restaurantName || 'GoBite Restaurant'} is now: ${steps[newStep]?.title || orderData.status}`,
              { orderId: orderData.id, status: orderData.status }
            );
          }
          return newStep;
        });
      }
    });

    // Offline mock fallback mode loop or Periodic HTTP Polling backup
    let fallbackTimer: NodeJS.Timeout;
    const targetOrderId = route.params?.orderId;
    const isMockOrder = !targetOrderId || 
                        String(targetOrderId).startsWith('ORD') || 
                        String(targetOrderId).startsWith('GFT');
    
    if (isMockOrder) {
      console.log('Running in offline mock mode order tracking fallback loop.');
      const runOfflineLoop = () => {
        fallbackTimer = setTimeout(() => {
          setCurrentStep((prev) => {
            if (prev < steps.length - 1) {
              const nextStep = prev + 1;
              scheduleLocalNotification(
                'GoBite Order Status (Offline)',
                `Your order from ${route.params?.restaurantName || 'GoBite Restaurant'} is now: ${steps[nextStep]?.title}`,
                { orderId: 'ORD001', status: steps[nextStep]?.title }
              );
              runOfflineLoop();
              return nextStep;
            }
            return prev;
          });
        }, 3500);
      };
      runOfflineLoop();
    } else {
      // Backend HTTP polling backup every 3s
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/orders/${targetOrderId}`);
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data && json.data.status) {
              const newStep = getStepIndex(json.data.status);
              setCurrentStep((prev) => (newStep > prev ? newStep : prev));
            }
          }
        } catch (e) {
          // Silent fallback
        }
      }, 3000);
    }

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
      if (fallbackTimer) clearTimeout(fallbackTimer);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [route.params?.orderId]);

  const step = steps[currentStep];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ===== Header ===== */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.navigate('Food')} style={styles.headerBtn}>
          <Icon name="chevron-left" set="feather" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={{ alignItems: 'center' }}>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Order Tracking</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textTertiary }]}>#{route.params?.orderId ?? 'ORD001'}</Text>
        </View>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ===== Status Banner ===== */}
        <View style={styles.statusBannerContainer}>
          <LinearGradient
            colors={isGift ? ['#E91E63', '#C2185B'] : [colors.foodOrange, '#F7931E']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.statusBanner}
          >
            <View style={styles.statusIconWrap}>
              <Icon name={isGift ? 'gift' : step.icon} set={isGift ? 'feather' : 'material'} size={32} color="#FFFFFF" />
            </View>
            <View style={styles.statusTextWrap}>
              <Text style={styles.statusLabel}>{isGift ? 'GIFT STATUS' : 'CURRENT STATUS'}</Text>
              <Text style={styles.statusTitle}>{step.title}</Text>
              <Text style={styles.statusDesc}>{step.description}</Text>
            </View>
          </LinearGradient>
        </View>

        {/* ===== ETA Card ===== */}
        <View style={[
          styles.etaCard, 
          { 
            backgroundColor: colors.surface,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            borderWidth: 1.5,
          }, 
          shadows.small
        ]}>
          <View style={styles.etaItem}>
            <Icon name="clock-time-four" set="material" size={20} color={accentColor} />
            <Text style={[styles.etaLabel, { color: colors.textTertiary }]}>{isGift ? 'EST. ARRIVAL' : isPickup ? 'EST. READY' : 'EST. DELIVERY'}</Text>
            <Text style={[styles.etaValue, { color: colors.textPrimary }]}>25-30 min</Text>
          </View>
          <View style={[styles.etaDivider, { backgroundColor: colors.border }]} />
          <View style={styles.etaItem}>
            <Icon name="map-marker-distance" set="material" size={20} color={colors.primary} />
            <Text style={[styles.etaLabel, { color: colors.textTertiary }]}>DISTANCE</Text>
            <Text style={[styles.etaValue, { color: colors.textPrimary }]}>{isPickup ? '0.8 km' : '3.2 km'}</Text>
          </View>
          <View style={[styles.etaDivider, { backgroundColor: colors.border }]} />
          <View style={styles.etaItem}>
            <Icon name="cash-multiple" set="material" size={20} color={colors.textPrimary} />
            <Text style={[styles.etaLabel, { color: colors.textTertiary }]}>TOTAL PAID</Text>
            <Text style={[styles.etaValue, { color: colors.textPrimary }]}>
              {route.params?.totalPrice ? `GH₵${route.params.totalPrice.toFixed(2)}` : 'GH₵107'}
            </Text>
          </View>
        </View>

        {/* ===== Progress Timeline ===== */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>ORDER PROGRESS</Text>
        <View style={[
          styles.timelineCard, 
          { 
            backgroundColor: colors.surface,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            borderWidth: 1.5,
          }
        ]}>
          {steps.map((orderStep, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isLast = index === steps.length - 1;
            return (
              <View key={orderStep.id} style={[styles.timelineItem, isLast && { marginBottom: 0 }]}>
                {/* Left: Icon + connecting line */}
                <View style={styles.timelineLeft}>
                  <TimelineIcon
                    isCompleted={isCompleted}
                    isCurrent={isCurrent}
                    icon={orderStep.icon}
                    colors={colors}
                  />
                  {!isLast && (
                    <View
                      style={[
                        styles.timelineLine,
                        {
                          backgroundColor: isCompleted ? colors.primary : colors.border,
                        },
                      ]}
                    />
                  )}
                </View>
                {/* Right: Text */}
                <View style={styles.timelineText}>
                  <Text
                    style={[
                      styles.timelineTitle,
                      {
                        color: isCompleted || isCurrent ? colors.textPrimary : colors.textTertiary,
                        fontWeight: isCurrent ? '700' : '500',
                      },
                    ]}
                  >
                    {orderStep.title}
                  </Text>
                  <Text style={[styles.timelineDesc, { color: colors.textTertiary }]}>
                    {orderStep.description}
                  </Text>
                  {isCurrent && (
                    <View style={[styles.inProgressBadge, { backgroundColor: colors.primaryLight }]}>
                      <View style={styles.pulseDot} />
                      <Text style={[styles.inProgressText, { color: colors.primary }]}>In progress</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* ===== Rider Info (only when on the way and NOT pickup) ===== */}
        {!isPickup && currentStep >= 2 && (
          <View style={[styles.riderCard, { backgroundColor: colors.surface }, shadows.small]}>
            <View style={styles.riderInfo}>
              <View style={[styles.riderAvatar, { backgroundColor: colors.foodOrangeLight }]}>
                <Text style={[styles.riderInitials, { color: colors.foodOrange }]}>KO</Text>
              </View>
              <View>
                <Text style={[styles.riderName, { color: colors.textPrimary }]}>Kwabena Osei</Text>
                <View style={styles.riderMetaRow}>
                  <Icon name="star" set="material" size={12} color={colors.foodOrange} />
                  <Text style={[styles.riderMeta, { color: colors.textSecondary }]}>4.8 • Motorbike</Text>
                </View>
              </View>
            </View>
            <View style={styles.riderActions}>
              <TouchableOpacity style={[styles.riderAction, { backgroundColor: colors.surfaceAlt }]}>
                <Icon name="message-circle" set="feather" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.riderAction, { backgroundColor: colors.primary }]}>
                <Icon name="phone" set="feather" size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ===== Gift Recipient Card (only for gift orders) ===== */}
        {isGift && (
          <>
            <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>🎁 GIFT RECIPIENT</Text>
            <View style={[styles.giftRecipientCard, { backgroundColor: colors.surface }, shadows.small]}>
              <View style={styles.giftRecipientRow}>
                <View style={[styles.giftRecipientAvatar, { backgroundColor: 'rgba(233,30,99,0.12)' }]}>
                  <Icon name="gift" set="feather" size={20} color="#E91E63" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.giftRecipientName, { color: colors.textPrimary }]}>
                    {route.params?.giftRecipient ?? 'Your Friend'}
                  </Text>
                  <Text style={[styles.giftRecipientSub, { color: colors.textTertiary }]}>Receiving a surprise meal 🎉</Text>
                </View>
              </View>
              {route.params?.giftMessage ? (
                <View style={[styles.giftMessageBubble, { backgroundColor: 'rgba(233,30,99,0.08)' }]}>
                  <Icon name="heart" set="feather" size={14} color="#E91E63" />
                  <Text style={[styles.giftMessageText, { color: colors.textPrimary }]}>
                    "{route.params.giftMessage}"
                  </Text>
                </View>
              ) : null}
            </View>
          </>
        )}

        {/* ===== Delivery Address / Pickup Location ===== */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>
          {isGift ? 'DELIVERING TO' : isPickup ? 'PICKUP FROM' : 'DELIVERING TO'}
        </Text>
        <View style={[styles.addressCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.addressIcon, { backgroundColor: isGift ? 'rgba(233,30,99,0.12)' : colors.primaryLight }]}>
            <Icon name={isPickup ? "shopping-bag" : "map-pin"} set="feather" size={18} color={isGift ? '#E91E63' : colors.primary} />
          </View>
          <View style={styles.addressInfo}>
            <Text style={[styles.addressLabel, { color: colors.textTertiary }]}>
              {isGift ? 'RECIPIENT' : isPickup ? 'RESTAURANT' : 'HOME'}
            </Text>
            <Text style={[styles.addressText, { color: colors.textPrimary }]}>
              {isGift
                ? (route.params?.giftRecipient ?? 'Gift Recipient')
                : isPickup
                  ? (route.params?.restaurantName ?? 'Papaye Fast Foods')
                  : 'East Legon, Oxford Street'}
            </Text>
            <Text style={[styles.addressMeta, { color: colors.textTertiary }]}>
              {isGift
                ? 'Gift delivery in progress 🎁'
                : isPickup
                  ? 'Spintex Road, Accra (In-Person Collection)'
                  : 'Hse No. 12, near Accra Mall'}
            </Text>
          </View>
        </View>

        {/* ===== Order Complete Celebration Banner ===== */}
        {currentStep === steps.length - 1 && (
          <View style={[styles.completedCard, { backgroundColor: colors.primaryLight, borderColor: colors.primary, borderWidth: 1.5 }]}>
            <Icon name="check-circle" set="feather" size={32} color={colors.primary} />
            <Text style={[styles.completedTitle, { color: colors.textPrimary }]}>
              {isPickup ? 'Order Picked Up! 🎉' : 'Order Delivered! 🎉'}
            </Text>
            <Text style={[styles.completedDesc, { color: colors.textSecondary }]}>
              {isPickup ? 'Thank you for collecting your meal. Enjoy!' : 'Your food has arrived. Thank you for using GoBite!'}
            </Text>
            <TouchableOpacity
              style={[styles.completedBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('Food')}
              activeOpacity={0.9}
            >
              <Text style={styles.completedBtnText}>Back to GoBite</Text>
              <Icon name="arrow-right" set="feather" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.base, paddingVertical: 8, borderBottomWidth: 1,
  },
  headerBtn: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: typography.size.md, fontWeight: '700' },
  headerSubtitle: { fontSize: typography.size.sm, marginTop: 1 },
  scrollContent: { padding: spacing.base },

  // Status banner
  statusBannerContainer: { marginBottom: spacing.lg },
  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 16,
    borderRadius: borderRadius.xl, padding: spacing.xl,
  },
  statusIconWrap: {
    width: 56, height: 56, borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  statusTextWrap: { flex: 1 },
  statusLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  statusTitle: { color: '#FFFFFF', fontSize: typography.size.xl, fontWeight: '800', marginTop: 2 },
  statusDesc: { color: 'rgba(255,255,255,0.85)', fontSize: typography.size.sm, marginTop: 2 },

  // ETA card
  etaCard: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg,
  },
  etaItem: { flex: 1, alignItems: 'center', gap: 4 },
  etaDivider: { width: 1, height: 36 },
  etaLabel: { fontSize: 9, fontWeight: '600', letterSpacing: 0.5 },
  etaValue: { fontSize: typography.size.md, fontWeight: '700' },

  // Section label
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: spacing.md },

  // Timeline
  timelineCard: { borderRadius: borderRadius.lg, padding: spacing.lg },
  timelineItem: { flexDirection: 'row', marginBottom: 20 },
  timelineLeft: { alignItems: 'center', marginRight: spacing.md },
  timelineIconWrap: {
    width: 32, height: 32, borderRadius: 9999,
    borderWidth: 2, alignItems: 'center', justifyContent: 'center',
  },
  timelineLine: { width: 2, flex: 1, marginTop: 4, minHeight: 20 },
  timelineText: { flex: 1, paddingBottom: 4 },
  timelineTitle: { fontSize: typography.size.md },
  timelineDesc: { fontSize: typography.size.sm, marginTop: 2 },
  inProgressBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: borderRadius.full, marginTop: 8 },
  pulseDot: { width: 6, height: 6, borderRadius: 9999, backgroundColor: '#00B14F' },
  inProgressText: { fontSize: 11, fontWeight: '600' },

  // Rider
  riderCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg,
  },
  riderInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  riderAvatar: { width: 44, height: 44, borderRadius: 9999, alignItems: 'center', justifyContent: 'center' },
  riderInitials: { fontSize: typography.size.md, fontWeight: '700' },
  riderName: { fontSize: typography.size.md, fontWeight: '600' },
  riderMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  riderMeta: { fontSize: typography.size.sm },
  riderActions: { flexDirection: 'row', gap: 8 },
  riderAction: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },

  // Address
  addressCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md, borderRadius: borderRadius.lg },
  addressIcon: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  addressInfo: { flex: 1 },
  addressLabel: { fontSize: 10, letterSpacing: 0.8, fontWeight: '600' },
  addressText: { fontSize: typography.size.md, fontWeight: '600', marginTop: 2 },
  addressMeta: { fontSize: typography.size.sm, marginTop: 2 },

  // Gift recipient card
  giftRecipientCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  giftRecipientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  giftRecipientAvatar: {
    width: 44,
    height: 44,
    borderRadius: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  giftRecipientName: { fontSize: typography.size.md, fontWeight: '700' },
  giftRecipientSub: { fontSize: typography.size.sm, marginTop: 2 },
  giftMessageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: borderRadius.md,
  },
  giftMessageText: {
    flex: 1,
    fontSize: typography.size.sm,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  completedCard: {
    marginTop: spacing.lg,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  completedTitle: {
    fontSize: typography.size.xl,
    fontWeight: '800',
    marginTop: spacing.sm,
  },
  completedDesc: {
    fontSize: typography.size.sm,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: spacing.md,
  },
  completedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: borderRadius.lg,
  },
  completedBtnText: {
    color: '#FFFFFF',
    fontSize: typography.size.md,
    fontWeight: '800',
  },
});
