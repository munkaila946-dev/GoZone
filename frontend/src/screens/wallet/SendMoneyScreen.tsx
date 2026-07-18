// ============================================================
// SCREEN: Send Money (Realistic UI)
// ============================================================
// Send to phone number / recent contacts with confirmation
// ============================================================

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/useTheme';
import { typography, spacing, borderRadius, shadows } from '@theme/index';
import { Icon, Button } from '@components/index';
import { useUserStore } from '@store/index';

const ContactAvatarItem = ({
  contact,
  isSelected,
  colors,
  onPress
}: {
  contact: any;
  isSelected: boolean;
  colors: any;
  onPress: () => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
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
      style={styles.contactItem}
    >
      <Animated.View style={[
        styles.contactAvatar, 
        { 
          backgroundColor: contact.color,
          transform: [{ scale }] 
        }, 
        isSelected && { borderWidth: 3, borderColor: colors.primary }
      ]}>
        <Text style={styles.contactInitials}>{contact.initials}</Text>
      </Animated.View>
      <Text style={[styles.contactName, { color: colors.textSecondary }]} numberOfLines={1}>
        {contact.name.split(' ')[0]}
      </Text>
    </TouchableOpacity>
  );
};

const QuickAmountChip = ({
  amt,
  currentAmt,
  colors,
  onPress
}: {
  amt: number;
  currentAmt: string;
  colors: any;
  onPress: () => void;
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const isSelected = parseFloat(currentAmt) === amt;

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.92,
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
        styles.quickBtn, 
        { 
          backgroundColor: isSelected ? colors.primary : colors.surface, 
          borderColor: isSelected ? colors.primary : colors.border,
          transform: [{ scale }]
        }
      ]}>
        <Text style={[styles.quickText, { color: isSelected ? '#FFFFFF' : colors.textPrimary }]}>
          {amt}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Recent contacts
const RECENT_CONTACTS = [
  { id: '1', name: 'Ama Owusu', initials: 'AO', number: '+233 24 987 6543', color: '#E91E63' },
  { id: '2', name: 'Kofi Asante', initials: 'KA', number: '+233 20 555 1234', color: '#2196F3' },
  { id: '3', name: 'Adwoa Mensah', initials: 'AM', number: '+233 27 111 2222', color: '#FF9800' },
  { id: '4', name: 'Yaw Boateng', initials: 'YB', number: '+233 55 333 4444', color: '#9C27B0' },
];

interface SendMoneyScreenProps {
  navigation: any;
}

export const SendMoneyScreen: React.FC<SendMoneyScreenProps> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const backBtnScale = useRef(new Animated.Value(1)).current;
  const sendBtnScale = useRef(new Animated.Value(1)).current;

  const animateScale = (val: Animated.Value, toVal: number) => {
    Animated.spring(val, {
      toValue: toVal,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };

  const { balance, setBalance, addTransaction } = useUserStore();
  const walletBalance = balance;
  const numericAmount = parseFloat(amount) || 0;
  const exceedsBalance = numericAmount > walletBalance;
  const canProceed = numericAmount > 0 && numericAmount <= walletBalance && recipient.length > 0;

  const handleSend = () => {
    setProcessing(true);
    setTimeout(() => {
      const newBalance = walletBalance - numericAmount;
      setBalance(newBalance);

      // Find recipient name if matching a contact
      const contact = RECENT_CONTACTS.find(
        (c) => c.number.replace('+233 ', '').replace(/\s/g, '') === recipient.replace(/\s/g, '')
      );
      const recipientName = contact ? contact.name : `+233 ${recipient}`;

      addTransaction({
        id: 't_' + Date.now(),
        type: 'debit',
        category: 'transfer',
        amount: numericAmount,
        description: `Sent to ${recipientName}`,
        date: new Date().toISOString(),
        status: 'completed',
      });

      setProcessing(false);

      Alert.alert(
        'Transfer Successful',
        `GH₵${numericAmount.toFixed(2)} has been sent to ${recipientName}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1500);
  };

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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Send Money</Text>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ===== Available Balance ===== */}
        <View style={[styles.balanceRow, { backgroundColor: colors.surface }, shadows.small]}>
          <Icon name="credit-card" set="feather" size={16} color={colors.primary} />
          <Text style={[styles.balanceLabel, { color: colors.textTertiary }]}>Available:</Text>
          <Text style={[styles.balanceValue, { color: colors.textPrimary }]}>GH₵ {walletBalance.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>

        {/* ===== Recipient Input ===== */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>SEND TO</Text>
        <View style={[styles.recipientInput, { backgroundColor: colors.surface, borderColor: recipient ? colors.primary : colors.border }]}>
          <View style={[styles.recipientFlag, { borderRightColor: colors.border }]}>
            <Text style={styles.flag}>🇬🇭</Text>
            <Text style={[styles.countryCode, { color: colors.textPrimary }]}>+233</Text>
          </View>
          <TextInput
            style={[styles.recipientField, { color: colors.textPrimary }]}
            placeholder="Phone number"
            placeholderTextColor={colors.textTertiary}
            keyboardType="phone-pad"
            value={recipient}
            onChangeText={(text) => { setRecipient(text); setSelectedContact(null); }}
          />
        </View>

        {/* Recent contacts */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>RECENT</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contactsRow}>
          {RECENT_CONTACTS.map((contact) => (
            <ContactAvatarItem
              key={contact.id}
              contact={contact}
              isSelected={selectedContact === contact.id}
              colors={colors}
              onPress={() => {
                setSelectedContact(contact.id);
                setRecipient(contact.number.replace('+233 ', ''));
              }}
            />
          ))}
        </ScrollView>

        {/* ===== Amount ===== */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>AMOUNT</Text>
        <View style={[styles.amountWrap, { backgroundColor: colors.surface, borderColor: exceedsBalance ? colors.error : numericAmount > 0 ? colors.primary : colors.border }]}>
          <Text style={[styles.amountCurrency, { color: colors.textTertiary }]}>GH₵</Text>
          <TextInput
            style={[styles.amountField, { color: colors.textPrimary }]}
            placeholder="0.00"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Exceeds balance warning */}
        {exceedsBalance && (
          <View style={[styles.warningBanner, { backgroundColor: colors.error + '15' }]}>
            <Icon name="alert-circle" set="feather" size={14} color={colors.error} />
            <Text style={[styles.warningText, { color: colors.error }]}>
              Amount exceeds your available balance
            </Text>
          </View>
        )}

        {/* Quick amounts */}
        <View style={styles.quickRow}>
          {[20, 50, 100, 200].map((amt) => (
            <QuickAmountChip
              key={amt}
              amt={amt}
              currentAmt={amount}
              colors={colors}
              onPress={() => setAmount(amt.toString())}
            />
          ))}
        </View>

        {/* ===== Note ===== */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>NOTE (OPTIONAL)</Text>
        <View style={[styles.noteWrap, { backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.noteField, { color: colors.textPrimary }]}
            placeholder="What's this for?"
            placeholderTextColor={colors.textTertiary}
            value={note}
            onChangeText={setNote}
            maxLength={50}
          />
        </View>

        {/* ===== Summary ===== */}
        {canProceed && (
          <View style={[
            styles.summaryCard, 
            { 
              backgroundColor: colors.surfaceAlt,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
              borderWidth: 1.5,
            }
          ]}>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Amount</Text>
              <Text style={[styles.summaryValue, { color: colors.textPrimary }]}>GH₵{numericAmount.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Transaction fee</Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>Free</Text>
            </View>
            <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
            <View style={styles.summaryItem}>
              <Text style={[styles.summaryTotal, { color: colors.textPrimary }]}>Total</Text>
              <Text style={[styles.summaryTotalValue, { color: colors.textPrimary }]}>GH₵{numericAmount.toFixed(2)}</Text>
            </View>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ===== Bottom Button ===== */}
      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPressIn={() => animateScale(sendBtnScale, 0.96)}
          onPressOut={() => animateScale(sendBtnScale, 1)}
          onPress={handleSend}
          disabled={!canProceed || processing}
          activeOpacity={0.95}
        >
          <Animated.View style={[
            styles.customSendBtn,
            { 
              backgroundColor: colors.primary,
              opacity: (!canProceed || processing) ? 0.6 : 1,
              transform: [{ scale: sendBtnScale }]
            }
          ]}>
            <Text style={styles.customSendBtnText}>
              {processing ? "Sending..." : (canProceed ? `Send GH₵${numericAmount.toFixed(2)}` : 'Enter details')}
            </Text>
            <Icon name="send" set="feather" size={16} color="#FFFFFF" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.base, paddingVertical: 8, borderBottomWidth: 1 },
  headerBtn: { width: 40, alignItems: 'center' },
  headerTitle: { fontSize: typography.size.lg, fontWeight: '700' },
  scrollContent: { padding: spacing.xl },

  // Balance
  balanceRow: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: borderRadius.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md, marginBottom: spacing.lg },
  balanceLabel: { fontSize: typography.size.sm },
  balanceValue: { fontSize: typography.size.sm, fontWeight: '700' },

  // Section label
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: spacing.md },

  // Recipient
  recipientInput: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.md, borderWidth: 1.5, marginBottom: spacing.lg, overflow: 'hidden' },
  recipientFlag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: spacing.md, paddingRight: spacing.sm, paddingVertical: 14, borderRightWidth: 1 },
  flag: { fontSize: 18 },
  countryCode: { fontSize: typography.size.md, fontWeight: '600' },
  recipientField: { flex: 1, paddingHorizontal: spacing.md, fontSize: typography.size.md },

  // Contacts
  contactsRow: { gap: spacing.md, marginBottom: spacing.lg },
  contactItem: { alignItems: 'center', gap: 6, width: 60 },
  contactAvatar: { width: 48, height: 48, borderRadius: 9999, alignItems: 'center', justifyContent: 'center' },
  contactInitials: { color: '#FFFFFF', fontSize: typography.size.md, fontWeight: '700' },
  contactName: { fontSize: 11, fontWeight: '500' },

  // Amount
  amountWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.md, paddingHorizontal: spacing.lg, paddingVertical: 14, borderWidth: 1.5, marginBottom: spacing.md },
  amountCurrency: { fontSize: typography.size.xl, fontWeight: '700', marginRight: 8 },
  amountField: { flex: 1, fontSize: typography.size['2xl'], fontWeight: '800' },

  // Warning
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    marginBottom: spacing.md,
  },
  warningText: { fontSize: typography.size.sm, fontWeight: '500' },

  // Quick
  quickRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.lg },
  quickBtn: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: borderRadius.sm, borderWidth: 1.5 },
  quickText: { fontSize: typography.size.sm, fontWeight: '600' },

  // Note
  noteWrap: { borderRadius: borderRadius.md, marginBottom: spacing.lg },
  noteField: { paddingHorizontal: spacing.md, paddingVertical: 14, fontSize: typography.size.md },

  // Summary
  summaryCard: { borderRadius: borderRadius.md, padding: spacing.md },
  summaryItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  summaryLabel: { fontSize: typography.size.sm },
  summaryValue: { fontSize: typography.size.sm, fontWeight: '600' },
  summaryDivider: { height: 1, marginVertical: 6 },
  summaryTotal: { fontSize: typography.size.md, fontWeight: '700' },
  summaryTotalValue: { fontSize: typography.size.md, fontWeight: '800' },

  // Bottom
  bottomBar: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderTopWidth: 1 },
  customSendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    width: '100%',
  },
  customSendBtnText: {
    color: '#FFFFFF',
    fontSize: typography.size.md,
    fontWeight: '800',
  },
});
