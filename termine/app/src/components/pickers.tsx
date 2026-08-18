import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { weekdayLabel } from '@/lib/format';

/** Form controls for building a watch. */

export function Chip({
  label,
  selected,
  onPress,
  disabled = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      onPress={disabled ? undefined : onPress}
      className={`rounded-full border px-3.5 py-2 ${
        selected ? 'border-primary bg-primary' : 'border-border bg-background'
      } ${disabled ? 'opacity-40' : ''}`}
    >
      <Text
        className={`text-sm font-medium ${selected ? 'text-primary-foreground' : 'text-foreground'}`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function ChipGroup({
  options,
  selected,
  onToggle,
}: {
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <View className="flex-row flex-wrap gap-2">
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          selected={selected.includes(option.value)}
          onPress={() => onToggle(option.value)}
        />
      ))}
    </View>
  );
}

/**
 * Weekday bitmask editor.
 *
 * Bit 0 is Monday, matching the backend and German calendars — not Sunday,
 * which is what `Date#getDay` would give.
 */
export function WeekdayPicker({
  mask,
  onChange,
}: {
  mask: number;
  onChange: (mask: number) => void;
}) {
  return (
    <View className="flex-row gap-1.5">
      {Array.from({ length: 7 }, (_, index) => {
        const bit = 1 << index;
        const selected = (mask & bit) !== 0;
        return (
          <Pressable
            key={index}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={weekdayLabel(index, true)}
            onPress={() => {
              const next = selected ? mask & ~bit : mask | bit;
              // An empty mask would silently match nothing at all.
              if (next !== 0) onChange(next);
            }}
            className={`h-11 flex-1 items-center justify-center rounded-lg border ${
              selected ? 'border-primary bg-primary' : 'border-border bg-background'
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                selected ? 'text-primary-foreground' : 'text-muted-foreground'
              }`}
            >
              {weekdayLabel(index)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/**
 * A plain `HH:MM` text field.
 *
 * A native time wheel would be nicer, but it costs a modal per field and the
 * values here are coarse ("ab 9", "bis 13"). Typing four digits is faster.
 */
export function TimeField({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <View className="flex-1">
      <Text className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</Text>
      <TextInput
        value={value}
        onChangeText={(text) => onChange(normaliseTimeInput(text))}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType="numbers-and-punctuation"
        maxLength={5}
        className="h-12 rounded-xl border border-border bg-background px-3 text-base text-foreground"
      />
    </View>
  );
}

/** Inserts the colon as the user types, so `0900` becomes `09:00`. */
export function normaliseTimeInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

/** `09:00` -> `09:00:00`, which is what the API expects. Invalid input -> null. */
export function toApiTime(value: string): string | null {
  const match = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return `${hours.toString().padStart(2, '0')}:${match[2]}:00`;
}

export function TextField({
  value,
  onChange,
  placeholder,
  label,
  autoFocus = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
  autoFocus?: boolean;
}) {
  return (
    <View>
      {label ? (
        <Text className="mb-1.5 text-xs font-medium text-muted-foreground">{label}</Text>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        autoFocus={autoFocus}
        autoCorrect={false}
        className="h-12 rounded-xl border border-border bg-background px-3 text-base text-foreground"
      />
    </View>
  );
}

export function HorizontalChips({
  options,
  selected,
  onSelect,
}: {
  options: { value: string; label: string }[];
  selected: string | null;
  onSelect: (value: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}
    >
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          selected={selected === option.value}
          onPress={() => onSelect(option.value)}
        />
      ))}
    </ScrollView>
  );
}
