// ============================================================
// COMPONENT: Button (Realistic — with optional icon support)
// ============================================================

import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@hooks/useTheme';
import { typography, borderRadius } from '@theme/index';
import { Icon, type IconSet } from './Icon';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  iconName?: string;
  iconSet?: IconSet;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  loading = false,
  disabled = false,
  fullWidth = true,
  iconName,
  iconSet = 'feather',
  iconPosition = 'left',
  style,
}) => {
  const { colors } = useTheme();

  const getBgColor = () => {
    switch (variant) {
      case 'primary': return colors.primary;
      case 'secondary': return colors.surfaceAlt;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary': return colors.textInverse;
      case 'secondary': return colors.textPrimary;
      case 'outline': return colors.primary;
      case 'ghost': return colors.primary;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        {
          backgroundColor: getBgColor(),
          borderWidth: variant === 'outline' ? 1.5 : 0,
          borderColor: variant === 'outline' ? colors.borderStrong : 'transparent',
        },
        sizes[size],
        fullWidth && styles.fullWidth,
        variant === 'primary' && {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 12,
          elevation: 6,
        },
        (disabled || loading) && styles.disabled,
        style,
      ]}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {iconName && iconPosition === 'left' && (
            <Icon name={iconName} set={iconSet} size={18} color={getTextColor()} />
          )}
          <Text style={[styles.text, { color: getTextColor() }]}>{title}</Text>
          {iconName && iconPosition === 'right' && (
            <Icon name={iconName} set={iconSet} size={18} color={getTextColor()} />
          )}
        </>
      )}
    </TouchableOpacity>
  );
};

const sizes: Record<ButtonSize, ViewStyle> = {
  small: { paddingVertical: 8, paddingHorizontal: 14 },
  medium: { paddingVertical: 12, paddingHorizontal: 18 },
  large: { paddingVertical: 16, paddingHorizontal: 24 },
};

const styles = StyleSheet.create({
  base: {
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  text: {
    fontSize: typography.size.base,
    fontWeight: '600',
  },
});
