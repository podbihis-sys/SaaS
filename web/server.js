// Startdatei fuer Plesk / Phusion Passenger.
//
// Startet den eigenstaendigen Next.js-Build (output: "standalone"). Passenger
// setzt PORT; der Standalone-Server liest PORT und HOSTNAME aus der Umgebung.
//
// Diese Datei liegt im App-Root (= hochgeladenes web/) und wird als "Startdatei"
// der Plesk-Node.js-App eingetragen. Sie startet den eigenstaendigen Server aus
// .next/standalone/ (dieser bringt seine eigenen node_modules mit).
//
// Voraussetzung (siehe docs/bit-plesk-deploy.md): nach `npm run build` liegen
//   .next/standalone/server.js        (unveraendert)
//   .next/standalone/.next/static  <- Kopie von .next/static
//   .next/standalone/public        <- Kopie von public/
const path = require("node:path");
const fs = require("node:fs");

process.env.PORT = process.env.PORT || "3000";
process.env.HOSTNAME = process.env.HOSTNAME || "127.0.0.1";

const target = path.join(__dirname, ".next", "standalone", "server.js");
if (!fs.existsSync(target)) {
  console.error(
    "Standalone-Server nicht gefunden (.next/standalone/server.js). Bitte den Build deployen (siehe docs/bit-plesk-deploy.md).",
  );
  process.exit(1);
}

require(target);
