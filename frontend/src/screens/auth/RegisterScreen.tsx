// ============================================================
// SCREEN: Register (Realistic UI)
// ============================================================
// Form for entering user name, email, phone, and agreement check
// ============================================================

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/useTheme';
import { typography, spacing, borderRadius } from '@theme/index';
import { Button, Icon } from '@components/index';

interface RegisterScreenProps {
  navigation: any;
  route: any;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { colors } = useTheme();
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const backBtnScale = useRef(new Animated.Value(1)).current;
  const signUpBtnScale = useRef(new Animated.Value(1)).current;
  const checkboxScale = useRef(new Animated.Value(1)).current;

  const animateScale = (val: Animated.Value, toVal: number) => {
    Animated.spring(val, {
      toValue: toVal,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };
  const [phoneError, setPhoneError] = useState('');

  // Valid Ghanaian mobile prefixes (without leading 0)
  const VALID_GH_PREFIXES = ['20','23','24','25','26','27','28','29',
                             '50','53','54','55','56','57','59'];

  const formatGhanaPhone = (text: string): string => {
    let digits = text.replace(/[^0-9]/g, '');
    if (digits.startsWith('0')) digits = digits.substring(1);
    digits = digits.substring(0, 9);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  };

  const getRawDigits = (formatted: string): string => formatted.replace(/\s/g, '');

  const handlePhoneChange = (text: string) => {
    const formatted = formatGhanaPhone(text);
    setPhoneNumber(formatted);
    const raw = getRawDigits(formatted);
    if (raw.length === 0) {
      setPhoneError('');
    } else if (raw.length >= 2 && !VALID_GH_PREFIXES.some(p => raw.startsWith(p))) {
      setPhoneError('Invalid network prefix. Use a valid GH number (e.g. 24, 50, 27).');
    } else {
      setPhoneError('');
    }
  };

  const isPhoneValid = (): boolean => {
    const raw = getRawDigits(phoneNumber);
    return raw.length === 9 && VALID_GH_PREFIXES.some(p => raw.startsWith(p));
  };

  const handleRegister = () => {
    if (!fullName.trim()) {
      Alert.alert('Required Field', 'Please enter your full name.');
      return;
    }
    if (!isPhoneValid()) {
      Alert.alert('Invalid Phone', 'Please enter a valid 9-digit Ghanaian phone number (e.g. 24 123 4567).');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Password Required', 'Password must be at least 6 characters.');
      return;
    }
    if (!agreeToTerms) {
      Alert.alert('Terms & Privacy', 'Please accept the Terms of Service & Privacy Policy to create your account.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      console.log(`[DEV] Generated Registration OTP: ${generatedOtp}`);
      navigation.navigate('OTP', {
        phoneNumber: `+233 ${phoneNumber.trim()}`,
        otpCode: generatedOtp,
        isRegistering: true,
        registerData: {
          name: fullName,
          phone: `0${getRawDigits(phoneNumber)}`,
          email: email.trim(),
          password: password,
        }
      });
      Alert.alert(
        'Verification Code',
        `Your GoZone OTP is: ${generatedOtp}\n\nUse this code to verify your phone number.`
      );
    }, 1200);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        {/* Header Back Button */}
        <View style={styles.header}>
          <TouchableOpacity
            onPressIn={() => animateScale(backBtnScale, 0.9)}
            onPressOut={() => animateScale(backBtnScale, 1)}
            onPress={() => navigation.goBack()}
            activeOpacity={0.9}
          >
            <Animated.View style={[
              styles.backBtn,
              { transform: [{ scale: backBtnScale }] }
            ]}>
              <Icon name="chevron-left" set="feather" size={24} color={colors.textPrimary} />
            </Animated.View>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Logo Section */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Create Account</Text>
            <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
              Join GoZone and start riding, eating, and paying seamlessly.
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Full Name */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>FULL NAME</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Icon name="user" set="feather" size={16} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="Kwame Asante"
                placeholderTextColor={colors.textTertiary}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            {/* Phone Number */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>PHONE NUMBER</Text>
            <View style={[
              styles.phoneInputContainer,
              {
                backgroundColor: colors.surfaceAlt,
                borderColor: phoneError ? '#FF4444' : (isPhoneValid() ? colors.primary : colors.border),
              },
            ]}>
              <View style={[styles.countryCode, { borderRightColor: colors.border }]}>
                <Text style={styles.flag}>🇬🇭</Text>
                <Text style={[styles.countryCodeText, { color: colors.textPrimary }]}>+233</Text>
              </View>
              <TextInput
                style={[styles.phoneInput, { color: colors.textPrimary }]}
                placeholder="24 123 4567"
                placeholderTextColor={colors.textTertiary}
                keyboardType="phone-pad"
                value={phoneNumber}
                onChangeText={handlePhoneChange}
                maxLength={11}
              />
              {getRawDigits(phoneNumber).length > 0 && (
                <Text style={[
                  styles.digitCounter,
                  { color: isPhoneValid() ? colors.primary : colors.textTertiary },
                ]}>
                  {getRawDigits(phoneNumber).length}/9
                </Text>
              )}
            </View>
            {phoneError ? (
              <Text style={styles.errorText}>{phoneError}</Text>
            ) : null}

            {/* Email */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>EMAIL ADDRESS (OPTIONAL)</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Icon name="mail" set="feather" size={16} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="kwame.asante@example.com"
                placeholderTextColor={colors.textTertiary}
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>PASSWORD</Text>
            <View style={[styles.passwordInputContainer, { backgroundColor: colors.surfaceAlt, borderColor: password.length >= 6 ? colors.primary : colors.border }]}>
              <Icon name="lock" set="feather" size={16} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.passwordInput, { color: colors.textPrimary }]}
                placeholder="Must be at least 6 characters"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Icon name={showPassword ? "eye" : "eye-off"} set="feather" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Referral Code */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>REFERRAL CODE (OPTIONAL)</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
              <Icon name="gift" set="feather" size={16} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.textPrimary }]}
                placeholder="GOZONE100"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="characters"
                value={referralCode}
                onChangeText={setReferralCode}
              />
            </View>

            {/* Terms and Conditions Checkbox */}
            <TouchableOpacity
              onPressIn={() => animateScale(checkboxScale, 0.9)}
              onPressOut={() => animateScale(checkboxScale, 1)}
              style={styles.checkboxContainer}
              onPress={() => setAgreeToTerms(!agreeToTerms)}
              activeOpacity={0.9}
            >
              <Animated.View style={[
                styles.checkbox,
                { 
                  borderColor: agreeToTerms ? colors.primary : colors.border,
                  transform: [{ scale: checkboxScale }]
                },
                agreeToTerms && { backgroundColor: colors.primary }
              ]}>
                {agreeToTerms && <Icon name="check" set="feather" size={12} color="#FFFFFF" />}
              </Animated.View>
              <Text style={[styles.checkboxLabel, { color: colors.textSecondary }]}>
                I agree to the <Text style={{ color: colors.primary, fontWeight: '600' }}>Terms of Service</Text> and{' '}
                <Text style={{ color: colors.primary, fontWeight: '600' }}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* Continue Button */}
            <TouchableOpacity
              onPressIn={() => animateScale(signUpBtnScale, 0.96)}
              onPressOut={() => animateScale(signUpBtnScale, 1)}
              onPress={handleRegister}
              disabled={!agreeToTerms || !fullName.trim() || !isPhoneValid() || password.length < 6 || loading}
              activeOpacity={0.95}
              style={{ marginTop: spacing.md }}
            >
              <Animated.View style={[
                styles.customSignUpBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: (!agreeToTerms || !fullName.trim() || !isPhoneValid() || password.length < 6 || loading) ? 0.6 : 1,
                  transform: [{ scale: signUpBtnScale }]
                }
              ]}>
                <Text style={styles.customSignUpBtnText}>
                  {loading ? "Please wait..." : "Sign Up"}
                </Text>
                {!loading && <Icon name="arrow-right" set="feather" size={16} color="#FFFFFF" />}
              </Animated.View>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textTertiary }]}>
              Already have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
              <Text style={[styles.signinText, { color: colors.primary }]}> Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },
  header: { paddingHorizontal: spacing.base, paddingVertical: spacing.sm },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
  titleSection: { marginTop: spacing.md, marginBottom: spacing.xl },
  title: { fontSize: typography.size['2xl'], fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: typography.size.md, marginTop: 6, lineHeight: 22 },
  formContainer: { flex: 1, gap: spacing.base },
  fieldLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginTop: spacing.sm },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1,
    paddingHorizontal: spacing.md, paddingVertical: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: typography.size.md, padding: 0 },
  phoneInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1,
    overflow: 'hidden',
  },
  countryCode: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingLeft: spacing.base, paddingRight: spacing.sm,
    borderRightWidth: 1, paddingVertical: 14,
  },
  flag: { fontSize: 18 },
  countryCodeText: { fontSize: typography.size.md, fontWeight: '600' },
  phoneInput: { flex: 1, paddingVertical: 14, paddingHorizontal: spacing.md, fontSize: typography.size.md },
  digitCounter: { fontSize: 11, fontWeight: '600', marginRight: spacing.md },
  errorText: { color: '#FF4444', fontSize: 11, fontWeight: '500', marginTop: 4, marginBottom: 4, marginLeft: 4 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: spacing.md },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxLabel: { flex: 1, fontSize: typography.size.sm, lineHeight: 20 },
  footer: { paddingVertical: spacing.xl, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: typography.size.md },
  signinText: { fontSize: typography.size.md, fontWeight: '700' },
  passwordInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  passwordInput: { flex: 1, fontSize: typography.size.md, paddingVertical: 14 },
  eyeBtn: { padding: 10 },
  customSignUpBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    width: '100%',
  },
  customSignUpBtnText: {
    color: '#FFFFFF',
    fontSize: typography.size.md,
    fontWeight: '800',
  },
});
