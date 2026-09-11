import { useQueryClient } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, Text, View } from 'react-native';

import { API_BASE_URL } from '@/api/client';
import { Button, Row, SectionTitle } from '@/components/ui';
import { getPushPermissionStatus, registerForPushNotifications, type PushPermission } from '@/lib/push';
import { resetIdentity } from '@/lib/storage';

const PERMISSION_LABEL: Record<PushPermission, string> = {
  granted: 'Erlaubt',
  denied: 'Nicht erlaubt',
  unsupported: 'Auf diesem Gerät nicht verfügbar',
};

export default function SettingsScreen() {
  const queryClient = useQueryClient();
  const [permission, setPermission] = useState<PushPermission>('denied');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void getPushPermissionStatus().then(setPermission);
  }, []);

  const enablePush = async () => {
    setBusy(true);
    try {
      const result = await registerForPushNotifications();
      setPermission(result.status);
      if (result.status === 'denied') {
        // Once iOS has been told "no" it will not ask again, so the only route
        // left is the system settings app.
        Alert.alert(
          'Benachrichtigungen sind blockiert',
          'Bitte erlauben Sie Mitteilungen in den Systemeinstellungen. Ohne sie können wir Sie nicht über freie Termine informieren.',
          [
            { text: 'Abbrechen', style: 'cancel' },
            { text: 'Einstellungen öffnen', onPress: () => void Linking.openSettings() },
          ],
        );
      }
    } finally {
      setBusy(false);
    }
  };

  const deleteEverything = () => {
    Alert.alert(
      'Alle Daten löschen?',
      'Ihre Suchaufträge und Meldungen auf diesem Gerät werden vergessen. Das lässt sich nicht rückgängig machen.',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: async () => {
            await resetIdentity();
            queryClient.clear();
            Alert.alert('Erledigt', 'Bitte starten Sie die App neu, um von vorn zu beginnen.');
          },
        },
      ],
    );
  };

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ padding: 16, gap: 24 }}>
      <View>
        <SectionTitle>Benachrichtigungen</SectionTitle>
        <View className="overflow-hidden rounded-card border border-border bg-background">
          <Row title="Push-Mitteilungen" subtitle={PERMISSION_LABEL[permission]} />
          <View className="p-4">
            <Button
              label={permission === 'granted' ? 'Erneut registrieren' : 'Benachrichtigungen erlauben'}
              variant={permission === 'granted' ? 'secondary' : 'primary'}
              loading={busy}
              onPress={() => void enablePush()}
            />
            <Text className="mt-3 text-xs leading-4 text-muted-foreground">
              Freie Termine bei Ämtern sind oft nur Minuten verfügbar. Ohne Push erfahren Sie erst
              davon, wenn Sie die App zufällig öffnen.
            </Text>
          </View>
        </View>
      </View>

      <View>
        <SectionTitle>Wie das funktioniert</SectionTitle>
        <View className="rounded-card border border-border bg-background p-4">
          <Text className="text-sm leading-5 text-foreground">
            Wir fragen die offiziellen Terminportale der Ämter regelmäßig ab und melden uns, sobald
            ein Termin zu Ihrem Suchauftrag passt.
          </Text>
          <Text className="mt-3 text-sm leading-5 text-foreground">
            Gebucht wird immer auf der Seite des Amtes — wir bringen Sie mit einem Tipp direkt
            dorthin. Die App bucht nichts eigenständig und speichert keine Ausweisdaten.
          </Text>
          <Text className="mt-3 text-sm leading-5 text-muted-foreground">
            Ein angezeigter Termin kann bereits vergeben sein, wenn Sie ihn öffnen. Das ist keine
            Panne, sondern liegt daran, dass viele Menschen gleichzeitig suchen.
          </Text>
        </View>
      </View>

      <View>
        <SectionTitle>Ihre Daten</SectionTitle>
        <View className="rounded-card border border-border bg-background p-4">
          <Text className="text-sm leading-5 text-foreground">
            Es gibt kein Konto und keine Anmeldung. Ihr Gerät bekommt beim ersten Start eine
            Zufallskennung — daran hängen Ihre Suchaufträge. Wir kennen weder Ihren Namen noch Ihre
            E-Mail-Adresse.
          </Text>
          <View className="mt-4">
            <Button label="Alle Daten löschen" variant="danger" onPress={deleteEverything} />
          </View>
        </View>
      </View>

      <View>
        <SectionTitle>Über</SectionTitle>
        <View className="overflow-hidden rounded-card border border-border bg-background">
          <Row title="Version" right={<Text className="text-sm text-muted-foreground">0.1.0</Text>} />
          <Row
            title="Server"
            subtitle={API_BASE_URL}
            onPress={() => void WebBrowser.openBrowserAsync(`${API_BASE_URL}/docs`)}
          />
        </View>
      </View>
    </ScrollView>
  );
}
