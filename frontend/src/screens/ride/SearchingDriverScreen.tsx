// ============================================================
// SCREEN: Searching for Driver (Realistic UI)
// ============================================================
// Animated searching state with pulsing radar effect
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/useTheme';
import { typography, spacing, borderRadius, shadows, DARK_MAP_STYLE } from '@theme/index';
import { Icon, Button } from '@components/index';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { useSocketStore } from '@store/index';
import { API_BASE_URL, fetchWithAuth } from '../../services/apiConfig';
import { scheduleLocalNotification } from '../../services/notificationManager';

interface SearchingDriverScreenProps {
  route: any;
  navigation: any;
}

export const SearchingDriverScreen: React.FC<SearchingDriverScreenProps> = ({
  route,
  navigation,
}) => {
  const { colors, isDark } = useTheme();
  const params = route.params || { 
    pickup: 'Accra Mall', 
    destination: 'Kotoka Airport', 
    rideType: 'Standard', 
    price: 25,
    pickupCoords: { latitude: 5.6037, longitude: -0.1870 },
    destinationCoords: { latitude: 5.6150, longitude: -0.1700 }
  };

  // Pulse & spin animations
  const pulseAnim = useRef(new Animated.Value(0)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;

  // Nearby mock cars that fade in/out during searching
  const driver1Opacity = useRef(new Animated.Value(0)).current;
  const driver2Opacity = useRef(new Animated.Value(0)).current;

  // Touch spring animations
  const cancelBtnScale = useRef(new Animated.Value(1)).current;
  const closeBtnScale = useRef(new Animated.Value(1)).current;

  const [rideId, setRideId] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  const animateScale = (val: Animated.Value, toVal: number) => {
    Animated.spring(val, {
      toValue: toVal,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };

  const handleCancelRequest = async () => {
    setCancelling(true);
    
    // Clear local mock timer if it exists
    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
    }

    const currentRideId = rideId || params.rideId;
    if (currentRideId && currentRideId !== 9999) {
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/rides/${currentRideId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'CANCELLED'
          })
        });
        if (response.ok) {
          console.log('Ride request cancelled on backend successfully');
        }
      } catch (err) {
        console.warn('Failed to cancel ride on backend (offline fallback):', err);
      }
    }

    setCancelling(false);
    navigation.goBack();
  };

  useEffect(() => {
    // Pulse loop (Native Driver optimized)
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1, duration: 1500, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();

    // Spin loop (searching - Native Driver optimized)
    Animated.loop(
      Animated.timing(spinAnim, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true })
    ).start();

    // Driver markers animations
    Animated.sequence([
      Animated.delay(1000),
      Animated.timing(driver1Opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.delay(1200),
      Animated.timing(driver1Opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.delay(2400),
      Animated.timing(driver2Opacity, { toValue: 1, duration: 600, useNativeDriver: true }),
    ]).start();

    let unsubscribe: (() => void) | null = null;
    let isMounted = true;

    let pollInterval: NodeJS.Timeout | null = null;

    // Connect to WebSocket room updates
    unsubscribe = useSocketStore.getState().subscribe('RIDE_STATUS_UPDATE', (payload) => {
      const rideData = payload.data;
      console.log('SearchingScreen received WebSocket status update:', rideData);
      
      if (isMounted && rideData && (rideData.status === 'ACCEPTED' || rideData.status === 'ARRIVING' || rideData.status === 'IN_PROGRESS')) {
        if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
        if (pollInterval) clearInterval(pollInterval);
        
        // Dispatch local OS push banner
        scheduleLocalNotification(
          'GoRide Booked!',
          `${rideData.driverName || 'Kwame Asante'} has accepted your ride request and is heading your way.`,
          { rideId: rideData.id, status: 'ACCEPTED' }
        );

        navigation.navigate('RideInProgress', {
          rideId: rideData.id,
          rideType: params.rideType,
          price: params.fare || params.price,
          driverName: rideData.driverName || 'Kwame Asante',
          pickup: rideData.pickupAddress || params.pickup,
          destination: rideData.destinationAddress || params.destination,
          pickupCoords: {
            latitude: rideData.pickupLatitude || params.pickupCoords?.latitude || 5.6037,
            longitude: rideData.pickupLongitude || params.pickupCoords?.longitude || -0.1870
          },
          destinationCoords: {
            latitude: rideData.destLatitude || params.destinationCoords?.latitude || 5.6150,
            longitude: rideData.destLongitude || params.destinationCoords?.longitude || -0.1700
          }
        });
      }
    });

    // Fire HTTP POST request to backend API to request a ride
    const bookRideOnBackend = async () => {
      const typeMap: Record<string, string> = {
        'GoPool': 'GO_POOL',
        'Standard': 'GO_STANDARD',
        'Premium': 'GO_PREMIUM'
      };
      
      const backendType = typeMap[params.rideType] || 'GO_STANDARD';
      
      try {
        const response = await fetchWithAuth(`${API_BASE_URL}/rides`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            rideType: backendType,
            fare: params.price,
            pickupAddress: params.pickup,
            pickupLatitude: params.pickupCoords?.latitude || 5.6037,
            pickupLongitude: params.pickupCoords?.longitude || -0.1870,
            destinationAddress: params.destination,
            destLatitude: params.destinationCoords?.latitude || 5.6150,
            destLongitude: params.destinationCoords?.longitude || -0.1700,
            distanceKm: 3.2,
            estimatedDurationMin: 10
          })
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const json = await response.json();
        console.log('Backend ride booking initiated successfully:', json);
        const bookedId = (json.success && json.data) ? json.data.id : 9999;
        if (json.success && json.data) {
          setRideId(json.data.id);
        }

        // Demo Simulation Auto-Accept Timer (after 4s auto-accepts & opens RideInProgress)
        fallbackTimerRef.current = setTimeout(() => {
          if (isMounted) {
            scheduleLocalNotification(
              'GoRide Driver Found!',
              'Kwame Asante (GW-4921-23) has accepted your ride request and is en route.',
              { rideId: bookedId, status: 'ACCEPTED' }
            );

            navigation.navigate('RideInProgress', {
              rideId: bookedId,
              rideType: params.rideType,
              price: params.price,
              driverName: 'Kwame Asante',
              vehicleModel: 'Toyota Vitz • Silver',
              licensePlate: 'GW-4921-23',
              pickup: params.pickup,
              destination: params.destination,
              pickupCoords: params.pickupCoords || { latitude: 5.6037, longitude: -0.1870 },
              destinationCoords: params.destinationCoords || { latitude: 5.6150, longitude: -0.1700 }
            });
          }
        }, 4000);
      } catch (err) {
        console.warn('Backend ride booking failed (offline mode). Falling back to mock simulation.', err);
        
        // Offline Fallback local timer
        fallbackTimerRef.current = setTimeout(() => {
          if (isMounted) {
            scheduleLocalNotification(
              'GoRide Driver Found! (Demo)',
              'Kwame Asante (GW-4921-23) has accepted your ride request and is heading your way.',
              { rideId: 9999, status: 'ACCEPTED' }
            );

            navigation.navigate('RideInProgress', {
              rideId: 9999,
              rideType: params.rideType,
              price: params.price,
              driverName: 'Kwame Asante',
              vehicleModel: 'Toyota Vitz • Silver',
              licensePlate: 'GW-4921-23',
              pickup: params.pickup,
              destination: params.destination,
              pickupCoords: params.pickupCoords || { latitude: 5.6037, longitude: -0.1870 },
              destinationCoords: params.destinationCoords || { latitude: 5.6150, longitude: -0.1700 }
            });
          }
        }, 4000);
      }
    };

    bookRideOnBackend();

    return () => {
      isMounted = false;
      if (unsubscribe) unsubscribe();
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, []);

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ===== Map Background ===== */}
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
          <Marker
            coordinate={params.pickupCoords || { latitude: 5.6037, longitude: -0.1870 }}
            title="Pickup"
            description={params.pickup}
          />
          <Marker
            coordinate={params.destinationCoords || { latitude: 5.6150, longitude: -0.1700 }}
            title="Destination"
            description={params.destination}
          />

          {/* Mock nearby driver 1 (offset from pickup) */}
          <Marker
            coordinate={{ 
              latitude: (params.pickupCoords?.latitude || 5.6037) + 0.003, 
              longitude: (params.pickupCoords?.longitude || -0.1870) + 0.004 
            }}
            title="Searching Driver 1"
          >
            <Animated.View style={{ opacity: driver1Opacity, backgroundColor: 'rgba(0, 177, 79, 0.15)', borderRadius: 20, padding: 6, borderWidth: 1, borderColor: colors.primary }}>
              <Icon name="car-sports" set="material" size={16} color={colors.primary} />
            </Animated.View>
          </Marker>

          {/* Mock nearby driver 2 (offset from pickup) */}
          <Marker
            coordinate={{ 
              latitude: (params.pickupCoords?.latitude || 5.6037) - 0.002, 
              longitude: (params.pickupCoords?.longitude || -0.1870) - 0.004 
            }}
            title="Searching Driver 2"
          >
            <Animated.View style={{ opacity: driver2Opacity, backgroundColor: 'rgba(0, 177, 79, 0.15)', borderRadius: 20, padding: 6, borderWidth: 1, borderColor: colors.primary }}>
              <Icon name="car-hatchback" set="material" size={16} color={colors.primary} />
            </Animated.View>
          </Marker>
        </MapView>

        {/* Radar pulse effect */}
        <View style={styles.radarContainer}>
          <Animated.View
            style={[
              styles.radarRing,
              {
                transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.3, 2.5] }) }],
                opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
                borderColor: colors.primary,
                shadowColor: colors.primary,
              },
            ]}
          />
          <Animated.View
            style={[
              styles.radarRing,
              {
                transform: [{ scale: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.1, 2] }) }],
                opacity: pulseAnim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] }),
                borderColor: colors.primary,
                shadowColor: colors.primary,
              },
            ]}
          />
          {/* Center icon */}
          <View style={[styles.radarCenter, { backgroundColor: colors.primary }]}>
            <Animated.View style={{ transform: [{ rotate: spin }] }}>
              <Icon name="radar" set="material" size={28} color="#FFFFFF" />
            </Animated.View>
          </View>
        </View>
      </View>

      {/* ===== Top Info ===== */}
      <View style={styles.topInfoContainer}>
        <TouchableOpacity
          onPressIn={() => animateScale(closeBtnScale, 0.9)}
          onPressOut={() => animateScale(closeBtnScale, 1)}
          onPress={handleCancelRequest}
          disabled={cancelling}
          activeOpacity={0.9}
        >
          <Animated.View style={[
            styles.closeButton,
            {
              backgroundColor: colors.surface,
              transform: [{ scale: closeBtnScale }]
            },
            shadows.small
          ]}>
            <Icon name="x" set="feather" size={20} color={colors.textPrimary} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* ===== Bottom Sheet ===== */}
      <View style={[
        styles.bottomSheet,
        {
          backgroundColor: colors.surface,
          borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          borderWidth: 1.5,
          borderBottomWidth: 0,
        },
        shadows.large
      ]}>
        {/* Status */}
        <View style={styles.statusRow}>
          <View style={styles.searchingIndicator}>
            <Animated.View
              style={[
                styles.searchingDot,
                { backgroundColor: colors.primary, opacity: pulseAnim },
              ]}
            />
            <Text style={[styles.statusText, { color: colors.textPrimary }]}>Finding your driver...</Text>
          </View>
        </View>

        {/* Trip summary */}
        <View style={[styles.tripSummary, { backgroundColor: colors.surfaceAlt }]}>
          {/* Pickup */}
          <View style={styles.tripRow}>
            <View style={styles.tripDotColumn}>
              <View style={[styles.tripDot, { backgroundColor: colors.primary }]} />
              <View style={[styles.tripLine, { backgroundColor: colors.border }]} />
              <Icon name="map-pin" set="feather" size={14} color={colors.foodOrange} />
            </View>
            <View style={styles.tripTextColumn}>
              <Text style={[styles.tripLabel, { color: colors.textTertiary }]}>PICKUP</Text>
              <Text style={[styles.tripText, { color: colors.textPrimary }]} numberOfLines={1}>{params.pickup}</Text>
              <View style={{ height: 8 }} />
              <Text style={[styles.tripLabel, { color: colors.textTertiary }]}>DESTINATION</Text>
              <Text style={[styles.tripText, { color: colors.textPrimary }]} numberOfLines={1}>{params.destination}</Text>
            </View>
          </View>
        </View>

        {/* Ride type */}
        <View style={styles.rideTypeRow}>
          <View style={[styles.rideTypeLeft, { backgroundColor: colors.surfaceAlt }]}>
            <Icon name="car-hatchback" set="material" size={22} color={colors.textPrimary} />
          </View>
          <Text style={[styles.rideTypeName, { color: colors.textPrimary }]}>{params.rideType}</Text>
          <View style={{ flex: 1 }} />
          <Text style={[styles.rideTypePrice, { color: colors.textPrimary }]}>GH₵{params.price}</Text>
        </View>

        {/* Cancel button */}
        <TouchableOpacity 
          onPressIn={() => animateScale(cancelBtnScale, 0.96)}
          onPressOut={() => animateScale(cancelBtnScale, 1)}
          onPress={handleCancelRequest}
          disabled={cancelling}
          activeOpacity={0.95}
        >
          <Animated.View style={[
            styles.cancelButton,
            {
              borderColor: colors.border,
              transform: [{ scale: cancelBtnScale }]
            }
          ]}>
            <Text style={[styles.cancelText, { color: colors.textSecondary }]}>
              {cancelling ? 'Cancelling...' : 'Cancel Request'}
            </Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapArea: { flex: 1, backgroundColor: '#E8EDF0', position: 'relative', overflow: 'hidden' },

  // Radar
  radarContainer: {
    position: 'absolute', top: '30%', left: '35%',
    width: 120, height: 120, marginLeft: -60, marginTop: -60,
    alignItems: 'center', justifyContent: 'center',
  },
  radarRing: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  radarCenter: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    ...shadows.medium,
  },

  // Top
  topInfoContainer: { position: 'absolute', top: 16, left: 20, zIndex: 10 },
  closeButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  // Bottom sheet
  bottomSheet: {
    borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl,
  },
  statusRow: { marginBottom: spacing.lg },
  searchingIndicator: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  searchingDot: { width: 10, height: 10, borderRadius: 5 },
  statusText: { fontSize: typography.size.lg, fontWeight: '700' },

  // Trip summary
  tripSummary: { borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.md },
  tripRow: { flexDirection: 'row' },
  tripDotColumn: { alignItems: 'center', marginRight: spacing.md, paddingTop: 4 },
  tripDot: { width: 10, height: 10, borderRadius: 5 },
  tripLine: { width: 2, height: 32, marginTop: 4, marginBottom: 4 },
  tripTextColumn: { flex: 1 },
  tripLabel: { fontSize: 9, letterSpacing: 0.8, fontWeight: '600' },
  tripText: { fontSize: typography.size.sm, fontWeight: '500', marginTop: 2 },

  // Ride type
  rideTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: spacing.lg },
  rideTypeLeft: { width: 44, height: 44, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  rideTypeName: { fontSize: typography.size.md, fontWeight: '600' },
  rideTypePrice: { fontSize: typography.size.lg, fontWeight: '800' },

  // Cancel
  cancelButton: { alignItems: 'center', paddingVertical: 13, borderRadius: borderRadius.md, borderWidth: 1.5 },
  cancelText: { fontSize: typography.size.md, fontWeight: '600' },
});
