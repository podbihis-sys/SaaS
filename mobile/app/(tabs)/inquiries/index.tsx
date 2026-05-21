import { useCallback } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Badge, type BadgeTone } from '@/components/Badge';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { listInquiries, type Inquiry, type InquiryStatus } from '@/lib/api/inquiries';
import { formatDate, truncate } from '@/lib/utils/format';

const statusLabel: Record<InquiryStatus, string> = {
  new: 'Neu',
  in_review: 'In Pruefung',
  quoted: 'Angeboten',
  won: 'Gewonnen',
  lost: 'Verloren',
  archived: 'Archiviert',
};

const statusTone: Record<InquiryStatus, BadgeTone> = {
  new: 'info',
  in_review: 'warning',
  quoted: 'neutral',
  won: 'success',
  lost: 'danger',
  archived: 'neutral',
};

export default function InquiriesListScreen() {
  const query = useQuery({
    queryKey: ['inquiries', 'all'],
    queryFn: () => listInquiries(),
  });

  const onRefresh = useCallback(() => {
    void query.refetch();
  }, [query]);

  const renderItem = useCallback(({ item }: { item: Inquiry }) => {
    return (
      <Card
        className="mb-3"
        onPress={() => router.push({ pathname: '/(tabs)/inquiries/[id]', params: { id: item.id } })}
      >
        <View className="flex-row items-start justify-between mb-2">
          <View className="flex-1 pr-3">
            <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
              {item.title}
            </Text>
            {item.customer_name ? (
              <Text className="text-xs text-muted-foreground mt-0.5">{item.customer_name}</Text>
            ) : null}
          </View>
          <Badge label={statusLabel[item.status]} tone={statusTone[item.status]} />
        </View>
        {item.description ? (
          <Text className="text-sm text-muted-foreground mt-1" numberOfLines={2}>
            {truncate(item.description, 140)}
          </Text>
        ) : null}
        <Text className="text-xs text-muted-foreground mt-3">{formatDate(item.created_at)}</Text>
      </Card>
    );
  }, []);

  return (
    <Screen padded={false}>
      <View className="px-5 pt-4 pb-3 flex-row items-center justify-between">
        <Text className="text-2xl font-bold text-foreground">Anfragen</Text>
        <Button
          title="+ Neu"
          size="sm"
          fullWidth={false}
          onPress={() => router.push('/(tabs)/inquiries/new')}
        />
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
              title="Noch keine Anfragen"
              description="Erstellen Sie Ihre erste Anfrage, um zu starten."
              action={
                <Button
                  title="+ Neue Anfrage"
                  onPress={() => router.push('/(tabs)/inquiries/new')}
                />
              }
            />
          ) : null
        }
      />
    </Screen>
  );
}
