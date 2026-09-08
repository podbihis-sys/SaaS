import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';

import { useCategories, useOffices, usePlaces, useSlots } from '@/api/hooks';
import type { Place, ServiceCategory } from '@/api/types';
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

  const placeQuery = city.trim();
  const isPostcode = /^\d{5}$/.test(placeQuery);
  const placesQuery = usePlaces(placeQuery);

  const officeParams = {
    ...(category ? { category } : {}),
    // A postcode matches an office's own postcode; a name matches its city.
    ...(placeQuery ? (isPostcode ? { q: placeQuery } : { city: placeQuery }) : {}),
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
          <PlaceSuggestions
            places={placesQuery.data ?? []}
            visible={placeQuery.length >= 2}
            onOpen={(place) => router.push(`/place/${place.ags}`)}
          />
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

/**
 * Municipalities matching what was typed, from the official register.
 *
 * Tapping one opens the responsibility view — which office serves this place
 * for which errand — because "Odenthal" has no office of its own for half of
 * what people need, and the plain office search would show nothing.
 */
function PlaceSuggestions({
  places,
  visible,
  onOpen,
}: {
  places: Place[];
  visible: boolean;
  onOpen: (place: Place) => void;
}) {
  if (!visible || places.length === 0) return null;
  return (
    <View className="mt-3 overflow-hidden rounded-card border border-border bg-background">
      {places.map((place, index) => (
        <Pressable
          key={place.ags}
          accessibilityRole="button"
          onPress={() => onOpen(place)}
          className={`flex-row items-center justify-between px-4 py-3 ${
            index > 0 ? 'border-t border-border' : ''
          }`}
        >
          <View className="flex-1 pr-2">
            <Text className="text-sm font-medium text-foreground">
              {place.short_name}
              {place.matched_plz && place.localities.length > 0 && place.localities[0] !== place.short_name
                ? ` (${place.localities.join(', ')})`
                : ''}
            </Text>
            <Text className="mt-0.5 text-xs text-muted-foreground">
              {place.kind_label}
              {place.is_kreisfrei ? '' : ` · ${place.district_name}`} · {place.state}
            </Text>
          </View>
          <Badge
            label={place.office_count > 0 ? `${place.office_count} Ämter` : 'Zuständigkeit'}
            tone={place.office_count > 0 ? 'primary' : 'neutral'}
          />
        </Pressable>
      ))}
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
                <View className="items-end gap-1">
                  {distance ? <Badge label={distance} tone="primary" /> : null}
                  {item.scan_enabled ? null : <Badge label="direkt buchen" tone="neutral" />}
                </View>
              </View>
              <Text className="mt-3 text-xs text-muted-foreground">
                {item.scan_enabled
                  ? item.services.length === 1
                    ? '1 Anliegen buchbar'
                    : `${item.services.length} Anliegen buchbar`
                  : 'Terminportal des Amtes — Überwachung nicht möglich'}
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
