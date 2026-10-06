// Kopiert nach dem Build die statischen Assets in den Standalone-Ordner,
// sodass .next/standalone komplett lauffaehig ist (Plesk/Passenger).
// Plattformunabhaengig (Node fs.cpSync), laeuft also auch unter Windows.
import { cpSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const standalone = resolve(root, ".next/standalone");

if (!existsSync(standalone)) {
  console.error("Kein .next/standalone gefunden. Zuerst 'next build' ausfuehren.");
  process.exit(1);
}

cpSync(resolve(root, ".next/static"), resolve(standalone, ".next/static"), { recursive: true });
if (existsSync(resolve(root, "public"))) {
  cpSync(resolve(root, "public"), resolve(standalone, "public"), { recursive: true });
}

console.log("Standalone fertig paketiert: .next/standalone ist deploybereit.");
