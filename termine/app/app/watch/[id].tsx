import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, ScrollView, Text, View } from 'react-native';

import { useDeleteWatch, useUpdateWatch, useWatch } from '@/api/hooks';
import { SlotCard } from '@/components/SlotCard';
import { Badge, Button, Card, ErrorState, LoadingState, SectionTitle } from '@/components/ui';
import {
  categoryLabel,
  formatDateWindow,
  formatRelative,
  formatTimeWindow,
  formatWeekdayMask,
} from '@/lib/format';

/** One search order: its criteria, and whatever currently satisfies them. */
export default function WatchDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const watchId = String(id);

  const { data: watch, isLoading, isError, refetch } = useWatch(watchId);
  const updateWatch = useUpdateWatch(watchId);
  const deleteWatch = useDeleteWatch();

  if (isLoading) return <LoadingState />;
  if (isError || !watch) {
    return <ErrorState message="Dieser Suchauftrag ist nicht verfügbar." onRetry={() => void refetch()} />;
  }

  const paused = Boolean(watch.paused_until && new Date(watch.paused_until) > new Date());

  const pauseForADay = () => {
    const until = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    updateWatch.mutate({ paused_until: paused ? null : until });
  };

  const confirmDelete = () => {
    Alert.alert('Suchauftrag löschen?', 'Wir hören dann auf, für Sie nach diesem Termin zu suchen.', [
      { text: 'Abbrechen', style: 'cancel' },
      {
        text: 'Löschen',
        style: 'destructive',
        onPress: () => {
          deleteWatch.mutate(watchId, { onSuccess: () => router.back() });
        },
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ padding: 16, gap: 20 }}>
      <Card>
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-lg font-bold text-foreground">{watch.label}</Text>
            <Text className="mt-0.5 text-sm text-primary">{categoryLabel(watch.category)}</Text>
          </View>
          {!watch.active ? (
            <Badge label="beendet" tone="neutral" />
          ) : paused ? (
            <Badge label="pausiert" tone="warning" />
          ) : (
            <Badge label="aktiv" tone="available" />
          )}
        </View>

        <View className="mt-4 gap-2">
          <Criterion label="Ämter" value={watch.offices.map((o) => o.name).join(', ')} />
          <Criterion
            label="Zeitraum"
            value={formatDateWindow(watch.earliest_date, watch.latest_date)}
          />
          <Criterion label="Tage" value={formatWeekdayMask(watch.weekday_mask)} />
          <Criterion
            label="Uhrzeit"
            value={formatTimeWindow(watch.earliest_time, watch.latest_time)}
          />
          <Criterion
            label="Vorlauf"
            value={`mindestens ${watch.min_lead_hours} ${watch.min_lead_hours === 1 ? 'Stunde' : 'Stunden'}`}
          />
          <Criterion
            label="Nachtruhe"
            value={
              watch.quiet_hours_start && watch.quiet_hours_end
                ? `${watch.quiet_hours_start.slice(0, 5)}–${watch.quiet_hours_end.slice(0, 5)} Uhr`
                : 'aus'
            }
          />
        </View>

        <Text className="mt-4 text-xs text-muted-foreground">
          {watch.last_notified_at
            ? `Zuletzt gemeldet ${formatRelative(watch.last_notified_at)}`
            : 'Bisher noch nichts gefunden'}
        </Text>
      </Card>

      <View>
        <SectionTitle>
          {watch.matching_slots.length > 0
            ? `${watch.matching_slots.length} passende Termine gerade frei`
            : 'Gerade nichts frei'}
        </SectionTitle>

        {watch.matching_slots.length === 0 ? (
          <Card>
            <Text className="text-sm leading-5 text-muted-foreground">
              Das ist der Normalfall. Wir fragen die Terminportale laufend ab und melden uns, sobald
              etwas passt — auch wenn es nur für ein paar Minuten frei ist.
            </Text>
          </Card>
        ) : (
          <View className="gap-3">
            {watch.matching_slots.map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                onPress={() => router.push(`/slot/${slot.id}?watchId=${watch.id}`)}
              />
            ))}
          </View>
        )}
      </View>

      <View className="gap-2">
        {watch.active ? (
          <Button
            label={paused ? 'Suche fortsetzen' : 'Für 24 Stunden pausieren'}
            variant="secondary"
            loading={updateWatch.isPending}
            onPress={pauseForADay}
          />
        ) : (
          <Button
            label="Suche wieder aktivieren"
            variant="secondary"
            loading={updateWatch.isPending}
            onPress={() => updateWatch.mutate({ active: true })}
          />
        )}
        <Button
          label="Suchauftrag löschen"
          variant="danger"
          loading={deleteWatch.isPending}
          onPress={confirmDelete}
        />
      </View>
    </ScrollView>
  );
}

function Criterion({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row">
      <Text className="w-24 text-sm text-muted-foreground">{label}</Text>
      <Text className="flex-1 text-sm text-foreground">{value}</Text>
    </View>
  );
}
