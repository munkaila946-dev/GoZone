// ============================================================
// THEME: COLORS
// ============================================================
// This file defines every color used in GoZone.
// Change a color here → it updates everywhere in the app!
// ============================================================

export const colors = {
  // 🔵 Brand Colors
  primary: '#00B14F',        // GoZone Green — main brand color
  primaryDark: '#007E33',    // Darker green for gradients
  primaryLight: '#E8F8F0',   // Light green for backgrounds

  // 🎨 Service Accent Colors
  rideBlue: '#2196F3',       // GoRide accent
  rideBlueLight: '#E3F2FD',  // GoRide light background
  foodOrange: '#FF6B35',     // GoBite accent
  foodOrangeLight: '#FFF3EE', // GoBite light background
  walletPurple: '#7C4DFF',   // SuperWallet accent
  walletPurpleLight: '#F3E8FF',

  // 🌑 Dark Theme Colors (used on Home screen)
  darkBg: '#1A1A2E',         // Main dark background
  darkCard: '#252540',       // Card background in dark mode
  darkBorder: 'rgba(255,255,255,0.06)',

  // ☀️ Light Theme Colors
  lightBg: '#F5F6FA',        // Main light background
  white: '#FFFFFF',          // Card / surface background

  // 📝 Text Colors
  textPrimary: '#1A1A2E',    // Main text (headings)
  textSecondary: '#6B7280',  // Secondary text (descriptions)
  textTertiary: '#9CA3AF',   // Tertiary text (hints, labels)
  textInverse: '#FFFFFF',    // Text on dark/colored backgrounds

  // ⚠️ Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // 🏷️ Neutral Colors
  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  // 🌟 Special
  gradient: {
    greenStart: '#00B14F',
    greenEnd: '#007E33',
    orangeStart: '#FF6B35',
    orangeEnd: '#F7931E',
    darkStart: '#1A1A2E',
    darkEnd: '#16162A',
  },

  // 💰 Currency / Ghana Cedi symbol styling
  currency: '#00B14F',
} as const;

export type Colors = typeof colors;
