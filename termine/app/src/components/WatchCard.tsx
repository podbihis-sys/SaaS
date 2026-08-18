import { Pressable, Text, View } from 'react-native';

import type { Watch } from '@/api/types';
import {
  categoryLabel,
  formatDateWindow,
  formatTimeWindow,
  formatWeekdayMask,
} from '@/lib/format';

import { Badge } from './ui';

function officeSummary(watch: Watch): string {
  const first = watch.offices[0];
  if (!first) return 'Keine Ämter ausgewählt';
  if (watch.offices.length === 1) return `${first.name}, ${first.city}`;
  return `${first.name} +${watch.offices.length - 1} weitere`;
}

/** A standing search order, summarised the way the user set it up. */
export function WatchCard({ watch, onPress }: { watch: Watch; onPress: () => void }) {
  const paused = Boolean(watch.paused_until && new Date(watch.paused_until) > new Date());

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <View className="rounded-card border border-border bg-background p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-3">
            <Text className="text-base font-semibold text-foreground" numberOfLines={1}>
              {watch.label}
            </Text>
            <Text className="mt-0.5 text-sm text-primary">{categoryLabel(watch.category)}</Text>
          </View>
          {!watch.active ? (
            <Badge label="beendet" tone="neutral" />
          ) : paused ? (
            <Badge label="pausiert" tone="warning" />
          ) : (
            <Badge label="aktiv" tone="available" />
          )}
        </View>

        <Text className="mt-3 text-sm text-muted-foreground" numberOfLines={1}>
          {officeSummary(watch)}
        </Text>

        <View className="mt-3 flex-row flex-wrap gap-x-4 gap-y-1">
          <Text className="text-xs text-muted-foreground">
            {formatDateWindow(watch.earliest_date, watch.latest_date)}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {formatWeekdayMask(watch.weekday_mask)}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {formatTimeWindow(watch.earliest_time, watch.latest_time)}
          </Text>
        </View>

        {watch.notification_count > 0 ? (
          <Text className="mt-3 text-xs text-muted-foreground">
            {watch.notification_count === 1
              ? '1 Benachrichtigung gesendet'
              : `${watch.notification_count} Benachrichtigungen gesendet`}
          </Text>
        ) : (
          <Text className="mt-3 text-xs text-muted-foreground">Noch nichts gefunden</Text>
        )}
      </View>
    </Pressable>
  );
}
