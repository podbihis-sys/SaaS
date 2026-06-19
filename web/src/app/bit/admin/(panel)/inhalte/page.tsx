import { getContent } from "@/app/bit/_data/content-server";
import { ContentForm } from "@/app/bit/admin/_components/content-form";

export const dynamic = "force-dynamic";

export default async function ContentPage() {
  const content = await getContent();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Seiteninhalte</h1>
        <p className="mt-1 text-sm text-slate-500">
          Texte der öffentlichen Seiten bearbeiten. Leere Felder verwenden den eingebauten
          Standardtext.
        </p>
      </div>
      <ContentForm initial={content} />
    </div>
  );
}
