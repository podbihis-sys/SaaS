import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuth } from '@/lib/auth/context';

const schema = z.object({
  email: z.string().email('Bitte gueltige E-Mail-Adresse'),
  password: z.string().min(6, 'Mindestens 6 Zeichen'),
});

type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: FormValues): Promise<void> {
    try {
      setSubmitting(true);
      await signIn(values.email, values.password);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Anmeldung fehlgeschlagen';
      Alert.alert('Fehler', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-1 justify-center py-12">
          <Text className="text-3xl font-bold text-foreground mb-1">Willkommen zurueck</Text>
          <Text className="text-base text-muted-foreground mb-8">
            Melden Sie sich an, um fortzufahren.
          </Text>

          <View className="gap-4">
            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <Input
                  label="E-Mail"
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="password"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <Input
                  label="Passwort"
                  secureTextEntry
                  autoComplete="password"
                  textContentType="password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
          </View>

          <View className="mt-8">
            <Button
              title="Anmelden"
              onPress={handleSubmit(onSubmit)}
              loading={submitting || formState.isSubmitting}
            />
          </View>

          <View className="mt-6 flex-row justify-center">
            <Text className="text-sm text-muted-foreground">Noch kein Konto? </Text>
            <Link href="/(auth)/register" className="text-sm font-semibold text-primary">
              Registrieren
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
