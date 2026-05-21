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
  full_name: z.string().min(2, 'Name erforderlich'),
  company_name: z.string().min(2, 'Firmenname erforderlich'),
  email: z.string().email('Bitte gueltige E-Mail-Adresse'),
  password: z.string().min(8, 'Mindestens 8 Zeichen'),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterScreen() {
  const { signUp } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: '', company_name: '', email: '', password: '' },
  });

  async function onSubmit(values: FormValues): Promise<void> {
    try {
      setSubmitting(true);
      await signUp(values);
      Alert.alert('Erfolgreich', 'Bitte bestaetigen Sie Ihre E-Mail-Adresse.');
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Registrierung fehlgeschlagen';
      Alert.alert('Fehler', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Screen scroll>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <View className="flex-1 justify-center py-12">
          <Text className="text-3xl font-bold text-foreground mb-1">Konto erstellen</Text>
          <Text className="text-base text-muted-foreground mb-8">
            Starten Sie kostenlos und richten Sie Ihr Unternehmen ein.
          </Text>

          <View className="gap-4">
            <Controller
              control={control}
              name="full_name"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <Input
                  label="Ihr Name"
                  autoCapitalize="words"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="company_name"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <Input
                  label="Firmenname"
                  autoCapitalize="words"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="email"
              render={({ field: { value, onChange, onBlur }, fieldState }) => (
                <Input
                  label="E-Mail"
                  autoCapitalize="none"
                  keyboardType="email-address"
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
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={fieldState.error?.message}
                  hint="Mindestens 8 Zeichen"
                />
              )}
            />
          </View>

          <View className="mt-8">
            <Button title="Konto erstellen" onPress={handleSubmit(onSubmit)} loading={submitting} />
          </View>

          <View className="mt-6 flex-row justify-center">
            <Text className="text-sm text-muted-foreground">Bereits ein Konto? </Text>
            <Link href="/(auth)/login" className="text-sm font-semibold text-primary">
              Anmelden
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
