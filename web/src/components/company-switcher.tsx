"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useActiveCompany } from "@/lib/hooks/use-company";

export function CompanySwitcher() {
  const [open, setOpen] = React.useState(false);
  const { companies, activeId, company, switchTo, isLoading } = useActiveCompany();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          size="sm"
          aria-expanded={open}
          className="w-[220px] justify-between"
          disabled={isLoading || companies.length === 0}
        >
          <span className="flex items-center gap-2 truncate">
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{company?.name ?? "Firma wählen"}</span>
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Suchen..." />
          <CommandList>
            <CommandEmpty>Keine Firma gefunden.</CommandEmpty>
            <CommandGroup>
              {companies.map((c) => (
                <CommandItem
                  key={c.id}
                  value={c.name}
                  onSelect={() => {
                    setOpen(false);
                    if (c.id !== activeId) switchTo(c.id);
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", activeId === c.id ? "opacity-100" : "opacity-0")} />
                  {c.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
