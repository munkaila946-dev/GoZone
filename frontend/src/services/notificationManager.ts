import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { API_BASE_URL, fetchWithAuth } from './apiConfig';

// Configure how notifications are handled when the app is running in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Register the device for push notifications and retrieve the Expo Push Token.
 * If EAS projectId is not configured or fails, returns a local mock token.
 */
export async function registerForPushNotificationsAsync(): Promise<string> {
  let token = '';

  if (Platform.OS === 'web') {
    return 'ExponentPushToken[mock_web_token]';
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('Failed to get push token for push notification! Permissions not granted.');
    return 'ExponentPushToken[mock_permission_denied]';
  }

  try {
    // Attempt to get Expo Push Token. Pass a dummy projectId to prevent EAS crashes during development.
    const tokenResult = await Notifications.getExpoPushTokenAsync({
      projectId: 'dummy-project-id-gozone',
    }).catch(async () => {
      return await Notifications.getExpoPushTokenAsync();
    });
    token = tokenResult.data;
    console.log('Expo Push Token registered:', token);
  } catch (error) {
    console.warn(
      'Could not retrieve Expo Push Token (missing EAS project config). Using local mock token instead.',
      error
    );
    token = `ExponentPushToken[mock_local_${Date.now()}]`;
  }

  // Android-specific channel configuration
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#00B14F',
    });
  }

  return token;
}

/**
 * Send the retrieved push token to the Spring Boot backend server.
 */
export async function sendTokenToBackend(token: string) {
  if (!token) return;

  try {
    const response = await fetchWithAuth(`${API_BASE_URL}/auth/push-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    if (response.ok) {
      console.log('Push token successfully registered on backend:', token);
    } else {
      console.warn('Failed to register push token on backend. Status:', response.status);
    }
  } catch (error) {
    console.warn('Could not register push token on backend (server offline):', error);
  }
}

/**
 * Schedule a local notification directly on the device.
 * Used for simulated status updates in sandbox/offline modes.
 */
export async function scheduleLocalNotification(title: string, body: string, data?: Record<string, any>) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
      },
      trigger: null, // deliver immediately
    });
  } catch (error) {
    console.error('Error scheduling local notification:', error);
  }
}
