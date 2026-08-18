import { useQuery } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';

import { request } from '@/api/client';
import { useCreateBooking, useResolveBooking } from '@/api/hooks';
import type { Slot } from '@/api/types';
import { Badge, Button, Card, ErrorState, LoadingState, SectionTitle } from '@/components/ui';
import { formatRelative, formatSlotDate, formatSlotTime } from '@/lib/format';

/**
 * A single appointment, and the handoff into the authority's booking flow.
 *
 * The screen is honest about the race it cannot win: between the last scan and
 * this tap, somebody else may have taken the slot. Saying so up front is better
 * than letting the official site deliver the bad news unexplained.
 */
export default function SlotDetailScreen() {
  const { id, watchId } = useLocalSearchParams<{ id: string; watchId?: string }>();
  const slotId = String(id);

  const [bookingId, setBookingId] = useState<string | null>(null);
  const createBooking = useCreateBooking();
  const resolveBooking = useResolveBooking();

  const {
    data: slot,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['slot', slotId],
    queryFn: () => request<Slot>(`/api/v1/slots/${slotId}`, { anonymous: true }),
    retry: false,
  });

  if (isLoading) return <LoadingState />;

  if (isError || !slot) {
    return (
      <ErrorState
        message="Dieser Termin ist nicht mehr verfügbar. Das passiert bei Ämtern häufig innerhalb weniger Minuten."
        onRetry={() => void refetch()}
      />
    );
  }

  const taken = slot.status !== 'available';

  const openBooking = async () => {
    try {
      const booking = await createBooking.mutateAsync({
        slot_id: slot.id,
        ...(watchId ? { watch_id: String(watchId) } : {}),
      });
      setBookingId(booking.id);
      await WebBrowser.openBrowserAsync(booking.handoff_url);
      askHowItWent(booking.id);
    } catch (error) {
      Alert.alert(
        'Buchung konnte nicht geöffnet werden',
        error instanceof Error ? error.message : 'Bitte versuchen Sie es erneut.',
      );
    }
  };

  /**
   * Asked after the browser closes. A confirmed booking retires the watch, so
   * the user stops hearing about an errand they have already run.
   */
  const askHowItWent = (id: string) => {
    Alert.alert('Hat es geklappt?', 'Konnten Sie den Termin auf der Seite des Amtes buchen?', [
      {
        text: 'War schon weg',
        onPress: () => resolveBooking.mutate({ id, status: 'missed' }),
      },
      { text: 'Später', style: 'cancel' },
      {
        text: 'Ja, gebucht',
        onPress: () => resolveBooking.mutate({ id, status: 'confirmed' }),
      },
    ]);
  };

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ padding: 16, gap: 20 }}>
      <View
        className={`rounded-card border p-5 ${
          taken ? 'border-border bg-background' : 'border-available-border bg-available-soft'
        }`}
      >
        <View className="flex-row items-start justify-between">
          <Text className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {formatSlotDate(slot.starts_at, slot.timezone)}
          </Text>
          <Badge label={taken ? 'vergeben' : 'frei'} tone={taken ? 'neutral' : 'available'} />
        </View>
        <Text className="mt-2 text-4xl font-bold text-foreground">
          {formatSlotTime(slot.starts_at, slot.timezone)}
        </Text>
        <Text className="mt-3 text-base text-foreground">{slot.service_name}</Text>
        <Text className="mt-1 text-sm text-muted-foreground">
          {slot.office_name}, {slot.city}
        </Text>
        <Text className="mt-4 text-xs text-muted-foreground">
          Zuletzt bestätigt {formatRelative(slot.last_seen_at)}
        </Text>
      </View>

      {taken ? (
        <Card>
          <Text className="text-sm leading-5 text-muted-foreground">
            Dieser Termin ist beim letzten Abgleich nicht mehr aufgetaucht. Er kann jederzeit wieder
            frei werden, wenn jemand absagt — Ihr Suchauftrag läuft weiter.
          </Text>
        </Card>
      ) : (
        <View className="gap-3">
          <Button
            label="Beim Amt buchen"
            loading={createBooking.isPending}
            onPress={() => void openBooking()}
          />
          <Text className="px-1 text-xs leading-4 text-muted-foreground">
            Sie werden auf die offizielle Seite des Amtes weitergeleitet. Dort geben Sie Ihre Daten
            ein und schließen die Buchung ab — die App bucht nichts für Sie und speichert keine
            Ausweisdaten.
          </Text>
        </View>
      )}

      {bookingId ? (
        <View>
          <SectionTitle>Nach der Buchung</SectionTitle>
          <Card>
            <Text className="mb-3 text-sm leading-5 text-muted-foreground">
              Sagen Sie uns, wie es ausgegangen ist. Bei einer erfolgreichen Buchung beenden wir den
              Suchauftrag, damit Sie keine weiteren Meldungen bekommen.
            </Text>
            <View className="gap-2">
              <Button
                label="Termin gebucht"
                variant="secondary"
                onPress={() => resolveBooking.mutate({ id: bookingId, status: 'confirmed' })}
              />
              <Button
                label="War leider schon vergeben"
                variant="ghost"
                onPress={() => resolveBooking.mutate({ id: bookingId, status: 'missed' })}
              />
            </View>
          </Card>
        </View>
      ) : null}
    </ScrollView>
  );
}
