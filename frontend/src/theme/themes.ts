// ============================================================
// THEME: MULTI-THEME DEFINITIONS
// ============================================================
// Each theme defines a complete set of semantic colors.
// The app reads these dynamically — switch one, everything updates!
// ============================================================

// ---- Theme Type ----
export interface ThemeColors {
  // Backgrounds
  background: string;       // Main screen background
  surface: string;          // Cards, bottom sheets, elevated surfaces
  surfaceAlt: string;       // Input fields, secondary backgrounds

  // Text
  textPrimary: string;      // Headings, important text
  textSecondary: string;    // Descriptions, subtitles
  textTertiary: string;     // Hints, labels, placeholders
  textInverse: string;      // Text on colored/brand backgrounds

  // Brand Colors (the green can shift per theme)
  primary: string;          // Main brand color — buttons, accents
  primaryDark: string;      // Gradient end color
  primaryLight: string;     // Light tint backgrounds

  // Service Accent Colors (constant across themes — brand identity)
  rideBlue: string;
  rideBlueLight: string;
  foodOrange: string;
  foodOrangeLight: string;
  walletPurple: string;
  walletPurpleLight: string;

  // Borders & Dividers
  border: string;           // Light borders
  borderStrong: string;     // Stronger dividers

  // Bottom Tab Bar
  tabBg: string;
  tabBarActive: string;
  tabBarInactive: string;

  // Status Colors
  success: string;
  warning: string;
  error: string;

  // Shadows
  shadowColor: string;
}

export interface AppTheme {
  name: string;
  displayName: string;      // What users see in the picker
  description: string;      // Short tagline
  isDark: boolean;
  previewColors: {          // For the theme picker preview swatches
    bg: string;
    surface: string;
    accent: string;
  };
  colors: ThemeColors;
}

export type ThemeName = 'light' | 'dark' | 'midnight' | 'sunset' | 'forest' | 'ocean';

// ============================================================
// THEME: LIGHT (Clean & Bright)
// ============================================================
export const lightTheme: AppTheme = {
  name: 'light',
  displayName: 'Light',
  description: 'Clean & bright — great for daytime',
  isDark: false,
  previewColors: { bg: '#F5F6FA', surface: '#FFFFFF', accent: '#00B14F' },
  colors: {
    background: '#F5F6FA',
    surface: '#FFFFFF',
    surfaceAlt: '#F5F6FA',
    textPrimary: '#1A1A2E',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textInverse: '#FFFFFF',
    primary: '#00B14F',
    primaryDark: '#007E33',
    primaryLight: '#E8F8F0',
    rideBlue: '#2196F3',
    rideBlueLight: '#E3F2FD',
    foodOrange: '#FF6B35',
    foodOrangeLight: '#FFF3EE',
    walletPurple: '#7C4DFF',
    walletPurpleLight: '#F3E8FF',
    border: '#E5E7EB',
    borderStrong: '#D1D5DB',
    tabBg: '#FFFFFF',
    tabBarActive: '#00B14F',
    tabBarInactive: '#9CA3AF',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    shadowColor: '#000000',
  },
};

// ============================================================
// THEME: DARK (Premium Navy — default home look)
// ============================================================
export const darkTheme: AppTheme = {
  name: 'dark',
  displayName: 'Dark',
  description: 'Premium dark — easy on the eyes',
  isDark: true,
  previewColors: { bg: '#1A1A2E', surface: '#252540', accent: '#00B14F' },
  colors: {
    background: '#1A1A2E',
    surface: '#252540',
    surfaceAlt: '#2A2A45',
    textPrimary: '#FFFFFF',
    textSecondary: '#9CA3AF',
    textTertiary: '#6B7280',
    textInverse: '#FFFFFF',
    primary: '#00B14F',
    primaryDark: '#007E33',
    primaryLight: 'rgba(0, 177, 79, 0.15)',
    rideBlue: '#2196F3',
    rideBlueLight: 'rgba(33, 150, 243, 0.15)',
    foodOrange: '#FF6B35',
    foodOrangeLight: 'rgba(255, 107, 53, 0.15)',
    walletPurple: '#7C4DFF',
    walletPurpleLight: 'rgba(124, 77, 255, 0.15)',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.15)',
    tabBg: '#252540',
    tabBarActive: '#00B14F',
    tabBarInactive: '#6B7280',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    shadowColor: '#000000',
  },
};

// ============================================================
// THEME: MIDNIGHT (Deep Black with Teal)
// ============================================================
export const midnightTheme: AppTheme = {
  name: 'midnight',
  displayName: 'Midnight',
  description: 'Deep black with vibrant teal accents',
  isDark: true,
  previewColors: { bg: '#0D1117', surface: '#161B22', accent: '#00D9B2' },
  colors: {
    background: '#0D1117',
    surface: '#161B22',
    surfaceAlt: '#21262D',
    textPrimary: '#F0F6FC',
    textSecondary: '#8B949E',
    textTertiary: '#6E7681',
    textInverse: '#0D1117',
    primary: '#00D9B2',
    primaryDark: '#00A88A',
    primaryLight: 'rgba(0, 217, 178, 0.12)',
    rideBlue: '#58A6FF',
    rideBlueLight: 'rgba(88, 166, 255, 0.15)',
    foodOrange: '#FF7B54',
    foodOrangeLight: 'rgba(255, 123, 84, 0.15)',
    walletPurple: '#BC8CFF',
    walletPurpleLight: 'rgba(188, 140, 255, 0.15)',
    border: 'rgba(240, 246, 252, 0.1)',
    borderStrong: 'rgba(240, 246, 252, 0.2)',
    tabBg: '#161B22',
    tabBarActive: '#00D9B2',
    tabBarInactive: '#6E7681',
    success: '#3FB950',
    warning: '#D29922',
    error: '#F85149',
    shadowColor: '#000000',
  },
};

// ============================================================
// THEME: SUNSET (Warm Dark with Amber/Gold)
// ============================================================
export const sunsetTheme: AppTheme = {
  name: 'sunset',
  displayName: 'Sunset',
  description: 'Warm tones with golden accents',
  isDark: true,
  previewColors: { bg: '#1E1410', surface: '#2D1F18', accent: '#F59E0B' },
  colors: {
    background: '#1E1410',
    surface: '#2D1F18',
    surfaceAlt: '#3A2820',
    textPrimary: '#FFF8F0',
    textSecondary: '#C4A89A',
    textTertiary: '#8A7060',
    textInverse: '#1E1410',
    primary: '#F59E0B',
    primaryDark: '#D97706',
    primaryLight: 'rgba(245, 158, 11, 0.15)',
    rideBlue: '#FB923C',
    rideBlueLight: 'rgba(251, 146, 60, 0.15)',
    foodOrange: '#EF4444',
    foodOrangeLight: 'rgba(239, 68, 68, 0.15)',
    walletPurple: '#A78BFA',
    walletPurpleLight: 'rgba(167, 139, 250, 0.15)',
    border: 'rgba(255, 248, 240, 0.08)',
    borderStrong: 'rgba(255, 248, 240, 0.15)',
    tabBg: '#2D1F18',
    tabBarActive: '#F59E0B',
    tabBarInactive: '#8A7060',
    success: '#84CC16',
    warning: '#FBBF24',
    error: '#EF4444',
    shadowColor: '#000000',
  },
};

// ============================================================
// ============================================================
// THEME: FOREST (Calming Dark Forest with Mint/Emerald Accents)
// ============================================================
export const forestTheme: AppTheme = {
  name: 'forest',
  displayName: 'Forest',
  description: 'Calming deep green with mint accents',
  isDark: true,
  previewColors: { bg: '#0A1E14', surface: '#122D1F', accent: '#10B981' },
  colors: {
    background: '#0A1E14',
    surface: '#122D1F',
    surfaceAlt: '#1B3E2B',
    textPrimary: '#ECFDF5',
    textSecondary: '#A7F3D0',
    textTertiary: '#6EE7B7',
    textInverse: '#0A1E14',
    primary: '#10B981',
    primaryDark: '#059669',
    primaryLight: 'rgba(16, 185, 129, 0.15)',
    rideBlue: '#3B82F6',
    rideBlueLight: 'rgba(59, 130, 246, 0.15)',
    foodOrange: '#F59E0B',
    foodOrangeLight: 'rgba(245, 158, 11, 0.15)',
    walletPurple: '#8B5CF6',
    walletPurpleLight: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(236, 253, 245, 0.08)',
    borderStrong: 'rgba(236, 253, 245, 0.15)',
    tabBg: '#122D1F',
    tabBarActive: '#10B981',
    tabBarInactive: '#6EE7B7',
    success: '#34D399',
    warning: '#FBBF24',
    error: '#F87171',
    shadowColor: '#000000',
  },
};

// ============================================================
// THEME: OCEAN (Majestic Deep Blue with Cyan Accents)
// ============================================================
export const oceanTheme: AppTheme = {
  name: 'ocean',
  displayName: 'Ocean',
  description: 'Majestic deep blue with electric cyan accents',
  isDark: true,
  previewColors: { bg: '#0A192F', surface: '#172A45', accent: '#00F0FF' },
  colors: {
    background: '#0A192F',
    surface: '#172A45',
    surfaceAlt: '#203756',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    textInverse: '#0A192F',
    primary: '#00F0FF',
    primaryDark: '#00B2C2',
    primaryLight: 'rgba(0, 240, 255, 0.15)',
    rideBlue: '#38BDF8',
    rideBlueLight: 'rgba(56, 189, 248, 0.15)',
    foodOrange: '#FB923C',
    foodOrangeLight: 'rgba(251, 146, 60, 0.15)',
    walletPurple: '#C084FC',
    walletPurpleLight: 'rgba(192, 132, 252, 0.15)',
    border: 'rgba(248, 250, 252, 0.08)',
    borderStrong: 'rgba(248, 250, 252, 0.15)',
    tabBg: '#172A45',
    tabBarActive: '#00F0FF',
    tabBarInactive: '#64748B',
    success: '#4ADE80',
    warning: '#FBBF24',
    error: '#F87171',
    shadowColor: '#000000',
  },
};

// ============================================================
// THEME REGISTRY — All themes in one place
// ============================================================
export const themes: Record<ThemeName, AppTheme> = {
  light: lightTheme,
  dark: darkTheme,
  midnight: midnightTheme,
  sunset: sunsetTheme,
  forest: forestTheme,
  ocean: oceanTheme,
};

export const themeList: AppTheme[] = [
  lightTheme,
  darkTheme,
  midnightTheme,
  sunsetTheme,
  forestTheme,
  oceanTheme,
];

// Custom dark map styling representing premium Dark mode maps (Template 2)
export const DARK_MAP_STYLE = [
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

