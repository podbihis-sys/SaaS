import type { ReactNode } from 'react';
import { Pressable, View } from 'react-native';

export type CardProps = {
  children: ReactNode;
  onPress?: () => void;
  className?: string;
};

export function Card({ children, onPress, className }: CardProps) {
  const classes = `bg-background border border-border rounded-2xl p-4 ${className ?? ''}`;
  if (onPress) {
    return (
      <Pressable accessibilityRole="button" onPress={onPress} className={`${classes} active:bg-muted`}>
        {children}
      </Pressable>
    );
  }
  return <View className={classes}>{children}</View>;
}
