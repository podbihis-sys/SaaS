import { NewsForm } from "@/app/bit/admin/_components/news-form";

export const dynamic = "force-dynamic";

export default function NewNewsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Neuer Beitrag</h1>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <NewsForm />
      </div>
    </div>
  );
}
