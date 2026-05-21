"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserPlus, Users } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/data-table";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { companiesApi } from "@/lib/api/companies";
import { inviteSchema, type InviteInput } from "@/lib/utils/validation";
import { useToast } from "@/lib/hooks/use-toast";
import type { Membership, Role } from "@/lib/api/types";

const ROLE_LABEL: Record<Role, string> = {
  owner: "Inhaber",
  admin: "Administrator",
  member: "Mitglied",
};

export default function TeamPage() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = React.useState(false);

  const members = useQuery({
    queryKey: ["company", "members"],
    queryFn: () => companiesApi.listMembers(),
  });

  const form = useForm<InviteInput>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { email: "", role: "member" },
  });

  const invite = useMutation({
    mutationFn: (values: InviteInput) => companiesApi.invite(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["company", "members"] });
      toast({ title: "Einladung gesendet" });
      setOpen(false);
      form.reset();
    },
    onError: (err: Error) =>
      toast({ variant: "destructive", title: "Fehler", description: err.message }),
  });

  const updateRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      companiesApi.updateMember(id, { role }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["company", "members"] });
      toast({ title: "Rolle aktualisiert" });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => companiesApi.removeMember(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["company", "members"] });
      toast({ title: "Mitglied entfernt" });
    },
  });

  const columns: ColumnDef<Membership>[] = React.useMemo(
    () => [
      {
        accessorKey: "email",
        header: "E-Mail",
        cell: ({ row }) => (
          <div>
            <div className="font-medium">{row.original.full_name ?? row.original.email}</div>
            {row.original.full_name ? (
              <div className="text-xs text-muted-foreground">{row.original.email}</div>
            ) : null}
          </div>
        ),
      },
      {
        accessorKey: "role",
        header: "Rolle",
        cell: ({ row }) => (
          <Select
            value={row.original.role}
            onValueChange={(role) => updateRole.mutate({ id: row.original.id, role: role as Role })}
          >
            <SelectTrigger className="h-8 w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                <SelectItem key={r} value={r}>
                  {ROLE_LABEL[r]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) =>
          row.original.status === "invited" ? (
            <Badge variant="warning">Eingeladen</Badge>
          ) : (
            <Badge variant="success">Aktiv</Badge>
          ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (confirm("Mitglied wirklich entfernen?")) remove.mutate(row.original.id);
              }}
            >
              Entfernen
            </Button>
          </div>
        ),
      },
    ],
    [updateRole, remove],
  );

  return (
    <>
      <PageHeader
        title="Team"
        description="Mitarbeitende einladen und Rollen verwalten."
        actions={
          <Button onClick={() => setOpen(true)}>
            <UserPlus /> Einladen
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={members.data ?? []}
        isLoading={members.isLoading}
        emptyState={
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="Noch keine Mitarbeitenden"
            description="Laden Sie Ihr Team per E-Mail ein."
          />
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mitarbeiter einladen</DialogTitle>
            <DialogDescription>Die Person erhält eine E-Mail mit Anmeldelink.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4" onSubmit={form.handleSubmit((v) => invite.mutate(v))}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Mail</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rolle</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(Object.keys(ROLE_LABEL) as Role[]).map((r) => (
                          <SelectItem key={r} value={r}>
                            {ROLE_LABEL[r]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Abbrechen
                </Button>
                <Button type="submit" disabled={invite.isPending}>
                  Einladung senden
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
