import { useCallback } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Badge, type BadgeTone } from '@/components/Badge';
import { EmptyState } from '@/components/EmptyState';
import { listQuotes, type Quote, type QuoteStatus } from '@/lib/api/quotes';
import { formatDate, formatEuro } from '@/lib/utils/format';

const statusLabel: Record<QuoteStatus, string> = {
  draft: 'Entwurf',
  sent: 'Gesendet',
  accepted: 'Angenommen',
  declined: 'Abgelehnt',
  expired: 'Abgelaufen',
};

const statusTone: Record<QuoteStatus, BadgeTone> = {
  draft: 'neutral',
  sent: 'info',
  accepted: 'success',
  declined: 'danger',
  expired: 'warning',
};

export default function QuotesListScreen() {
  const query = useQuery({
    queryKey: ['quotes', 'all'],
    queryFn: () => listQuotes(),
  });

  const onRefresh = useCallback(() => {
    void query.refetch();
  }, [query]);

  const renderItem = useCallback(({ item }: { item: Quote }) => {
    return (
      <Card
        className="mb-3"
        onPress={() => router.push({ pathname: '/(tabs)/quotes/[id]', params: { id: item.id } })}
      >
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 pr-3">
            <Text className="text-base font-semibold text-foreground">{item.number}</Text>
            {item.customer_name ? (
              <Text className="text-xs text-muted-foreground mt-0.5">{item.customer_name}</Text>
            ) : null}
          </View>
          <Badge label={statusLabel[item.status]} tone={statusTone[item.status]} />
        </View>
        <View className="flex-row items-center justify-between mt-1">
          <Text className="text-xs text-muted-foreground">{formatDate(item.created_at)}</Text>
          <Text className="text-base font-semibold text-foreground">
            {formatEuro(item.total_cents / 100)}
          </Text>
        </View>
      </Card>
    );
  }, []);

  return (
    <Screen padded={false}>
      <View className="px-5 pt-4 pb-3">
        <Text className="text-2xl font-bold text-foreground">Angebote</Text>
      </View>

      <FlatList
        data={query.data?.items ?? []}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32, flexGrow: 1 }}
        refreshControl={<RefreshControl refreshing={query.isRefetching} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !query.isLoading ? (
            <EmptyState
              title="Noch keine Angebote"
              description="Erstellen Sie ein Angebot aus einer Anfrage."
            />
          ) : null
        }
      />
    </Screen>
  );
}
