// ============================================================
// HOOK: useTheme
// ============================================================
// Simple hook to get the current theme + colors anywhere.
//
// Usage in any component:
//   const { colors, isDark, theme } = useTheme();
//   <View style={{ backgroundColor: colors.background }} />
//
// When the user switches themes, this hook triggers a re-render
// with the new colors automatically. ✨
// ============================================================

import { useThemeStore } from '@store/themeStore';
import type { ThemeColors, AppTheme } from '@theme/themes';

interface UseThemeReturn {
  colors: ThemeColors;     // The active theme's colors
  theme: AppTheme;         // The full active theme object
  isDark: boolean;         // Whether dark mode is active
  themeName: string;       // Current theme name ('light', 'dark', etc.)
}

export const useTheme = (): UseThemeReturn => {
  const { currentTheme, currentThemeName } = useThemeStore();

  return {
    colors: currentTheme.colors,
    theme: currentTheme,
    isDark: currentTheme.isDark,
    themeName: currentThemeName,
  };
};
