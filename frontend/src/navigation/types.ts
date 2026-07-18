// ============================================================
// NAVIGATION: Route Types
// ============================================================
// TypeScript types for all navigation routes
// ============================================================

import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// ----- Auth Stack Routes -----
export type AuthStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  OTP: { phoneNumber: string; otpCode: string };
};

// ----- Main Tab Routes -----
export type MainTabParamList = {
  Home: undefined;
  Ride: undefined;
  Food: undefined;
  Profile: undefined;
};

// ----- Food Stack Routes -----
export type FoodStackParamList = {
  FoodHome: undefined;
  RestaurantDetail: { restaurantId: string };
  Cart: undefined;
  OrderTracking: { orderId: string };
};

// ----- Ride Stack Routes -----
export type RideStackParamList = {
  RideHome: undefined;
  SearchingDriver: { pickup: string; destination: string; rideType: string; price: number };
  RideInProgress: { rideType: string; price: number };
};

// ----- Wallet Stack Routes -----
export type WalletStackParamList = {
  WalletHome: undefined;
  TopUp: undefined;
  Withdraw: undefined;
  Transactions: undefined;
  SendMoney: undefined;
};

// ----- Root Stack (combines everything) -----
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;

  // Food screens
  RestaurantDetail: { restaurantId: string };
  Cart: undefined;
  OrderTracking: { orderId: string };

  // Ride screens
  SearchingDriver: { pickup: string; destination: string; rideType: string; price: number };
  RideInProgress: { rideType: string; price: number };

  // Wallet screens
  Wallet: undefined;
  WalletHome: undefined;
  TopUp: undefined;
  Withdraw: undefined;
  Transactions: undefined;
  SendMoney: undefined;

  // Settings
  ThemeSettings: undefined;
  Profile: undefined;
};

// ----- Screen Prop Types (for use in components) -----
export type AuthScreenProps<T extends keyof AuthStackParamList> =
  NativeStackScreenProps<AuthStackParamList, T>;

export type TabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
