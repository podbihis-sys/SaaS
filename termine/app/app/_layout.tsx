import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { AppState, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ensureAuthenticated } from '@/api/client';
import { readAlertData } from '@/lib/push';

import '../global.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 30 * 1000,
    },
  },
});

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const lastHandledResponse = useRef<string | null>(null);

  useEffect(() => {
    // Establishing the anonymous account before the first screen renders keeps
    // every query from racing to create one of its own.
    ensureAuthenticated()
      .catch(() => undefined)
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    // expo-notifications has no web implementation: calling into it there
    // throws rather than returning empty, which would take the whole app down
    // on first render.
    if (Platform.OS === 'web') return;

    /** Tapping a slot alert should land on that slot, not on the home tab. */
    const openFromAlert = (response: Notifications.NotificationResponse) => {
      if (lastHandledResponse.current === response.notification.request.identifier) return;
      lastHandledResponse.current = response.notification.request.identifier;

      const data = readAlertData(response);
      if (data.slotId) {
        router.push(`/slot/${data.slotId}`);
      } else if (data.watchId) {
        router.push(`/watch/${data.watchId}`);
      }
    };

    // Covers the cold-start case: the app was killed and launched by the tap.
    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) openFromAlert(response);
    });

    const subscription = Notifications.addNotificationResponseReceivedListener(openFromAlert);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    // Availability decays fast; anything cached while the app was backgrounded
    // is suspect the moment it comes forward again.
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void queryClient.invalidateQueries();
    });
    return () => subscription.remove();
  }, []);

  if (!ready) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: '#ffffff' },
            headerTintColor: '#0f172a',
            headerTitleStyle: { fontWeight: '600' },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: '#f8fafc' },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="watch/new"
            options={{
              title: 'Neuer Suchauftrag',
              presentation: Platform.OS === 'ios' ? 'modal' : 'card',
            }}
          />
          <Stack.Screen name="watch/[id]" options={{ title: 'Suchauftrag' }} />
          <Stack.Screen name="slot/[id]" options={{ title: 'Termin' }} />
          <Stack.Screen name="office/[id]" options={{ title: 'Amt' }} />
        </Stack>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
