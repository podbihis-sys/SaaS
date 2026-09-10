import { useRouter } from 'expo-router';
import { FlatList, RefreshControl, View } from 'react-native';

import { API_URL_MISSING } from '@/api/client';
import { useWatches } from '@/api/hooks';
import { WatchCard } from '@/components/WatchCard';
import { Button, EmptyState, ErrorState, LoadingState } from '@/components/ui';

/** Home: the search orders this device is running. */
export default function WatchesScreen() {
  const router = useRouter();
  const { data, isLoading, isError, error, refetch, isRefetching } = useWatches();

  // A build shipped without an API URL cannot reach anything, and every screen
  // would otherwise show "server not reachable" — true, but it sends whoever
  // is testing to look in the wrong place.
  if (API_URL_MISSING) {
    return (
      <ErrorState message="Dieser Build hat keine Server-Adresse (EXPO_PUBLIC_API_URL fehlt in eas.json)." />
    );
  }

  if (isLoading) return <LoadingState />;

  if (isError) {
    return (
      <ErrorState
        message={
          error instanceof Error
            ? error.message
            : 'Der Server ist gerade nicht erreichbar.'
        }
        onRetry={() => void refetch()}
      />
    );
  }

  const watches = data ?? [];

  return (
    <View className="flex-1 bg-surface">
      <FlatList
        data={watches}
        keyExtractor={(watch) => watch.id}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 96 }}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />
        }
        renderItem={({ item }) => (
          <WatchCard watch={item} onPress={() => router.push(`/watch/${item.id}`)} />
        )}
        ListEmptyComponent={
          <EmptyState
            title="Noch kein Suchauftrag"
            description={
              'Sagen Sie uns, welchen Termin Sie brauchen und bei welchen Ämtern. ' +
              'Wir prüfen laufend und melden uns, sobald etwas frei wird.'
            }
            action={
              <Button label="Suchauftrag anlegen" onPress={() => router.push('/watch/new')} />
            }
          />
        }
      />

      {watches.length > 0 ? (
        <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-background px-4 pb-6 pt-3">
          <Button label="Neuer Suchauftrag" onPress={() => router.push('/watch/new')} />
        </View>
      ) : null}
    </View>
  );
}
