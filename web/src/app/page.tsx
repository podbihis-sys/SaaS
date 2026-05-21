import Link from "next/link";
import { ArrowRight, Camera, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="text-base font-semibold tracking-tight">
            Handwerk SaaS
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Anmelden</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">Kostenlos starten</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
              <Sparkles className="h-3 w-3" /> KI-gestützte Angebotserstellung
            </span>
            <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
              Vom Foto zum Angebot in 60 Sekunden.
            </h1>
            <p className="mt-6 text-balance text-lg text-muted-foreground">
              Für Maler, Bodenleger, Trockenbauer & Co. — Anfragen erfassen, Bilder hochladen, KI
              kalkulieren lassen, Angebot als PDF versenden.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link href="/register">
                  Jetzt starten <ArrowRight className="ml-1" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/login">Anmelden</Link>
              </Button>
            </div>
          </div>
        </section>

        <section className="container pb-24">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Camera,
                title: "Bilder hochladen",
                body: "Per Drag & Drop direkt vom Smartphone oder Desktop. Mehrere Bilder pro Anfrage.",
              },
              {
                icon: Sparkles,
                title: "KI erkennt Leistungen",
                body: "Räume, Materialien und Schäden werden automatisch klassifiziert und mengenmäßig erfasst.",
              },
              {
                icon: FileText,
                title: "Angebot als PDF",
                body: "Preisliste, MwSt. und Layout aus den Firmeneinstellungen — bereit zum Versenden.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div key={title} className="rounded-lg border bg-card p-6">
                <Icon className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="container flex h-14 items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Handwerk SaaS</span>
          <span>Made in Germany</span>
        </div>
      </footer>
    </div>
  );
}
