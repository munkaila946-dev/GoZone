// ============================================================
// SCREEN: SuperWallet Home (Realistic UI)
// ============================================================
// Wallet balance card, quick actions, recent transactions
// ============================================================

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/useTheme';
import { typography, spacing, borderRadius, shadows } from '@theme/index';
import { Icon, type IconSet } from '@components/index';
import { useUserStore } from '@store/index';

const WalletQuickActionItem = ({
  action,
  colors,
  onPress
}: {
  action: any;
  colors: any;
  onPress: () => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.94,
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
      style={{ flex: 1 }}
    >
      <Animated.View style={[
        styles.quickActionItem, 
        { 
          backgroundColor: colors.surface,
          transform: [{ scale }]
        }
      ]}>
        <View style={[styles.quickActionIcon, { backgroundColor: action.bgColor }]}>
          <Icon name={action.icon} set={action.iconSet} size={action.iconSize} color={action.color} />
        </View>
        <Text style={[styles.quickActionText, { color: colors.textPrimary }]}>{action.label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const WalletTransactionItem = ({
  txn,
  colors,
  formatAmount,
  formatDate,
  iconConfig,
  isCredit
}: {
  txn: any;
  colors: any;
  formatAmount: (amount: number) => string;
  formatDate: (dateStr: string) => string;
  iconConfig: any;
  isCredit: boolean;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.97,
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
      activeOpacity={0.9}
    >
      <Animated.View style={[
        styles.txnItem, 
        { 
          backgroundColor: colors.surface,
          transform: [{ scale }]
        }
      ]}>
        <View style={[styles.txnIcon, { backgroundColor: isCredit ? colors.primaryLight : colors.surfaceAlt }]}>
          <Icon name={iconConfig.name} set={iconConfig.set} size={18} color={isCredit ? colors.primary : colors.textSecondary} />
        </View>
        <View style={styles.txnInfo}>
          <Text style={[styles.txnDescription, { color: colors.textPrimary }]} numberOfLines={1}>
            {txn.description}
          </Text>
          <Text style={[styles.txnDate, { color: colors.textTertiary }]}>{formatDate(txn.date)}</Text>
        </View>
        <Text style={[styles.txnAmount, { color: isCredit ? colors.primary : colors.error }]}>
          {isCredit ? '+' : '-'}{formatAmount(txn.amount)}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

interface WalletHomeScreenProps {
  navigation: any;
}

// Transaction icon mapping
const getTransactionIcon = (category: string): { name: string; set: IconSet } => {
  switch (category) {
    case 'ride': return { name: 'car-side', set: 'material' };
    case 'food': return { name: 'silverware-fork-knife', set: 'material' };
    case 'topup': return { name: 'arrow-down-circle', set: 'material' };
    case 'transfer': return { name: 'arrow-top-right', set: 'material' };
    case 'withdrawal': return { name: 'arrow-up-circle', set: 'material' };
    case 'refund': return { name: 'undo-variant', set: 'material' };
    default: return { name: 'circle-outline', set: 'material' };
  }
};

export const WalletHomeScreen: React.FC<WalletHomeScreenProps> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { name, phone, balance, isBalanceVisible, setBalanceVisible, transactions } = useUserStore();
  const recentTransactions = transactions.slice(0, 5);

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinCode, setPinCode] = useState('');
  const [pinError, setPinError] = useState(false);

  const backBtnScale = useRef(new Animated.Value(1)).current;

  const animateScale = (val: Animated.Value, toVal: number) => {
    Animated.spring(val, {
      toValue: toVal,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };

  const handleEyePress = () => {
    if (isBalanceVisible) {
      setBalanceVisible(false);
    } else {
      setPinCode('');
      setPinError(false);
      setShowPinModal(true);
    }
  };

  const handlePinChange = (text: string) => {
    const numericText = text.replace(/[^0-9]/g, '');
    setPinCode(numericText);

    if (numericText.length === 4) {
      if (numericText === '1234') {
        setBalanceVisible(true);
        setShowPinModal(false);
        setPinError(false);
      } else {
        setPinError(true);
        // Clear pin after a brief error display
        setTimeout(() => {
          setPinCode('');
          setPinError(false);
        }, 1000);
      }
    }
  };

  const formatAmount = (amount: number) =>
    `GH₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date('2026-06-24');
    const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-GH', { day: 'numeric', month: 'short' });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ===== Header ===== */}
        <View style={styles.header}>
          <TouchableOpacity
            onPressIn={() => animateScale(backBtnScale, 0.9)}
            onPressOut={() => animateScale(backBtnScale, 1)}
            style={[styles.iconButton, { backgroundColor: colors.surface }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.9}
          >
            <Animated.View style={{ transform: [{ scale: backBtnScale }] }}>
              <Icon name="chevron-left" set="feather" size={22} color={colors.textPrimary} />
            </Animated.View>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>SuperWallet</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* ===== Balance Card ===== */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.balanceCard}
        >
          <View style={styles.balanceTopRow}>
            <View style={styles.balanceLabelRow}>
              <Icon name="credit-card" set="feather" size={14} color="#FFFFFF" />
              <Text style={styles.balanceLabel}>TOTAL BALANCE</Text>
            </View>
            <TouchableOpacity style={styles.eyeButton} onPress={handleEyePress}>
              <Icon name={isBalanceVisible ? "eye-off" : "eye"} set="feather" size={16} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>
          <Text style={styles.balanceAmount}>
            {isBalanceVisible ? formatAmount(balance) : "GH₵ ••••"}
          </Text>

          {/* Card footer */}
          <View style={styles.balanceFooterRow}>
            <View>
              <Text style={styles.balanceCardLabel}>•••• •••• •••• 2024</Text>
              <Text style={styles.balanceCardName}>{name.toUpperCase()}</Text>
            </View>
            <View style={styles.cardBrand}>
              <Text style={styles.cardBrandText}>GoZone</Text>
            </View>
          </View>
        </LinearGradient>

        {/* ===== Quick Actions Grid ===== */}
        <View style={styles.quickActionsGrid}>
          <WalletQuickActionItem
            action={{ label: 'Top Up', icon: 'plus', iconSet: 'feather', iconSize: 20, bgColor: colors.primaryLight, color: colors.primary }}
            colors={colors}
            onPress={() => navigation.navigate('TopUp')}
          />
          <WalletQuickActionItem
            action={{ label: 'Send', icon: 'send', iconSet: 'feather', iconSize: 18, bgColor: colors.rideBlueLight, color: colors.rideBlue }}
            colors={colors}
            onPress={() => navigation.navigate('SendMoney')}
          />
          <WalletQuickActionItem
            action={{ label: 'Withdraw', icon: 'arrow-up', iconSet: 'feather', iconSize: 20, bgColor: colors.foodOrangeLight, color: colors.foodOrange }}
            colors={colors}
            onPress={() => navigation.navigate('Withdraw')}
          />
          <WalletQuickActionItem
            action={{ label: 'History', icon: 'list', iconSet: 'feather', iconSize: 20, bgColor: colors.walletPurpleLight, color: colors.walletPurple }}
            colors={colors}
            onPress={() => navigation.navigate('Transactions')}
          />
        </View>

        {/* ===== Funding Sources ===== */}
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Linked Accounts</Text>
        <View style={[
          styles.fundingCard, 
          { 
            backgroundColor: colors.surface,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            borderWidth: 1.5,
          }, 
          shadows.small
        ]}>
          <View style={[styles.fundingIcon, { backgroundColor: '#FFEB3B20' }]}>
            <Icon name="cellphone" set="material" size={20} color='#FFC107' />
          </View>
          <View style={styles.fundingInfo}>
            <Text style={[styles.fundingName, { color: colors.textPrimary }]}>MTN Mobile Money</Text>
            <Text style={[styles.fundingNumber, { color: colors.textTertiary }]}>{phone}</Text>
          </View>
          <View style={[styles.fundingBadge, { backgroundColor: colors.primaryLight }]}>
            <Text style={[styles.fundingBadgeText, { color: colors.primary }]}>Default</Text>
          </View>
        </View>

        {/* ===== Recent Transactions ===== */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Transactions')}>
            <Text style={[styles.seeAllText, { color: colors.primary }]}>See all</Text>
          </TouchableOpacity>
        </View>

        {recentTransactions.map((txn) => {
          const iconConfig = getTransactionIcon(txn.category);
          const isCredit = String(txn.type).toLowerCase() === 'credit';
          return (
            <WalletTransactionItem
              key={txn.id}
              txn={txn}
              colors={colors}
              formatAmount={formatAmount}
              formatDate={formatDate}
              iconConfig={iconConfig}
              isCredit={isCredit}
            />
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* ===== PIN verification modal ===== */}
      <Modal
        visible={showPinModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPinModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalCard, 
            { 
              backgroundColor: colors.surface,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              borderWidth: 1.5,
            }, 
            shadows.medium
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Enter Security PIN</Text>
              <TouchableOpacity onPress={() => setShowPinModal(false)}>
                <Icon name="x" set="feather" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={[styles.lockIconWrap, { backgroundColor: pinError ? 'rgba(239, 68, 68, 0.1)' : colors.primaryLight }]}>
                <Icon name={pinError ? "alert-circle" : "lock"} set="feather" size={28} color={pinError ? "#EF4444" : colors.primary} />
              </View>

              <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
                {pinError ? "Incorrect security PIN. Please try again." : "Type your 4-digit security PIN to reveal your wallet balance."}
              </Text>

              {/* Dots representing entered PIN digits */}
              <View style={styles.pinDotsRow}>
                {[0, 1, 2, 3].map((index) => {
                  const isDigitEntered = pinCode.length > index;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.pinDot,
                        {
                          backgroundColor: pinError
                            ? '#EF4444'
                            : isDigitEntered
                              ? colors.primary
                              : colors.borderStrong,
                        }
                      ]}
                    />
                  );
                })}
              </View>

              {/* Hidden text input to receive native keyboard input */}
              <TextInput
                style={styles.hiddenInput}
                keyboardType="numeric"
                maxLength={4}
                value={pinCode}
                onChangeText={handlePinChange}
                autoFocus={true}
                caretHidden={true}
              />

              <Text style={[styles.pinHint, { color: colors.textTertiary }]}>
                Default development PIN: 1234
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: spacing.xl },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.xl },
  headerTitle: { fontSize: typography.size['2xl'], fontWeight: '700' },
  iconButton: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  // Balance card
  balanceCard: {
    borderRadius: 22, padding: spacing.xl, marginBottom: spacing.xl,
    shadowColor: '#00B14F', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 20, elevation: 10,
  },
  balanceTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  balanceLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  balanceLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: '600', letterSpacing: 1 },
  eyeButton: { width: 32, height: 32, borderRadius: 9999, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  balanceAmount: { color: '#FFFFFF', fontSize: typography.size['4xl'], fontWeight: '800', marginTop: 8, letterSpacing: -1 },
  balanceFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: spacing.lg },
  balanceCardLabel: { color: 'rgba(255,255,255,0.4)', fontSize: 13, letterSpacing: 3, fontWeight: '600' },
  balanceCardName: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', letterSpacing: 1.5, marginTop: 6 },
  cardBrand: { backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: borderRadius.sm },
  cardBrandText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },

  // Quick actions
  quickActionsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xl },
  quickActionItem: { alignItems: 'center', gap: 8, flex: 1, paddingVertical: spacing.md, borderRadius: borderRadius.md },
  quickActionIcon: { width: 48, height: 48, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  quickActionText: { fontSize: 12, fontWeight: '500' },

  // Section
  sectionTitle: { fontSize: typography.size.md, fontWeight: '700', marginBottom: spacing.md },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  seeAllText: { fontSize: typography.size.sm, fontWeight: '600' },

  // Funding
  fundingCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.xl },
  fundingIcon: { width: 44, height: 44, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  fundingInfo: { flex: 1 },
  fundingName: { fontSize: typography.size.md, fontWeight: '600' },
  fundingNumber: { fontSize: typography.size.sm, marginTop: 2 },
  fundingBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: borderRadius.sm },
  fundingBadgeText: { fontSize: 11, fontWeight: '600' },

  // Transaction
  txnItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md, borderRadius: borderRadius.md, marginBottom: 8 },
  txnIcon: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  txnInfo: { flex: 1 },
  txnDescription: { fontSize: typography.size.sm, fontWeight: '500' },
  txnDate: { fontSize: typography.size.sm, marginTop: 2 },
  txnAmount: { fontSize: typography.size.md, fontWeight: '700' },

  // Modal styling
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  modalCard: { width: '100%', maxWidth: 320, borderRadius: borderRadius.lg, padding: spacing.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  modalTitle: { fontSize: typography.size.md, fontWeight: '700' },
  modalBody: { alignItems: 'center', marginBottom: spacing.sm },
  lockIconWrap: { width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  modalDesc: { fontSize: typography.size.sm, textAlign: 'center', lineHeight: 20, marginBottom: spacing.lg },
  pinDotsRow: { flexDirection: 'row', gap: 16, marginBottom: spacing.lg, justifyContent: 'center' },
  pinDot: { width: 14, height: 14, borderRadius: 7 },
  hiddenInput: { position: 'absolute', width: 0, height: 0, opacity: 0 },
  pinHint: { fontSize: 11, textAlign: 'center', marginTop: spacing.md }
});
