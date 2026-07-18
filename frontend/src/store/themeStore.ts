// ============================================================
// STORE: Theme Store (Zustand)
// ============================================================
// Manages the current theme selection.
// When theme changes → all components using useTheme() re-render!
// ============================================================

import { create } from 'zustand';
import { themes, darkTheme } from '@theme/themes';
import type { ThemeName, AppTheme } from '@theme/themes';

interface ThemeState {
  // ---- State ----
  currentThemeName: ThemeName;       // e.g. 'dark', 'light'
  currentTheme: AppTheme;            // The full theme object

  // ---- Actions ----
  setTheme: (name: ThemeName) => void;       // Switch to a specific theme
  toggleTheme: () => void;                    // Quick toggle dark/light
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  // Default theme is Dark (our premium look)
  currentThemeName: 'dark',
  currentTheme: darkTheme,

  // Switch to a new theme
  setTheme: (name: ThemeName) => {
    set({
      currentThemeName: name,
      currentTheme: themes[name],
    });
    // NOTE: In a real app, we'd also persist this to AsyncStorage
    // so the user's choice survives app restarts.
  },

  // Quick toggle between dark and light
  toggleTheme: () => {
    const current = get().currentThemeName;
    const next = current === 'light' ? 'dark' : 'light';
    get().setTheme(next);
  },
}));
