"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { companiesApi, type CompanyCreateInput } from "@/lib/api/companies";
import { useToast } from "@/lib/hooks/use-toast";
import { ACTIVE_COMPANY_COOKIE } from "@/lib/api/client";

const schema = z.object({
  name: z.string().min(2, "Name zu kurz"),
  slug: z
    .string()
    .min(2)
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Nur Kleinbuchstaben, Ziffern, Bindestriche"),
  legal_name: z.string().optional(),
  tax_id: z.string().optional(),
  address_line1: z.string().optional(),
  postal_code: z.string().optional(),
  city: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "", country: "DE" } as Partial<FormValues>,
  });

  const nameValue = watch("name");
  React.useEffect(() => {
    if (nameValue) setValue("slug", slugify(nameValue));
  }, [nameValue, setValue]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload: CompanyCreateInput = { ...values, country: "DE" };
      const company = await companiesApi.create(payload);
      document.cookie = `${ACTIVE_COMPANY_COOKIE}=${encodeURIComponent(company.id)}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      toast({ title: "Betrieb angelegt", description: company.name });
      router.replace("/dashboard");
      router.refresh();
    } catch (e) {
      toast({
        title: "Fehler",
        description: e instanceof Error ? e.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Betrieb anlegen</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Lege deinen Betrieb an, um zu starten. Du kannst Details später in den Einstellungen ergänzen.
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" placeholder="Musterbetrieb" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input id="slug" placeholder="musterbetrieb" {...register("slug")} />
            {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="legal_name">Firmierung</Label>
            <Input id="legal_name" placeholder="Musterbetrieb GmbH" {...register("legal_name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tax_id">USt-IdNr.</Label>
            <Input id="tax_id" placeholder="DE123456789" {...register("tax_id")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_line1">Straße</Label>
            <Input id="address_line1" {...register("address_line1")} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="space-y-2 col-span-1">
              <Label htmlFor="postal_code">PLZ</Label>
              <Input id="postal_code" {...register("postal_code")} />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="city">Ort</Label>
              <Input id="city" {...register("city")} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Wird angelegt…" : "Betrieb anlegen"}
          </Button>
        </form>
      </div>
    </div>
  );
}
