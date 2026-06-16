import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t py-8 text-center text-sm text-muted-foreground">
      <nav className="flex flex-wrap justify-center gap-4">
        <Link href="/verleih-software" className="hover:underline">
          Produkt
        </Link>
        <Link href="/impressum" className="hover:underline">
          Impressum
        </Link>
        <Link href="/datenschutz" className="hover:underline">
          Datenschutz
        </Link>
        <Link href="/agb" className="hover:underline">
          AGB
        </Link>
      </nav>
      <p className="mt-3">© {new Date().getFullYear()} RentFlow</p>
    </footer>
  );
}
