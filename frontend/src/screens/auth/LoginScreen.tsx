// ============================================================
// SCREEN: Login (Realistic UI)
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/useTheme';
import { typography, spacing, borderRadius } from '@theme/index';
import { Button, Icon } from '@components/index';
import { API_BASE_URL } from '@services/apiConfig';

interface LoginScreenProps {
  onLogin: () => void;
  navigation: any;
  route: any;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, navigation }) => {
  const { colors } = useTheme();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  const continueBtnScale = useRef(new Animated.Value(1)).current;
  const googleBtnScale = useRef(new Animated.Value(1)).current;
  const appleBtnScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 80,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateScale = (val: Animated.Value, toVal: number) => {
    Animated.spring(val, {
      toValue: toVal,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };

  // Valid Ghanaian mobile prefixes (without leading 0)
  const VALID_GH_PREFIXES = ['20','23','24','25','26','27','28','29',
                             '50','53','54','55','56','57','59'];

  // Format: XX XXX XXXX (9 raw digits max)
  const formatGhanaPhone = (text: string): string => {
    // Strip everything except digits
    let digits = text.replace(/[^0-9]/g, '');
    // If user types leading 0, strip it (we already show +233)
    if (digits.startsWith('0')) digits = digits.substring(1);
    // Cap at 9 digits
    digits = digits.substring(0, 9);
    // Format as XX XXX XXXX
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)} ${digits.slice(2)}`;
    return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
  };

  const getRawDigits = (formatted: string): string => formatted.replace(/\s/g, '');

  const handlePhoneChange = (text: string) => {
    const formatted = formatGhanaPhone(text);
    setPhoneNumber(formatted);
    const raw = getRawDigits(formatted);
    // Live validation
    if (raw.length === 0) {
      setPhoneError('');
    } else if (raw.length >= 2 && !VALID_GH_PREFIXES.some(p => raw.startsWith(p))) {
      setPhoneError('Invalid network prefix. Use a valid GH number (e.g. 24, 50, 27).');
    } else if (raw.length === 9) {
      setPhoneError('');
    } else if (raw.length > 0 && raw.length < 9) {
      setPhoneError('');
    } else {
      setPhoneError('');
    }
  };

  const isPhoneValid = (): boolean => {
    const raw = getRawDigits(phoneNumber);
    return raw.length === 9 && VALID_GH_PREFIXES.some(p => raw.startsWith(p));
  };

  const handleSendOTP = async () => {
    const raw = getRawDigits(phoneNumber);
    if (!raw) {
      Alert.alert('Error', 'Please enter your phone number.');
      return;
    }
    if (raw.length !== 9) {
      Alert.alert('Error', 'A Ghanaian phone number must be exactly 9 digits (without the leading 0).');
      return;
    }
    if (!VALID_GH_PREFIXES.some(p => raw.startsWith(p))) {
      Alert.alert('Error', 'Please enter a valid Ghanaian mobile number.');
      return;
    }
    if (!password || password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    const normalizedPhone = `0${raw}`;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: normalizedPhone,
          password: password,
        }),
      });

      const json = await response.json();

      if (!response.ok || !json.success) {
        throw new Error(json.message || 'Invalid credentials or user not found.');
      }

      const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
      navigation.navigate('OTP', {
        phoneNumber: `+233 ${phoneNumber.trim()}`,
        otpCode: generatedOtp,
        loginData: json.data,
      });

      Alert.alert(
        'Verification Code',
        `Your GoZone OTP is: ${generatedOtp}\n\nUse this code to verify your phone number.`
      );
    } catch (error: any) {
      Alert.alert(
        'Login Options',
        'Unable to connect to backend server. Would you like to enter Demo Mode with preloaded wallet balance (GH₵ 1,250)?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: '🚀 Enter Demo Mode', onPress: () => onLogin() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* ===== Logo Section with Gradient ===== */}
          <Animated.View style={[styles.logoSection, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.logoCircle}
            >
              <Icon name="navigation" set="feather" size={36} color="#FFFFFF" />
            </LinearGradient>
            <Text style={[styles.logoText, { color: colors.textPrimary }]}>GoZone</Text>
            <Text style={[styles.tagline, { color: colors.textSecondary }]}>
              Ride. Eat. Pay. All in one app.
            </Text>
          </Animated.View>

          {/* ===== Form ===== */}
          <View style={styles.formContainer}>
            <Text style={[styles.welcomeText, { color: colors.textPrimary }]}>
              Welcome back
            </Text>
            <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
              Enter your credentials to get started
            </Text>

            {/* Phone Input */}
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

            {/* Password Input */}
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>PASSWORD</Text>
            <View style={[
              styles.passwordInputContainer,
              {
                backgroundColor: colors.surfaceAlt,
                borderColor: password.length >= 6 ? colors.primary : colors.border,
              },
            ]}>
              <Icon name="lock" set="feather" size={16} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.passwordInput, { color: colors.textPrimary }]}
                placeholder="Enter password"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Icon name={showPassword ? "eye" : "eye-off"} set="feather" size={16} color={colors.textTertiary} />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              onPressIn={() => animateScale(continueBtnScale, 0.96)}
              onPressOut={() => animateScale(continueBtnScale, 1)}
              onPress={handleSendOTP}
              disabled={!isPhoneValid() || password.length < 6 || loading}
              activeOpacity={0.95}
            >
              <Animated.View style={[
                styles.customContinueBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: (!isPhoneValid() || password.length < 6 || loading) ? 0.6 : 1,
                  transform: [{ scale: continueBtnScale }]
                }
              ]}>
                <Text style={styles.customContinueBtnText}>
                  {loading ? "Please wait..." : "Continue"}
                </Text>
                {!loading && <Icon name="arrow-right" set="feather" size={16} color="#FFFFFF" />}
              </Animated.View>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or continue with</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Social Login */}
            <View style={styles.socialRow}>
              <TouchableOpacity
                onPressIn={() => animateScale(googleBtnScale, 0.95)}
                onPressOut={() => animateScale(googleBtnScale, 1)}
                style={{ flex: 1 }}
                activeOpacity={0.9}
              >
                <Animated.View style={[
                  styles.socialButton, 
                  { 
                    backgroundColor: colors.surface, 
                    borderColor: colors.border,
                    transform: [{ scale: googleBtnScale }]
                  }
                ]}>
                  <Icon name="google" set="micons" size={20} color="#EA4335" />
                  <Text style={[styles.socialText, { color: colors.textPrimary }]}>Google</Text>
                </Animated.View>
              </TouchableOpacity>

              <TouchableOpacity
                onPressIn={() => animateScale(appleBtnScale, 0.95)}
                onPressOut={() => animateScale(appleBtnScale, 1)}
                style={{ flex: 1 }}
                activeOpacity={0.9}
              >
                <Animated.View style={[
                  styles.socialButton, 
                  { 
                    backgroundColor: colors.surface, 
                    borderColor: colors.border,
                    transform: [{ scale: appleBtnScale }]
                  }
                ]}>
                  <Icon name="apple" set="feather" size={20} color={colors.textPrimary} />
                  <Text style={[styles.socialText, { color: colors.textPrimary }]}>Apple</Text>
                </Animated.View>
              </TouchableOpacity>
            </View>
          </View>

          {/* ===== Footer ===== */}
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.textTertiary }]}>
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
              <Text style={[styles.signupText, { color: colors.primary }]}> Sign up</Text>
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
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing.xl },

  // Logo
  logoSection: { alignItems: 'center', marginTop: spacing['3xl'], marginBottom: spacing['4xl'] },
  logoCircle: {
    width: 72, height: 72, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#00B14F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: typography.size['3xl'], fontWeight: '800',
    marginTop: spacing.md, letterSpacing: -0.5,
  },
  tagline: { fontSize: typography.size.md, marginTop: 6 },

  // Form
  formContainer: { flex: 1 },
  welcomeText: { fontSize: typography.size['2xl'], fontWeight: '700' },
  subtitle: { fontSize: typography.size.md, marginTop: 4, marginBottom: spacing.xl },
  phoneInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, marginBottom: spacing.lg, overflow: 'hidden',
    borderWidth: 1,
  },
  countryCode: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingLeft: spacing.base, paddingRight: spacing.sm,
    borderRightWidth: 1, paddingVertical: 15,
  },
  flag: { fontSize: 18 },
  countryCodeText: { fontSize: typography.size.md, fontWeight: '600' },
  phoneInput: { flex: 1, paddingVertical: 15, paddingHorizontal: spacing.md, fontSize: typography.size.md },
  digitCounter: { fontSize: 11, fontWeight: '600', marginRight: spacing.md },
  errorText: { color: '#FF4444', fontSize: 11, fontWeight: '500', marginTop: 4, marginBottom: 4, marginLeft: 4 },

  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.xl },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { fontSize: typography.size.sm, marginHorizontal: spacing.md },

  // Social
  socialRow: { flexDirection: 'row', gap: spacing.md },
  socialButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 13, borderWidth: 1, borderRadius: 14,
  },
  socialText: { fontSize: typography.size.md, fontWeight: '600' },

  // Footer
  footer: { paddingVertical: spacing.xl, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: typography.size.md },
  signupText: { fontSize: typography.size.md, fontWeight: '700' },

  // Added auth styles
  fieldLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginTop: spacing.sm, marginBottom: 6 },
  passwordInputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 14, marginBottom: spacing.lg,
    borderWidth: 1, paddingHorizontal: spacing.md,
  },
  passwordInput: { flex: 1, paddingVertical: 15, fontSize: typography.size.md },
  inputIcon: { marginRight: 10 },
  eyeBtn: { padding: 10 },
  customContinueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    width: '100%',
  },
  customContinueBtnText: {
    color: '#FFFFFF',
    fontSize: typography.size.md,
    fontWeight: '800',
  },
});
