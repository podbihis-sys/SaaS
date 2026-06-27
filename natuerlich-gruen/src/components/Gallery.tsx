import Image from "next/image";
import { photos } from "@/lib/photos";

/**
 * Arbeitsproben-Galerie mit echten Projektfotos (von natuerlichgruen.net
 * übernommen, lokal gehostet, via next/image automatisch optimiert).
 */
export default function Gallery() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {photos.gallery.map((img) => (
        <div
          key={img.src}
          className="relative aspect-[4/3] overflow-hidden rounded-organic bg-moss-100"
        >
          <Image
            src={img.src}
            alt={img.alt}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        </div>
      ))}
    </div>
  );
}
