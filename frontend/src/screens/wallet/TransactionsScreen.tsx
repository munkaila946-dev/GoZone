// ============================================================
// SCREEN: Transaction History (Realistic UI)
// ============================================================
// Full transaction list with filtering and grouping by date
// ============================================================

import React, { useState, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SectionList,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/useTheme';
import { typography, spacing, borderRadius, shadows } from '@theme/index';
import { Icon, type IconSet } from '@components/index';
import { useUserStore } from '@store/index';

const FilterTabButton = ({
  tab,
  isActive,
  colors,
  onPress
}: {
  tab: any;
  isActive: boolean;
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
        styles.filterTab, 
        isActive && { backgroundColor: colors.surface },
        { transform: [{ scale }] }
      ]}>
        <Text style={[
          styles.filterTabText, 
          { color: isActive ? colors.primary : colors.textSecondary }, 
          isActive && { fontWeight: '700' }
        ]}>
          {tab.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const TransactionListItem = ({
  txn,
  colors,
  formatAmount,
  formatTime,
  iconConfig,
  isCredit
}: {
  txn: any;
  colors: any;
  formatAmount: (amount: number) => string;
  formatTime: (dateStr: string) => string;
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
          <Text style={[styles.txnMeta, { color: colors.textTertiary }]}>{formatTime(txn.date)}</Text>
        </View>
        <View style={styles.txnRight}>
          <Text style={[styles.txnAmount, { color: isCredit ? colors.primary : colors.error }]}>
            {isCredit ? '+' : '-'}{formatAmount(txn.amount)}
          </Text>
          <View style={[styles.txnStatusBadge, { backgroundColor: colors.primaryLight }]}>
            <Icon name="check" set="feather" size={9} color={colors.primary} />
            <Text style={[styles.txnStatusText, { color: colors.primary }]}>Done</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

type FilterType = 'all' | 'credit' | 'debit';

interface TransactionsScreenProps {
  navigation: any;
}

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

export const TransactionsScreen: React.FC<TransactionsScreenProps> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { transactions } = useUserStore();
  const [filter, setFilter] = useState<FilterType>('all');

  const backBtnScale = useRef(new Animated.Value(1)).current;
  const downloadBtnScale = useRef(new Animated.Value(1)).current;

  const animateScale = (val: Animated.Value, toVal: number) => {
    Animated.spring(val, {
      toValue: toVal,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };

  // Filter transactions
  const filteredTxns = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter((t) => String(t.type).toLowerCase() === filter);
  }, [filter, transactions]);

  // Group by date
  const groupedData = useMemo(() => {
    const groups: Record<string, typeof transactions> = {};
    filteredTxns.forEach((txn) => {
      const date = new Date(txn.date);
      const now = new Date('2026-06-24');
      const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
      let label: string;
      if (diffDays === 0) label = 'Today';
      else if (diffDays === 1) label = 'Yesterday';
      else label = date.toLocaleDateString('en-GH', { weekday: 'long', day: 'numeric', month: 'short' });
      if (!groups[label]) groups[label] = [];
      groups[label].push(txn);
    });
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, [filteredTxns]);

  // Calculate totals
  const totalIn = filteredTxns.filter((t) => String(t.type).toLowerCase() === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalOut = filteredTxns.filter((t) => String(t.type).toLowerCase() === 'debit').reduce((s, t) => s + t.amount, 0);

  const formatAmount = (amount: number) =>
    `GH₵${amount.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const formatTime = (dateStr: string) =>
    new Date(dateStr).toLocaleTimeString('en-GH', { hour: 'numeric', minute: '2-digit' });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ===== Header ===== */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPressIn={() => animateScale(backBtnScale, 0.9)}
          onPressOut={() => animateScale(backBtnScale, 1)}
          onPress={() => navigation.goBack()}
          activeOpacity={0.9}
          style={styles.headerBtn}
        >
          <Animated.View style={{ transform: [{ scale: backBtnScale }] }}>
            <Icon name="chevron-left" set="feather" size={24} color={colors.textPrimary} />
          </Animated.View>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Transactions</Text>
        <TouchableOpacity
          onPressIn={() => animateScale(downloadBtnScale, 0.9)}
          onPressOut={() => animateScale(downloadBtnScale, 1)}
          activeOpacity={0.9}
          style={styles.headerBtn}
        >
          <Animated.View style={{ transform: [{ scale: downloadBtnScale }] }}>
            <Icon name="download" set="feather" size={20} color={colors.textPrimary} />
          </Animated.View>
        </TouchableOpacity>
      </View>

      {/* ===== Summary Cards ===== */}
      <View style={styles.summaryRow}>
        <View style={[
          styles.summaryCard, 
          { 
            backgroundColor: colors.surface,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            borderWidth: 1.5,
          }, 
          shadows.small
        ]}>
          <View style={[styles.summaryIcon, { backgroundColor: colors.primaryLight }]}>
            <Icon name="arrow-down-left" set="feather" size={16} color={colors.primary} />
          </View>
          <Text style={[styles.summaryLabel, { color: colors.textTertiary }]}>MONEY IN</Text>
          <Text style={[styles.summaryValue, { color: colors.primary }]}>{formatAmount(totalIn)}</Text>
        </View>
        <View style={[
          styles.summaryCard, 
          { 
            backgroundColor: colors.surface,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            borderWidth: 1.5,
          }, 
          shadows.small
        ]}>
          <View style={[styles.summaryIcon, { backgroundColor: colors.foodOrangeLight }]}>
            <Icon name="arrow-up-right" set="feather" size={16} color={colors.error} />
          </View>
          <Text style={[styles.summaryLabel, { color: colors.textTertiary }]}>MONEY OUT</Text>
          <Text style={[styles.summaryValue, { color: colors.error }]}>{formatAmount(totalOut)}</Text>
        </View>
      </View>

      {/* ===== Filter Tabs ===== */}
      <View style={[styles.filterTabs, { backgroundColor: colors.surfaceAlt }]}>
        {([
          { id: 'all' as const, label: 'All' },
          { id: 'credit' as const, label: 'Money In' },
          { id: 'debit' as const, label: 'Money Out' },
        ]).map((tab) => (
          <FilterTabButton
            key={tab.id}
            tab={tab}
            isActive={filter === tab.id}
            colors={colors}
            onPress={() => setFilter(tab.id)}
          />
        ))}
      </View>

      {/* ===== Transactions List ===== */}
      <SectionList
        sections={groupedData}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderSectionHeader={({ section: { title } }) => (
          <Text style={[styles.dateHeader, { color: colors.textTertiary }]}>{title}</Text>
        )}
        renderItem={({ item: txn }) => {
          const iconConfig = getTransactionIcon(txn.category);
          const isCredit = String(txn.type).toLowerCase() === 'credit';
          return (
            <TransactionListItem
              txn={txn}
              colors={colors}
              formatAmount={formatAmount}
              formatTime={formatTime}
              iconConfig={iconConfig}
              isCredit={isCredit}
            />
          );
        }}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.base, paddingVertical: 8, borderBottomWidth: 1 },
  headerBtn: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: typography.size.lg, fontWeight: '700' },

  // Summary
  summaryRow: { flexDirection: 'row', gap: spacing.md, padding: spacing.xl, paddingBottom: spacing.md },
  summaryCard: { flex: 1, borderRadius: borderRadius.lg, padding: spacing.md },
  summaryIcon: { width: 36, height: 36, borderRadius: borderRadius.sm, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  summaryLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.8 },
  summaryValue: { fontSize: typography.size.md, fontWeight: '800', marginTop: 2 },

  // Filter
  filterTabs: { flexDirection: 'row', paddingHorizontal: spacing.xl, gap: 6, marginBottom: spacing.md },
  filterTab: { flex: 1, alignItems: 'center', paddingVertical: 9, borderRadius: borderRadius.sm },
  filterTabText: { fontSize: typography.size.sm, fontWeight: '500' },

  // List
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: 40 },
  dateHeader: { fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginTop: spacing.md, marginBottom: spacing.sm },

  // Transaction item
  txnItem: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md, borderRadius: borderRadius.md },
  txnIcon: { width: 40, height: 40, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  txnInfo: { flex: 1 },
  txnDescription: { fontSize: typography.size.sm, fontWeight: '500' },
  txnMeta: { fontSize: typography.size.sm, marginTop: 2 },
  txnRight: { alignItems: 'flex-end' },
  txnAmount: { fontSize: typography.size.md, fontWeight: '700' },
  txnStatusBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: borderRadius.sm, marginTop: 4 },
  txnStatusText: { fontSize: 9, fontWeight: '600' },
});
