import { Text, View } from 'react-native';
import { Card } from './Card';
import { Badge, type BadgeTone } from './Badge';
import { formatDate, formatEuro } from '@/lib/utils/format';
import type { Quote, QuoteStatus } from '@/lib/api/quotes';

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

export type QuotePreviewProps = {
  quote: Quote;
};

export function QuotePreview({ quote }: QuotePreviewProps) {
  return (
    <Card>
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 pr-3">
          <Text className="text-sm text-muted-foreground">Angebot</Text>
          <Text className="text-lg font-semibold text-foreground mt-0.5">{quote.number}</Text>
          {quote.customer_name ? (
            <Text className="text-sm text-muted-foreground mt-1">{quote.customer_name}</Text>
          ) : null}
        </View>
        <Badge label={statusLabel[quote.status]} tone={statusTone[quote.status]} />
      </View>

      <View className="border-t border-border pt-3">
        {quote.positions.map((position) => (
          <View key={position.id} className="py-2 flex-row justify-between">
            <View className="flex-1 pr-3">
              <Text className="text-sm font-medium text-foreground">
                {position.position_number}. {position.title}
              </Text>
              {position.description ? (
                <Text className="text-xs text-muted-foreground mt-0.5" numberOfLines={2}>
                  {position.description}
                </Text>
              ) : null}
              <Text className="text-xs text-muted-foreground mt-0.5">
                {position.quantity} {position.unit} x {formatEuro(position.unit_price_cents / 100)}
              </Text>
            </View>
            <Text className="text-sm font-medium text-foreground">
              {formatEuro(position.total_cents / 100)}
            </Text>
          </View>
        ))}
      </View>

      <View className="border-t border-border mt-3 pt-3">
        <View className="flex-row justify-between py-0.5">
          <Text className="text-sm text-muted-foreground">Zwischensumme</Text>
          <Text className="text-sm text-foreground">{formatEuro(quote.subtotal_cents / 100)}</Text>
        </View>
        <View className="flex-row justify-between py-0.5">
          <Text className="text-sm text-muted-foreground">MwSt.</Text>
          <Text className="text-sm text-foreground">{formatEuro(quote.tax_cents / 100)}</Text>
        </View>
        <View className="flex-row justify-between py-1 mt-1">
          <Text className="text-base font-semibold text-foreground">Gesamt</Text>
          <Text className="text-base font-semibold text-foreground">
            {formatEuro(quote.total_cents / 100)}
          </Text>
        </View>
      </View>

      {quote.valid_until ? (
        <Text className="text-xs text-muted-foreground mt-3">
          Gueltig bis {formatDate(quote.valid_until)}
        </Text>
      ) : null}
    </Card>
  );
}
