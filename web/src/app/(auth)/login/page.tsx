"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, KeyRound, ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/lib/hooks/use-toast";
import { loginSchema, magicLinkSchema } from "@/lib/utils/validation";
import type { z } from "zod";

type PasswordForm = z.infer<typeof loginSchema>;
type MagicForm = z.infer<typeof magicLinkSchema>;

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const { toast } = useToast();
  const supabase = React.useMemo(() => createClient(), []);

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const magicForm = useForm<MagicForm>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
  });

  const onPassword = async (values: PasswordForm) => {
    const { error } = await supabase.auth.signInWithPassword(values);
    if (error) {
      toast({ variant: "destructive", title: "Anmeldung fehlgeschlagen", description: error.message });
      return;
    }
    router.push(next);
    router.refresh();
  };

  const onMagic = async (values: MagicForm) => {
    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback?next=${encodeURIComponent(next)}`,
      },
    });
    if (error) {
      toast({ variant: "destructive", title: "Versand fehlgeschlagen", description: error.message });
      return;
    }
    toast({ title: "E-Mail gesendet", description: "Bitte prüfen Sie Ihren Posteingang." });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Zurück
          </Link>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Anmelden</CardTitle>
            <CardDescription>Willkommen zurück. Bitte melden Sie sich an.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="password" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="password">
                  <KeyRound className="mr-2 h-3.5 w-3.5" /> Passwort
                </TabsTrigger>
                <TabsTrigger value="magic">
                  <Mail className="mr-2 h-3.5 w-3.5" /> Magic Link
                </TabsTrigger>
              </TabsList>
              <TabsContent value="password" className="pt-4">
                <Form {...passwordForm}>
                  <form className="space-y-4" onSubmit={passwordForm.handleSubmit(onPassword)}>
                    <FormField
                      control={passwordForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-Mail</FormLabel>
                          <FormControl>
                            <Input type="email" autoComplete="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Passwort</FormLabel>
                          <FormControl>
                            <Input type="password" autoComplete="current-password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={passwordForm.formState.isSubmitting}>
                      Anmelden
                    </Button>
                  </form>
                </Form>
              </TabsContent>
              <TabsContent value="magic" className="pt-4">
                <Form {...magicForm}>
                  <form className="space-y-4" onSubmit={magicForm.handleSubmit(onMagic)}>
                    <FormField
                      control={magicForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-Mail</FormLabel>
                          <FormControl>
                            <Input type="email" autoComplete="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="w-full" disabled={magicForm.formState.isSubmitting}>
                      Link senden
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Noch kein Konto?{" "}
              <Link className="text-primary hover:underline" href="/register">
                Registrieren
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
