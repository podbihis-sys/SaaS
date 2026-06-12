import { redirect } from "next/navigation";
import { getCompany, getUser } from "@/lib/data";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }
  const company = await getCompany();
  if (company) {
    redirect("/dashboard");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <h1 className="mb-2 text-center text-2xl font-bold">Ihren Betrieb anlegen</h1>
      <p className="mb-6 text-center text-sm text-slate-600">
        Einmalig erforderlich — danach geht es direkt zum Geräteinventar.
      </p>
      <OnboardingForm defaultEmail={user.email ?? ""} />
    </main>
  );
}
