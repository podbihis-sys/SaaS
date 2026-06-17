import Link from "next/link";
import { ArrowUpRight, Thermometer } from "lucide-react";
import type { Product } from "../_data/catalog";
import { getCategory } from "../_data/catalog";
import { ProductIllustration } from "./product-illustration";

export function ProductCard({ product }: { product: Product }) {
  const category = getCategory(product.category);
  return (
    <Link
      href={`/bit/produkte/${product.slug}`}
      className="bit-card group flex flex-col overflow-hidden"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-t-[1.3rem] bg-gradient-to-br from-slate-50 to-slate-100">
        <ProductIllustration
          category={product.category}
          src={product.image}
          alt={product.imageAlt}
          className="bit-card-img h-full w-full"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-1 text-xs font-medium text-[#1e4a7a] shadow-sm backdrop-blur">
          {category?.name}
        </span>
        {product.code !== product.name && (
          <span className="absolute right-3 top-3 rounded-md bg-[#0f2742]/80 px-2 py-0.5 font-mono text-[11px] font-medium text-white/90 backdrop-blur">
            {product.code}
          </span>
        )}
        {product.temperature && (
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1 rounded-full bg-[#0f2742]/85 px-2.5 py-1 text-xs font-medium text-white shadow-sm backdrop-blur">
            <Thermometer className="h-3.5 w-3.5 text-[#38bdf8]" />
            {product.temperature}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold text-slate-900 transition-colors group-hover:text-[#1e4a7a]">
          {product.name}
        </h3>
        <p className="mt-1 text-sm text-[#1d4ed8]">{product.tagline}</p>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
          {product.description}
        </p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {product.features.slice(0, 2).map((f) => (
            <span
              key={f}
              className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#38bdf8]" />
              {f}
            </span>
          ))}
          <span className="inline-flex items-center rounded-full bg-[#1e4a7a]/10 px-2.5 py-1 text-xs font-medium text-[#1e4a7a]">
            {product.sizes.length} Größen
          </span>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
          <span className="text-sm font-semibold text-slate-900">Details &amp; Anfrage</span>
          <span className="bit-arrow-circle">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
