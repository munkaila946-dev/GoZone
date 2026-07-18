// ============================================================
// COMPONENT: ServiceCard (Realistic Icons)
// ============================================================
// Uses vector icons instead of emoji for a professional look
// ============================================================

import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from '@hooks/useTheme';
import { typography, spacing, borderRadius } from '@theme/index';
import { Icon, type IconSet } from './Icon';

type ServiceAccent = 'blue' | 'orange' | 'green' | 'purple';

interface ServiceCardProps {
  iconName: string;
  iconSet?: IconSet;
  title: string;
  description: string;
  accent: ServiceAccent;
  onPress: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  iconName,
  iconSet = 'material',
  title,
  description,
  accent,
  onPress,
}) => {
  const { colors } = useTheme();

  // Animation values for scale feedback
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 110,
      friction: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      tension: 110,
      friction: 6,
    }).start();
  };

  const getAccentColor = () => {
    switch (accent) {
      case 'blue': return colors.rideBlue;
      case 'orange': return colors.foodOrange;
      case 'green': return colors.primary;
      case 'purple': return colors.walletPurple;
    }
  };

  const getAccentBg = () => {
    switch (accent) {
      case 'blue': return colors.rideBlueLight;
      case 'orange': return colors.foodOrangeLight;
      case 'green': return colors.primaryLight;
      case 'purple': return colors.walletPurpleLight;
    }
  };

  return (
    <TouchableOpacity
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <Animated.View style={[
        styles.card, 
        { 
          backgroundColor: colors.surface, 
          borderColor: colors.border,
          transform: [{ scale }]
        }
      ]}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: getAccentBg() }]}>
          <Icon name={iconName} set={iconSet} size={26} color={getAccentColor()} />
        </View>

        {/* Text */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.textPrimary }]}>{title}</Text>
          <Text style={[styles.description, { color: colors.textTertiary }]}>{description}</Text>
        </View>

        {/* Arrow */}
        <Icon name="chevron-right" set="feather" size={22} color={colors.textTertiary} />
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    marginBottom: spacing.md,
    borderWidth: 1.2,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.base,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold as any,
  },
  description: {
    fontSize: typography.size.sm,
    marginTop: 2,
  },
});
