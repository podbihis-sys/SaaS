"use client";

import * as React from "react";
import { useDropzone, type Accept } from "react-dropzone";
import { Upload } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FileDropzoneProps {
  onFiles: (files: File[]) => void;
  accept?: Accept;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  hint?: string;
}

export function FileDropzone({
  onFiles,
  accept = { "image/*": [] },
  multiple = true,
  disabled,
  className,
  hint,
}: FileDropzoneProps) {
  const onDrop = React.useCallback(
    (accepted: File[]) => {
      if (accepted.length) onFiles(accepted);
    },
    [onFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    disabled,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-card/40 px-6 py-10 text-center transition-colors",
        isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
    >
      <input {...getInputProps()} />
      <Upload className="h-6 w-6 text-muted-foreground" />
      <p className="mt-3 text-sm font-medium">
        {isDragActive ? "Dateien hier ablegen…" : "Dateien ablegen oder klicken zum Hochladen"}
      </p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
