import { Alert, ScrollView, Text, View } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { useAuth } from '@/lib/auth/context';
import { useCompany } from '@/lib/hooks/useCompany';

const roleLabel: Record<'owner' | 'admin' | 'member' | 'viewer', string> = {
  owner: 'Inhaber',
  admin: 'Administrator',
  member: 'Mitglied',
  viewer: 'Beobachter',
};

export default function MoreScreen() {
  const { user, signOut } = useAuth();
  const { activeCompanyId, memberships, switchCompany } = useCompany();

  async function onSignOut(): Promise<void> {
    try {
      await signOut();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Abmeldung fehlgeschlagen';
      Alert.alert('Fehler', message);
    }
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <Text className="text-2xl font-bold text-foreground mb-1">Mehr</Text>
        <Text className="text-sm text-muted-foreground mb-6">Einstellungen und Konto</Text>

        <Card className="mb-4">
          <Text className="text-sm font-medium text-muted-foreground">Angemeldet als</Text>
          <Text className="text-base font-semibold text-foreground mt-1">
            {user?.full_name ?? '-'}
          </Text>
          <Text className="text-sm text-muted-foreground">{user?.email ?? ''}</Text>
        </Card>

        {memberships.length > 0 ? (
          <View className="mb-4">
            <Text className="text-sm font-medium text-muted-foreground mb-2 px-1">Unternehmen</Text>
            <View className="gap-2">
              {memberships.map((m) => {
                const active = m.company_id === activeCompanyId;
                return (
                  <Card
                    key={m.company_id}
                    onPress={async () => {
                      if (!active) {
                        await switchCompany(m.company_id);
                      }
                    }}
                    className={active ? 'border-primary' : ''}
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 pr-3">
                        <Text className="text-base font-medium text-foreground">{m.company_name}</Text>
                        <Text className="text-xs text-muted-foreground mt-0.5">
                          {roleLabel[m.role]}
                        </Text>
                      </View>
                      {active ? (
                        <Text className="text-xs font-semibold text-primary">Aktiv</Text>
                      ) : null}
                    </View>
                  </Card>
                );
              })}
            </View>
          </View>
        ) : null}

        <View className="mt-6">
          <Button title="Abmelden" variant="destructive" onPress={onSignOut} />
        </View>

        <Text className="text-xs text-muted-foreground text-center mt-8">
          Weitere Einstellungen verfuegbar im Webportal.
        </Text>
      </ScrollView>
    </Screen>
  );
}
