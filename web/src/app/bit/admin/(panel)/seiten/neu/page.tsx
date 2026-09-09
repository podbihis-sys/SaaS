import { PageForm } from "../../../_components/page-form";

export const dynamic = "force-dynamic";

export default function NeueSeite() {
  return (
    <>
      <h1 className="text-xl font-bold text-slate-900">Neue Seite</h1>
      <div className="mt-6">
        <PageForm />
      </div>
    </>
  );
}
