import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { useCategories, useCreateWatch, useOffices } from '@/api/hooks';
import type { ServiceCategory } from '@/api/types';
import { TextField, TimeField, WeekdayPicker, toApiTime } from '@/components/pickers';
import { Badge, Button, LoadingState, SectionTitle } from '@/components/ui';
import { categoryLabel } from '@/lib/format';
import { registerForPushNotifications } from '@/lib/push';

const ALL_WEEKDAYS = 0b1111111;
const WEEKDAYS_ONLY = 0b0011111;

type Step = 'category' | 'offices' | 'when';

/**
 * Three steps, in the order the questions actually occur to someone: what do I
 * need, where would I go, and when can I make it. Everything on the last step
 * has a working default, so a user can create a valid watch by tapping through.
 */
export default function NewWatchScreen() {
  const router = useRouter();
  const createWatch = useCreateWatch();

  const [step, setStep] = useState<Step>('category');
  const [category, setCategory] = useState<ServiceCategory | null>(null);
  const [city, setCity] = useState('');
  const [officeIds, setOfficeIds] = useState<string[]>([]);
  const [weekdayMask, setWeekdayMask] = useState(WEEKDAYS_ONLY);
  const [earliestTime, setEarliestTime] = useState('');
  const [latestTime, setLatestTime] = useState('');
  const [minLeadHours, setMinLeadHours] = useState(24);
  const [quietHours, setQuietHours] = useState(true);

  const categoriesQuery = useCategories();
  const officesQuery = useOffices(
    { ...(category ? { category } : {}), ...(city.trim() ? { city: city.trim() } : {}) },
    step === 'offices' && category !== null,
  );

  const offices = officesQuery.data?.items ?? [];
  const selectedOffices = useMemo(
    () => offices.filter((office) => officeIds.includes(office.id)),
    [offices, officeIds],
  );

  const toggleOffice = (id: string) => {
    setOfficeIds((current) =>
      current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id],
    );
  };

  const submit = async () => {
    if (!category || officeIds.length === 0) return;

    const from = toApiTime(earliestTime);
    const to = toApiTime(latestTime);
    if (earliestTime && !from) {
      Alert.alert('Uhrzeit prüfen', 'Bitte geben Sie die früheste Uhrzeit als HH:MM an.');
      return;
    }
    if (latestTime && !to) {
      Alert.alert('Uhrzeit prüfen', 'Bitte geben Sie die späteste Uhrzeit als HH:MM an.');
      return;
    }
    if (from && to && from > to) {
      Alert.alert('Uhrzeit prüfen', 'Die früheste Uhrzeit liegt nach der spätesten.');
      return;
    }

    const label =
      selectedOffices.length === 1 && selectedOffices[0]
        ? `${categoryLabel(category)} · ${selectedOffices[0].city}`
        : `${categoryLabel(category)} · ${selectedOffices.length} Ämter`;

    try {
      const watch = await createWatch.mutateAsync({
        label,
        category,
        office_ids: officeIds,
        weekday_mask: weekdayMask,
        earliest_time: from,
        latest_time: to,
        min_lead_hours: minLeadHours,
        quiet_hours_start: quietHours ? '22:00:00' : null,
        quiet_hours_end: quietHours ? '07:00:00' : null,
      });

      // Asked for here rather than at first launch: the permission dialog now
      // has an obvious answer, because the user just asked to be notified.
      void registerForPushNotifications();

      router.replace(`/watch/${watch.id}`);
    } catch (error) {
      Alert.alert(
        'Suchauftrag nicht gespeichert',
        error instanceof Error ? error.message : 'Bitte versuchen Sie es erneut.',
      );
    }
  };

  return (
    <View className="flex-1 bg-surface">
      <StepIndicator step={step} />

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {step === 'category' ? (
          <View>
            <SectionTitle>Worum geht es?</SectionTitle>
            {categoriesQuery.isLoading ? (
              <LoadingState label="Anliegen werden geladen…" />
            ) : (
              <View className="gap-2">
                {(categoriesQuery.data ?? []).map((entry) => {
                  const selected = category === entry.value;
                  return (
                    <Pressable
                      key={entry.value}
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      onPress={() => setCategory(entry.value)}
                      className={`flex-row items-center justify-between rounded-card border p-4 ${
                        selected ? 'border-primary bg-primary-50' : 'border-border bg-background'
                      }`}
                    >
                      <Text className="text-base font-medium text-foreground">{entry.label_de}</Text>
                      <Text className="text-xs text-muted-foreground">
                        {entry.office_count === 1 ? '1 Amt' : `${entry.office_count} Ämter`}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </View>
        ) : null}

        {step === 'offices' ? (
          <View>
            <SectionTitle>Bei welchen Ämtern?</SectionTitle>
            <Text className="mb-3 text-sm leading-5 text-muted-foreground">
              Wählen Sie ruhig mehrere. Je mehr Ämter Sie akzeptieren, desto eher wird etwas frei.
            </Text>
            <TextField value={city} onChange={setCity} placeholder="Nach Stadt filtern" />

            <View className="mt-4 gap-2">
              {officesQuery.isLoading ? (
                <LoadingState label="Ämter werden geladen…" />
              ) : offices.length === 0 ? (
                <Text className="py-8 text-center text-sm text-muted-foreground">
                  Für dieses Anliegen sind hier keine Ämter hinterlegt.
                </Text>
              ) : (
                offices.map((office) => {
                  const selected = officeIds.includes(office.id);
                  return (
                    <Pressable
                      key={office.id}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: selected }}
                      onPress={() => toggleOffice(office.id)}
                      className={`rounded-card border p-4 ${
                        selected ? 'border-primary bg-primary-50' : 'border-border bg-background'
                      }`}
                    >
                      <Text className="text-base font-medium text-foreground">{office.name}</Text>
                      <Text className="mt-0.5 text-sm text-muted-foreground">
                        {[office.street, `${office.postal_code ?? ''} ${office.city}`.trim()]
                          .filter(Boolean)
                          .join(', ')}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </View>
          </View>
        ) : null}

        {step === 'when' ? (
          <View className="gap-6">
            <View>
              <SectionTitle>An welchen Tagen?</SectionTitle>
              <WeekdayPicker mask={weekdayMask} onChange={setWeekdayMask} />
              <Pressable onPress={() => setWeekdayMask(ALL_WEEKDAYS)} className="mt-2">
                <Text className="text-sm text-primary">Alle Tage zulassen</Text>
              </Pressable>
            </View>

            <View>
              <SectionTitle>Zu welcher Uhrzeit?</SectionTitle>
              <View className="flex-row gap-3">
                <TimeField
                  label="frühestens"
                  value={earliestTime}
                  onChange={setEarliestTime}
                  placeholder="08:00"
                />
                <TimeField
                  label="spätestens"
                  value={latestTime}
                  onChange={setLatestTime}
                  placeholder="16:00"
                />
              </View>
              <Text className="mt-2 text-xs text-muted-foreground">
                Leer lassen heißt: jede Uhrzeit ist recht.
              </Text>
            </View>

            <View>
              <SectionTitle>Wie viel Vorlauf brauchen Sie?</SectionTitle>
              <View className="flex-row flex-wrap gap-2">
                {[2, 24, 48, 168].map((hours) => (
                  <Pressable
                    key={hours}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: minLeadHours === hours }}
                    onPress={() => setMinLeadHours(hours)}
                    className={`rounded-full border px-3.5 py-2 ${
                      minLeadHours === hours
                        ? 'border-primary bg-primary'
                        : 'border-border bg-background'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        minLeadHours === hours ? 'text-primary-foreground' : 'text-foreground'
                      }`}
                    >
                      {hours === 2 ? '2 Stunden' : hours === 168 ? '1 Woche' : `${hours} Stunden`}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text className="mt-2 text-xs text-muted-foreground">
                Termine, die früher stattfinden, melden wir nicht — Sie kämen ohnehin nicht hin.
              </Text>
            </View>

            <View>
              <SectionTitle>Nachtruhe</SectionTitle>
              <Pressable
                accessibilityRole="switch"
                accessibilityState={{ checked: quietHours }}
                onPress={() => setQuietHours((value) => !value)}
                className={`flex-row items-center justify-between rounded-card border p-4 ${
                  quietHours ? 'border-primary bg-primary-50' : 'border-border bg-background'
                }`}
              >
                <View className="flex-1 pr-3">
                  <Text className="text-base font-medium text-foreground">
                    Zwischen 22 und 7 Uhr nicht stören
                  </Text>
                  <Text className="mt-0.5 text-xs text-muted-foreground">
                    Gefundene Termine erscheinen trotzdem in den Meldungen.
                  </Text>
                </View>
                <Badge label={quietHours ? 'an' : 'aus'} tone={quietHours ? 'primary' : 'neutral'} />
              </Pressable>
            </View>
          </View>
        ) : null}
      </ScrollView>

      <View className="border-t border-border bg-background px-4 pb-6 pt-3">
        {step === 'category' ? (
          <Button
            label="Weiter"
            disabled={category === null}
            onPress={() => setStep('offices')}
          />
        ) : null}

        {step === 'offices' ? (
          <View className="gap-2">
            <Button
              label={
                officeIds.length === 0
                  ? 'Bitte mindestens ein Amt wählen'
                  : `Weiter mit ${officeIds.length} ${officeIds.length === 1 ? 'Amt' : 'Ämtern'}`
              }
              disabled={officeIds.length === 0}
              onPress={() => setStep('when')}
            />
            <Button label="Zurück" variant="ghost" onPress={() => setStep('category')} />
          </View>
        ) : null}

        {step === 'when' ? (
          <View className="gap-2">
            <Button
              label="Suchauftrag starten"
              loading={createWatch.isPending}
              onPress={() => void submit()}
            />
            <Button label="Zurück" variant="ghost" onPress={() => setStep('offices')} />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps: Step[] = ['category', 'offices', 'when'];
  const current = steps.indexOf(step);
  return (
    <View className="flex-row gap-1.5 bg-background px-4 pb-3 pt-1">
      {steps.map((entry, index) => (
        <View
          key={entry}
          className={`h-1 flex-1 rounded-full ${index <= current ? 'bg-primary' : 'bg-muted'}`}
        />
      ))}
    </View>
  );
}
