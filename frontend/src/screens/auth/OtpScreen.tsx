// ============================================================
// SCREEN: OTP Verification (Realistic UI)
// ============================================================
// Custom 4-digit code entry boxes, cursor, timer countdown
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
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@hooks/useTheme';
import { typography, spacing, borderRadius } from '@theme/index';
import { Button, Icon } from '@components/index';
import { useUserStore } from '@store/userStore';
import { API_BASE_URL } from '@services/apiConfig';

interface OtpScreenProps {
  navigation: any;
  route: any;
  onLogin: () => void;
}

export const OtpScreen: React.FC<OtpScreenProps> = ({ navigation, route, onLogin }) => {
  const { colors } = useTheme();
  const phoneNumber = route.params?.phoneNumber ?? '+233 24 123 4567';
  const [expectedOtp, setExpectedOtp] = useState<string>(route.params?.otpCode ?? '1234');
  const [code, setCode] = useState('');
  const [timer, setTimer] = useState(59);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const cursorOpacity = useRef(new Animated.Value(1)).current;

  const backBtnScale = useRef(new Animated.Value(1)).current;
  const verifyBtnScale = useRef(new Animated.Value(1)).current;

  const animateScale = (val: Animated.Value, toVal: number) => {
    Animated.spring(val, {
      toValue: toVal,
      useNativeDriver: true,
      tension: 100,
      friction: 6,
    }).start();
  };

  // Cursor blinking loop
  useEffect(() => {
    const blinkAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(cursorOpacity, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(cursorOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    );
    blinkAnimation.start();
    return () => blinkAnimation.stop();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (timer === 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(59);
    setCode('');
    const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
    setExpectedOtp(newOtp);
    Alert.alert(
      "Verification Code",
      `Your new GoZone OTP is: ${newOtp}\n\nUse this code to verify your phone number.`
    );
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleTextChange = (text: string) => {
    const cleanText = text.replace(/[^0-9]/g, '');
    setCode(cleanText);

    if (cleanText.length === 4) {
      handleVerify(cleanText);
    }
  };

  const handleVerify = async (otpCode: string = code) => {
    if (otpCode.length < 4) return;
    setLoading(true);

    const isRegistering = route.params?.isRegistering ?? false;
    const registerData = route.params?.registerData;
    const loginData = route.params?.loginData;
    const setAuth = useUserStore.getState().setAuth;

    if (otpCode === expectedOtp) {
      if (isRegistering && registerData) {
        try {
          const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData),
          });

          const json = await response.json();

          if (!response.ok || !json.success) {
            throw new Error(json.message || 'Registration failed.');
          }

          const data = json.data;
          setAuth(data.token, data.userId, data.name, data.email, data.phone, data.walletBalance);
          setLoading(false);
          onLogin();
        } catch (error: any) {
          setLoading(false);
          Alert.alert('Registration Failed', error.message || 'Could not complete registration on backend.');
          setCode('');
        }
      } else if (loginData) {
        setAuth(
          loginData.token,
          loginData.userId,
          loginData.name,
          loginData.email,
          loginData.phone,
          loginData.walletBalance
        );
        setLoading(false);
        onLogin();
      } else {
        setLoading(false);
        onLogin();
      }
    } else {
      setLoading(false);
      Alert.alert("Error", "Invalid verification code. Please try again.");
      setCode('');
    }
  };

  useEffect(() => {
    const timerRef = setTimeout(() => {
      inputRef.current?.focus();
    }, 500);
    return () => clearTimeout(timerRef);
  }, []);

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
          {/* Title Section */}
          <View style={styles.titleSection}>
            <Text style={[styles.title, { color: colors.textPrimary }]}>Verify Phone</Text>
            <Text style={[styles.subtitle, { color: colors.textTertiary }]}>
              Enter the 4-digit code sent to <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>{phoneNumber}</Text>
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {/* Hidden Input */}
            <TextInput
              ref={inputRef}
              style={styles.hiddenInput}
              value={code}
              onChangeText={handleTextChange}
              keyboardType="number-pad"
              maxLength={4}
              textContentType="oneTimeCode"
            />

            {/* OTP Code Blocks */}
            <TouchableOpacity
              style={styles.otpGrid}
              onPress={() => inputRef.current?.focus()}
              activeOpacity={1}
            >
              {[0, 1, 2, 3].map((index) => {
                const digit = code[index];
                const isFocused = code.length === index;
                return (
                  <View
                    key={index}
                    style={[
                      styles.otpBox,
                      {
                        backgroundColor: colors.surfaceAlt,
                        borderColor: isFocused ? colors.primary : colors.border,
                        shadowColor: isFocused ? colors.primary : 'transparent',
                        shadowOffset: isFocused ? { width: 0, height: 4 } : { width: 0, height: 0 },
                        shadowOpacity: isFocused ? 0.25 : 0,
                        shadowRadius: isFocused ? 8 : 0,
                        elevation: isFocused ? 4 : 0,
                      },
                    ]}
                  >
                    <Text style={[styles.otpDigit, { color: colors.textPrimary }]}>
                      {digit || ''}
                    </Text>
                    {!digit && isFocused && (
                      <Animated.View style={[styles.cursor, { backgroundColor: colors.primary, opacity: cursorOpacity }]} />
                    )}
                  </View>
                );
              })}
            </TouchableOpacity>

            {/* Timer */}
            <View style={styles.timerRow}>
              {timer > 0 ? (
                <Text style={[styles.timerText, { color: colors.textTertiary }]}>
                  Resend code in <Text style={{ color: colors.textPrimary, fontWeight: '600' }}>0:{timer < 10 ? `0${timer}` : timer}</Text>
                </Text>
              ) : (
                <TouchableOpacity onPress={handleResend} activeOpacity={0.7}>
                  <Text style={[styles.resendLink, { color: colors.primary }]}>Resend Code</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              onPressIn={() => animateScale(verifyBtnScale, 0.96)}
              onPressOut={() => animateScale(verifyBtnScale, 1)}
              onPress={() => handleVerify()}
              disabled={code.length < 4 || loading}
              activeOpacity={0.95}
              style={{ marginTop: spacing.xl }}
            >
              <Animated.View style={[
                styles.customVerifyBtn,
                {
                  backgroundColor: colors.primary,
                  opacity: (code.length < 4 || loading) ? 0.6 : 1,
                  transform: [{ scale: verifyBtnScale }]
                }
              ]}>
                <Text style={styles.customVerifyBtnText}>
                  {loading ? "Please wait..." : "Verify & Continue"}
                </Text>
                {!loading && <Icon name="check" set="material" size={16} color="#FFFFFF" />}
              </Animated.View>
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
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing.xl },
  titleSection: { marginTop: spacing.md, marginBottom: spacing.xl },
  title: { fontSize: typography.size['2xl'], fontWeight: '800', letterSpacing: -0.5 },
  subtitle: { fontSize: typography.size.md, marginTop: 6, lineHeight: 22 },
  formContainer: { flex: 1 },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  otpGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginVertical: spacing.xl,
  },
  otpBox: {
    flex: 1,
    height: 64,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  otpDigit: {
    fontSize: 24,
    fontWeight: '800',
  },
  cursor: {
    width: 2,
    height: 20,
    position: 'absolute',
  },
  timerRow: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  timerText: {
    fontSize: typography.size.md,
  },
  resendLink: {
    fontSize: typography.size.md,
    fontWeight: '600',
  },
  customVerifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 15,
    borderRadius: 16,
    width: '100%',
  },
  customVerifyBtnText: {
    color: '#FFFFFF',
    fontSize: typography.size.md,
    fontWeight: '800',
  },
});
