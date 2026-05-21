import { ActivityIndicator, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { listInquiries } from '@/lib/api/inquiries';
import { listQuotes } from '@/lib/api/quotes';
import { useCompany } from '@/lib/hooks/useCompany';
import { useAuth } from '@/lib/auth/context';

export default function DashboardScreen() {
  const { user } = useAuth();
  const { activeCompany } = useCompany();

  const inquiriesQuery = useQuery({
    queryKey: ['inquiries', 'open'],
    queryFn: () => listInquiries({ status: 'new' }),
  });

  const quotesQuery = useQuery({
    queryKey: ['quotes', 'draft'],
    queryFn: () => listQuotes({ status: 'draft' }),
  });

  const openInquiries = inquiriesQuery.data?.total ?? 0;
  const draftQuotes = quotesQuery.data?.total ?? 0;
  const loading = inquiriesQuery.isLoading || quotesQuery.isLoading;

  return (
    <Screen scroll>
      <View className="mb-6">
        <Text className="text-sm text-muted-foreground">
          {activeCompany?.company_name ?? 'Handwerk'}
        </Text>
        <Text className="text-2xl font-bold text-foreground mt-1">
          Hallo {user?.full_name ?? ''}
        </Text>
      </View>

      <View className="flex-row gap-3 mb-6">
        <View className="flex-1">
          <Card>
            <Text className="text-xs text-muted-foreground">Offene Anfragen</Text>
            {loading ? (
              <ActivityIndicator className="mt-2" />
            ) : (
              <Text className="text-3xl font-bold text-foreground mt-1">{openInquiries}</Text>
            )}
          </Card>
        </View>
        <View className="flex-1">
          <Card>
            <Text className="text-xs text-muted-foreground">Entwurfs-Angebote</Text>
            {loading ? (
              <ActivityIndicator className="mt-2" />
            ) : (
              <Text className="text-3xl font-bold text-foreground mt-1">{draftQuotes}</Text>
            )}
          </Card>
        </View>
      </View>

      <View className="gap-3">
        <Button
          title="+ Neue Anfrage"
          size="lg"
          onPress={() => router.push('/(tabs)/inquiries/new')}
        />
        <Button
          title="Anfragen ansehen"
          variant="secondary"
          size="lg"
          onPress={() => router.push('/(tabs)/inquiries')}
        />
      </View>
    </Screen>
  );
}
