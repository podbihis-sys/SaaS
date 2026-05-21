"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { parseEuroInput } from "@/lib/utils/format";

export interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value: number | null | undefined;
  onValueChange: (value: number) => void;
  className?: string;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, className, ...props }, ref) => {
    const [text, setText] = React.useState(() =>
      value === null || value === undefined || Number.isNaN(value)
        ? ""
        : (value as number).toString().replace(".", ","),
    );

    React.useEffect(() => {
      const incoming =
        value === null || value === undefined || Number.isNaN(value)
          ? ""
          : (value as number).toString().replace(".", ",");
      setText((current) => {
        const numeric = parseEuroInput(current);
        return numeric === value ? current : incoming;
      });
    }, [value]);

    return (
      <div className={cn("relative", className)}>
        <Input
          ref={ref}
          inputMode="decimal"
          value={text}
          className="pr-7"
          onChange={(e) => {
            const next = e.target.value;
            setText(next);
            onValueChange(parseEuroInput(next));
          }}
          {...props}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
          €
        </span>
      </div>
    );
  },
);
CurrencyInput.displayName = "CurrencyInput";
