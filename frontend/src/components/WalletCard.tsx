// ============================================================
// COMPONENT: WalletCard (Realistic Icons)
// ============================================================

import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@hooks/useTheme';
import { typography, spacing, borderRadius } from '@theme/index';
import { Icon } from './Icon';

interface WalletCardProps {
  balance: number;
  isBalanceVisible: boolean;
  onEyePress: () => void;
  onTopUp: () => void;
  onWithdraw: () => void;
  onSend: () => void;
}

export const WalletCard: React.FC<WalletCardProps> = ({
  balance,
  isBalanceVisible,
  onEyePress,
  onTopUp,
  onWithdraw,
  onSend,
}) => {
  const { colors, isDark } = useTheme();

  // Animation values for scale effects
  const topUpScale = useRef(new Animated.Value(1)).current;
  const withdrawScale = useRef(new Animated.Value(1)).current;
  const sendScale = useRef(new Animated.Value(1)).current;

  const animateScale = (val: Animated.Value, toVal: number) => {
    Animated.spring(val, {
      toValue: toVal,
      useNativeDriver: true,
      tension: 120,
      friction: 7,
    }).start();
  };

  // Convert theme hex color to rgba for realistic frosted glass overlay
  const hexToRgba = (hex: string, alpha: number) => {
    const cleanHex = hex.replace('#', '');
    let r = 0, g = 0, b = 0;
    if (cleanHex.length === 3) {
      r = parseInt(cleanHex[0] + cleanHex[0], 16);
      g = parseInt(cleanHex[1] + cleanHex[1], 16);
      b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else if (cleanHex.length === 6) {
      r = parseInt(cleanHex.substring(0, 2), 16);
      g = parseInt(cleanHex.substring(2, 4), 16);
      b = parseInt(cleanHex.substring(4, 6), 16);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  const startColor = hexToRgba(colors.primary, isDark ? 0.75 : 0.92);
  const endColor = hexToRgba(colors.primaryDark || colors.primary, isDark ? 0.45 : 0.78);

  const formatBalance = (amount: number) => {
    return `GH₵ ${amount.toLocaleString('en-GH', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <LinearGradient
      colors={[startColor, endColor]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.card, { shadowColor: colors.primary }]}
    >
      {/* Top Row */}
      <View style={styles.topRow}>
        <View>
          <View style={styles.labelRow}>
            <Icon name="credit-card" set="feather" size={13} color="#FFFFFF" />
            <Text style={styles.label}>SuperWallet</Text>
            <TouchableOpacity style={styles.eyeButton} onPress={onEyePress} activeOpacity={0.7}>
              <Icon name={isBalanceVisible ? "eye-off" : "eye"} set="feather" size={13} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
          <Text style={styles.balance}>
            {isBalanceVisible ? formatBalance(balance) : "GH₵ ••••"}
          </Text>
        </View>
        <View style={styles.cardChip}>
          <View style={styles.chipLine} />
          <View style={styles.chipLine} />
          <View style={styles.chipLine} />
        </View>
      </View>

      {/* Card Number (decorative) */}
      <View style={styles.cardNumberRow}>
        <Text style={styles.cardDots}>•••• ••••</Text>
        <Text style={styles.cardDots}>•••• 2024</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          onPressIn={() => animateScale(topUpScale, 0.94)}
          onPressOut={() => animateScale(topUpScale, 1)}
          onPress={onTopUp}
          activeOpacity={0.9}
          style={{ flex: 1 }}
        >
          <Animated.View style={[styles.actionBtn, { transform: [{ scale: topUpScale }] }]}>
            <Icon name="plus" set="feather" size={16} color="#FFFFFF" />
            <Text style={styles.actionText}>Top Up</Text>
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity
          onPressIn={() => animateScale(withdrawScale, 0.94)}
          onPressOut={() => animateScale(withdrawScale, 1)}
          onPress={onWithdraw}
          activeOpacity={0.9}
          style={{ flex: 1 }}
        >
          <Animated.View style={[styles.actionBtn, { transform: [{ scale: withdrawScale }] }]}>
            <Icon name="arrow-up" set="feather" size={16} color="#FFFFFF" />
            <Text style={styles.actionText}>Withdraw</Text>
          </Animated.View>
        </TouchableOpacity>

        <TouchableOpacity
          onPressIn={() => animateScale(sendScale, 0.94)}
          onPressOut={() => animateScale(sendScale, 1)}
          onPress={onSend}
          activeOpacity={0.9}
          style={{ flex: 1 }}
        >
          <Animated.View style={[styles.actionBtn, { transform: [{ scale: sendScale }] }]}>
            <Icon name="send" set="feather" size={15} color="#FFFFFF" />
            <Text style={styles.actionText}>Send</Text>
          </Animated.View>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: spacing.xl,
    marginBottom: spacing.xl,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  eyeButton: {
    marginLeft: 8,
    padding: 2,
  },
  label: {
    fontSize: 11,
    color: '#FFFFFF',
    opacity: 0.85,
    fontWeight: '600',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  balance: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 6,
    letterSpacing: -0.5,
  },
  // Chip (like a real card chip)
  cardChip: {
    width: 38,
    height: 28,
    borderRadius: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  chipLine: {
    width: 24,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  cardNumberRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    marginBottom: spacing.lg,
  },
  cardDots: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 3,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: borderRadius.md,
    paddingVertical: 11,
  },
  actionText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
