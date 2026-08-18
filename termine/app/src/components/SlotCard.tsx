import { Pressable, Text, View } from 'react-native';

import type { Slot } from '@/api/types';
import { formatRelative, formatSlotDate, formatSlotTime } from '@/lib/format';

import { Badge } from './ui';

/**
 * One free appointment.
 *
 * The time is the headline because it is the only thing that decides whether
 * the user acts. "Gefunden vor 2 Min." sits underneath because freshness is
 * the second question everyone asks — the slot may already be gone.
 */
export function SlotCard({
  slot,
  onPress,
  showOffice = true,
}: {
  slot: Slot;
  onPress?: () => void;
  showOffice?: boolean;
}) {
  const body = (
    <View className="rounded-card border border-available-border bg-available-soft p-4">
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-xs font-semibold uppercase tracking-wide text-available">
            {formatSlotDate(slot.starts_at, slot.timezone)}
          </Text>
          <Text className="mt-1 text-2xl font-bold text-foreground">
            {formatSlotTime(slot.starts_at, slot.timezone)}
          </Text>
          {showOffice ? (
            <Text className="mt-1.5 text-sm text-muted-foreground" numberOfLines={2}>
              {slot.office_name}, {slot.city}
            </Text>
          ) : null}
          <Text className="mt-0.5 text-sm text-muted-foreground" numberOfLines={1}>
            {slot.service_name}
          </Text>
        </View>
        <View className="items-end">
          <Badge label="frei" tone="available" />
          <Text className="mt-2 text-xs text-muted-foreground">
            {formatRelative(slot.first_seen_at)}
          </Text>
        </View>
      </View>
    </View>
  );

  if (!onPress) return body;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Termin am ${formatSlotDate(slot.starts_at, slot.timezone)} um ${formatSlotTime(
        slot.starts_at,
        slot.timezone,
      )} bei ${slot.office_name}`}
      onPress={onPress}
    >
      {body}
    </Pressable>
  );
}
