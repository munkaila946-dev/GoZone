// ============================================================
// SCREEN: Theme Settings (Realistic UI)
// ============================================================

import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/useTheme';
import { useThemeStore } from '@store/themeStore';
import { themeList } from '@theme/themes';
import type { AppTheme } from '@theme/themes';
import { typography, spacing, borderRadius, shadows } from '@theme/index';
import { Icon } from '@components/index';

const ThemePaletteGridItem = ({
  theme,
  isActive,
  colors,
  onPress
}: {
  theme: AppTheme;
  isActive: boolean;
  colors: any;
  onPress: () => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
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
      style={{ width: '47%' }}
    >
      <Animated.View style={[
        styles.paletteItem,
        { 
          backgroundColor: colors.surface, 
          borderColor: isActive ? colors.primary : colors.border,
          transform: [{ scale }],
          width: '100%',
        },
        shadows.small
      ]}>
        {/* Color preview circle */}
        <View style={styles.paletteCircleWrap}>
          <View style={[styles.paletteCircleLeft, { backgroundColor: theme.previewColors.bg }]} />
          <View style={[styles.paletteCircleRight, { backgroundColor: theme.previewColors.accent }]} />
          {isActive && (
            <View style={styles.paletteActiveCheck}>
              <Icon name="check" set="feather" size={12} color="#FFFFFF" />
            </View>
          )}
        </View>

        {/* Theme Name */}
        <Text style={[styles.paletteName, { color: colors.textPrimary }]} numberOfLines={1}>
          {theme.displayName}
        </Text>
        
        <Icon
          name={theme.isDark ? 'moon' : 'sun'}
          set="feather"
          size={12}
          color={colors.textTertiary}
          style={{ marginTop: 4 }}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};

interface ThemeSettingsScreenProps {
  navigation: any;
}

export const ThemeSettingsScreen: React.FC<ThemeSettingsScreenProps> = ({ navigation }) => {
  const { colors, themeName } = useTheme();
  const setTheme = useThemeStore((s) => s.setTheme);

  const backBtnScale = useRef(new Animated.Value(1)).current;

  const animateScale = (val: Animated.Value, toVal: number) => {
    Animated.spring(val, {
      toValue: toVal,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* ===== Header ===== */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPressIn={() => animateScale(backBtnScale, 0.9)}
          onPressOut={() => animateScale(backBtnScale, 1)}
          onPress={() => navigation.goBack()}
          activeOpacity={0.9}
          style={styles.backBtn}
        >
          <Animated.View style={{ transform: [{ scale: backBtnScale }] }}>
            <Icon name="chevron-left" set="feather" size={24} color={colors.textPrimary} />
          </Animated.View>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Appearance</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Info Banner */}
        <View style={[styles.infoBanner, { backgroundColor: colors.primaryLight }]}>
          <Icon name="palette" set="material" size={18} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.textPrimary }]}>
            Choose a theme. Your selection applies instantly across the entire app.
          </Text>
        </View>

        {/* Color Palette Theme Selector */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>THEME PALETTE</Text>
        
        <View style={styles.paletteGrid}>
          {themeList.map((theme: AppTheme) => (
            <ThemePaletteGridItem
              key={theme.name}
              theme={theme}
              isActive={theme.name === themeName}
              colors={colors}
              onPress={() => setTheme(theme.name as any)}
            />
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.base, paddingVertical: 8, borderBottomWidth: 1,
  },
  backBtn: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: typography.size.lg, fontWeight: '700' },
  scrollContent: { padding: spacing.xl },

  // Info
  infoBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    borderRadius: borderRadius.lg, padding: spacing.base, marginBottom: spacing.xl,
  },
  infoText: { flex: 1, fontSize: typography.size.sm, lineHeight: 20 },

  // Section
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: spacing.md },

  // Palette styles
  paletteGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'space-between',
  },
  paletteItem: {
    width: '47%',
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    marginBottom: spacing.sm,
  },
  paletteCircleWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    flexDirection: 'row',
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  paletteCircleLeft: {
    flex: 1,
    height: '100%',
  },
  paletteCircleRight: {
    flex: 1,
    height: '100%',
  },
  paletteActiveCheck: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paletteName: {
    fontSize: typography.size.md,
    fontWeight: '700',
    textAlign: 'center',
  },
});
