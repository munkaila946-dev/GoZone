// ============================================================
// SCREEN: GoRide Home (Theme Uniform Refined UI)
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/useTheme';
import { typography, spacing, borderRadius, shadows } from '@theme/index';
import { Icon } from '@components/index';
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import type { TabScreenProps } from '@navigation/types';
import { API_BASE_URL } from '@services/apiConfig';

const RIDE_OPTIONS = [
  { id: '1', type: 'GoPool', desc: 'Save 30%', price: 15, eta: 6, icon: 'car-multiple', iconSet: 'material', seats: '1-2' },
  { id: '2', type: 'GoStandard', desc: 'Affordable', price: 25, eta: 3, icon: 'car-hatchback', iconSet: 'material', seats: '4' },
  { id: '3', type: 'GoComfort', desc: 'Extra A/C', price: 35, eta: 5, icon: 'car-sports', iconSet: 'material', seats: '4' },
  { id: '4', type: 'GoBiker', desc: 'Beat traffic', price: 12, eta: 2, icon: 'motorbike', iconSet: 'material', seats: '1' },
] as const;

// Custom dark map styling for dark mode themes
const DARK_MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#1A1A2E" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#1A1A2E" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
  { "featureType": "administrative.country", "elementType": "labels.text.fill", "stylers": [{ "color": "#9e9e9e" }] },
  { "featureType": "administrative.land_parcel", "stylers": [{ "visibility": "off" }] },
  { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#12121F" }] },
  { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#252540" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
  { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#2D2D4B" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#333355" }] },
  { "featureType": "road.highway.controlled_access", "elementType": "geometry", "stylers": [{ "color": "#444466" }] },
  { "featureType": "road.local", "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "featureType": "transit", "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#0D0D1A" }] },
  { "featureType": "water", "elementType": "labels.text.fill", "stylers": [{ "color": "#3d3d3d" }] }
];

// Custom light map styling for light mode themes
const LIGHT_MAP_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#F8F9FA" }] },
  { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#616161" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#FFFFFF" }] },
  { "featureType": "administrative.land_parcel", "elementType": "labels.text.fill", "stylers": [{ "color": "#bdbdbd" }] },
  { "featureType": "poi", "elementType": "geometry", "stylers": [{ "color": "#EEEEEE" }] },
  { "featureType": "poi.park", "elementType": "geometry", "stylers": [{ "color": "#E8F5E9" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#FFFFFF" }] },
  { "featureType": "road.arterial", "elementType": "geometry", "stylers": [{ "color": "#FFFFFF" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#FFE0B2" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#E0F7FA" }] }
];

const GHANA_PLACES = [
  // Accra Suburbs & Landmarks
  { name: 'Accra Mall, Teshie Rd', latitude: 5.6178, longitude: -0.1691 },
  { name: 'Kotoka International Airport (ACC), Airport Rd', latitude: 5.6061, longitude: -0.1681 },
  { name: 'Osu Oxford Street, Osu', latitude: 5.5566, longitude: -0.1740 },
  { name: 'East Legon, Accra', latitude: 5.6322, longitude: -0.1557 },
  { name: 'Cantonments, Accra', latitude: 5.5866, longitude: -0.1722 },
  { name: 'Labadi Beach, Labadi', latitude: 5.5684, longitude: -0.1417 },
  { name: 'University of Ghana, Legon', latitude: 5.6508, longitude: -0.1870 },
  { name: 'Makola Market, Accra Central', latitude: 5.5476, longitude: -0.2070 },
  { name: 'Jubilee House, Kanda', latitude: 5.5786, longitude: -0.1916 },
  { name: 'Tetteh Quarshie Interchange, Accra', latitude: 5.6146, longitude: -0.1788 },
  { name: 'Achimota Retail Centre, Achimota', latitude: 5.6416, longitude: -0.2319 },
  { name: 'West Hills Mall, Weija', latitude: 5.5511, longitude: -0.3276 },
  { name: 'Jamestown Lighthouse, Jamestown', latitude: 5.5325, longitude: -0.2078 },
  { name: 'National Theatre, Accra Central', latitude: 5.5542, longitude: -0.2001 },
  { name: 'Labadi Beach Hotel, Labadi', latitude: 5.5658, longitude: -0.1488 },
  { name: 'Spintex Road, Accra', latitude: 5.6264, longitude: -0.1197 },
  { name: 'Kempinski Hotel Gold Coast City, Accra', latitude: 5.5539, longitude: -0.1983 },
  { name: '37 Military Hospital, Liberation Rd', latitude: 5.5897, longitude: -0.1834 },
  { name: 'Dansoman, Accra', latitude: 5.5520, longitude: -0.2644 },
  { name: 'Madina Market, Madina', latitude: 5.6796, longitude: -0.1691 },

  // Kumasi
  { name: 'Kumasi City Mall, Kumasi', latitude: 6.6908, longitude: -1.6111 },
  { name: 'KNUST Campus, Kumasi', latitude: 6.6745, longitude: -1.5716 },
  { name: 'Kejetia Market, Kumasi', latitude: 6.7001, longitude: -1.6225 },
  { name: 'Kumasi Airport (KMS), Kumasi', latitude: 6.7145, longitude: -1.5906 },

  // Tamale
  { name: 'Tamale Airport (TML), Tamale', latitude: 9.5572, longitude: -0.8550 },
  { name: 'Tamale Central Mosque, Tamale', latitude: 9.4075, longitude: -0.8398 },
  { name: 'UDS Campus, Tamale', latitude: 9.4005, longitude: -0.8715 },

  // Takoradi / Sekondi
  { name: 'Takoradi Mall, Takoradi', latitude: 4.9004, longitude: -1.7745 },
  { name: 'Market Circle, Takoradi', latitude: 4.8936, longitude: -1.7828 },
  { name: 'Takoradi Harbour, Takoradi', latitude: 4.8877, longitude: -1.7681 },

  // Cape Coast
  { name: 'Cape Coast Castle, Cape Coast', latitude: 5.1039, longitude: -1.2415 },
  { name: 'Kakum National Park, Central Region', latitude: 5.3533, longitude: -1.3831 },
  { name: 'UCC Campus, Cape Coast', latitude: 5.1154, longitude: -1.2825 },

  // Tema
  { name: 'Tema Harbour, Tema', latitude: 5.6369, longitude: 0.0163 },
  { name: 'Tema Community 1, Tema', latitude: 5.6500, longitude: 0.0050 },

  // Koforidua
  { name: 'Koforidua Flowers / Central, Eastern Region', latitude: 6.0934, longitude: -0.2599 },

  // Ho
  { name: 'Ho Airport, Ho', latitude: 6.6111, longitude: 0.4778 },

  // Sunyani
  { name: 'Sunyani Airport, Sunyani', latitude: 7.3486, longitude: -2.3283 },
];

const MapActionButton = ({
  onPress,
  iconName,
  iconSet = 'feather',
  colors,
  style,
  color,
  disabled
}: {
  onPress: () => void;
  iconName: string;
  iconSet?: any;
  colors: any;
  style?: any;
  color?: string;
  disabled?: boolean;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.9,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.9}
      style={style}
    >
      <Animated.View style={[
        styles.mapButton,
        {
          backgroundColor: colors.surface,
          transform: [{ scale }]
        }
      ]}>
        <Icon name={iconName} set={iconSet} size={20} color={color || colors.textPrimary} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const RideOptionItem = ({
  option,
  isSelected,
  accentColor,
  colors,
  onPress
}: {
  option: any;
  isSelected: boolean;
  accentColor: string;
  colors: any;
  onPress: () => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
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
      style={{ width: '100%', marginBottom: 10 }}
    >
      <Animated.View style={[
        styles.boltRideCard,
        {
          backgroundColor: isSelected ? colors.primaryLight : colors.surfaceAlt,
          borderColor: isSelected ? accentColor : colors.border,
          borderWidth: isSelected ? 2 : 1,
          transform: [{ scale }]
        }
      ]}>
        {/* Left Icon Badge */}
        <View style={[
          styles.boltVehicleBadge,
          { backgroundColor: isSelected ? accentColor : colors.surface }
        ]}>
          <Icon name={option.icon} set={option.iconSet || 'material'} size={24} color={isSelected ? '#FFFFFF' : accentColor} />
        </View>

        {/* Middle Info */}
        <View style={styles.boltInfoCol}>
          <View style={styles.boltTitleRow}>
            <Text style={[styles.boltRideTitle, { color: colors.textPrimary }]}>{option.type}</Text>
            <View style={[styles.boltSeatsPill, { backgroundColor: colors.surface }]}>
              <Icon name="user" set="feather" size={10} color={colors.textSecondary} />
              <Text style={[styles.boltSeatsText, { color: colors.textSecondary }]}>{option.seats}</Text>
            </View>
          </View>
          <Text style={[styles.boltRideDesc, { color: colors.textTertiary }]} numberOfLines={1}>
            {option.desc} • {option.eta} min away
          </Text>
        </View>

        {/* Right Price */}
        <View style={styles.boltPriceCol}>
          <Text style={[styles.boltPriceText, { color: isSelected ? accentColor : colors.textPrimary }]}>
            GH₵{option.price}
          </Text>
          {isSelected && (
            <View style={[styles.selectedCheckDot, { backgroundColor: accentColor }]}>
              <Icon name="check" set="feather" size={10} color="#FFFFFF" />
            </View>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

export const RideHomeScreen: React.FC<TabScreenProps<'Ride'>> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [selectedRide, setSelectedRide] = useState('2');
  const [pickup, setPickup] = useState('Accra Mall, Teshie Rd');
  const [destination, setDestination] = useState('');
  const [places, setPlaces] = useState<any[]>(GHANA_PLACES);
  const [isMinimized, setIsMinimized] = useState(false);

  const sheetTranslateY = useRef(new Animated.Value(0)).current;
  const confirmBtnScale = useRef(new Animated.Value(1)).current;

  const handleConfirmPressIn = () => {
    Animated.spring(confirmBtnScale, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };

  const handleConfirmPressOut = () => {
    Animated.spring(confirmBtnScale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };

  // Synced spring animations for tap toggles
  useEffect(() => {
    Animated.spring(sheetTranslateY, {
      toValue: isMinimized ? 320 : 0,
      tension: 35,
      friction: 8,
      useNativeDriver: true,
    }).start();
  }, [isMinimized]);

  // PanResponder to detect swipe up/down on bottom sheet handle
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => Math.abs(gestureState.dy) > 3,
      onPanResponderMove: (evt, gestureState) => {
        let targetValue = (isMinimized ? 340 : 0) + gestureState.dy;
        if (targetValue < 0) targetValue = 0;
        if (targetValue > 340) targetValue = 340;
        sheetTranslateY.setValue(targetValue);
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (gestureState.dy > 50 || gestureState.vy > 0.3) {
          setIsMinimized(true);
          Animated.spring(sheetTranslateY, {
            toValue: 340,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }).start();
        } else if (gestureState.dy < -50 || gestureState.vy < -0.3) {
          setIsMinimized(false);
          Animated.spring(sheetTranslateY, {
            toValue: 0,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }).start();
        } else {
          // Snap back
          Animated.spring(sheetTranslateY, {
            toValue: isMinimized ? 340 : 0,
            tension: 40,
            friction: 8,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const contentOpacity = sheetTranslateY.interpolate({
    inputRange: [0, 240],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  // Fetch backend restaurants dynamically to use as ride destinations
  useEffect(() => {
    const fetchRestaurantsForMap = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/restaurants`);
        if (response.ok) {
          const json = await response.json();
          if (json.success && Array.isArray(json.data)) {
            const restaurantPlaces = json.data.map((r: any) => ({
              name: `${r.name} (${r.cuisineType || 'Restaurant'}), ${r.address || 'Accra'}`,
              latitude: r.latitude || 5.6037,
              longitude: r.longitude || -0.1870,
            }));
            setPlaces(prev => [...prev, ...restaurantPlaces]);
          }
        }
      } catch (err) {
        console.warn('Failed to load restaurants for ride home map places:', err);
      }
    };
    fetchRestaurantsForMap();
  }, []);

  // Live Location States
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState({
    latitude: 5.6037,
    longitude: -0.1870,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });
  const [pickupCoords, setPickupCoords] = useState<{ latitude: number; longitude: number } | null>({
    latitude: 5.6178,
    longitude: -0.1691,
  });
  const [destinationCoords, setDestinationCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mockDrivers, setMockDrivers] = useState<{ id: string; latitude: number; longitude: number; rotation: number }[]>([]);

  useEffect(() => {
    if (pickupCoords) {
      const drivers = [
        {
          id: 'driver_1',
          latitude: pickupCoords.latitude + 0.002,
          longitude: pickupCoords.longitude + 0.003,
          rotation: 45,
        },
        {
          id: 'driver_2',
          latitude: pickupCoords.latitude - 0.002,
          longitude: pickupCoords.longitude - 0.003,
          rotation: 120,
        },
        {
          id: 'driver_3',
          latitude: pickupCoords.latitude + 0.004,
          longitude: pickupCoords.longitude - 0.002,
          rotation: 290,
        },
      ];
      setMockDrivers(drivers);
    }
  }, [pickupCoords]);

  // Search/Suggestions States
  const [activeField, setActiveField] = useState<'pickup' | 'destination' | null>(null);
  const [suggestions, setSuggestions] = useState<typeof GHANA_PLACES>([]);

  const selectedOption = RIDE_OPTIONS.find((r) => r.id === selectedRide);

  // Request permissions and get current location on mount
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        try {
          // 1. Fast fallback to last known location (instant map update)
          let lastLocation = await Location.getLastKnownPositionAsync({});
          if (lastLocation) {
            const coords = {
              latitude: lastLocation.coords.latitude,
              longitude: lastLocation.coords.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            };
            setRegion(coords);
            setPickupCoords({ latitude: lastLocation.coords.latitude, longitude: lastLocation.coords.longitude });
            mapRef.current?.animateToRegion(coords, 500);

            let reverse = await Location.reverseGeocodeAsync({
              latitude: lastLocation.coords.latitude,
              longitude: lastLocation.coords.longitude,
            });
            if (reverse && reverse.length > 0) {
              const place = reverse[0];
              setPickup(place.name || place.street || `${place.city}, ${place.region}`);
            } else {
              setPickup("Current Location");
            }
          }

          // 2. Fetch current location with Balanced accuracy (faster lock, no hangs)
          let location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const coords = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.015,
            longitudeDelta: 0.015,
          };
          setRegion(coords);
          setPickupCoords({ latitude: location.coords.latitude, longitude: location.coords.longitude });
          mapRef.current?.animateToRegion(coords, 1000);

          let reverse = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          if (reverse && reverse.length > 0) {
            const place = reverse[0];
            setPickup(place.name || place.street || `${place.city}, ${place.region}`);
          } else {
            setPickup("Current Location");
          }
        } catch (e) {
          console.warn("Failed to get users live location:", e);
        }
      }
    })();
  }, []);

  const handleLocateUser = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Permission to access location was denied.');
      return;
    }
    try {
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };
      setRegion(coords);
      setPickupCoords({ latitude: location.coords.latitude, longitude: location.coords.longitude });
      mapRef.current?.animateToRegion(coords, 1000);

      let reverse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      if (reverse && reverse.length > 0) {
        const place = reverse[0];
        setPickup(place.name || place.street || `${place.city}, ${place.region}`);
      } else {
        setPickup("Current Location");
      }
    } catch (error) {
      console.warn("Failed to locate user:", error);
      Alert.alert('Error', 'Failed to retrieve location. Please check if your device GPS is enabled.');
    }
  };

  const zoomToFit = (pCoords: { latitude: number; longitude: number } | null, dCoords: { latitude: number; longitude: number } | null, fallbackRegion: any) => {
    if (pCoords && dCoords) {
      mapRef.current?.fitToCoordinates([pCoords, dCoords], {
        edgePadding: { top: 100, right: 65, bottom: 330, left: 65 },
        animated: true,
      });
    } else {
      mapRef.current?.animateToRegion(fallbackRegion, 1000);
    }
  };

  const handleMapPress = async (coords: { latitude: number; longitude: number }) => {
    // If no active field is focused, default to setting destination
    const targetField = activeField || 'destination';
    let newPickupCoords = pickupCoords;
    let newDestCoords = destinationCoords;

    try {
      let reverse = await Location.reverseGeocodeAsync(coords);
      const place = reverse?.[0];
      const name = place
        ? place.name || place.street || `${place.city || place.subregion || 'Accra'}, ${place.region || 'Ghana'}`
        : `Location (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`;

      if (targetField === 'pickup') {
        newPickupCoords = coords;
        setPickupCoords(newPickupCoords);
        setPickup(name);
      } else {
        newDestCoords = coords;
        setDestinationCoords(newDestCoords);
        setDestination(name);
      }
    } catch (e) {
      const name = `Location (${coords.latitude.toFixed(4)}, ${coords.longitude.toFixed(4)})`;
      if (targetField === 'pickup') {
        newPickupCoords = coords;
        setPickupCoords(newPickupCoords);
        setPickup(name);
      } else {
        newDestCoords = coords;
        setDestinationCoords(newDestCoords);
        setDestination(name);
      }
    }

    const targetRegion = {
      latitude: coords.latitude,
      longitude: coords.longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    };
    setRegion(targetRegion);

    setTimeout(() => {
      zoomToFit(newPickupCoords, newDestCoords, targetRegion);
    }, 100);

    setActiveField(null);
    setSuggestions([]);
    Keyboard.dismiss();
  };

  // Helper to calculate distance between two coordinates
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    return Math.sqrt(Math.pow(lat1 - lat2, 2) + Math.pow(lon1 - lon2, 2));
  };

  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (text: string, field: 'pickup' | 'destination') => {
    if (field === 'pickup') {
      setPickup(text);
    } else {
      setDestination(text);
    }

    // Sort places by distance to reference coordinates
    let sortedPlaces = [...places];
    const refCoords = pickupCoords || { latitude: region.latitude, longitude: region.longitude };
    if (refCoords) {
      sortedPlaces.sort((a, b) => {
        const distA = getDistance(refCoords.latitude, refCoords.longitude, a.latitude, a.longitude);
        const distB = getDistance(refCoords.latitude, refCoords.longitude, b.latitude, b.longitude);
        return distA - distB;
      });
    }

    if (!text.trim()) {
      setSuggestions(sortedPlaces.slice(0, 5));
      return;
    }

    // Instant local matching on every keystroke
    const query = text.toLowerCase().trim();
    const localFiltered = sortedPlaces.filter(place =>
      place.name.toLowerCase().includes(query)
    );

    setSuggestions(localFiltered.slice(0, 8));

    // Debounced background geocoding for extra online suggestions
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (text.length > 3) {
      searchDebounceRef.current = setTimeout(async () => {
        try {
          const geocoded = await Location.geocodeAsync(`${text}, Ghana`);
          if (geocoded && geocoded.length > 0) {
            const combined = [...localFiltered];
            geocoded.forEach((g, idx) => {
              const formattedName = `${text.charAt(0).toUpperCase() + text.slice(1)}${idx > 0 ? ' ' + (idx + 1) : ''}, Ghana`;
              if (!combined.some(c => Math.abs(c.latitude - g.latitude) < 0.001 && Math.abs(c.longitude - g.longitude) < 0.001)) {
                combined.push({
                  name: formattedName,
                  latitude: g.latitude,
                  longitude: g.longitude,
                });
              }
            });
            setSuggestions(combined.slice(0, 8));
          }
        } catch (err) {
          // Fallback silently
        }
      }, 300);
    }
  };

  const handleSelectSuggestion = (place: any) => {
    let newPickupCoords = pickupCoords;
    let newDestCoords = destinationCoords;

    if (activeField === 'pickup') {
      setPickup(place.name);
      newPickupCoords = { latitude: place.latitude, longitude: place.longitude };
      setPickupCoords(newPickupCoords);
    } else {
      setDestination(place.name);
      newDestCoords = { latitude: place.latitude, longitude: place.longitude };
      setDestinationCoords(newDestCoords);
    }

    const targetRegion = {
      latitude: place.latitude,
      longitude: place.longitude,
      latitudeDelta: 0.015,
      longitudeDelta: 0.015,
    };
    setRegion(targetRegion);

    setTimeout(() => {
      zoomToFit(newPickupCoords, newDestCoords, targetRegion);
    }, 100);

    setActiveField(null);
    setSuggestions([]);
    Keyboard.dismiss();
  };

  const handleQuickChipPress = (placeName: string) => {
    const place = places.find(p => p.name.toLowerCase().includes(placeName.toLowerCase()));
    if (place) {
      const newDestCoords = { latitude: place.latitude, longitude: place.longitude };
      setDestination(place.name);
      setDestinationCoords(newDestCoords);

      const targetRegion = {
        latitude: place.latitude,
        longitude: place.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };
      setRegion(targetRegion);

      setTimeout(() => {
        zoomToFit(pickupCoords, newDestCoords, targetRegion);
      }, 100);
    } else {
      setDestination(placeName);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* ===== Map Area ===== */}
        <View style={styles.mapArea}>
          {/* Contextual Back Button */}
          <MapActionButton
            onPress={() => {
              if (activeField) {
                setActiveField(null);
              } else {
                navigation.goBack();
              }
            }}
            iconName="chevron-left"
            colors={colors}
            style={styles.backButtonPos}
          />

          {/* My Location Button */}
          <MapActionButton
            onPress={handleLocateUser}
            iconName="crosshairs-gps"
            iconSet="material"
            colors={colors}
            color={colors.primary}
            style={styles.locateButtonPos}
          />

          {/* Recenter Route Button */}
          {pickupCoords && destinationCoords && (
            <MapActionButton
              onPress={() => zoomToFit(pickupCoords, destinationCoords, region)}
              iconName="routes"
              iconSet="material"
              colors={colors}
              color={colors.primary}
              style={styles.recenterButtonPos}
            />
          )}

          {/* Interactive Map */}
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFillObject}
            customMapStyle={isDark ? DARK_MAP_STYLE : LIGHT_MAP_STYLE}
            region={region}
            onRegionChangeComplete={setRegion}
            showsUserLocation={true}
            showsMyLocationButton={false}
            showsCompass={false}
            onPress={(e) => handleMapPress(e.nativeEvent.coordinate)}
          >
            {pickupCoords && (
              <Marker coordinate={pickupCoords}>
                <View style={styles.customDestMarker}>
                  <View style={[styles.destBubble, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
                    <Text style={[styles.destBubbleText, { color: colors.textPrimary }]} numberOfLines={1}>
                      {pickup.split(',')[0] || "Pickup"}
                    </Text>
                  </View>
                  <View style={[styles.destPinDot, { backgroundColor: colors.primary }]} />
                </View>
              </Marker>
            )}
            {destinationCoords && (
              <Marker coordinate={destinationCoords}>
                <View style={styles.customDestMarker}>
                  <View style={[styles.destBubble, { backgroundColor: colors.surface, borderColor: colors.foodOrange }]}>
                    <Text style={[styles.destBubbleText, { color: colors.textPrimary }]} numberOfLines={1}>
                      {destination.split(',')[0] || "Destination"}
                    </Text>
                  </View>
                  <View style={[styles.destPinDot, { backgroundColor: colors.foodOrange }]} />
                </View>
              </Marker>
            )}

            {pickupCoords && destinationCoords && (
              <Polyline
                coordinates={[pickupCoords, destinationCoords]}
                strokeColor={colors.primary}
                strokeWidth={4}
                geodesic={true}
              />
            )}

            {mockDrivers.map((driver) => (
              <Marker
                key={driver.id}
                coordinate={{ latitude: driver.latitude, longitude: driver.longitude }}
                rotation={driver.rotation}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View style={{
                  backgroundColor: colors.surface,
                  borderRadius: 20,
                  padding: 6,
                  borderWidth: 1.5,
                  borderColor: colors.primary,
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.2,
                  shadowRadius: 2,
                  elevation: 2,
                }}>
                  <Icon name="car-sports" set="material" size={16} color={colors.primary} />
                </View>
              </Marker>
            ))}
          </MapView>
        </View>

        {/* ===== Sleek Dynamic Theme Bottom Sheet ===== */}
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              backgroundColor: colors.surface,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              borderWidth: 1.5,
              borderBottomWidth: 0,
              transform: [{ translateY: sheetTranslateY }]
            },
            shadows.large
          ]}
        >
          {/* Swipeable Header Area (Handle + Title) */}
          <View {...panResponder.panHandlers} style={{ width: '100%' }}>
            {/* Handle */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsMinimized(!isMinimized)}
              style={{ paddingVertical: 12, width: '100%', alignItems: 'center' }}
            >
              <View style={[styles.handle, { backgroundColor: colors.border, marginBottom: 0 }]} />
            </TouchableOpacity>

          {/* Swipeable Header Area (Handle + Title) */}
          <View {...panResponder.panHandlers} style={{ width: '100%' }}>
            {/* Handle */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsMinimized(!isMinimized)}
              style={{ paddingVertical: 10, width: '100%', alignItems: 'center' }}
            >
              <View style={[styles.handle, { backgroundColor: colors.border, width: 44, height: 5, borderRadius: 3, marginBottom: 0 }]} />
            </TouchableOpacity>

            {/* Title Row - Exact Bolt Screenshot Header */}
            <View style={[styles.titleRow, { marginTop: 4, marginBottom: 16 }]}>
              <Text style={[styles.boltHeaderTitle, { color: colors.textPrimary }]}>
                {isMinimized ? "Map View" : (destination ? "Choose a ride" : "Let's get you on your way.")}
              </Text>
              <TouchableOpacity
                onPress={() => setIsMinimized(!isMinimized)}
                style={[styles.minimizeBtn, { backgroundColor: colors.surfaceAlt }]}
              >
                <Icon name={isMinimized ? "chevron-up" : "chevron-down"} set="feather" size={18} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <Animated.View
            pointerEvents={isMinimized ? 'none' : 'auto'}
            style={{ opacity: contentOpacity }}
          >
            {/* If no destination set yet, show exact Bolt Home Screenshot layout (3 Service Grid Cards + Large Where To search + Recent Places) */}
            {!destination && !activeField ? (
              <>
                {/* 3 Top Service Cards (Rides, Bolt Food, Bolt Send) */}
                <View style={styles.boltServiceGrid}>
                  <TouchableOpacity 
                    style={[styles.boltServiceCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.primary, borderWidth: 1.5 }]}
                    onPress={() => setActiveField('destination')}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.boltServiceIconWrap, { backgroundColor: colors.primaryLight }]}>
                      <Icon name="car-sports" set="material" size={26} color={colors.primary} />
                    </View>
                    <Text style={[styles.boltServiceTitle, { color: colors.textPrimary }]}>Rides</Text>
                    <Text style={[styles.boltServiceSub, { color: colors.textTertiary }]}>Let's get moving</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.boltServiceCard, { backgroundColor: colors.surfaceAlt }]}
                    onPress={() => (navigation as any).navigate('Food')}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.boltServiceIconWrap, { backgroundColor: colors.foodOrangeLight }]}>
                      <Icon name="hamburger" set="material" size={26} color={colors.foodOrange} />
                    </View>
                    <Text style={[styles.boltServiceTitle, { color: colors.textPrimary }]}>Bolt Food</Text>
                    <Text style={[styles.boltServiceSub, { color: colors.textTertiary }]}>Quick delivery</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.boltServiceCard, { backgroundColor: colors.surfaceAlt }]}
                    onPress={() => Alert.alert('Bolt Send 📦', 'GoZone Express Delivery: Send packages safely across town!')}
                    activeOpacity={0.85}
                  >
                    <View style={[styles.boltServiceIconWrap, { backgroundColor: colors.rideBlueLight }]}>
                      <Icon name="package-variant-closed" set="material" size={26} color={colors.rideBlue} />
                    </View>
                    <Text style={[styles.boltServiceTitle, { color: colors.textPrimary }]}>Bolt Send</Text>
                    <Text style={[styles.boltServiceSub, { color: colors.textTertiary }]}>Send or receive</Text>
                  </TouchableOpacity>
                </View>

                {/* Large "Where to?" Search Pill Bar */}
                <TouchableOpacity
                  style={[styles.boltWhereToBar, { backgroundColor: colors.surfaceAlt }]}
                  onPress={() => {
                    setActiveField('destination');
                    handleSearch('', 'destination');
                  }}
                  activeOpacity={0.85}
                >
                  <Icon name="search" set="feather" size={20} color={colors.textPrimary} style={{ marginRight: 12 }} />
                  <Text style={[styles.boltWhereToText, { color: colors.textPrimary }]}>Where to?</Text>
                </TouchableOpacity>

                {/* Exact Screenshot Recent Places List */}
                <View style={styles.boltRecentList}>
                  <TouchableOpacity
                    style={[styles.boltRecentItem, { borderBottomColor: colors.border }]}
                    onPress={() => handleQuickChipPress('Trinity Oil')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.boltRecentIconWrap, { backgroundColor: colors.surfaceAlt }]}>
                      <Icon name="clock" set="feather" size={16} color={colors.textSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.boltRecentTitle, { color: colors.textPrimary }]}>Trinity Oil - petroleum gas station</Text>
                      <Text style={[styles.boltRecentSub, { color: colors.textTertiary }]}>Kumasi</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.boltRecentItem, { borderBottomColor: colors.border }]}
                    onPress={() => handleQuickChipPress('Atta-Mills')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.boltRecentIconWrap, { backgroundColor: colors.surfaceAlt }]}>
                      <Icon name="clock" set="feather" size={16} color={colors.textSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.boltRecentTitle, { color: colors.textPrimary }]}>Atta-Mills Junction 9</Text>
                      <Text style={[styles.boltRecentSub, { color: colors.textTertiary }]}>Kumasi</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.boltRecentItem, { borderBottomColor: colors.border }]}
                    onPress={() => handleQuickChipPress('Tech Junction')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.boltRecentIconWrap, { backgroundColor: colors.surfaceAlt }]}>
                      <Icon name="bus" set="feather" size={16} color={colors.textSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.boltRecentTitle, { color: colors.textPrimary }]}>Tech Junction</Text>
                      <Text style={[styles.boltRecentSub, { color: colors.textTertiary }]}>Kumasi</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.boltRecentItem, { borderBottomColor: colors.border }]}
                    onPress={() => handleQuickChipPress('East Legon')}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.boltRecentIconWrap, { backgroundColor: colors.surfaceAlt }]}>
                      <Icon name="home" set="feather" size={16} color={colors.textSecondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.boltRecentTitle, { color: colors.textPrimary }]}>East Legon</Text>
                      <Text style={[styles.boltRecentSub, { color: colors.textTertiary }]}>Accra</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                {/* Location Inputs Container */}
                <View style={[styles.inputContainer, { backgroundColor: colors.surfaceAlt }]}>
                  <View style={styles.inputRow}>
                    <View style={[styles.inputDot, { backgroundColor: colors.primary }]} />
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary }]}
                      value={pickup}
                      onChangeText={(text) => handleSearch(text, 'pickup')}
                      onFocus={() => {
                        setActiveField('pickup');
                        handleSearch(pickup, 'pickup');
                      }}
                      placeholder="Pickup location"
                      placeholderTextColor={colors.textTertiary}
                    />
                    {activeField === 'pickup' && pickup.length > 0 && (
                      <TouchableOpacity
                        style={[styles.plusIconWrap, { backgroundColor: colors.border }]}
                        onPress={() => {
                          setPickup('');
                          setPickupCoords(null);
                          handleSearch('', 'pickup');
                        }}
                      >
                        <Icon name="x" set="feather" size={12} color={colors.textPrimary} />
                      </TouchableOpacity>
                    )}
                    <View style={[styles.inputLine, { backgroundColor: colors.border }]} />
                  </View>
                  <View style={styles.inputRow}>
                    <Icon name="map-pin" set="feather" size={14} color={colors.foodOrange} style={{ marginRight: 8 }} />
                    <TextInput
                      style={[styles.input, { color: colors.textPrimary }]}
                      value={destination}
                      onChangeText={(text) => handleSearch(text, 'destination')}
                      onFocus={() => {
                        setActiveField('destination');
                        handleSearch(destination, 'destination');
                      }}
                      placeholder="Where to?"
                      placeholderTextColor={colors.textTertiary}
                    />
                    {destination.length > 0 && (
                      <TouchableOpacity
                        style={[styles.plusIconWrap, { backgroundColor: colors.border }]}
                        onPress={() => {
                          setDestination('');
                          setDestinationCoords(null);
                          setActiveField(null);
                        }}
                      >
                        <Icon name="x" set="feather" size={12} color={colors.textPrimary} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Conditional Content: If searching, show suggestions. Else show chips + options */}
                {activeField && suggestions.length > 0 ? (
              <View style={styles.suggestionsContainer}>
                {suggestions.map((item, index) => {
                  const parts = item.name.split(',');
                  const mainName = parts[0].trim();
                  const subDetail = parts.slice(1).join(',').trim() || 'Accra, Ghana';
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.suggestionCard, { borderBottomColor: colors.border }]}
                      onPress={() => handleSelectSuggestion(item)}
                      activeOpacity={0.7}
                    >
                      <View style={[styles.suggestionIconWrap, { backgroundColor: colors.primaryLight }]}>
                        <Icon name="map-pin" set="feather" size={14} color={colors.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.suggestionTitleText, { color: colors.textPrimary }]} numberOfLines={1}>
                          {mainName}
                        </Text>
                        <Text style={[styles.suggestionSubText, { color: colors.textTertiary }]} numberOfLines={1}>
                          {subDetail}
                        </Text>
                      </View>
                      <Icon name="arrow-up-left" set="feather" size={14} color={colors.textTertiary} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <>
                {/* Destination Quick Chips */}
                <View style={styles.chipsRow}>
                  <TouchableOpacity
                    style={[styles.chip, { backgroundColor: colors.surfaceAlt }]}
                    onPress={() => handleQuickChipPress('East Legon')}
                    activeOpacity={0.7}
                  >
                    <Icon name="home" set="feather" size={12} color={colors.textSecondary} />
                    <Text style={[styles.chipText, { color: colors.textPrimary }]}>Home</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chip, { backgroundColor: colors.surfaceAlt }]}
                    onPress={() => handleQuickChipPress('Liberation Road')}
                    activeOpacity={0.7}
                  >
                    <Icon name="briefcase" set="feather" size={12} color={colors.textSecondary} />
                    <Text style={[styles.chipText, { color: colors.textPrimary }]}>Work</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.chip, { backgroundColor: colors.surfaceAlt }]}
                    onPress={() => handleQuickChipPress('Kotoka International')}
                    activeOpacity={0.7}
                  >
                    <Icon name="navigation" set="feather" size={12} color={colors.textSecondary} />
                    <Text style={[styles.chipText, { color: colors.textPrimary }]}>Airport</Text>
                  </TouchableOpacity>
                </View>

                {/* Ride Options */}
                <View style={styles.rideOptions}>
                  {RIDE_OPTIONS.map((option) => {
                    const isSelected = selectedRide === option.id;
                    const accentColor = option.type === 'Premium' ? colors.walletPurple : colors.primary;
                    return (
                      <RideOptionItem
                        key={option.id}
                        option={option}
                        isSelected={isSelected}
                        accentColor={accentColor}
                        colors={colors}
                        onPress={() => setSelectedRide(option.id)}
                      />
                    );
                  })}
                </View>

                {/* Bolt-style Payment Selector Bar */}
                <TouchableOpacity 
                  style={[styles.paymentBar, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}
                  onPress={() => Alert.alert('Payment Method', 'Payment method set to SuperWallet Balance (GH₵250.00)')}
                  activeOpacity={0.8}
                >
                  <View style={styles.paymentLeft}>
                    <View style={[styles.paymentIconWrap, { backgroundColor: colors.primaryLight }]}>
                      <Icon name="credit-card" set="feather" size={14} color={colors.primary} />
                    </View>
                    <View>
                      <Text style={[styles.paymentTitle, { color: colors.textPrimary }]}>SuperWallet Balance</Text>
                      <Text style={[styles.paymentSub, { color: colors.textTertiary }]}>Available: GH₵250.00</Text>
                    </View>
                  </View>
                  <Icon name="chevron-right" set="feather" size={16} color={colors.textTertiary} />
                </TouchableOpacity>

                {/* Confirm Button with dynamic color background */}
                <TouchableOpacity
                  onPressIn={handleConfirmPressIn}
                  onPressOut={handleConfirmPressOut}
                  onPress={() => {
                    if (!pickup.trim()) {
                      Alert.alert("Pickup Required", "Please enter or select a pickup location.");
                      return;
                    }

                    if (!destination.trim()) {
                      Alert.alert("Destination Required", "Please enter or select a destination.");
                      return;
                    }

                    // Fallback coordinate lookup in places if pickupCoords is null
                    let finalPickupCoords = pickupCoords;
                    if (!finalPickupCoords) {
                      const matchedPlace = places.find(
                        (p) => p.name.toLowerCase().trim() === pickup.toLowerCase().trim()
                      );
                      if (matchedPlace) {
                        finalPickupCoords = { latitude: matchedPlace.latitude, longitude: matchedPlace.longitude };
                      } else {
                        Alert.alert(
                          "Select Pickup from Suggestions",
                          "Please select a pickup location from the suggestions list or tap on the map to set it."
                        );
                        return;
                      }
                    }

                    // Fallback coordinate lookup in places if destinationCoords is null
                    let finalDestCoords = destinationCoords;
                    if (!finalDestCoords) {
                      const matchedPlace = places.find(
                        (p) => p.name.toLowerCase().trim() === destination.toLowerCase().trim()
                      );
                      if (matchedPlace) {
                        finalDestCoords = { latitude: matchedPlace.latitude, longitude: matchedPlace.longitude };
                      } else {
                        Alert.alert(
                          "Select from Suggestions",
                          "Please select a destination from the suggestions list or tap on the map to set it."
                        );
                        return;
                      }
                    }

                    const dest = destination;
                    if (selectedOption?.type !== 'GoPool') {
                      Alert.alert(
                        "Riders Nearby! 🚗",
                        `Ama (0.2 km away) is also requesting a ride to ${dest}. Would you like to share the ride and save 40% on your fare? (Pay GH₵15.00 instead of GH₵${selectedOption?.price})`,
                        [
                          {
                            text: "🤝 Share Ride & Save",
                            onPress: () => {
                              setSelectedRide('1'); // Switch to GoPool
                              (navigation as any).navigate('SearchingDriver', {
                                pickup,
                                destination: dest,
                                rideType: 'GoPool',
                                price: 15,
                                pickupCoords: finalPickupCoords,
                                destinationCoords: finalDestCoords,
                              });
                            }
                          },
                          {
                            text: "👤 Go Solo",
                            onPress: () => {
                              (navigation as any).navigate('SearchingDriver', {
                                pickup,
                                destination: dest,
                                rideType: selectedOption?.type ?? 'Standard',
                                price: selectedOption?.price ?? 25,
                                pickupCoords: finalPickupCoords,
                                destinationCoords: finalDestCoords,
                              });
                            }
                          },
                          {
                            text: "Cancel",
                            style: "cancel"
                          }
                        ],
                        { cancelable: true }
                      );
                    } else {
                      (navigation as any).navigate('SearchingDriver', {
                        pickup,
                        destination: dest,
                        rideType: 'GoPool',
                        price: 15,
                        pickupCoords: finalPickupCoords,
                        destinationCoords: finalDestCoords,
                      });
                    }
                  }}
                  activeOpacity={0.95}
                >
                  <Animated.View style={[
                    styles.confirmBtn,
                    { 
                      backgroundColor: selectedOption?.type === 'Premium' ? colors.walletPurple : colors.primary,
                      transform: [{ scale: confirmBtnScale }]
                    }
                  ]}>
                    <Text style={[styles.confirmBtnText, { color: colors.textInverse }]}>
                      Confirm {selectedOption?.type ?? ''} • GH₵{selectedOption?.price ?? 0}
                    </Text>
                    <Icon name="arrow-right" set="feather" size={16} color={colors.textInverse} />
                  </Animated.View>
                </TouchableOpacity>
              </>
            )}
          </>
        )}
      </Animated.View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  mapArea: { flex: 1, position: 'relative' },

  // Map buttons
  mapButton: {
    width: 40, height: 40,
    borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  backButtonPos: { position: 'absolute', top: 16, left: 20, zIndex: 10 },
  locateButtonPos: { position: 'absolute', bottom: 330, right: 20, zIndex: 10 },
  recenterButtonPos: { position: 'absolute', top: 68, right: 20, zIndex: 10 },
  locateButton: { left: undefined, right: 20 },

  // Bottom sheet
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: spacing.xl,
    paddingTop: 4,
    paddingBottom: spacing.xl,
  },
  handle: { width: 36, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: spacing.base },
  minimizeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: spacing.md,
  },
  sheetTitle: { fontSize: typography.size.xl, fontWeight: '800' },
  timeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: borderRadius.full,
  },
  timeText: { fontSize: typography.size.sm, fontWeight: '600' },

  // Exact Bolt Screenshot UI Styles
  boltHeaderTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  boltServiceGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: spacing.lg,
  },
  boltServiceCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: 18,
    alignItems: 'flex-start',
  },
  boltServiceIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  boltServiceTitle: {
    fontSize: typography.size.sm,
    fontWeight: '700',
  },
  boltServiceSub: {
    fontSize: 10,
    marginTop: 2,
  },
  boltWhereToBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: 16,
    marginBottom: spacing.lg,
  },
  boltWhereToText: {
    fontSize: 16,
    fontWeight: '700',
  },
  boltRecentList: {
    marginBottom: spacing.md,
  },
  boltRecentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 14,
  },
  boltRecentIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boltRecentTitle: {
    fontSize: typography.size.sm,
    fontWeight: '600',
  },
  boltRecentSub: {
    fontSize: 11,
    marginTop: 2,
  },

  // Inputs
  inputContainer: { borderRadius: borderRadius.lg, padding: 4, marginBottom: spacing.md },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: spacing.md, paddingVertical: 10,
  },
  inputDot: { width: 8, height: 8, borderRadius: 4, marginRight: 12 },
  inputLine: { width: 1, height: 16, marginLeft: 4, marginRight: 11 },
  input: { flex: 1, fontSize: typography.size.md, padding: 0 },
  plusIconWrap: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },

  // Quick Chips
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: spacing.lg,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },

  // Ride options (Bolt style full width list)
  rideOptions: { flexDirection: 'column', gap: 0, marginBottom: spacing.md },
  boltRideCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 18,
    gap: 12,
  },
  boltVehicleBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boltInfoCol: {
    flex: 1,
    justifyContent: 'center',
  },
  boltTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  boltRideTitle: {
    fontSize: typography.size.md,
    fontWeight: '700',
  },
  boltSeatsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  boltSeatsText: {
    fontSize: 10,
    fontWeight: '600',
  },
  boltRideDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  boltPriceCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  boltPriceText: {
    fontSize: typography.size.md,
    fontWeight: '800',
  },
  selectedCheckDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },

  // Payment bar
  paymentBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  paymentIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentTitle: {
    fontSize: typography.size.sm,
    fontWeight: '700',
  },
  paymentSub: {
    fontSize: 11,
    marginTop: 1,
  },

  // Confirm Button
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    width: '100%',
  },
  confirmBtnText: {
    fontSize: typography.size.md,
    fontWeight: '800',
  },
  suggestionsContainer: {
    marginVertical: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    gap: 12,
  },
  suggestionIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionTitleText: {
    fontSize: typography.size.sm,
    fontWeight: '700',
  },
  suggestionSubText: {
    fontSize: 11,
    marginTop: 2,
  },
  // Custom markers styling
  customDestMarker: { alignItems: 'center', justifyContent: 'center' },
  destBubble: {
    paddingHorizontal: 10, paddingVertical: 6,
    borderRadius: 12, borderWidth: 1.5,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
    marginBottom: 4, maxWidth: 150,
  },
  destBubbleText: { fontSize: 10, fontWeight: '700' },
  destPinDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, borderColor: '#FFFFFF' },
});
