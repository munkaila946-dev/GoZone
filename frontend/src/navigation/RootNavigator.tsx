// ============================================================
// NAVIGATION: Root Navigator (All Screens Wired Up)
// ============================================================
// Full app flow: Auth → Main Tabs → All feature screens
// ============================================================

import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainTabNavigator } from './MainTabNavigator';
import { AuthNavigator } from './AuthNavigator';

// Food screens
import { RestaurantDetailScreen } from '@screens/food/RestaurantDetailScreen';
import { CartScreen } from '@screens/food/CartScreen';
import { OrderTrackingScreen } from '@screens/food/OrderTrackingScreen';

// Ride screens
import { SearchingDriverScreen } from '@screens/ride/SearchingDriverScreen';
import { RideInProgressScreen } from '@screens/ride/RideInProgressScreen';

// Wallet screens
import { WalletHomeScreen } from '@screens/wallet/WalletHomeScreen';
import { TopUpScreen } from '@screens/wallet/TopUpScreen';
import { TransactionsScreen } from '@screens/wallet/TransactionsScreen';
import { SendMoneyScreen } from '@screens/wallet/SendMoneyScreen';
import { WithdrawScreen } from '@screens/wallet/WithdrawScreen';

// Settings
import { ThemeSettingsScreen } from '@screens/settings/ThemeSettingsScreen';
import { ProfileScreen } from '@screens/profile/ProfileScreen';

import type { RootStackParamList } from './types';
import { useSocketStore } from '@store/index';
import { useUserStore } from '@store/userStore';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync, sendTokenToBackend } from '@services/notificationManager';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const RootNavigator: React.FC = () => {
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const userId = useUserStore((state) => state.userId);
  const logout = useUserStore((state) => state.logout);
  const connectSocket = useSocketStore((state) => state.connect);
  const disconnectSocket = useSocketStore((state) => state.disconnect);

  React.useEffect(() => {
    if (isAuthenticated && userId) {
      // Connect to socket with authenticated user's ID
      connectSocket(userId);

      // Register push notifications and upload token
      (async () => {
        const token = await registerForPushNotificationsAsync();
        await sendTokenToBackend(token);
      })();
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, userId]);

  React.useEffect(() => {
    // Listen for incoming notifications in the foreground
    const notificationSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Foreground notification received:', notification);
    });

    // Listen for notification taps/responses
    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification interaction response received:', response);
    });

    return () => {
      notificationSubscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_right'
        }}
      >
        {isAuthenticated ? (
          <>
            {/* ===== Main app with bottom tabs ===== */}
            <Stack.Screen name="Main">
              {(props) => <MainTabNavigator {...props} onLogout={logout} />}
            </Stack.Screen>

            {/* ===== Food Flow ===== */}
            <Stack.Screen
              name="RestaurantDetail"
              component={RestaurantDetailScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Cart"
              component={CartScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="OrderTracking"
              component={OrderTrackingScreen}
              options={{ presentation: 'card' }}
            />

            {/* ===== Ride Flow ===== */}
            <Stack.Screen
              name="SearchingDriver"
              component={SearchingDriverScreen}
              options={{ presentation: 'fullScreenModal' }}
            />
            <Stack.Screen
              name="RideInProgress"
              component={RideInProgressScreen}
              options={{ presentation: 'fullScreenModal' }}
            />

            {/* ===== Wallet Flow ===== */}
            <Stack.Screen
              name="Wallet"
              component={WalletHomeScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="WalletHome"
              component={WalletHomeScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="TopUp"
              component={TopUpScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Withdraw"
              component={WithdrawScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Transactions"
              component={TransactionsScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="SendMoney"
              component={SendMoneyScreen}
              options={{ presentation: 'card' }}
            />

            {/* ===== Profile Flow ===== */}
            <Stack.Screen name="Profile">
              {(props) => <ProfileScreen {...props} onLogout={logout} />}
            </Stack.Screen>

            {/* ===== Settings ===== */}
            <Stack.Screen
              name="ThemeSettings"
              component={ThemeSettingsScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
          </>
        ) : (
          <Stack.Screen name="Auth">
            {() => <AuthNavigator onLogin={() => { }} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
