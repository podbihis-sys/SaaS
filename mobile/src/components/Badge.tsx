import { Text, View } from 'react-native';

export type BadgeTone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const toneClasses: Record<BadgeTone, { container: string; text: string }> = {
  neutral: { container: 'bg-muted', text: 'text-foreground' },
  info: { container: 'bg-primary-50', text: 'text-primary-600' },
  success: { container: 'bg-emerald-50', text: 'text-emerald-700' },
  warning: { container: 'bg-amber-50', text: 'text-amber-700' },
  danger: { container: 'bg-red-50', text: 'text-red-700' },
};

export type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

export function Badge({ label, tone = 'neutral' }: BadgeProps) {
  const t = toneClasses[tone];
  return (
    <View className={`${t.container} self-start px-2.5 py-1 rounded-full`}>
      <Text className={`${t.text} text-xs font-medium`}>{label}</Text>
    </View>
  );
}
