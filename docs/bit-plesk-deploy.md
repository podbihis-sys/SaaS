# BIT-Website – Deployment auf Plesk (self-hosted, MariaDB)

Die BIT-Website (`web/`, Next.js 15, App unter `/bit`) laeuft ohne Supabase und
ohne Vercel: Daten in MariaDB, eigene Admin-Anmeldung, Bild-Uploads lokal im
Dateisystem. Dieses Dokument beschreibt Einrichtung und Deployment auf einem
Plesk-Server mit der Erweiterung "Node.js" (Phusion Passenger).

## 1. Datenbank anlegen

In Plesk unter **Datenbanken** eine MariaDB-Datenbank + Benutzer anlegen, z. B.
`bit_cms` / `bit_user`. Danach das Schema einspielen:

```bash
mysql -u bit_user -p bit_cms < web/scripts/bit-schema.sql
```

Legt die 9 Tabellen an (`bit_categories`, `bit_products`, `bit_news`,
`bit_pages`, `bit_jobs`, `bit_faq`, `bit_team`, `bit_content`, `bit_admins`),
utf8mb4, inkl. Fremdschluessel und Indizes.

## 2. Umgebungsvariablen

Die App liest `BIT_DB_*` (Fallback `DB_*`). In Plesk werden die Variablen in der
Node.js-App unter **Umgebungsvariablen** gesetzt (oder per `.env` im App-Ordner,
falls bevorzugt). Siehe `web/.env.example`.

| Variable           | Beschreibung                                        |
|--------------------|-----------------------------------------------------|
| `BIT_DB_HOST`      | DB-Host (meist `127.0.0.1`)                         |
| `BIT_DB_PORT`      | DB-Port (`3306`)                                    |
| `BIT_DB_USER`      | DB-Benutzer                                         |
| `BIT_DB_PASSWORD`  | DB-Passwort                                         |
| `BIT_DB_NAME`      | DB-Name (`bit_cms`)                                 |
| `BIT_AUTH_SECRET`  | langes Zufallsgeheimnis fuer die Session (JWT)      |
| `BIT_UPLOAD_DIR`   | absoluter Pfad fuer hochgeladene Bilder             |
| `NODE_ENV`         | `production`                                        |

`BIT_AUTH_SECRET` erzeugen:

```bash
openssl rand -base64 48
```

`BIT_UPLOAD_DIR` muss vom Node-Prozess beschreibbar sein und **ausserhalb** des
Build-Ordners liegen (sonst gehen Bilder beim naechsten Deploy verloren), z. B.:

```bash
mkdir -p /var/www/vhosts/<domain>/bit-uploads
```

Fuer die **einmalige Migration** zusaetzlich (siehe Schritt 6):
`NEXT_PUBLIC_BIT_SUPABASE_URL`, `NEXT_PUBLIC_BIT_SUPABASE_ANON_KEY`.

## 3. Build (lokal oder auf dem Server)

```bash
cd web
npm ci
npm run build
```

Der Build erzeugt dank `output: "standalone"` einen eigenstaendigen Server unter
`web/.next/standalone/`. Eine erreichbare Datenbank ist zum Bauen **nicht**
noetig – die oeffentlichen Seiten fallen beim Build auf ihre statischen Inhalte
zurueck.

## 4. Dateien auf den Server bringen

Der **App-Root** ist das hochgeladene `web/`-Verzeichnis. Darin muss die
Struktur so aussehen (Standalone-Bundle **unveraendert** lassen, nur `static`
und `public` hineinkopieren):

```
<app-root>/server.js                     (web/server.js – Passenger-Startdatei)
<app-root>/.next/standalone/server.js    (vom Build, nicht ueberschreiben)
<app-root>/.next/standalone/node_modules (vom Build, eigene Abhaengigkeiten)
<app-root>/.next/standalone/.next/static <- Kopie von .next/static
<app-root>/.next/standalone/public       <- Kopie von public/
```

Praktisch nach dem Build:

```bash
cp -r web/.next/static  web/.next/standalone/.next/static
cp -r web/public        web/.next/standalone/public
# dann web/ (mit server.js, .next/standalone, …) in den App-Root hochladen, z. B.:
rsync -a web/server.js web/.next <app-root>/
```

Hinweis: Das Standalone-Bundle enthaelt bereits seine eigenen `node_modules` –
im App-Root ist kein `npm install` noetig. `web/server.js` startet den Server
unter `.next/standalone/server.js`.

## 5. Plesk Node.js-App konfigurieren

Unter **Websites & Domains → Node.js**:

- **Application Root / Document Root**: der App-Ordner von Schritt 4
- **Application Startup File**: `server.js`
- **Application Mode**: `production`
- **Umgebungsvariablen**: wie in Schritt 2
- Danach **NPM install** ist nicht erforderlich; **Restart App** klicken.

`server.js` startet den Standalone-Server und uebernimmt den von Passenger
gesetzten `PORT`.

### Bilder ausliefern

Hochgeladene Bilder werden ueber die Route `/bit/media/<key>` gestreamt – ohne
weitere Konfiguration lauffaehig. Optional kann der Webserver (nginx/Apache in
Plesk) `BIT_UPLOAD_DIR` direkt unter `/bit/media/` ausliefern (schneller); die
Route bleibt dann als Fallback bestehen.

## 6. Daten aus Supabase migrieren (einmalig)

Auf einem Rechner mit Zugriff auf Supabase **und** MariaDB:

```bash
cd web
export NEXT_PUBLIC_BIT_SUPABASE_URL=...        # BIT-Projekt
export NEXT_PUBLIC_BIT_SUPABASE_ANON_KEY=...
export BIT_DB_HOST=... BIT_DB_PORT=3306 BIT_DB_USER=... BIT_DB_PASSWORD=... BIT_DB_NAME=bit_cms
export BIT_UPLOAD_DIR=/var/www/vhosts/<domain>/bit-uploads
node scripts/migrate-supabase-to-mariadb.mjs
```

Das Skript kopiert alle CMS-Tabellen (TRUNCATE + INSERT, wiederholbar) und laedt
die Bilder aus dem Storage-Bucket nach `BIT_UPLOAD_DIR`. `bit_admins` wird
bewusst **nicht** migriert (Supabase-Passwoerter sind nicht uebertragbar).

## 7. Admin-Konto anlegen

```bash
cd web
export BIT_DB_HOST=... BIT_DB_USER=... BIT_DB_PASSWORD=... BIT_DB_NAME=bit_cms
node scripts/create-admin.mjs admin@bit-gmbh.de 'EinStarkesPasswort' admin
```

Anmeldung danach unter `/bit/admin/login`. Eine gueltige Zeile in `bit_admins`
ist zugleich die Freischaltung (keine separate Whitelist).

## 8. Diagnose

`/bit/api/cms-health` liefert, ob DB + Auth-Secret erreichbar/gesetzt sind
(ohne Geheimnisse). Solange keine DB erreichbar ist, zeigt die oeffentliche
Website weiterhin die eingebauten statischen Inhalte.
