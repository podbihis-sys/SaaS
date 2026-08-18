import * as WebBrowser from 'expo-web-browser';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Linking, ScrollView, Text, View } from 'react-native';

import { useOffice, useSlots } from '@/api/hooks';
import { SlotCard } from '@/components/SlotCard';
import { Button, Card, ErrorState, LoadingState, Row, SectionTitle } from '@/components/ui';
import { categoryLabel } from '@/lib/format';

/** One office: address, what it offers, and what is free there right now. */
export default function OfficeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const officeId = String(id);

  const { data: office, isLoading, isError, refetch } = useOffice(officeId);
  const slotsQuery = useSlots({ office_id: [officeId] });

  if (isLoading) return <LoadingState />;
  if (isError || !office) {
    return <ErrorState message="Dieses Amt ist nicht verfügbar." onRetry={() => void refetch()} />;
  }

  const address = [office.street, `${office.postal_code ?? ''} ${office.city}`.trim()]
    .filter(Boolean)
    .join(', ');

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerStyle={{ padding: 16, gap: 20 }}>
      <Card>
        <Text className="text-lg font-bold text-foreground">{office.name}</Text>
        <Text className="mt-1 text-sm text-muted-foreground">{address}</Text>
        {office.phone ? (
          <Text
            className="mt-3 text-sm text-primary"
            onPress={() => void Linking.openURL(`tel:${office.phone}`)}
          >
            {office.phone}
          </Text>
        ) : null}
        {office.booking_url ? (
          <View className="mt-4">
            <Button
              label="Terminportal des Amtes öffnen"
              variant="secondary"
              onPress={() => void WebBrowser.openBrowserAsync(office.booking_url as string)}
            />
          </View>
        ) : null}
      </Card>

      <View>
        <SectionTitle>Anliegen</SectionTitle>
        <View className="overflow-hidden rounded-card border border-border bg-background">
          {office.services.map((service) => (
            <Row
              key={service.id}
              title={service.name}
              subtitle={`${categoryLabel(service.category)}${
                service.duration_minutes ? ` · ca. ${service.duration_minutes} Min.` : ''
              }`}
            />
          ))}
        </View>
      </View>

      <View>
        <SectionTitle>Gerade frei</SectionTitle>
        {slotsQuery.isLoading ? (
          <LoadingState label="Termine werden gesucht…" />
        ) : (slotsQuery.data ?? []).length === 0 ? (
          <Card>
            <Text className="text-sm leading-5 text-muted-foreground">
              Aktuell nichts frei. Ein Suchauftrag meldet sich, sobald sich das ändert.
            </Text>
            <View className="mt-4">
              <Button label="Suchauftrag anlegen" onPress={() => router.push('/watch/new')} />
            </View>
          </Card>
        ) : (
          <View className="gap-3">
            {(slotsQuery.data ?? []).map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                showOffice={false}
                onPress={() => router.push(`/slot/${slot.id}`)}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
