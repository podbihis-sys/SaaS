import { useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { Badge, type BadgeTone } from '@/components/Badge';
import { Card } from '@/components/Card';
import { AIResultCard } from '@/components/AIResultCard';
import { getInquiry, type InquiryStatus } from '@/lib/api/inquiries';
import { analyzeInquiry, type AIAnalysis } from '@/lib/api/ai';
import { createQuoteFromInquiry } from '@/lib/api/quotes';
import { formatDateTime, formatEuro } from '@/lib/utils/format';

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

export default function InquiryDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const queryClient = useQueryClient();

  const inquiryQuery = useQuery({
    queryKey: ['inquiry', id],
    queryFn: () => getInquiry(id),
    enabled: id.length > 0,
  });

  const analyzeMutation = useMutation<AIAnalysis>({
    mutationFn: () => analyzeInquiry(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['inquiry', id] });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Analyse fehlgeschlagen';
      Alert.alert('Fehler', message);
    },
  });

  const quoteMutation = useMutation({
    mutationFn: () => createQuoteFromInquiry(id),
    onSuccess: async (quote) => {
      await queryClient.invalidateQueries({ queryKey: ['quotes'] });
      router.push({ pathname: '/(tabs)/quotes/[id]', params: { id: quote.id } });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Angebot konnte nicht erstellt werden';
      Alert.alert('Fehler', message);
    },
  });

  const inquiry = inquiryQuery.data;
  const screenWidth = Dimensions.get('window').width;
  const imageSize = Math.min(screenWidth - 40, 320);

  const renderHeader = useCallback(
    () => (
      <View className="flex-row items-center justify-between mb-4">
        <Pressable onPress={() => router.back()}>
          <Text className="text-base text-primary">Zurueck</Text>
        </Pressable>
        <View />
      </View>
    ),
    [],
  );

  if (inquiryQuery.isLoading) {
    return (
      <Screen>
        {renderHeader()}
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#6366f1" />
        </View>
      </Screen>
    );
  }

  if (!inquiry) {
    return (
      <Screen>
        {renderHeader()}
        <Text className="text-base text-muted-foreground">Anfrage nicht gefunden.</Text>
      </Screen>
    );
  }

  const hasAnalysis = inquiry.ai_summary !== null;
  const analysis: AIAnalysis | null = hasAnalysis
    ? {
        inquiry_id: inquiry.id,
        summary: inquiry.ai_summary ?? '',
        trade: null,
        materials: [],
        labor_hours: null,
        estimate_cents: inquiry.ai_estimate_cents,
        confidence: inquiry.ai_confidence,
        created_at: inquiry.updated_at,
      }
    : (analyzeMutation.data ?? null);

  return (
    <Screen padded={false}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {renderHeader()}

        <View className="mb-4">
          <Badge label={statusLabel[inquiry.status]} tone={statusTone[inquiry.status]} />
          <Text className="text-2xl font-bold text-foreground mt-2">{inquiry.title}</Text>
          {inquiry.customer_name ? (
            <Text className="text-sm text-muted-foreground mt-1">{inquiry.customer_name}</Text>
          ) : null}
          <Text className="text-xs text-muted-foreground mt-1">
            Erstellt {formatDateTime(inquiry.created_at)}
          </Text>
        </View>

        {inquiry.images.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            className="mb-4"
          >
            {inquiry.images.map((img) =>
              img.url ? (
                <Image
                  key={img.id}
                  source={{ uri: img.url }}
                  style={{ width: imageSize, height: imageSize, marginRight: 12, borderRadius: 16 }}
                  resizeMode="cover"
                />
              ) : null,
            )}
          </ScrollView>
        ) : null}

        {inquiry.description ? (
          <Card className="mb-4">
            <Text className="text-sm font-medium text-muted-foreground mb-1">Beschreibung</Text>
            <Text className="text-base text-foreground leading-6">{inquiry.description}</Text>
          </Card>
        ) : null}

        {analysis ? (
          <View className="mb-4">
            <AIResultCard analysis={analysis} />
          </View>
        ) : (
          <Card className="mb-4">
            <Text className="text-sm font-medium text-foreground mb-1">KI-Analyse</Text>
            <Text className="text-sm text-muted-foreground">
              Starten Sie die KI-Analyse, um eine Schaetzung zu erhalten.
            </Text>
          </Card>
        )}

        {inquiry.ai_estimate_cents !== null && !analysis ? (
          <Text className="text-sm text-muted-foreground mb-3">
            Letzte Schaetzung: {formatEuro(inquiry.ai_estimate_cents / 100)}
          </Text>
        ) : null}

        <View className="gap-3 mt-2">
          <Button
            title={analysis ? 'Analyse aktualisieren' : 'KI-Analyse starten'}
            variant="secondary"
            size="lg"
            onPress={() => analyzeMutation.mutate()}
            loading={analyzeMutation.isPending}
          />
          <Button
            title="Angebot erstellen"
            size="lg"
            onPress={() => quoteMutation.mutate()}
            loading={quoteMutation.isPending}
          />
        </View>
      </ScrollView>
    </Screen>
  );
}
