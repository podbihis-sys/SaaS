import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  leading?: ReactNode;
  trailing?: ReactNode;
  fullWidth?: boolean;
};

const variantClasses: Record<ButtonVariant, { container: string; text: string }> = {
  primary: { container: 'bg-primary active:bg-primary-600', text: 'text-primary-foreground' },
  secondary: { container: 'bg-muted active:bg-border', text: 'text-foreground' },
  ghost: { container: 'bg-transparent active:bg-muted', text: 'text-foreground' },
  destructive: { container: 'bg-destructive active:opacity-90', text: 'text-white' },
};

const sizeClasses: Record<ButtonSize, { container: string; text: string }> = {
  sm: { container: 'h-10 px-3', text: 'text-sm' },
  md: { container: 'h-12 px-4', text: 'text-base' },
  lg: { container: 'h-14 px-5', text: 'text-base' },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled,
  loading,
  leading,
  trailing,
  fullWidth = true,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const v = variantClasses[variant];
  const s = sizeClasses[size];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      className={`${v.container} ${s.container} ${fullWidth ? 'w-full' : ''} ${
        isDisabled ? 'opacity-50' : ''
      } rounded-xl flex-row items-center justify-center`}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'destructive' ? '#fff' : '#0a0a0a'} />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {leading}
          <Text className={`${v.text} ${s.text} font-semibold`}>{title}</Text>
          {trailing}
        </View>
      )}
    </Pressable>
  );
}
