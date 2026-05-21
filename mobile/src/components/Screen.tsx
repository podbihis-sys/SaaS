import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  padded?: boolean;
  className?: string;
};

export function Screen({ children, scroll = false, padded = true, className }: ScreenProps) {
  const innerClasses = `${padded ? 'px-5 py-4' : ''} ${className ?? ''}`.trim();
  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />
      {scroll ? (
        <ScrollView
          contentContainerClassName={`flex-grow ${innerClasses}`}
          keyboardShouldPersistTaps="handled"
        >
          {children}
        </ScrollView>
      ) : (
        <View className={`flex-1 ${innerClasses}`}>{children}</View>
      )}
    </SafeAreaView>
  );
}
