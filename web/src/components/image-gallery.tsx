"use client";

import * as React from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { InquiryImage } from "@/lib/api/types";

interface ImageGalleryProps {
  images: InquiryImage[];
}

export function ImageGallery({ images }: ImageGalleryProps) {
  const [active, setActive] = React.useState<InquiryImage | null>(null);

  if (images.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
        Keine Bilder.
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {images.map((img) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setActive(img)}
            className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
          >
            <Image
              src={img.thumbnail_url ?? img.url}
              alt=""
              fill
              sizes="(min-width: 768px) 25vw, 50vw"
              className="object-cover transition-transform group-hover:scale-105"
            />
          </button>
        ))}
      </div>
      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-3xl p-2">
          {active ? (
            <div className="relative h-[70vh] w-full">
              <Image src={active.url} alt="" fill sizes="80vw" className="object-contain" />
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
