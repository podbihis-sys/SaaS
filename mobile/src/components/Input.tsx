import { forwardRef } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';

export type InputProps = TextInputProps & {
  label?: string;
  hint?: string;
  error?: string;
};

export const Input = forwardRef<TextInput, InputProps>(function Input(
  { label, hint, error, className, ...rest },
  ref,
) {
  const borderColor = error ? 'border-destructive' : 'border-border';
  return (
    <View className="w-full">
      {label ? (
        <Text className="text-sm font-medium text-foreground mb-1.5">{label}</Text>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor="#a1a1aa"
        className={`h-12 px-3 rounded-xl border ${borderColor} bg-background text-base text-foreground ${className ?? ''}`}
        {...rest}
      />
      {error ? (
        <Text className="text-xs text-destructive mt-1">{error}</Text>
      ) : hint ? (
        <Text className="text-xs text-muted-foreground mt-1">{hint}</Text>
      ) : null}
    </View>
  );
});
