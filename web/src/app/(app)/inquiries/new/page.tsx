"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FileDropzone } from "@/components/file-dropzone";
import { customersApi } from "@/lib/api/customers";
import { inquiriesApi } from "@/lib/api/inquiries";
import { inquirySchema, type InquiryInput } from "@/lib/utils/validation";
import { useToast } from "@/lib/hooks/use-toast";

interface PendingFile {
  file: File;
  preview: string;
}

export default function NewInquiryPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [files, setFiles] = React.useState<PendingFile[]>([]);

  const customers = useQuery({
    queryKey: ["customers", "all"],
    queryFn: () => customersApi.list({ page: 1, page_size: 200 }),
  });

  const form = useForm<InquiryInput>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { customer_id: "", title: "", description: "" },
  });

  const uploadOne = async (inquiryId: string, file: File) => {
    const signed = await inquiriesApi.signImageUpload(inquiryId, {
      filename: file.name,
      content_type: file.type,
      size: file.size,
    });
    const res = await fetch(signed.upload_url, {
      method: "PUT",
      body: file,
      headers: { "Content-Type": file.type },
    });
    if (!res.ok) throw new Error(`Upload fehlgeschlagen (${res.status})`);
  };

  const createMutation = useMutation({
    mutationFn: async (values: InquiryInput) => {
      const inquiry = await inquiriesApi.create({
        customer_id: values.customer_id,
        title: values.title,
        description: values.description,
      });
      for (const pending of files) {
        await uploadOne(inquiry.id, pending.file);
      }
      return inquiry;
    },
    onSuccess: (inquiry) => {
      toast({ title: "Anfrage erstellt" });
      router.push(`/inquiries/${inquiry.id}`);
    },
    onError: (error: Error) => {
      toast({ variant: "destructive", title: "Fehler", description: error.message });
    },
  });

  const addFiles = (newFiles: File[]) => {
    setFiles((current) => [
      ...current,
      ...newFiles.map((f) => ({ file: f, preview: URL.createObjectURL(f) })),
    ]);
  };

  const removeFile = (index: number) => {
    setFiles((current) => {
      const removed = current[index];
      if (removed) URL.revokeObjectURL(removed.preview);
      return current.filter((_, i) => i !== index);
    });
  };

  React.useEffect(() => {
    return () => {
      files.forEach((f) => URL.revokeObjectURL(f.preview));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <PageHeader
        title="Neue Anfrage"
        description="Kunde, Beschreibung und Bilder erfassen."
        actions={
          <Button variant="outline" asChild>
            <Link href="/inquiries">
              <ArrowLeft /> Zurück
            </Link>
          </Button>
        }
      />

      <Form {...form}>
        <form
          className="grid gap-6 lg:grid-cols-3"
          onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
        >
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="customer_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kunde</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Kunde wählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(customers.data?.items ?? []).map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titel</FormLabel>
                    <FormControl>
                      <Input placeholder="z. B. Renovierung Wohnzimmer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Beschreibung</FormLabel>
                    <FormControl>
                      <Textarea rows={6} placeholder="Was soll gemacht werden?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bilder</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileDropzone onFiles={addFiles} hint="JPG, PNG, HEIC bis 25 MB" />
              {files.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {files.map((f, i) => (
                    <div key={f.preview} className="relative aspect-square overflow-hidden rounded-md border">
                      <Image src={f.preview} alt="" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute right-1 top-1 rounded-full bg-background/90 p-1 text-foreground shadow-sm transition-opacity hover:opacity-100"
                        aria-label="Entfernen"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2 lg:col-span-3">
            <Button type="button" variant="outline" onClick={() => router.push("/inquiries")}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              Anfrage erstellen
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
