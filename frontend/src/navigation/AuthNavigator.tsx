// ============================================================
// NAVIGATION: Auth Navigator
// ============================================================
// Stack navigator for Auth flow: Login → Register → OTP
// ============================================================

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '@screens/auth/LoginScreen';
import { RegisterScreen } from '@screens/auth/RegisterScreen';
import { OtpScreen } from '@screens/auth/OtpScreen';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

interface AuthNavigatorProps {
  onLogin: () => void;
}

export const AuthNavigator: React.FC<AuthNavigatorProps> = ({ onLogin }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
      <Stack.Screen name="Login">
        {(props) => <LoginScreen {...props} onLogin={onLogin} />}
      </Stack.Screen>
      <Stack.Screen name="Register">
        {(props) => <RegisterScreen {...props} />}
      </Stack.Screen>
      <Stack.Screen name="OTP">
        {(props) => <OtpScreen {...props} onLogin={onLogin} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};
