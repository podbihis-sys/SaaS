import { useLocalSearchParams, useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { usePlace } from '@/api/hooks';
import type { Office, Responsibility, ResponsibilityLevel } from '@/api/types';
import { Badge, Button, Card, ErrorState, LoadingState, SectionTitle } from '@/components/ui';

/**
 * One municipality: who is responsible for which errand, and the offices we
 * know for it.
 *
 * The point of this screen is the *responsible* line, not the office list.
 * Half of Germany lives in a Gemeinde that does not register cars or issue
 * residence permits itself; sending those people to their Rathaus would be
 * wrong, and "nothing found" would be useless. So every errand names the
 * authority even when the catalogue has no office for it yet.
 */
export default function PlaceScreen() {
  const { ags } = useLocalSearchParams<{ ags: string }>();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = usePlace(String(ags));

  if (isLoading) return <LoadingState label="Zuständigkeiten werden ermittelt…" />;
  if (isError || !data) {
    return <ErrorState message="Diese Gemeinde ist nicht verfügbar." onRetry={() => void refetch()} />;
  }

  const { place, responsibilities } = data;
  const withOffices = responsibilities.filter((r) => r.offices.length > 0);
  const withoutOffices = responsibilities.filter((r) => r.offices.length === 0);

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ padding: 16, gap: 20 }}>
      <Card>
        <Text className="text-lg font-bold text-foreground">{place.short_name}</Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          {place.kind_label}
          {place.is_kreisfrei ? '' : ` · ${place.district_name}`}
          {` · ${place.state}`}
        </Text>
        {place.matched_plz ? (
          <Text className="mt-1 text-sm text-muted-foreground">
            PLZ {place.matched_plz}
            {place.localities.length > 0 ? ` (${place.localities.join(', ')})` : ''}
          </Text>
        ) : null}
        <Text className="mt-3 text-xs leading-4 text-muted-foreground">
          {place.is_kreisfrei
            ? 'Kreisfreie Stadt: alle Anliegen werden von der Stadt selbst bearbeitet.'
            : `Kreisangehörig: Kfz, Führerschein und Ausländerangelegenheiten bearbeitet der ${place.district_name}` +
              (place.district_seat ? ` (Sitz: ${place.district_seat}).` : '.')}
        </Text>
      </Card>

      {withOffices.length > 0 ? (
        <View>
          <SectionTitle>Direkt buchbar</SectionTitle>
          <View className="gap-3">
            {withOffices.map((entry) => (
              <ResponsibilityCard
                key={entry.authority_type}
                entry={entry}
                onOpenOffice={(office) => router.push(`/office/${office.id}`)}
              />
            ))}
          </View>
        </View>
      ) : null}

      {withoutOffices.length > 0 ? (
        <View>
          <SectionTitle>Zuständig, noch nicht im Katalog</SectionTitle>
          <View className="overflow-hidden rounded-card border border-border bg-background">
            {withoutOffices.map((entry, index) => (
              <View
                key={entry.authority_type}
                className={`px-4 py-3 ${index > 0 ? 'border-t border-border' : ''}`}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="flex-1 pr-2 text-sm font-medium text-foreground">
                    {entry.label_de}
                  </Text>
                  <Badge label={levelLabel(entry.level)} tone="neutral" />
                </View>
                <Text className="mt-0.5 text-sm text-muted-foreground">{entry.responsible_name}</Text>
                {entry.note ? (
                  <Text className="mt-1 text-xs leading-4 text-muted-foreground">{entry.note}</Text>
                ) : null}
              </View>
            ))}
          </View>
          <Text className="mt-2 text-xs leading-4 text-muted-foreground">
            Für diese Stellen kennen wir noch kein Terminsystem, das wir abfragen dürfen. Die
            Zuständigkeit stimmt trotzdem — buchen Sie dort direkt.
          </Text>
        </View>
      ) : null}

      {withOffices.length > 0 ? (
        <Button label="Suchauftrag anlegen" onPress={() => router.push('/watch/new')} />
      ) : null}
    </ScrollView>
  );
}

function ResponsibilityCard({
  entry,
  onOpenOffice,
}: {
  entry: Responsibility;
  onOpenOffice: (office: Office) => void;
}) {
  return (
    <View className="overflow-hidden rounded-card border border-border bg-background">
      <View className="border-b border-border px-4 py-3">
        <View className="flex-row items-center justify-between">
          <Text className="flex-1 pr-2 text-base font-semibold text-foreground">{entry.label_de}</Text>
          <Badge label={levelLabel(entry.level)} tone={entry.level === 'kreis' ? 'warning' : 'primary'} />
        </View>
        <Text className="mt-0.5 text-sm text-muted-foreground">{entry.responsible_name}</Text>
        {entry.note ? (
          <Text className="mt-1 text-xs leading-4 text-muted-foreground">{entry.note}</Text>
        ) : null}
      </View>
      {entry.offices.map((office) => (
        <Pressable
          key={office.id}
          accessibilityRole="button"
          onPress={() => onOpenOffice(office)}
          className="border-t border-border px-4 py-3"
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-2">
              <Text className="text-sm font-medium text-foreground">{office.name}</Text>
              <Text className="mt-0.5 text-xs text-muted-foreground">
                {[office.street, `${office.postal_code ?? ''} ${office.city}`.trim()]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
            </View>
            {office.scan_enabled ? (
              <Badge label="überwachbar" tone="available" />
            ) : (
              <Badge label="nur Portal" tone="neutral" />
            )}
          </View>
        </Pressable>
      ))}
    </View>
  );
}

function levelLabel(level: ResponsibilityLevel): string {
  switch (level) {
    case 'gemeinde':
      return 'Gemeinde';
    case 'kreis':
      return 'Kreis';
    default:
      return 'Eigener Bezirk';
  }
}
