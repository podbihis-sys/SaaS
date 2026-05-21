import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { QuotePreview } from '@/components/QuotePreview';
import { getQuote, getQuotePdfUrl } from '@/lib/api/quotes';

export default function QuoteDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';

  const quoteQuery = useQuery({
    queryKey: ['quote', id],
    queryFn: () => getQuote(id),
    enabled: id.length > 0,
  });

  const pdfMutation = useMutation({
    mutationFn: () => getQuotePdfUrl(id),
    onSuccess: async (data) => {
      await WebBrowser.openBrowserAsync(data.url);
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'PDF konnte nicht geladen werden';
      Alert.alert('Fehler', message);
    },
  });

  if (quoteQuery.isLoading) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#6366f1" />
        </View>
      </Screen>
    );
  }

  if (!quoteQuery.data) {
    return (
      <Screen>
        <Pressable onPress={() => router.back()} className="mb-4">
          <Text className="text-base text-primary">Zurueck</Text>
        </Pressable>
        <Text className="text-base text-muted-foreground">Angebot nicht gefunden.</Text>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View className="flex-row items-center justify-between mb-4">
          <Pressable onPress={() => router.back()}>
            <Text className="text-base text-primary">Zurueck</Text>
          </Pressable>
          <View />
        </View>

        <QuotePreview quote={quoteQuery.data} />

        {quoteQuery.data.notes ? (
          <View className="mt-4">
            <Text className="text-sm font-medium text-muted-foreground mb-1">Notizen</Text>
            <Text className="text-base text-foreground">{quoteQuery.data.notes}</Text>
          </View>
        ) : null}

        <View className="mt-6">
          <Button
            title="PDF anzeigen"
            size="lg"
            onPress={() => pdfMutation.mutate()}
            loading={pdfMutation.isPending}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
