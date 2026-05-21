import { Redirect, Stack } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuth } from '@/lib/auth/context';

export default function AuthLayout() {
  const { initializing, session } = useAuth();

  if (initializing) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#6366f1" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#ffffff' } }} />;
}
