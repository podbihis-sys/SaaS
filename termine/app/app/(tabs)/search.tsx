import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { useCategories, useOffices, useSlots } from '@/api/hooks';
import type { ServiceCategory } from '@/api/types';
import { SlotCard } from '@/components/SlotCard';
import { HorizontalChips, TextField } from '@/components/pickers';
import { Badge, Button, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { formatDistance } from '@/lib/format';

type Mode = 'slots' | 'offices';

/**
 * Browse what is free right now, and which offices exist.
 *
 * Deliberately separate from creating a watch: people arrive either wanting to
 * grab something today, or wanting to set up a standing search. Mixing the two
 * into one flow makes both worse.
 */
export default function SearchScreen() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('slots');
  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [city, setCity] = useState('');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const categoriesQuery = useCategories();

  const categoryOptions = useMemo(
    () => (categoriesQuery.data ?? []).map((c) => ({ value: c.value, label: c.label_de })),
    [categoriesQuery.data],
  );

  const officeParams = {
    ...(category ? { category } : {}),
    ...(city.trim() ? { city: city.trim() } : {}),
    ...(coords ? { latitude: coords.latitude, longitude: coords.longitude, radius_km: 25 } : {}),
  };

  const officesQuery = useOffices(officeParams, mode === 'offices' || Boolean(coords || city));
  const slotsQuery = useSlots(
    {
      ...(category ? { category } : {}),
      // When a place is chosen, slots are narrowed to the offices it matched.
      ...(officesQuery.data && (city.trim() || coords)
        ? { office_id: officesQuery.data.items.map((o) => o.id) }
        : {}),
    },
    mode === 'slots',
  );

  const useMyLocation = async () => {
    setLocationError(null);
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setLocationError('Ohne Standortfreigabe können wir keine Ämter in der Nähe suchen.');
      return;
    }
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });
    setCity('');
    setCoords({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });
  };

  return (
    <View className="flex-1 bg-surface">
      <View className="border-b border-border bg-background pb-3 pt-3">
        <View className="mb-3 flex-row gap-2 px-4">
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === 'slots' }}
            onPress={() => setMode('slots')}
            className={`flex-1 items-center rounded-lg py-2 ${
              mode === 'slots' ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                mode === 'slots' ? 'text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              Freie Termine
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="tab"
            accessibilityState={{ selected: mode === 'offices' }}
            onPress={() => setMode('offices')}
            className={`flex-1 items-center rounded-lg py-2 ${
              mode === 'offices' ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                mode === 'offices' ? 'text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              Ämter
            </Text>
          </Pressable>
        </View>

        <View className="mb-3 px-4">
          <TextField
            value={city}
            onChange={(value) => {
              setCity(value);
              if (value) setCoords(null);
            }}
            placeholder="Stadt oder PLZ"
          />
          <Pressable accessibilityRole="button" onPress={() => void useMyLocation()} className="mt-2">
            <Text className="text-sm font-medium text-primary">
              {coords ? '✓ Ämter in Ihrer Nähe' : 'Meinen Standort verwenden'}
            </Text>
          </Pressable>
          {locationError ? (
            <Text className="mt-1 text-xs text-destructive">{locationError}</Text>
          ) : null}
        </View>

        {categoryOptions.length > 0 ? (
          <HorizontalChips
            options={[{ value: '', label: 'Alle Anliegen' }, ...categoryOptions]}
            selected={category ?? ''}
            onSelect={(value) => setCategory(value ? (value as ServiceCategory) : null)}
          />
        ) : null}
      </View>

      {mode === 'slots' ? (
        <SlotResults
          query={slotsQuery}
          onOpen={(id) => router.push(`/slot/${id}`)}
          onCreateWatch={() => router.push('/watch/new')}
        />
      ) : (
        <OfficeResults query={officesQuery} onOpen={(id) => router.push(`/office/${id}`)} />
      )}
    </View>
  );
}

function SlotResults({
  query,
  onOpen,
  onCreateWatch,
}: {
  query: ReturnType<typeof useSlots>;
  onOpen: (id: string) => void;
  onCreateWatch: () => void;
}) {
  if (query.isLoading) return <LoadingState label="Termine werden gesucht…" />;
  if (query.isError) {
    return <ErrorState message="Termine konnten nicht geladen werden." onRetry={() => void query.refetch()} />;
  }

  return (
    <FlatList
      data={query.data ?? []}
      keyExtractor={(slot) => slot.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => <SlotCard slot={item} onPress={() => onOpen(item.id)} />}
      ListEmptyComponent={
        <EmptyState
          title="Gerade nichts frei"
          description={
            'Bei Ämtern ist das der Normalfall — freie Termine tauchen oft nur für ' +
            'Minuten auf, wenn jemand absagt. Legen Sie einen Suchauftrag an, dann ' +
            'schauen wir für Sie nach.'
          }
          action={<Button label="Suchauftrag anlegen" onPress={onCreateWatch} />}
        />
      }
    />
  );
}

function OfficeResults({
  query,
  onOpen,
}: {
  query: ReturnType<typeof useOffices>;
  onOpen: (id: string) => void;
}) {
  if (query.isLoading) return <LoadingState label="Ämter werden geladen…" />;
  if (query.isError) {
    return <ErrorState message="Ämter konnten nicht geladen werden." onRetry={() => void query.refetch()} />;
  }

  return (
    <FlatList
      data={query.data?.items ?? []}
      keyExtractor={(office) => office.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item }) => {
        const distance = formatDistance(item.distance_km);
        return (
          <Pressable accessibilityRole="button" onPress={() => onOpen(item.id)}>
            <View className="rounded-card border border-border bg-background p-4">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-base font-semibold text-foreground">{item.name}</Text>
                  <Text className="mt-0.5 text-sm text-muted-foreground">
                    {[item.street, `${item.postal_code ?? ''} ${item.city}`.trim()]
                      .filter(Boolean)
                      .join(', ')}
                  </Text>
                </View>
                {distance ? <Badge label={distance} tone="primary" /> : null}
              </View>
              <Text className="mt-3 text-xs text-muted-foreground">
                {item.services.length === 1
                  ? '1 Anliegen buchbar'
                  : `${item.services.length} Anliegen buchbar`}
              </Text>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState
          title="Keine Ämter gefunden"
          description="Versuchen Sie eine andere Stadt oder entfernen Sie den Anliegen-Filter."
        />
      }
    />
  );
}
