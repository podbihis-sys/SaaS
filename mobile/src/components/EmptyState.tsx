import type { ReactNode } from 'react';
import { Text, View } from 'react-native';

export type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <View className="w-12 h-12 rounded-full bg-muted mb-4" />
      <Text className="text-base font-semibold text-foreground text-center">{title}</Text>
      {description ? (
        <Text className="text-sm text-muted-foreground text-center mt-1.5 max-w-xs">{description}</Text>
      ) : null}
      {action ? <View className="mt-5 w-full max-w-xs">{action}</View> : null}
    </View>
  );
}
