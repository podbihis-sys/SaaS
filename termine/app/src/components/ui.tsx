import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import type { ReactNode } from 'react';

/** Small building blocks shared by every screen. */

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <View className={`rounded-card border border-border bg-background p-4 ${className}`}>
      {children}
    </View>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Text className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
      {children}
    </Text>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const BUTTON_STYLES: Record<ButtonVariant, { container: string; label: string }> = {
  primary: { container: 'bg-primary', label: 'text-primary-foreground' },
  secondary: { container: 'bg-muted border border-border', label: 'text-foreground' },
  ghost: { container: 'bg-transparent', label: 'text-primary' },
  danger: { container: 'bg-destructive-soft border border-destructive', label: 'text-destructive' },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  className = '',
}: {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}) {
  const styles = BUTTON_STYLES[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive }}
      onPress={inactive ? undefined : onPress}
      className={`h-12 flex-row items-center justify-center rounded-xl px-5 ${styles.container} ${
        inactive ? 'opacity-50' : ''
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#ffffff' : '#1d4ed8'} />
      ) : (
        <Text className={`text-base font-semibold ${styles.label}`}>{label}</Text>
      )}
    </Pressable>
  );
}

type BadgeTone = 'neutral' | 'available' | 'warning' | 'danger' | 'primary';

const BADGE_STYLES: Record<BadgeTone, { container: string; label: string }> = {
  neutral: { container: 'bg-muted', label: 'text-muted-foreground' },
  available: { container: 'bg-available-soft', label: 'text-available' },
  warning: { container: 'bg-warning-soft', label: 'text-warning' },
  danger: { container: 'bg-destructive-soft', label: 'text-destructive' },
  primary: { container: 'bg-primary-50', label: 'text-primary' },
};

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: BadgeTone }) {
  const styles = BADGE_STYLES[tone];
  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${styles.container}`}>
      <Text className={`text-xs font-semibold ${styles.label}`}>{label}</Text>
    </View>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <View className="items-center justify-center px-8 py-16">
      <Text className="mb-2 text-center text-lg font-semibold text-foreground">{title}</Text>
      <Text className="mb-6 text-center text-sm leading-5 text-muted-foreground">{description}</Text>
      {action}
    </View>
  );
}

export function LoadingState({ label = 'Wird geladen…' }: { label?: string }) {
  return (
    <View className="items-center justify-center py-16">
      <ActivityIndicator color="#1d4ed8" />
      <Text className="mt-3 text-sm text-muted-foreground">{label}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View className="items-center justify-center px-8 py-16">
      <Text className="mb-2 text-center text-lg font-semibold text-foreground">
        Das hat nicht geklappt
      </Text>
      <Text className="mb-6 text-center text-sm leading-5 text-muted-foreground">{message}</Text>
      {onRetry ? <Button label="Erneut versuchen" variant="secondary" onPress={onRetry} /> : null}
    </View>
  );
}

/** A tappable row with a chevron affordance, used for lists of settings. */
export function Row({
  title,
  subtitle,
  right,
  onPress,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  onPress?: () => void;
}) {
  const content = (
    <View className="flex-row items-center justify-between border-b border-border px-4 py-3.5">
      <View className="flex-1 pr-3">
        <Text className="text-base text-foreground">{title}</Text>
        {subtitle ? (
          <Text className="mt-0.5 text-sm text-muted-foreground">{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );
  if (!onPress) return content;
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {content}
    </Pressable>
  );
}
