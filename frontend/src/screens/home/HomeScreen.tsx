// ============================================================
// SCREEN: Home (Realistic UI — Vector Icons)
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Image,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/useTheme';
import { typography, spacing, borderRadius, shadows } from '@theme/index';
import { ServiceCard, WalletCard, Icon, ICONS } from '@components/index';
import * as Location from 'expo-location';
import type { TabScreenProps } from '@navigation/types';
import { useUserStore } from '@store/index';

const QuickActionButton = ({ action, colors }: { action: any; colors: any }) => {
  const scaleVal = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleVal, {
      toValue: 0.92,
      useNativeDriver: true,
      tension: 120,
      friction: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleVal, {
      toValue: 1,
      useNativeDriver: true,
      tension: 120,
      friction: 6,
    }).start();
  };

  return (
    <TouchableOpacity
      style={styles.quickAction}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={action.onPress}
      activeOpacity={0.9}
    >
      <Animated.View style={[
        styles.quickActionIcon,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          transform: [{ scale: scaleVal }],
          borderWidth: 1,
          shadowColor: colors.shadowColor || '#000000',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.06,
          shadowRadius: 5,
          elevation: 2,
        }
      ]}>
        <Icon name={action.icon} set={action.iconSet} size={20} color={colors.textPrimary} />
      </Animated.View>
      <Text style={[styles.quickActionText, { color: colors.textSecondary }]}>
        {action.label}
      </Text>
    </TouchableOpacity>
  );
};

export const HomeScreen: React.FC<TabScreenProps<'Home'>> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { name, firstName, initials, balance, isBalanceVisible, setBalanceVisible, avatarUrl } = useUserStore();
  const userName = firstName();
  const walletBalance = balance;

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState(false);

  // Animation values
  const locationPinAnim = useRef(new Animated.Value(1)).current;
  const modalScale = useRef(new Animated.Value(0.85)).current;
  const modalOpacity = useRef(new Animated.Value(0)).current;

  // Pulse effect for location indicator
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(locationPinAnim, {
          toValue: 0.35,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(locationPinAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // Spring transition when PIN verification modal mounts/demounts
  useEffect(() => {
    if (showPinModal) {
      Animated.parallel([
        Animated.spring(modalScale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(modalOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        })
      ]).start();
    } else {
      modalScale.setValue(0.85);
      modalOpacity.setValue(0);
    }
  }, [showPinModal]);

  const handleEyePress = () => {
    if (isBalanceVisible) {
      setBalanceVisible(false);
    } else {
      setPinCode('');
      setPinError(false);
      setShowPinModal(true);
    }
  };

  const handlePinChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setPinCode(numericText);
    
    if (numericText.length === 4) {
      if (numericText === '1234') {
        setBalanceVisible(true);
        setShowPinModal(false);
        setPinError(false);
      } else {
        setPinError(true);
        // Clear pin after a brief error display
        setTimeout(() => {
          setPinCode('');
          setPinError(false);
        }, 1000);
      }
    }
  };

  const [locationName, setLocationName] = useState('Locating...');

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationName('East Legon, Accra');
        return;
      }
      try {
        let location = await Location.getCurrentPositionAsync({});
        let reverse = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (reverse && reverse.length > 0) {
          const place = reverse[0];
          const district = place.district || place.city || place.subregion || '';
          const region = place.region || place.name || '';
          const address = district && region ? `${district}, ${region}` : (place.name || 'Accra, Ghana');
          setLocationName(address);
        } else {
          setLocationName('Accra, Ghana');
        }
      } catch (e) {
        setLocationName('East Legon, Accra');
      }
    })();
  }, []);

  const handleRefreshLocation = async () => {
    setLocationName('Locating...');
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access location was denied.');
      setLocationName('East Legon, Accra');
      return;
    }
    try {
      let location = await Location.getCurrentPositionAsync({});
      let reverse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverse && reverse.length > 0) {
        const place = reverse[0];
        const district = place.district || place.city || place.subregion || '';
        const region = place.region || place.name || '';
        const address = district && region ? `${district}, ${region}` : (place.name || 'Accra, Ghana');
        setLocationName(address);
      } else {
        setLocationName('Accra, Ghana');
      }
    } catch (e) {
      setLocationName('East Legon, Accra');
      Alert.alert('Error', 'Failed to retrieve your live location.');
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ===== Header ===== */}
        <View style={styles.header}>
          {/* ===== Location Pill (Live Location) ===== */}
          <TouchableOpacity 
            style={[styles.locationPill, { backgroundColor: colors.surface }]}
            onPress={handleRefreshLocation}
            activeOpacity={0.7}
          >
            <Animated.View style={{ opacity: locationPinAnim, marginRight: 2, flexDirection: 'row', alignItems: 'center' }}>
              <Icon name="location" set="entypo" size={14} color={colors.primary} />
            </Animated.View>
            <Text style={[styles.locationText, { color: colors.textSecondary }]} numberOfLines={1}>
              {locationName}
            </Text>
            <Icon name="chevron-down" set="feather" size={14} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.avatar, { backgroundColor: colors.primaryLight, overflow: 'hidden' }]}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.8}
          >
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Text style={[styles.avatarText, { color: colors.primary }]}>{initials()}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ===== Greeting ===== */}
        <View style={styles.greetingContainer}>
          <Text style={[styles.greetingLine1, { color: colors.textTertiary }]}>
            Good morning,
          </Text>
          <Text style={[styles.greetingLine2, { color: colors.textPrimary }]}>
            {userName}
          </Text>
        </View>

        {/* ===== Wallet Card ===== */}
        <WalletCard
          balance={walletBalance}
          isBalanceVisible={isBalanceVisible}
          onEyePress={handleEyePress}
          onTopUp={() => (navigation as any).navigate('TopUp')}
          onWithdraw={() => (navigation as any).navigate('Withdraw')}
          onSend={() => (navigation as any).navigate('SendMoney')}
        />

        {/* ===== Services ===== */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Services</Text>
        <View style={styles.servicesContainer}>
          <ServiceCard
            iconName="car-hatchback"
            iconSet="material"
            title="GoRide"
            description="Get a ride • Bid your fare"
            accent="blue"
            onPress={() => navigation.navigate('Ride')}
          />
          <ServiceCard
            iconName="silverware-fork-knife"
            iconSet="material"
            title="GoBite"
            description="Order food • Delivery & Pickup"
            accent="orange"
            onPress={() => navigation.navigate('Food')}
          />
          <ServiceCard
            iconName="wallet-outline"
            iconSet="material"
            title="SuperWallet"
            description="MoMo • Pay everywhere"
            accent="green"
            onPress={() => (navigation as any).navigate('Wallet')}
          />
        </View>

        {/* ===== Quick Actions ===== */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Quick Actions</Text>
        <View style={styles.quickActionsRow}>
          {[
            { 
              icon: 'gift' as const, 
              iconSet: 'feather' as const, 
              label: 'Promos', 
              onPress: () => Alert.alert('Active Promos', 'No active promos at the moment. Keep checking for exciting discounts!') 
            },
            { 
              icon: 'file-text' as const, 
              iconSet: 'feather' as const, 
              label: 'History', 
              onPress: () => (navigation as any).navigate('Transactions') 
            },
            { 
              icon: 'palette' as const, 
              iconSet: 'material' as const, 
              label: 'Themes', 
              onPress: () => navigation.navigate('ThemeSettings') 
            },
            { 
              icon: 'help-circle' as const, 
              iconSet: 'feather' as const, 
              label: 'Support', 
              onPress: () => Alert.alert('GoZone Support', 'Need help? Reach out to us:\n\n📧 support@gozone.com\n📞 +233 24 123 4567') 
            },
          ].map((action) => (
            <QuickActionButton key={action.label} action={action} colors={colors} />
          ))}
        </View>
      </ScrollView>

      {/* ===== PIN verification modal ===== */}
      <Modal
        visible={showPinModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowPinModal(false)}
      >
        <Animated.View style={[
          styles.modalOverlay,
          {
            backgroundColor: isDark ? 'rgba(10, 10, 20, 0.78)' : 'rgba(0, 0, 0, 0.55)',
            opacity: modalOpacity,
          }
        ]}>
          <Animated.View style={[
            styles.modalCard,
            {
              backgroundColor: colors.surface,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              shadowColor: colors.shadowColor,
              transform: [{ scale: modalScale }],
            },
            shadows.medium
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Enter Security PIN</Text>
              <TouchableOpacity onPress={() => setShowPinModal(false)}>
                <Icon name="x" set="feather" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={[styles.lockIconWrap, { backgroundColor: pinError ? 'rgba(239, 68, 68, 0.1)' : colors.primaryLight }]}>
                <Icon name={pinError ? "alert-circle" : "lock"} set="feather" size={28} color={pinError ? "#EF4444" : colors.primary} />
              </View>

              <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
                {pinError ? "Incorrect security PIN. Please try again." : "Type your 4-digit security PIN to reveal your wallet balance."}
              </Text>

              {/* Dots representing entered PIN digits */}
              <View style={styles.pinDotsRow}>
                {[0, 1, 2, 3].map((index) => {
                  const isDigitEntered = pinCode.length > index;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.pinDot,
                        {
                          backgroundColor: pinError 
                            ? '#EF4444' 
                            : isDigitEntered 
                              ? colors.primary 
                              : colors.borderStrong,
                        }
                      ]}
                    />
                  );
                })}
              </View>

              {/* Hidden text input to receive native keyboard input */}
              <TextInput
                style={styles.hiddenInput}
                keyboardType="numeric"
                maxLength={4}
                value={pinCode}
                onChangeText={handlePinChange}
                autoFocus={true}
                caretHidden={true}
              />
              
              <Text style={[styles.pinHint, { color: colors.textTertiary }]}>
                Default development PIN: 1234
              </Text>
            </View>
          </Animated.View>
        </Animated.View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { padding: spacing.xl, paddingBottom: 120 },

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  greetingContainer: {
    marginBottom: spacing.xl,
  },
  greetingLine1: { fontSize: typography.size.sm, fontWeight: '500' },
  greetingLine2: {
    fontSize: typography.size['2xl'],
    fontWeight: '700',
    marginTop: 2,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: typography.size.lg, fontWeight: '700' },

  // Location
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: borderRadius.full,
    alignSelf: 'flex-start',
    ...shadows.small,
    maxWidth: '80%',
  },
  locationText: { 
    fontSize: typography.size.sm, 
    fontWeight: '500',
    flexShrink: 1,
  },

  // Sections
  sectionTitle: {
    fontSize: typography.size.md,
    fontWeight: '700',
    marginBottom: spacing.md,
    marginTop: spacing.xs,
  },
  servicesContainer: { marginBottom: spacing.lg },

  // Quick Actions
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAction: { alignItems: 'center', gap: 6, flex: 1 },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: 11,
    fontWeight: '500',
  },

  // Modal styling
  modalOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  modalCard: { 
    width: '100%', 
    maxWidth: 320, 
    borderRadius: borderRadius.xl, 
    padding: spacing.xl,
    borderWidth: 1.5,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  modalTitle: { fontSize: typography.size.md, fontWeight: '700' },
  modalBody: { alignItems: 'center', marginBottom: spacing.sm },
  lockIconWrap: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  modalDesc: { fontSize: typography.size.sm, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  pinDotsRow: { flexDirection: 'row', gap: 16, marginBottom: spacing.lg, justifyContent: 'center' },
  pinDot: { width: 14, height: 14, borderRadius: 7 },
  hiddenInput: { position: 'absolute', width: 0, height: 0, opacity: 0 },
  pinHint: { fontSize: 11, textAlign: 'center', marginTop: spacing.md }
});
