import { useRouter } from 'expo-router';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';

import { useMarkNotificationRead, useNotifications } from '@/api/hooks';
import type { AppNotification } from '@/api/types';
import { Badge, EmptyState, ErrorState, LoadingState } from '@/components/ui';
import { formatRelative } from '@/lib/format';

/**
 * Alert history.
 *
 * Suppressed alerts are shown too, marked as such. If the app went quiet
 * during someone's do-not-disturb window they deserve to see what they missed,
 * rather than assuming nothing ever came up.
 */
export default function AlertsScreen() {
  const router = useRouter();
  const { data, isLoading, isError, refetch, isRefetching } = useNotifications();
  const markRead = useMarkNotificationRead();

  if (isLoading) return <LoadingState />;
  if (isError) {
    return <ErrorState message="Meldungen konnten nicht geladen werden." onRetry={() => void refetch()} />;
  }

  const open = (notification: AppNotification) => {
    if (!notification.read_at) markRead.mutate(notification.id);
    router.push(`/slot/${notification.slot_id}`);
  };

  return (
    <FlatList
      className="bg-surface"
      data={data ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={() => void refetch()} />}
      renderItem={({ item }) => {
        const unread = item.read_at === null;
        const suppressed = item.status === 'throttled';
        return (
          <Pressable accessibilityRole="button" onPress={() => open(item)}>
            <View
              className={`rounded-card border p-4 ${
                unread ? 'border-primary-200 bg-primary-50' : 'border-border bg-background'
              }`}
            >
              <View className="flex-row items-start justify-between">
                <Text className="flex-1 pr-3 text-base font-semibold text-foreground">
                  {item.title}
                </Text>
                {suppressed ? <Badge label="stumm" tone="warning" /> : null}
                {item.status === 'failed' ? <Badge label="Fehler" tone="danger" /> : null}
              </View>
              <Text className="mt-1.5 text-sm leading-5 text-muted-foreground">{item.body}</Text>
              <Text className="mt-2 text-xs text-muted-foreground">
                {formatRelative(item.created_at)}
                {suppressed ? ' · wegen Ruhezeit oder Limit nicht gesendet' : ''}
              </Text>
            </View>
          </Pressable>
        );
      }}
      ListEmptyComponent={
        <EmptyState
          title="Noch keine Meldungen"
          description="Sobald ein passender Termin frei wird, erscheint er hier — und als Push auf Ihrem Gerät."
        />
      }
    />
  );
}
