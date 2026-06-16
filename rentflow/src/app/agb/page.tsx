import type { Metadata } from "next";

export const metadata: Metadata = { title: "AGB", robots: { index: false } };

export default function AgbPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold">Allgemeine Geschäftsbedingungen</h1>
      <p className="mt-2 rounded-md bg-muted p-3 text-sm text-muted-foreground">
        Muster ohne Gewähr, keine Rechtsberatung. Diese AGB sind ein Platzhalter und vor Livegang
        rechtlich zu prüfen und an den konkreten Betrieb anzupassen.
      </p>

      <div className="mt-6 space-y-6 text-sm leading-relaxed">
        <section>
          <h2 className="font-semibold">§ 1 Geltungsbereich</h2>
          <p>
            RentFlow ist eine Software, die Verleih-Betrieben eine Online-Buchungsseite
            bereitstellt. Der Mietvertrag kommt ausschließlich zwischen dem Verleih-Betrieb und dem
            Mieter zustande; RentFlow wird nicht Vertragspartei der Vermietung.
          </p>
        </section>
        <section>
          <h2 className="font-semibold">§ 2 Zahlungen</h2>
          <p>
            Zahlungen der Mieter (Anzahlung/Kaution/Miete) werden über Stripe direkt an den
            Verleih-Betrieb geleistet. RentFlow ist zu keinem Zeitpunkt im Geldfluss und nimmt keine
            Gelder für den Betrieb entgegen.
          </p>
        </section>
        <section>
          <h2 className="font-semibold">§ 3 Plattform-Abo</h2>
          <p>
            Die Nutzung von RentFlow erfolgt im Rahmen des gewählten Tarifs. Abrechnung und
            Kündigung sind über das Stripe Customer Portal jederzeit möglich.
          </p>
        </section>
        <section>
          <h2 className="font-semibold">§ 4 Haftung</h2>
          <p>
            Für die Mietsache, Kautions-Rückgaben, Erstattungen und etwaige Streitfälle ist
            ausschließlich der jeweilige Verleih-Betrieb verantwortlich.
          </p>
        </section>
      </div>
    </main>
  );
}
