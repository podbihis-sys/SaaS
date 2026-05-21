import { useMemo, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { router, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ImagePickerSheet, type PickedImage } from '@/components/ImagePickerSheet';
import {
  attachInquiryImage,
  createInquiry,
  createInquiryUpload,
  type Inquiry,
} from '@/lib/api/inquiries';
import { listCustomers } from '@/lib/api/customers';

const schema = z.object({
  title: z.string().min(3, 'Titel erforderlich'),
  description: z.string().optional(),
  customer_id: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof schema>;

async function uploadImage(inquiryId: string, image: PickedImage): Promise<void> {
  const signed = await createInquiryUpload(inquiryId, {
    filename: image.fileName,
    content_type: image.mimeType,
  });
  const blob = await fetch(image.uri).then((r) => r.blob());
  const headers: Record<string, string> = {
    'Content-Type': image.mimeType,
    ...(signed.headers ?? {}),
  };
  const res = await fetch(signed.upload_url, {
    method: 'PUT',
    headers,
    body: blob,
  });
  if (!res.ok) {
    throw new Error(`Upload fehlgeschlagen (${res.status})`);
  }
  await attachInquiryImage(inquiryId, { storage_path: signed.storage_path });
}

export default function NewInquiryScreen() {
  const queryClient = useQueryClient();
  const [sheetVisible, setSheetVisible] = useState(false);
  const [images, setImages] = useState<PickedImage[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  const customersQuery = useQuery({
    queryKey: ['customers'],
    queryFn: () => listCustomers({ limit: 50 }),
  });

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', description: '', customer_id: null },
  });

  const mutation = useMutation({
    mutationFn: async (values: FormValues): Promise<Inquiry> => {
      const inquiry = await createInquiry({
        title: values.title,
        description: values.description,
        customer_id: selectedCustomerId,
      });
      for (const image of images) {
        await uploadImage(inquiry.id, image);
      }
      return inquiry;
    },
    onSuccess: async (inquiry) => {
      await queryClient.invalidateQueries({ queryKey: ['inquiries'] });
      router.replace({ pathname: '/(tabs)/inquiries/[id]', params: { id: inquiry.id } });
    },
    onError: (err) => {
      const message = err instanceof Error ? err.message : 'Anfrage konnte nicht erstellt werden';
      Alert.alert('Fehler', message);
    },
  });

  const customers = useMemo(() => customersQuery.data?.items ?? [], [customersQuery.data]);

  return (
    <Screen padded={false}>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          <View className="flex-row items-center justify-between mb-4">
            <Pressable onPress={() => router.back()}>
              <Text className="text-base text-primary">Abbrechen</Text>
            </Pressable>
            <Text className="text-base font-semibold text-foreground">Neue Anfrage</Text>
            <View className="w-16" />
          </View>

          <View className="gap-4">
            <Controller
              control={control}
              name="title"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <Input
                  label="Titel"
                  placeholder="Z.B. Badezimmer renovieren"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <Input
                  label="Beschreibung"
                  placeholder="Was soll gemacht werden?"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
                  className="h-28 pt-3 text-base"
                  error={fieldState.error?.message}
                />
              )}
            />

            <View>
              <Text className="text-sm font-medium text-foreground mb-1.5">Kunde</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2">
                  <Pressable
                    onPress={() => setSelectedCustomerId(null)}
                    className={`px-3 h-10 rounded-full items-center justify-center border ${
                      selectedCustomerId === null ? 'bg-primary border-primary' : 'border-border'
                    }`}
                  >
                    <Text
                      className={`text-sm font-medium ${
                        selectedCustomerId === null ? 'text-primary-foreground' : 'text-foreground'
                      }`}
                    >
                      Ohne Kunde
                    </Text>
                  </Pressable>
                  {customers.map((c) => {
                    const active = selectedCustomerId === c.id;
                    return (
                      <Pressable
                        key={c.id}
                        onPress={() => setSelectedCustomerId(c.id)}
                        className={`px-3 h-10 rounded-full items-center justify-center border ${
                          active ? 'bg-primary border-primary' : 'border-border'
                        }`}
                      >
                        <Text
                          className={`text-sm font-medium ${
                            active ? 'text-primary-foreground' : 'text-foreground'
                          }`}
                        >
                          {c.name}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <View>
              <Text className="text-sm font-medium text-foreground mb-1.5">Bilder</Text>
              <View className="flex-row flex-wrap gap-2">
                {images.map((img, idx) => (
                  <View key={`${img.uri}-${idx}`} className="relative">
                    <Image source={{ uri: img.uri }} className="w-20 h-20 rounded-lg" />
                    <Pressable
                      onPress={() => setImages((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-foreground items-center justify-center"
                    >
                      <Text className="text-white text-xs">x</Text>
                    </Pressable>
                  </View>
                ))}
                <Pressable
                  onPress={() => setSheetVisible(true)}
                  className="w-20 h-20 rounded-lg border border-dashed border-border items-center justify-center"
                >
                  <Text className="text-2xl text-muted-foreground">+</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View className="mt-8">
            <Button
              title="Anfrage anlegen"
              size="lg"
              onPress={handleSubmit((v) => mutation.mutate(v))}
              loading={mutation.isPending}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ImagePickerSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        onPicked={(picked) => setImages((prev) => [...prev, ...picked])}
      />
    </Screen>
  );
}
