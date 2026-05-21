"use client";

import * as React from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Save, Upload } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { companiesApi } from "@/lib/api/companies";
import { companySettingsSchema, type CompanySettingsInput } from "@/lib/utils/validation";
import { useToast } from "@/lib/hooks/use-toast";

export default function SettingsPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const company = useQuery({
    queryKey: ["company", "current"],
    queryFn: () => companiesApi.getCurrent(),
  });

  const form = useForm<CompanySettingsInput>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      name: "",
      address_line1: "",
      address_line2: "",
      postal_code: "",
      city: "",
      country: "DE",
      vat_id: "",
      default_vat_rate: 19,
      bank_name: "",
      bank_iban: "",
      bank_bic: "",
    },
  });

  React.useEffect(() => {
    if (company.data) {
      form.reset({
        name: company.data.name,
        address_line1: company.data.address_line1 ?? "",
        address_line2: company.data.address_line2 ?? "",
        postal_code: company.data.postal_code ?? "",
        city: company.data.city ?? "",
        country: company.data.country ?? "DE",
        vat_id: company.data.vat_id ?? "",
        default_vat_rate: company.data.default_vat_rate ?? 19,
        bank_name: company.data.bank_name ?? "",
        bank_iban: company.data.bank_iban ?? "",
        bank_bic: company.data.bank_bic ?? "",
      });
    }
  }, [company.data, form]);

  const save = useMutation({
    mutationFn: (values: CompanySettingsInput) => companiesApi.update(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["company"] });
      qc.invalidateQueries({ queryKey: ["auth", "me"] });
      toast({ title: "Gespeichert" });
    },
    onError: (err: Error) =>
      toast({ variant: "destructive", title: "Fehler", description: err.message }),
  });

  const uploadLogo = useMutation({
    mutationFn: async (file: File) => {
      const signed = await companiesApi.uploadLogo({
        filename: file.name,
        content_type: file.type,
        size: file.size,
      });
      const res = await fetch(signed.upload_url, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error(`Upload fehlgeschlagen (${res.status})`);
      return signed.public_url;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["company"] });
      toast({ title: "Logo aktualisiert" });
    },
    onError: (err: Error) =>
      toast({ variant: "destructive", title: "Upload fehlgeschlagen", description: err.message }),
  });

  if (company.isLoading) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <>
      <PageHeader
        title="Einstellungen"
        description="Firmendaten, Steuersatz und Bankverbindung."
        actions={
          <Button onClick={form.handleSubmit((v) => save.mutate(v))} disabled={save.isPending}>
            <Save /> Speichern
          </Button>
        }
      />

      <Form {...form}>
        <form className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Logo</CardTitle>
              <CardDescription>Wird auf PDF-Angeboten verwendet.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex h-32 items-center justify-center overflow-hidden rounded-lg border bg-muted/30">
                {company.data?.logo_url ? (
                  <Image
                    src={company.data.logo_url}
                    alt="Logo"
                    width={200}
                    height={100}
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">Kein Logo hochgeladen</span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) uploadLogo.mutate(file);
                }}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadLogo.isPending}
              >
                <Upload /> Logo hochladen
              </Button>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Firma</CardTitle>
              <CardDescription>Diese Angaben erscheinen im PDF.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Firmenname</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address_line1"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>Adresse</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postal_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PLZ</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ort</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="vat_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>USt-IdNr.</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="default_vat_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Standard-MwSt.-Satz (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.1"
                        value={field.value}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Bankverbindung</CardTitle>
              <CardDescription>Wird im PDF-Footer angezeigt.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="bank_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bank</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bank_iban"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IBAN</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bank_bic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>BIC</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </form>
      </Form>
    </>
  );
}
