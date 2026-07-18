// ============================================================
// THEME: SPACING & LAYOUT
// ============================================================
// Consistent spacing values for margins, padding, and layout
// ============================================================

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

export const borderRadius = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export const layout = {
  screenWidth: '100%' as unknown as number,
  screenHeight: '100%' as unknown as number,

  // Standard content padding (left & right)
  contentPadding: 24,

  // Phone safe area
  statusBarHeight: 44,
  tabBarHeight: 83,
} as const;

// 📱 Common shadow styles
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  green: {
    shadowColor: '#00B14F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
} as const;
