import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Product } from "../_data/catalog";
import { getCategory } from "../_data/catalog";
import { ProductIllustration } from "./product-illustration";

export function ProductCard({ product }: { product: Product }) {
  const category = getCategory(product.category);
  return (
    <Link
      href={`/bit/produkte/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all hover:-translate-y-0.5 hover:border-[#1e4a7a]/40 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <ProductIllustration
          category={product.category}
          className="h-full w-full transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-xs font-medium text-[#1e4a7a]">
          {category?.name}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold text-slate-900">{product.name}</h3>
        <p className="mt-1 text-sm text-slate-500">{product.tagline}</p>
        <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
          {product.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {product.features.slice(0, 2).map((f) => (
            <span key={f} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
              {f}
            </span>
          ))}
          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
            {product.sizes.length} Größen
          </span>
        </div>
        <div className="mt-5 flex items-center gap-1 text-sm font-medium text-[#1e4a7a]">
          Details & Anfrage
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
}
