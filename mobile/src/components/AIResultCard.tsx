import { Text, View } from 'react-native';
import { Card } from './Card';
import { Badge } from './Badge';
import { formatEuro } from '@/lib/utils/format';
import type { AIAnalysis } from '@/lib/api/ai';

export type AIResultCardProps = {
  analysis: AIAnalysis;
};

export function AIResultCard({ analysis }: AIResultCardProps) {
  const confidencePct =
    analysis.confidence !== null ? `${Math.round(analysis.confidence * 100)}%` : '-';
  const estimate =
    analysis.estimate_cents !== null ? formatEuro(analysis.estimate_cents / 100) : '-';

  return (
    <Card>
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-base font-semibold text-foreground">KI-Analyse</Text>
        <Badge label={`Konfidenz ${confidencePct}`} tone="info" />
      </View>

      {analysis.trade ? (
        <Text className="text-xs text-muted-foreground mb-2">Gewerk: {analysis.trade}</Text>
      ) : null}

      <Text className="text-sm text-foreground leading-5 mb-3">{analysis.summary}</Text>

      <View className="flex-row gap-4 mb-3">
        <View className="flex-1">
          <Text className="text-xs text-muted-foreground">Arbeitszeit</Text>
          <Text className="text-sm font-medium text-foreground mt-0.5">
            {analysis.labor_hours !== null ? `${analysis.labor_hours} h` : '-'}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs text-muted-foreground">Schaetzung</Text>
          <Text className="text-sm font-medium text-foreground mt-0.5">{estimate}</Text>
        </View>
      </View>

      {analysis.materials.length > 0 ? (
        <View className="border-t border-border pt-3">
          <Text className="text-xs font-medium text-muted-foreground mb-2">Materialien</Text>
          {analysis.materials.map((m, idx) => (
            <View key={`${m.title}-${idx}`} className="flex-row justify-between py-1">
              <Text className="text-sm text-foreground flex-1">{m.title}</Text>
              <Text className="text-sm text-muted-foreground ml-2">
                {m.quantity} {m.unit}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}
