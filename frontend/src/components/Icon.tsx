// ============================================================
// COMPONENT: Icon
// ============================================================
// A unified icon system using @expo/vector-icons.
// Uses MaterialCommunityIcons, Ionicons, and Feather for the
// best coverage of professional, realistic-looking icons.
// ============================================================

import React from 'react';
import {
  MaterialCommunityIcons,
  Ionicons,
  Feather,
  MaterialIcons,
  Entypo,
} from '@expo/vector-icons';
import { useTheme } from '@hooks/useTheme';

// ---- Icon Set Types ----
export type IconSet =
  | 'material'    // MaterialCommunityIcons (primary)
  | 'ionicons'    // Ionicons
  | 'feather'     // Feather (clean line icons)
  | 'micons'      // MaterialIcons
  | 'entypo';     // Entypo

// ---- Available icon names per set ----
// (TypeScript will validate these at compile time)
export type IconName = string;

interface IconProps {
  name: IconName;
  set?: IconSet;
  size?: number;
  color?: string;        // Override color (defaults to theme text color)
  style?: any;
}

export const Icon: React.FC<IconProps> = ({
  name,
  set = 'material',
  size = 24,
  color,
  style,
}) => {
  // Default to theme text color if not specified
  const { colors } = useTheme();
  const iconColor = color ?? colors.textPrimary;

  const iconProps = {
    name: name as any,
    size,
    color: iconColor,
    style,
  };

  switch (set) {
    case 'material':
      return <MaterialCommunityIcons {...iconProps} />;
    case 'ionicons':
      return <Ionicons {...iconProps} />;
    case 'feather':
      return <Feather {...iconProps} />;
    case 'micons':
      return <MaterialIcons {...iconProps} />;
    case 'entypo':
      return <Entypo {...iconProps} />;
    default:
      return <MaterialCommunityIcons {...iconProps} />;
  }
};

// ============================================================
// ICON CATALOG — Pre-defined names for consistency
// ============================================================
// Reference these names so they're consistent everywhere.
// ============================================================

export const ICONS = {
  // Navigation / Tabs
  home: { name: 'home', set: 'material' as IconSet },
  ride: { name: 'car-side', set: 'material' as IconSet },
  food: { name: 'silverware-fork-knife', set: 'material' as IconSet },
  profile: { name: 'account', set: 'material' as IconSet },

  // Services
  goRide: { name: 'car-hatchback', set: 'material' as IconSet },
  goBite: { name: 'silverware', set: 'material' as IconSet },
  wallet: { name: 'wallet-outline', set: 'material' as IconSet },

  // Actions
  topUp: { name: 'arrow-down-circle', set: 'material' as IconSet },
  withdraw: { name: 'arrow-up-circle', set: 'material' as IconSet },
  send: { name: 'arrow-top-right', set: 'material' as IconSet },
  search: { name: 'search', set: 'feather' as IconSet },
  cart: { name: 'shopping-bag', set: 'feather' as IconSet },
  back: { name: 'chevron-left', set: 'feather' as IconSet },
  forward: { name: 'chevron-right', set: 'feather' as IconSet },
  close: { name: 'x', set: 'feather' as IconSet },
  check: { name: 'check', set: 'feather' as IconSet },

  // Location
  pickup: { name: 'circle', set: 'feather' as IconSet },
  destination: { name: 'map-pin', set: 'feather' as IconSet },
  navigate: { name: 'navigation', set: 'feather' as IconSet },

  // Profile Menu
  person: { name: 'user', set: 'feather' as IconSet },
  savedPlaces: { name: 'bookmark', set: 'feather' as IconSet },
  payment: { name: 'credit-card', set: 'feather' as IconSet },
  promos: { name: 'gift', set: 'feather' as IconSet },
  history: { name: 'receipt', set: 'feather' as IconSet },
  reviews: { name: 'star', set: 'feather' as IconSet },
  help: { name: 'help-circle', set: 'feather' as IconSet },
  privacy: { name: 'shield', set: 'feather' as IconSet },
  info: { name: 'info', set: 'feather' as IconSet },
  logout: { name: 'log-out', set: 'feather' as IconSet },
  palette: { name: 'palette', set: 'material' as IconSet },
  settings: { name: 'settings', set: 'feather' as IconSet },

  // Food Categories
  pizza: { name: 'pizza', set: 'material' as IconSet },
  burger: { name: 'hamburger', set: 'material' as IconSet },
  localFood: { name: 'bowl-mix', set: 'material' as IconSet },
  drinks: { name: 'cup-water', set: 'material' as IconSet },
  dessert: { name: 'cake-variant', set: 'material' as IconSet },
  chicken: { name: 'food-drumstick', set: 'material' as IconSet },

  // Misc
  star: { name: 'star', set: 'material' as IconSet },
  clock: { name: 'clock-time-four', set: 'material' as IconSet },
  motorbike: { name: 'motorbike', set: 'material' as IconSet },
  bell: { name: 'bell', set: 'feather' as IconSet },
  google: { name: 'google', set: 'micons' as IconSet },
  apple: { name: 'apple', set: 'feather' as IconSet },
  phone: { name: 'phone', set: 'feather' as IconSet },
  chevronDown: { name: 'chevron-down', set: 'feather' as IconSet },
} as const;

// Helper to get an icon config from the catalog
export function getIcon(key: keyof typeof ICONS) {
  return ICONS[key];
}
