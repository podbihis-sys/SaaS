import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
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
    <AuthShell title="Ihren Betrieb anlegen" subtitle="Einmalig erforderlich — danach geht es direkt zum Geräteinventar.">
      <OnboardingForm defaultEmail={user.email ?? ""} />
    </AuthShell>
  );
}
