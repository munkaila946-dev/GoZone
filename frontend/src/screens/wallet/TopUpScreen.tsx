// ============================================================
// SCREEN: Top Up Wallet (Realistic UI)
// ============================================================
// Fund wallet via Mobile Money or card with amount selection
// ============================================================

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/useTheme';
import { typography, spacing, borderRadius, shadows } from '@theme/index';
import { Icon, Button, type IconSet } from '@components/index';
import { useUserStore } from '@store/index';
import { API_BASE_URL, fetchWithAuth } from '@services/apiConfig';

const MethodSelectionItem = ({
  method,
  isSelected,
  colors,
  onPress
}: {
  method: any;
  isSelected: boolean;
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
      style={{ width: '100%' }}
    >
      <Animated.View style={[
        styles.methodCard,
        {
          backgroundColor: colors.surface,
          borderColor: isSelected ? colors.primary : colors.border,
          borderWidth: 1.5,
          transform: [{ scale }]
        }
      ]}>
        <View style={[styles.methodIcon, { backgroundColor: method.bgColor }]}>
          <Icon name={method.icon} set={method.iconSet} size={20} color={method.color} />
        </View>
        <View style={styles.methodInfo}>
          <Text style={[styles.methodName, { color: colors.textPrimary }]}>{method.name}</Text>
          <Text style={[styles.methodNumber, { color: colors.textTertiary }]}>{method.number}</Text>
        </View>
        <View style={[styles.radioButton, { borderColor: isSelected ? colors.primary : colors.border }]}>
          {isSelected && <View style={[styles.radioButtonFill, { backgroundColor: colors.primary }]} />}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
};

const QuickTopUpAmountChip = ({
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

// Funding method options
const FUNDING_METHODS: { id: string; name: string; number: string; icon: string; iconSet: IconSet; color: string; bgColor: string }[] = [
  { id: 'mtn', name: 'MTN MoMo', number: '+233 24 123 4567', icon: 'cellphone', iconSet: 'material', color: '#FFC107', bgColor: '#FFEB3B20' },
  { id: 'telecel', name: 'Telecel Cash', number: '+233 50 987 6543', icon: 'cellphone', iconSet: 'material', color: '#E60000', bgColor: '#FF000020' },
  { id: 'card', name: 'Visa Debit Card', number: '•••• 4521', icon: 'credit-card', iconSet: 'feather', color: '#2196F3', bgColor: '#2196F320' },
];

// Quick amount options
const QUICK_AMOUNTS = [50, 100, 200, 500];

interface TopUpScreenProps {
  navigation: any;
}

export const TopUpScreen: React.FC<TopUpScreenProps> = ({ navigation }) => {
  const { colors, isDark } = useTheme();
  const { balance, setBalance, addTransaction } = useUserStore();
  const [amount, setAmount] = useState('');
  const [selectedMethod, setSelectedMethod] = useState('mtn');
  const [processing, setProcessing] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const backBtnScale = useRef(new Animated.Value(1)).current;
  const topUpBtnScale = useRef(new Animated.Value(1)).current;

  const animateScale = (val: Animated.Value, toVal: number) => {
    Animated.spring(val, {
      toValue: toVal,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };
  
  // Modals & payment references
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [paymentReference, setPaymentReference] = useState('');
  const [authorizationUrl, setAuthorizationUrl] = useState('');

  const numericAmount = parseFloat(amount) || 0;
  const canProceed = numericAmount > 0;

  const handleTopUp = async () => {
    if (!canProceed) return;
    setProcessing(true);

    try {
      // 1. Initialize top-up with Paystack backend
      const response = await fetchWithAuth(`${API_BASE_URL}/wallet/initialize-topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: numericAmount,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      console.log('Initialize topup response:', json);

      if (json.success && json.data) {
        const payload = json.data.data;
        const ref = payload.reference;
        const authUrl = payload.authorization_url;

        setPaymentReference(ref);
        setAuthorizationUrl(authUrl);
        setProcessing(false);

        // 2. Open Paystack authorization URL in device browser
        const supported = await Linking.canOpenURL(authUrl);
        if (supported) {
          await Linking.openURL(authUrl);
          // Show verification overlay modal
          setShowVerifyModal(true);
        } else {
          Alert.alert('Error', 'Cannot open payment page in browser.');
        }
      } else {
        throw new Error('Invalid initialization response');
      }
    } catch (error) {
      console.warn('Backend server topup initialization failed (offline mode).', error);
      setProcessing(false);

      // Generate a mock payment reference for local sandbox simulation
      const mockRef = 'PSK_MOCK_' + Date.now();
      setPaymentReference(mockRef);

      // Prompt to run direct simulation
      Alert.alert(
        'Server Offline',
        'Could not connect to the GoZone backend server. Would you like to use the offline sandbox simulator instead?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Use Sandbox', onPress: () => setShowOfflineModal(true) },
        ]
      );
    }
  };

  const verifyTransaction = async () => {
    setVerifying(true);
    try {
      // 3. Call backend topup verification API
      const response = await fetchWithAuth(`${API_BASE_URL}/wallet/topup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: numericAmount,
          description: `SuperWallet Top-up (${selectedMethod === 'card' ? 'Card' : 'MoMo'})`,
          reference: paymentReference,
        }),
      });

      if (!response.ok) {
        throw new Error(`Verification HTTP error! status: ${response.status}`);
      }

      const json = await response.json();
      console.log('Verification response:', json);

      if (json.success && json.data) {
        // Update balance from response
        const newBalance = json.data.balance;
        setBalance(newBalance);

        // Log transaction in store
        addTransaction({
          id: paymentReference || ('t_' + Date.now()),
          type: 'credit',
          category: 'topup',
          amount: numericAmount,
          description: `Top-up via ${
            selectedMethod === 'card' 
              ? 'Card' 
              : selectedMethod === 'mtn' 
                ? 'MTN MoMo' 
                : 'Telecel Cash'
          }`,
          date: new Date().toISOString(),
          status: 'completed',
        });

        setVerifying(false);
        setShowVerifyModal(false);

        Alert.alert(
          'Top Up Successful',
          `GH₵${numericAmount.toFixed(2)} has been added to your SuperWallet. New balance: GH₵${newBalance.toFixed(2)}`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        throw new Error('Invalid payment reference verification');
      }
    } catch (error) {
      console.warn('Payment verification failed on server.', error);
      setVerifying(false);
      Alert.alert(
        'Verification Failed',
        'Could not verify transaction with the server. If this is a sandbox checkout, make sure the backend is active.'
      );
    }
  };

  const handleOfflineSuccess = () => {
    // Credit local state immediately for complete offline testing
    const newBal = balance + numericAmount;
    setBalance(newBal);

    // Log simulated transaction in store
    addTransaction({
      id: paymentReference || ('t_' + Date.now()),
      type: 'credit',
      category: 'topup',
      amount: numericAmount,
      description: `Top-up via ${
        selectedMethod === 'card' 
          ? 'Card' 
          : selectedMethod === 'mtn' 
            ? 'MTN MoMo' 
            : 'Telecel Cash'
      } [Sandbox]`,
      date: new Date().toISOString(),
      status: 'completed',
    });

    setShowOfflineModal(false);
    
    Alert.alert(
      'Sandbox Success',
      `[OFFLINE MODE] GH₵${numericAmount.toFixed(2)} credited to your local store. New balance: GH₵${newBal.toFixed(2)}`,
      [{ text: 'Great', onPress: () => navigation.goBack() }]
    );
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
        <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Top Up Wallet</Text>
        <View style={styles.headerBtn} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* ===== Current Balance ===== */}
        <View style={[
          styles.balanceCard, 
          { 
            backgroundColor: colors.surface,
            borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
            borderWidth: 1.5,
          }, 
          shadows.small
        ]}>
          <Text style={[styles.balanceLabel, { color: colors.textTertiary }]}>CURRENT BALANCE</Text>
          <Text style={[styles.balanceValue, { color: colors.textPrimary }]}>GH₵ {balance.toLocaleString('en-GH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
        </View>

        {/* ===== Amount Input ===== */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>ENTER AMOUNT</Text>
        <View style={[styles.amountInputWrap, { backgroundColor: colors.surface, borderColor: numericAmount > 0 ? colors.primary : colors.border }]}>
          <Text style={[styles.currencySymbol, { color: colors.textTertiary }]}>GH₵</Text>
          <TextInput
            style={[styles.amountInput, { color: colors.textPrimary }]}
            placeholder="0.00"
            placeholderTextColor={colors.textTertiary}
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Quick amounts */}
        <View style={styles.quickAmountsRow}>
          {QUICK_AMOUNTS.map((amt) => (
            <QuickTopUpAmountChip
              key={amt}
              amt={amt}
              currentAmt={amount}
              colors={colors}
              onPress={() => setAmount(amt.toString())}
            />
          ))}
        </View>

        {/* ===== Payment Method ===== */}
        <Text style={[styles.sectionLabel, { color: colors.textTertiary }]}>PAY FROM</Text>
        {FUNDING_METHODS.map((method) => (
          <MethodSelectionItem
            key={method.id}
            method={method}
            isSelected={selectedMethod === method.id}
            colors={colors}
            onPress={() => setSelectedMethod(method.id)}
          />
        ))}

        {/* ===== Info note ===== */}
        <View style={[styles.infoNote, { backgroundColor: colors.primaryLight }]}>
          <Icon name="information" set="material" size={16} color={colors.primary} />
          <Text style={[styles.infoNoteText, { color: colors.textSecondary }]}>
            Funds are added instantly to your SuperWallet. No transaction fees on top-ups.
          </Text>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ===== Bottom Button ===== */}
      <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border }]}>
        <TouchableOpacity
          onPressIn={() => animateScale(topUpBtnScale, 0.96)}
          onPressOut={() => animateScale(topUpBtnScale, 1)}
          onPress={handleTopUp}
          disabled={!canProceed || processing}
          activeOpacity={0.95}
        >
          <Animated.View style={[
            styles.customTopUpBtn,
            { 
              backgroundColor: colors.primary,
              opacity: (!canProceed || processing) ? 0.6 : 1,
              transform: [{ scale: topUpBtnScale }]
            }
          ]}>
            <Text style={styles.customTopUpBtnText}>
              {processing ? "Processing..." : (canProceed ? `Top Up GH₵${numericAmount.toFixed(2)}` : 'Enter an amount')}
            </Text>
            <Icon name="arrow-down-circle" set="feather" size={16} color="#FFFFFF" />
          </Animated.View>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>

      {/* ===== Verification Modal ===== */}
      <Modal
        visible={showVerifyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowVerifyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalCard,
            {
              backgroundColor: colors.surface,
              borderWidth: 1.5,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'
            },
            shadows.medium
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Verify Transaction</Text>
              <TouchableOpacity onPress={() => setShowVerifyModal(false)}>
                <Icon name="x" set="feather" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={[styles.statusIconWrap, { backgroundColor: colors.primaryLight }]}>
                <Icon name="clock" set="feather" size={32} color={colors.primary} />
              </View>
              
              <Text style={[styles.modalHeading, { color: colors.textPrimary }]}>Waiting for Payment</Text>
              <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
                We opened Paystack secure checkout in your browser. Please authorize the payment of{' '}
                <Text style={{ fontWeight: '700', color: colors.textPrimary }}>GH₵{numericAmount.toFixed(2)}</Text> and click verify below once done.
              </Text>

              <View style={[styles.refCard, { backgroundColor: colors.surfaceAlt }]}>
                <Text style={[styles.refLabel, { color: colors.textTertiary }]}>TRANSACTION REFERENCE</Text>
                <Text style={[styles.refValue, { color: colors.textPrimary }]}>{paymentReference}</Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Button
                title="Verify Top Up"
                onPress={verifyTransaction}
                loading={verifying}
                iconName="check-circle"
              />
              <TouchableOpacity 
                style={styles.cancelLink} 
                onPress={() => setShowVerifyModal(false)}
                disabled={verifying}
              >
                <Text style={[styles.cancelLinkText, { color: colors.textSecondary }]}>Cancel & Return</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===== Offline Simulator Modal ===== */}
      <Modal
        visible={showOfflineModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowOfflineModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalCard,
            {
              backgroundColor: colors.surface,
              borderWidth: 1.5,
              borderColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)'
            },
            shadows.medium
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Offline Sandbox Pay</Text>
              <TouchableOpacity onPress={() => setShowOfflineModal(false)}>
                <Icon name="x" set="feather" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <View style={[styles.statusIconWrap, { backgroundColor: colors.walletPurpleLight }]}>
                <Icon name="wifi-off" set="feather" size={32} color={colors.walletPurple} />
              </View>
              
              <Text style={[styles.modalHeading, { color: colors.textPrimary }]}>Local Simulation</Text>
              <Text style={[styles.modalDesc, { color: colors.textSecondary }]}>
                The GoZone backend is currently offline. You can authorize a local simulated deposit of{' '}
                <Text style={{ fontWeight: '700', color: colors.textPrimary }}>GH₵{numericAmount.toFixed(2)}</Text> directly in this sandbox.
              </Text>

              <View style={[styles.refCard, { backgroundColor: colors.surfaceAlt }]}>
                <Text style={[styles.refLabel, { color: colors.textTertiary }]}>MOCK TRANSACTION REFERENCE</Text>
                <Text style={[styles.refValue, { color: colors.textPrimary }]}>{paymentReference}</Text>
              </View>
            </View>

            <View style={styles.modalFooter}>
              <Button
                title="Authorize Deposit (Simulated)"
                onPress={handleOfflineSuccess}
                iconName="check"
              />
              <TouchableOpacity 
                style={styles.cancelLink} 
                onPress={() => setShowOfflineModal(false)}
              >
                <Text style={[styles.cancelLinkText, { color: colors.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  balanceCard: { borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.xl },
  balanceLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8 },
  balanceValue: { fontSize: typography.size['2xl'], fontWeight: '800', marginTop: 6 },

  // Section label
  sectionLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: spacing.md },

  // Amount input
  amountInputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: borderRadius.md, paddingHorizontal: spacing.lg, paddingVertical: 14, borderWidth: 1.5, marginBottom: spacing.md },
  currencySymbol: { fontSize: typography.size.xl, fontWeight: '700', marginRight: 8 },
  amountInput: { flex: 1, fontSize: typography.size['2xl'], fontWeight: '800' },

  // Quick amounts
  quickAmountsRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.xl },
  quickAmountBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: borderRadius.md, borderWidth: 1.5 },
  quickAmountText: { fontSize: typography.size.sm, fontWeight: '700' },

  // Method
  methodCard: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: spacing.md, borderRadius: borderRadius.lg, marginBottom: spacing.md, borderWidth: 1.5 },
  methodIcon: { width: 44, height: 44, borderRadius: borderRadius.md, alignItems: 'center', justifyContent: 'center' },
  methodInfo: { flex: 1 },
  methodName: { fontSize: typography.size.md, fontWeight: '600' },
  methodNumber: { fontSize: typography.size.sm, marginTop: 2 },
  radioButton: { width: 22, height: 22, borderRadius: 9999, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioButtonFill: { width: 12, height: 12, borderRadius: 9999 },

  // Info
  infoNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, borderRadius: borderRadius.md, padding: spacing.md, marginTop: spacing.sm },
  infoNoteText: { flex: 1, fontSize: typography.size.sm, lineHeight: 18 },

  // Bottom bar
  bottomBar: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderTopWidth: 1 },

  // Modal styling
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)', justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  modalCard: { width: '100%', maxWidth: 360, borderRadius: borderRadius.lg, padding: spacing.xl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
  modalTitle: { fontSize: typography.size.md, fontWeight: '700' },
  modalBody: { alignItems: 'center', marginBottom: spacing.xl },
  statusIconWrap: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  modalHeading: { fontSize: typography.size.lg, fontWeight: '700', marginBottom: spacing.xs },
  modalDesc: { fontSize: typography.size.sm, textAlign: 'center', lineHeight: 20 },
  refCard: { width: '100%', padding: spacing.md, borderRadius: borderRadius.md, marginTop: spacing.lg, alignItems: 'center' },
  refLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  refValue: { fontSize: typography.size.xs, fontFamily: 'monospace', fontWeight: '500' },
  modalFooter: { width: '100%' },
  cancelLink: { paddingVertical: spacing.md, alignItems: 'center', marginTop: spacing.sm },
  cancelLinkText: { fontSize: typography.size.sm, fontWeight: '600' },
  customTopUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    width: '100%',
  },
  customTopUpBtnText: {
    color: '#FFFFFF',
    fontSize: typography.size.md,
    fontWeight: '800',
  },
});
