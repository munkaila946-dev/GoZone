// ============================================================
// SCREEN: Ride In Progress / Tracking (Realistic UI)
// ============================================================
// Driver found, en-route with driver info + trip progress
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/useTheme';
import { typography, spacing, borderRadius, shadows, DARK_MAP_STYLE } from '@theme/index';
import { Icon, Button, type IconSet } from '@components/index';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { useSocketStore } from '@store/index';
import { scheduleLocalNotification } from '../../services/notificationManager';

const RideActionButton = ({
  icon,
  iconSet,
  label,
  color,
  colors,
  onPress
}: {
  icon: string;
  iconSet: IconSet;
  label: string;
  color?: string;
  colors: any;
  onPress: () => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
      useNativeDriver: true,
      tension: 120,
      friction: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 120,
      friction: 6,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={0.9}
      style={{ flex: 1 }}
    >
      <Animated.View style={[
        styles.actionBtn, 
        { 
          backgroundColor: colors.surfaceAlt,
          transform: [{ scale }]
        }
      ]}>
        <Icon name={icon} set={iconSet} size={20} color={color || colors.textPrimary} />
        <Text style={[styles.actionText, { color: colors.textPrimary }]}>{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const RideRatingStarItem = ({
  star,
  rating,
  colors,
  onPress
}: {
  star: number;
  rating: number;
  colors: any;
  onPress: () => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.85,
      useNativeDriver: true,
      tension: 140,
      friction: 5,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 140,
      friction: 5,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={0.9}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <Icon 
          name="star" 
          set="material" 
          size={32} 
          color={star <= rating ? colors.foodOrange : colors.border} 
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

interface RideInProgressScreenProps {
  route: any;
  navigation: any;
}

export const RideInProgressScreen: React.FC<RideInProgressScreenProps> = ({
  route,
  navigation,
}) => {
  const { colors, isDark } = useTheme();
  const params = route.params || { 
    rideId: 9999, 
    rideType: 'Standard', 
    price: 25, 
    driverName: 'Kwame Asante',
    pickup: 'Accra Mall',
    destination: 'Kotoka Airport',
    pickupCoords: { latitude: 5.6037, longitude: -0.1870 },
    destinationCoords: { latitude: 5.6150, longitude: -0.1700 }
  };

  // Ride states: 'arriving' -> 'inProgress' -> 'completed'
  const [rideStage, setRideStage] = useState<'arriving' | 'inProgress' | 'completed'>('arriving');
  const [carCoord, setCarCoord] = useState(params.pickupCoords || { latitude: 5.6037, longitude: -0.1870 });
  const [rating, setRating] = useState(5);

  const backBtnScale = useRef(new Animated.Value(1)).current;
  const gpsBtnScale = useRef(new Animated.Value(1)).current;
  const submitBtnScale = useRef(new Animated.Value(1)).current;

  const animateScale = (val: Animated.Value, toVal: number) => {
    Animated.spring(val, {
      toValue: toVal,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };

  const STAGES = {
    arriving: { title: 'Driver on the way', subtitle: 'Your driver is heading to your pickup location', eta: '3 min away' },
    inProgress: { title: 'On the trip', subtitle: 'Enjoy the ride! Heading to your destination', eta: '12 min to arrival' },
    completed: { title: 'Trip Completed', subtitle: 'You have arrived at your destination', eta: 'Hope you enjoyed your ride!' },
  };

  // Listen to stage updates & location updates from backend WebSockets
  useEffect(() => {
    let unsubscribeStatus: (() => void) | null = null;
    let unsubscribeLocation: (() => void) | null = null;
    let pollInterval: NodeJS.Timeout | null = null;

    if (params.pickupCoords) {
      setCarCoord(params.pickupCoords);
    }

    const processStatus = (statusStr: string) => {
      const status = (statusStr || '').toUpperCase();
      if (status === 'ACCEPTED' || status === 'ARRIVING') {
        setRideStage('arriving');
      } else if (status === 'IN_PROGRESS') {
        setRideStage('inProgress');
      } else if (status === 'COMPLETED') {
        setRideStage('completed');
      }
    };

    // Subscribe to status changes
    unsubscribeStatus = useSocketStore.getState().subscribe('RIDE_STATUS_UPDATE', (payload) => {
      const rideData = payload.data;
      if (rideData && String(rideData.id) === String(params.rideId)) {
        console.log('RideInProgressScreen received status update:', rideData.status);
        processStatus(rideData.status);
      }
    });

    // Subscribe to driver location coordinate updates
    unsubscribeLocation = useSocketStore.getState().subscribe('DRIVER_LOCATION_UPDATE', (payload) => {
      if (String(payload.rideId) === String(params.rideId)) {
        console.log('RideInProgressScreen received driver coordinate update:', payload.latitude, payload.longitude);
        setCarCoord({ latitude: payload.latitude, longitude: payload.longitude });
      }
    });

    // Offline mock fallback mode loop or Backend HTTP polling backup
    let fallbackTimer1: NodeJS.Timeout;
    let fallbackTimer2: NodeJS.Timeout;
    let fallbackAnimFrame: number;
    
    if (params.rideId === 9999) {
      console.log('Running in offline mock mode fallback loop.');
      fallbackTimer1 = setTimeout(() => {
        setRideStage('inProgress');
        scheduleLocalNotification(
          'On the trip (Offline)',
          'Your trip has started. Heading to your destination.',
          { rideId: 9999, status: 'IN_PROGRESS' }
        );
      }, 6000);
      fallbackTimer2 = setTimeout(() => {
        setRideStage('completed');
        scheduleLocalNotification(
          'Trip Completed (Offline)',
          `You have arrived at your destination! GH₵${params.price || '15.00'} has been deducted.`,
          { rideId: 9999, status: 'COMPLETED' }
        );
      }, 12000);

      const startTime = Date.now();
      const duration = 12000;
      const animateFallback = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const startCoords = params.pickupCoords || { latitude: 5.6037, longitude: -0.1870 };
        const endCoords = params.destinationCoords || { latitude: 5.6150, longitude: -0.1700 };

        const currentLat = startCoords.latitude + (endCoords.latitude - startCoords.latitude) * progress;
        const currentLng = startCoords.longitude + (endCoords.longitude - startCoords.longitude) * progress;
        setCarCoord({ latitude: currentLat, longitude: currentLng });

        if (progress < 1) {
          fallbackAnimFrame = requestAnimationFrame(animateFallback);
        }
      };
      animateFallback();
    } else {
      // Backend HTTP polling backup every 2.5s
      pollInterval = setInterval(async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/rides/${params.rideId}`);
          if (res.ok) {
            const json = await res.json();
            if (json.success && json.data && json.data.status) {
              processStatus(json.data.status);
            }
          }
        } catch (err) {
          // Silent fallback
        }
      }, 2500);
    }

    return () => {
      if (unsubscribeStatus) unsubscribeStatus();
      if (unsubscribeLocation) unsubscribeLocation();
      if (fallbackTimer1) clearTimeout(fallbackTimer1);
      if (fallbackTimer2) clearTimeout(fallbackTimer2);
      if (fallbackAnimFrame) cancelAnimationFrame(fallbackAnimFrame);
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [params.rideId]);

  const stage = STAGES[rideStage];
  const isCompleted = rideStage === 'completed';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ===== Map Area ===== */}
      <View style={styles.mapArea}>
        <MapView
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          customMapStyle={isDark ? DARK_MAP_STYLE : undefined}
          initialRegion={{
            latitude: params.pickupCoords?.latitude || 5.6037,
            longitude: params.pickupCoords?.longitude || -0.1870,
            latitudeDelta: 0.03,
            longitudeDelta: 0.03,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
        >
          {/* Destination Marker */}
          <Marker
            coordinate={params.destinationCoords || { latitude: 5.6150, longitude: -0.1700 }}
            title="Destination"
          >
            <View style={styles.destMarker}>
              {isCompleted ? (
                <View style={[styles.completedPin, { backgroundColor: colors.primary }]}>
                  <Icon name="flag" set="feather" size={16} color="#FFFFFF" />
                </View>
              ) : (
                <Icon name="map-pin" set="feather" size={30} color={colors.foodOrange} />
              )}
            </View>
          </Marker>

          {/* Car Marker */}
          <Marker
            coordinate={carCoord}
            title={params.driverName}
            description="Active GoRide Vehicle"
          >
            <View style={[styles.pickupPin, { backgroundColor: colors.primary, borderColor: '#FFFFFF', marginLeft: 0, marginTop: 0 }]} />
          </Marker>
        </MapView>

        {/* Top buttons */}
        <View style={styles.topButtonsRow}>
          <TouchableOpacity
            onPressIn={() => animateScale(backBtnScale, 0.9)}
            onPressOut={() => animateScale(backBtnScale, 1)}
            style={[styles.topButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.navigate('Ride')}
            activeOpacity={0.9}
          >
            <Animated.View style={{ transform: [{ scale: backBtnScale }] }}>
              <Icon name="chevron-left" set="feather" size={22} color={colors.textPrimary} />
            </Animated.View>
          </TouchableOpacity>
          <TouchableOpacity
            onPressIn={() => animateScale(gpsBtnScale, 0.9)}
            onPressOut={() => animateScale(gpsBtnScale, 1)}
            style={[styles.topButton, { backgroundColor: colors.surface }]}
            activeOpacity={0.9}
          >
            <Animated.View style={{ transform: [{ scale: gpsBtnScale }] }}>
              <Icon name="crosshairs-gps" set="material" size={20} color={colors.primary} />
            </Animated.View>
          </TouchableOpacity>
        </View>

        {/* Floating ETA badge */}
        <View style={styles.etaBadgeContainer}>
          <View style={[styles.etaBadge, { backgroundColor: colors.surface }]}>
            <Icon name="clock-time-four" set="material" size={14} color={isCompleted ? colors.primary : colors.textSecondary} />
            <Text style={[styles.etaBadgeText, { color: colors.textPrimary }]}>{stage.eta}</Text>
          </View>
        </View>
      </View>

      {/* ===== Bottom Sheet ===== */}
      <View style={[styles.bottomSheet, { backgroundColor: colors.surface }, shadows.large]}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        {/* Status banner */}
        <View style={styles.statusRow}>
          <View style={[styles.statusIconWrap, { backgroundColor: isCompleted ? colors.primaryLight : colors.foodOrange + '20' }]}>
            <Icon
              name={isCompleted ? 'check-circle' : rideStage === 'arriving' ? 'car-clock' : 'car-connected'}
              set="material"
              size={22}
              color={isCompleted ? colors.primary : colors.foodOrange}
            />
          </View>
          <View style={styles.statusTextWrap}>
            <Text style={[styles.statusTitle, { color: colors.textPrimary }]}>{stage.title}</Text>
            <Text style={[styles.statusSub, { color: colors.textTertiary }]}>{stage.subtitle}</Text>
          </View>
        </View>

        {/* Driver Info Card */}
        {!isCompleted && (
          <View style={[
            styles.driverCard, 
            { 
              backgroundColor: colors.surfaceAlt,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              borderWidth: 1.5,
            }
          ]}>
            <View style={styles.driverInfo}>
              <View style={[styles.driverAvatar, { backgroundColor: colors.primaryLight }]}>
                <Text style={[styles.driverInitials, { color: colors.primary }]}>
                  {params.driverName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                </Text>
              </View>
              <View>
                <Text style={[styles.driverName, { color: colors.textPrimary }]}>{params.driverName}</Text>
                <View style={styles.driverMetaRow}>
                  <Icon name="star" set="material" size={12} color={colors.foodOrange} />
                  <Text style={[styles.driverMeta, { color: colors.textSecondary }]}>4.9 • 1,240 trips</Text>
                </View>
              </View>
            </View>
            <View style={styles.vehicleInfo}>
              <View style={styles.plateNumber}>
                <Text style={[styles.plateText, { color: colors.textPrimary }]}>GR 2847-24</Text>
              </View>
              <Text style={[styles.vehicleMeta, { color: colors.textTertiary }]}>Silver Toyota Corolla</Text>
            </View>
          </View>
        )}

        {/* Trip Progress Bar */}
        {!isCompleted && (
          <View style={[
            styles.progressContainerCard,
            {
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              borderWidth: 1.5,
            }
          ]}>
            <View style={styles.progressLabels}>
              <View style={styles.progressPoint}>
                <View style={[styles.progressDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.progressLabel, { color: colors.textTertiary }]} numberOfLines={1}>PICKUP</Text>
                <Text style={[styles.progressAddress, { color: colors.textPrimary }]} numberOfLines={1}>{params.pickup}</Text>
              </View>
              <View style={styles.progressPoint}>
                <View style={[styles.progressDot, { backgroundColor: rideStage === 'inProgress' ? colors.foodOrange : colors.border }]} />
                <Text style={[styles.progressLabel, { color: colors.textTertiary }]} numberOfLines={1}>DESTINATION</Text>
                <Text style={[styles.progressAddress, { color: colors.textPrimary }]} numberOfLines={1}>{params.destination}</Text>
              </View>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressTrackBg, { backgroundColor: colors.border }]} />
              <AnimatedProgressFill stage={rideStage} color={colors.primary} />
            </View>
          </View>
        )}

        {/* Actions */}
        {!isCompleted ? (
          <View style={styles.actionRow}>
            <RideActionButton
              icon="message-circle"
              iconSet="feather"
              label="Message"
              colors={colors}
              onPress={() => {}}
            />
            <RideActionButton
              icon="phone"
              iconSet="feather"
              label="Call"
              color={colors.primary}
              colors={colors}
              onPress={() => {}}
            />
            <RideActionButton
              icon="shield"
              iconSet="feather"
              label="Safety"
              colors={colors}
              onPress={() => {}}
            />
          </View>
        ) : (
          <View>
            {/* Fare breakdown */}
            <View style={[
              styles.fareCard, 
              { 
                backgroundColor: colors.surfaceAlt,
                borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
                borderWidth: 1.5,
              }
            ]}>
              <View style={styles.fareRow}>
                <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>{params.rideType} Ride</Text>
                <Text style={[styles.fareValue, { color: colors.textPrimary }]}>GH₵{params.price}.00</Text>
              </View>
              <View style={styles.fareRow}>
                <Text style={[styles.fareLabel, { color: colors.textSecondary }]}>Paid via</Text>
                <Text style={[styles.fareValue, { color: colors.primary }]}>SuperWallet ✓</Text>
              </View>
            </View>

            {/* Rate driver */}
            <Text style={[styles.rateTitle, { color: colors.textPrimary }]}>Rate your trip</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <RideRatingStarItem
                  key={star}
                  star={star}
                  rating={rating}
                  colors={colors}
                  onPress={() => setRating(star)}
                />
              ))}
            </View>

            <TouchableOpacity
              onPressIn={() => animateScale(submitBtnScale, 0.96)}
              onPressOut={() => animateScale(submitBtnScale, 1)}
              onPress={() => navigation.navigate('Ride')}
              activeOpacity={0.95}
              style={{ marginTop: spacing.md }}
            >
              <Animated.View style={[
                styles.customSubmitBtn,
                { 
                  backgroundColor: colors.primary,
                  transform: [{ scale: submitBtnScale }]
                }
              ]}>
                <Text style={styles.customSubmitBtnText}>Submit & Done</Text>
                <Icon name="check" set="feather" size={16} color="#FFFFFF" />
              </Animated.View>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

// Animated progress fill component
const AnimatedProgressFill: React.FC<{ stage: string; color: string }> = ({ stage, color }) => {
  const width = stage === 'arriving' ? '10%' : stage === 'inProgress' ? '60%' : '100%';
  return (
    <View style={[StyleSheet.absoluteFill, { borderRadius: 9999 }]}>
      <View style={{ width, height: '100%', backgroundColor: color, borderRadius: 9999 }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapArea: { flex: 1, backgroundColor: '#E8EDF0', position: 'relative', overflow: 'hidden' },
  pickupPin: { width: 16, height: 16, borderRadius: 9999, borderWidth: 3 },
  destMarker: { alignItems: 'center', justifyContent: 'center' },
  completedPin: { width: 32, height: 32, borderRadius: 9999, alignItems: 'center', justifyContent: 'center' },

  // Top buttons
  topButtonsRow: { position: 'absolute', top: 16, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between', zIndex: 10 },
  topButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', ...shadows.small },

  // ETA badge
  etaBadgeContainer: { position: 'absolute', bottom: 16, left: 0, right: 0, alignItems: 'center' },
  etaBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: borderRadius.full, ...shadows.small },
  etaBadgeText: { fontSize: typography.size.sm, fontWeight: '600' },

  // Bottom sheet
  bottomSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.md },

  // Status
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: spacing.lg },
  statusIconWrap: { width: 48, height: 48, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  statusTextWrap: { flex: 1 },
  statusTitle: { fontSize: typography.size.lg, fontWeight: '700' },
  statusSub: { fontSize: typography.size.sm, marginTop: 2 },

  // Driver card
  driverCard: { borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1.5 },
  driverInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  driverAvatar: { width: 44, height: 44, borderRadius: 9999, alignItems: 'center', justifyContent: 'center' },
  driverInitials: { fontSize: typography.size.md, fontWeight: '700' },
  driverName: { fontSize: typography.size.md, fontWeight: '600' },
  driverMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 },
  driverMeta: { fontSize: typography.size.sm },
  vehicleInfo: { alignItems: 'flex-end', position: 'absolute', right: spacing.md, top: spacing.md },
  plateNumber: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.sm, borderWidth: 1.5, borderColor: '#999' },
  plateText: { fontSize: typography.size.sm, fontWeight: '700', letterSpacing: 1 },
  vehicleMeta: { fontSize: 11, marginTop: 4 },

  // Progress
  progressContainer: { marginBottom: spacing.lg },
  progressContainerCard: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1.5,
  },
  progressLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressPoint: { alignItems: 'flex-start', width: '48%' },
  progressDot: { width: 10, height: 10, borderRadius: 9999, marginBottom: 4 },
  progressLabel: { fontSize: 9, fontWeight: '600', letterSpacing: 0.8 },
  progressAddress: { fontSize: typography.size.sm, fontWeight: '500', marginTop: 1 },
  progressTrack: { height: 4, position: 'relative' },
  progressTrackBg: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, borderRadius: 9999 },

  // Actions
  actionRow: { flexDirection: 'row', gap: 8 },
  actionBtn: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: spacing.md, borderRadius: borderRadius.md },
  actionText: { fontSize: typography.size.sm, fontWeight: '500' },

  // Completed
  fareCard: { borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.lg, borderWidth: 1.5 },
  fareRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  fareLabel: { fontSize: typography.size.sm },
  fareValue: { fontSize: typography.size.sm, fontWeight: '600' },
  rateTitle: { fontSize: typography.size.md, fontWeight: '600', textAlign: 'center', marginBottom: spacing.md },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  customSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    width: '100%',
  },
  customSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: typography.size.md,
    fontWeight: '800',
  },
});
