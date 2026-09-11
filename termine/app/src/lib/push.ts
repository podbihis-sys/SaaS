import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { registerPushToken } from '@/api/hooks';
import { ensureAuthenticated } from '@/api/client';

/**
 * A slot alert is worthless if it arrives quietly, so notifications are shown
 * even while the app is in the foreground.
 */
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
}

export type PushPermission = 'granted' | 'denied' | 'unsupported';

export interface PushRegistration {
  status: PushPermission;
  token: string | null;
  error?: string;
}

/**
 * Asks for permission, gets an Expo push token and hands it to the backend.
 *
 * Called from the settings screen and after the first watch is created, rather
 * than on first launch: asking before the user has anything to be notified
 * about is the surest way to get a permanent "Nein".
 */
export async function registerForPushNotifications(): Promise<PushRegistration> {
  if (Platform.OS === 'web') {
    // Web push needs its own VAPID setup and a service worker; the browser
    // build is a convenience view, not an alerting client.
    return { status: 'unsupported', token: null, error: 'Im Browser nicht verfügbar.' };
  }
  if (!Device.isDevice) {
    // Simulators cannot receive remote pushes at all.
    return { status: 'unsupported', token: null, error: 'Nur auf echten Geräten verfügbar.' };
  }

  if (Platform.OS === 'android') {
    // Android 8+ ignores importance set anywhere but a channel, and a
    // low-importance channel would silence exactly the alerts that matter.
    await Notifications.setNotificationChannelAsync('slots', {
      name: 'Freie Termine',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1d4ed8',
      sound: 'default',
    });
  }

  const existing = await Notifications.getPermissionsAsync();
  let granted = existing.granted;
  if (!granted && existing.canAskAgain) {
    const requested = await Notifications.requestPermissionsAsync();
    granted = requested.granted;
  }
  if (!granted) {
    return { status: 'denied', token: null };
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId ?? undefined;

  try {
    const { data: token } = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined,
    );
    await ensureAuthenticated();
    await registerPushToken(token, Platform.OS === 'ios' ? 'ios' : 'android');
    return { status: 'granted', token };
  } catch (error) {
    return {
      status: 'denied',
      token: null,
      error: error instanceof Error ? error.message : 'Push-Token konnte nicht erstellt werden.',
    };
  }
}

export async function getPushPermissionStatus(): Promise<PushPermission> {
  if (Platform.OS === 'web' || !Device.isDevice) return 'unsupported';
  const permissions = await Notifications.getPermissionsAsync();
  return permissions.granted ? 'granted' : 'denied';
}

/** Payload the backend attaches to every slot alert. */
export interface SlotAlertData {
  type?: string;
  slotId?: string;
  watchId?: string;
  notificationId?: string;
}

export function readAlertData(response: Notifications.NotificationResponse): SlotAlertData {
  const data = response.notification.request.content.data;
  return (data ?? {}) as SlotAlertData;
}
