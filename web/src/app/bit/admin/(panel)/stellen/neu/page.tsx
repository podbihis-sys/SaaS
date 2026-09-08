import { JobForm } from "../../../_components/job-form";

export const dynamic = "force-dynamic";

export default function NeueStelle() {
  return (
    <>
      <h1 className="text-xl font-bold text-slate-900">Neue Stelle</h1>
      <div className="mt-6">
        <JobForm />
      </div>
    </>
  );
}
