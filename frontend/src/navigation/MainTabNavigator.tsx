// ============================================================
// NAVIGATION: Main Tab Navigator (Realistic Icons)
// ============================================================
// Professional bottom tab bar using vector icons
// ============================================================

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '@hooks/useTheme';
import { typography } from '@theme/index';
import { Icon, type IconSet } from '@components/index';
import { HomeScreen } from '@screens/home/HomeScreen';
import { RideHomeScreen } from '@screens/ride/RideHomeScreen';
import { FoodHomeScreen } from '@screens/food/FoodHomeScreen';
import { ProfileScreen } from '@screens/profile/ProfileScreen';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

// Tab icon configs
const TAB_CONFIG: Record<'Home' | 'Ride' | 'Food', {
  icon: string;
  activeIcon: string;
  set: IconSet;
  label: string;
}> = {
  Home: { icon: 'home', activeIcon: 'home', set: 'feather', label: 'Home' },
  Ride: { icon: 'car-side', activeIcon: 'car-side', set: 'material', label: 'Ride' },
  Food: { icon: 'silverware-fork-knife', activeIcon: 'silverware-fork-knife', set: 'material', label: 'Food' },
};

export const MainTabNavigator: React.FC<{ onLogout?: () => void }> = ({ onLogout }) => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const config = TAB_CONFIG[route.name as 'Home' | 'Ride' | 'Food'];
        return {
          tabBarActiveTintColor: colors.tabBarActive,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarStyle: {
            backgroundColor: colors.tabBg,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 80,
            paddingBottom: 20,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            marginTop: 2,
          },
          tabBarIconStyle: { marginBottom: 0 },
          tabBarIcon: ({ focused, color }) => (
            <View style={styles.iconWrapper}>
              <Icon
                name={config.icon}
                set={config.set}
                size={22}
                color={focused ? colors.tabBarActive : colors.tabBarInactive}
              />
              {focused && (
                <View style={[styles.activeIndicator, { backgroundColor: colors.tabBarActive }]} />
              )}
            </View>
          ),
          headerShown: false,
        };
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Ride" component={RideHomeScreen} />
      <Tab.Screen name="Food" component={FoodHomeScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 28,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 4,
    height: 4,
    borderRadius: 9999,
  },
});
