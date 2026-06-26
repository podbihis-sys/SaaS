import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-content flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="font-display text-6xl text-moss-500">404</p>
      <h1 className="mt-4 text-3xl">Diese Seite ist wohl noch zugewachsen.</h1>
      <p className="mt-3 max-w-md text-anthracite-600">
        Die gewünschte Seite konnte nicht gefunden werden. Vielleicht finden Sie
        über die Startseite oder unsere Leistungen, wonach Sie suchen.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link href="/" className="btn-primary">
          Zur Startseite
        </Link>
        <Link href="/leistungen" className="btn-secondary">
          Unsere Leistungen
        </Link>
      </div>
    </section>
  );
}
