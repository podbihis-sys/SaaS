import { getCompany } from "@/lib/data";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const company = await getCompany();
  // Das App-Layout leitet ohne Betrieb bereits nach /onboarding um — hier defensiv absichern.
  if (!company) return null;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold tracking-tight text-slate-900">Einstellungen</h1>
      <p className="mt-1 text-sm text-slate-600">
        Betriebsdaten und Bundesland für die Feiertags-Logik der Erinnerungen.
      </p>
      <div className="mt-6">
        <SettingsForm
          defaults={{
            name: company.name,
            contactEmail: company.contact_email,
            bundesland: company.bundesland,
          }}
        />
      </div>
    </div>
  );
}
