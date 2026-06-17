# Self-hosting the BIT website + Supabase

Run the BIT website **and** its own Supabase instance (Auth + Storage + REST +
RLS) entirely on your own Linux server with Docker — no Vercel, no Supabase
Cloud.

The stack (`docker-compose.selfhost.yml`):

| Service    | Image                       | Role                                   |
|------------|-----------------------------|----------------------------------------|
| `caddy`    | caddy:2-alpine              | Reverse proxy, automatic HTTPS         |
| `web`      | built from `web/`           | Next.js production server (BIT site)   |
| `kong`     | kong:2.8.1                  | Supabase API gateway                   |
| `auth`     | supabase/gotrue             | Authentication                         |
| `rest`     | postgrest/postgrest         | Auto REST API + RLS                    |
| `storage`  | supabase/storage-api        | Storage API (local filesystem backend) |
| `imgproxy` | darthsim/imgproxy           | Image transformations                  |
| `meta`     | supabase/postgres-meta      | DB introspection for Studio            |
| `studio`   | supabase/studio             | Admin UI (optional)                    |
| `db`       | supabase/postgres           | Postgres + Supabase roles/extensions   |

```
            ┌──────────────── Caddy (80/443, HTTPS) ────────────────┐
            │                                                        │
   bit-gmbh.de            api.bit-gmbh.de              studio.bit-gmbh.de
            │                    │                              │
          web:3000          kong:8000                       studio:3000
                         ┌────────┼─────────┐
                      auth:9999 rest:3000 storage:5000 ── imgproxy:5001
                                    │            │
                                   db:5432 ◄──── meta:8080
```

> **Image versions** are pinned in `docker-compose.selfhost.yml`. The canonical,
> mutually-tested combination lives in the official
> [`supabase/supabase`](https://github.com/supabase/supabase/tree/master/docker)
> `docker/` directory. If a pull fails or a service misbehaves, align the tags
> with that repo's `docker-compose.yml`.

---

## 1. Prepare the server

A small VPS (2 vCPU / 4 GB RAM / 40 GB disk) running a recent Ubuntu/Debian is
plenty.

```bash
# Install Docker Engine + compose plugin
curl -fsSL https://get.docker.com | sh

# Open the firewall for HTTP/HTTPS (example: ufw)
sudo ufw allow 80,443/tcp
sudo ufw enable

# Clone the repo
sudo mkdir -p /opt/bit && sudo chown "$USER" /opt/bit
git clone <your-repo-url> /opt/bit
cd /opt/bit
git checkout claude/bit-self-hosted-docker-ott5x6
```

### DNS

Point these A/AAAA records at the server's public IP **before** starting Caddy
(it needs them resolvable to issue certificates):

| Record               | Type | Value          |
|----------------------|------|----------------|
| `bit-gmbh.de`        | A    | `<server-ip>`  |
| `api.bit-gmbh.de`    | A    | `<server-ip>`  |
| `studio.bit-gmbh.de` | A    | `<server-ip>`  |

---

## 2. Configure environment + secrets

```bash
cp .env.selfhost.example .env.selfhost

# Generate POSTGRES_PASSWORD, JWT_SECRET, ANON_KEY, SERVICE_ROLE_KEY in place:
./scripts/generate-secrets.sh --write        # writes into .env.selfhost
# (or run without --write to print them and paste manually)
```

Then edit `.env.selfhost` and set:

- **Domains:** `SITE_DOMAIN`, `API_DOMAIN`, `STUDIO_DOMAIN`, `ACME_EMAIL`
- **URLs:** `SITE_URL`, `SUPABASE_PUBLIC_URL`, `NEXT_PUBLIC_*` (all derived from
  the domains; `NEXT_PUBLIC_BIT_SUPABASE_URL` = `https://<API_DOMAIN>`)
- **Studio basic-auth hash:**
  ```bash
  docker run --rm caddy:2-alpine caddy hash-password --plaintext 'your-studio-password'
  ```
  Paste the result into `STUDIO_BASIC_AUTH_HASH`.
- **SMTP** (optional, for admin invites / password resets).

> The `ANON_KEY`/`SERVICE_ROLE_KEY` are HS256 JWTs signed with `JWT_SECRET`. If
> you ever rotate `JWT_SECRET`, regenerate both keys (re-run the script) and
> rebuild the web image so the new anon key is baked into the client bundle.

> **Not deploying Studio?** Remove the `studio` block from `caddy/Caddyfile`
> (and the `studio`/`meta` services if you like). An empty `STUDIO_DOMAIN`
> would otherwise make Caddy fail to start.

---

## 3. Start the stack

```bash
docker compose -f docker-compose.selfhost.yml --env-file .env.selfhost up -d --build
docker compose -f docker-compose.selfhost.yml --env-file .env.selfhost ps
```

Caddy obtains certificates automatically on first request. Check:

```bash
curl -I https://bit-gmbh.de
curl -s https://api.bit-gmbh.de/rest/v1/ -H "apikey: $ANON_KEY"   # 200/empty = OK
```

Logs / lifecycle:

```bash
docker compose -f docker-compose.selfhost.yml --env-file .env.selfhost logs -f
docker compose -f docker-compose.selfhost.yml --env-file .env.selfhost down      # stop
```

---

## 4. Migrate data from the cloud project

This copies the BIT schema, data, auth users and storage files from the old
cloud project (`bit-gmbh`, id `lhllsywxusrqtxcpnjbo`) into your server.

> Run from a machine with the Postgres 15 client tools (`pg_dump`, `psql`) and
> network access to **both** databases. Running it directly on the server is
> easiest, since the self-hosted DB is published on `127.0.0.1:5432`.

1. Fill the migration vars in `.env.selfhost`:
   - `CLOUD_DB_URL` – cloud connection string
     (Supabase Dashboard → Project Settings → Database → Connection string → URI;
     replace `[YOUR-CLOUD-DB-PASSWORD]`).
   - `CLOUD_SUPABASE_URL`, `CLOUD_SERVICE_ROLE_KEY` – cloud API URL + service key.
   - `BIT_STORAGE_BUCKET` – `bit-product-images`.

2. Migrate the database (schema + data + RLS + auth users + storage metadata):
   ```bash
   set -a; source .env.selfhost; set +a
   ./scripts/migrate-cloud-to-selfhost.sh all
   ```
   This dumps into `./migration-dump/` then restores into the self-hosted DB.

3. Copy the storage files (uses the web app's `@supabase/supabase-js`):
   ```bash
   set -a; source .env.selfhost; set +a
   cd web && npm install --omit=dev      # if node_modules not present
   node ../scripts/migrate-storage.mjs
   cd ..
   ```

4. **Verify the admin login** (`admin@bit-gmbh.de`). The original bcrypt password
   hash is carried over with `auth.users`, so the existing password should work.
   If login fails (e.g. GoTrue schema drift), reset it directly:
   ```bash
   docker compose -f docker-compose.selfhost.yml --env-file .env.selfhost \
     exec db psql -U postgres -d postgres -c \
     "UPDATE auth.users
        SET encrypted_password = crypt('NEW-STRONG-PASSWORD', gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, now())
      WHERE email = 'admin@bit-gmbh.de';"
   ```

> **GoTrue version drift:** the `auth.users` columns must match the GoTrue
> version. The `restore` step ignores conflicts, but if the auth import errors on
> unknown columns, bump `supabase/gotrue` in the compose file to (roughly) the
> cloud project's version, recreate the `auth` service, and re-run the restore.

---

## 5. Updating / redeploying

```bash
cd /opt/bit
git pull
docker compose -f docker-compose.selfhost.yml --env-file .env.selfhost up -d --build
docker image prune -f
```

Or automate it — see below.

---

## 6. Optional: automated deploy from GitHub (`deploy-server.yml`)

`.github/workflows/deploy-server.yml` SSHes into the server and runs
`git reset --hard`, `compose pull`, `compose up -d --build` on every push to the
branch (or via *Run workflow*).

Add these **repository secrets** (Settings → Secrets and variables → Actions):

| Secret        | Value                                             |
|---------------|---------------------------------------------------|
| `SERVER_HOST` | server IP / hostname                              |
| `SERVER_USER` | SSH user that can run `docker compose`            |
| `SSH_KEY`     | private SSH key authorised for `SERVER_USER`      |

Optional **repository variables**: `SERVER_PATH` (default `/opt/bit`),
`SERVER_PORT` (default `22`).

The server must already be set up per steps 1–3 (repo cloned at `SERVER_PATH`,
`.env.selfhost` present). Generate the key pair with
`ssh-keygen -t ed25519 -f deploy_key`, add `deploy_key.pub` to the server's
`~/.ssh/authorized_keys`, and paste the private `deploy_key` into `SSH_KEY`.

---

## What you (the operator) actually run on the server

```bash
# one-time
git clone <repo-url> /opt/bit && cd /opt/bit
git checkout claude/bit-self-hosted-docker-ott5x6
cp .env.selfhost.example .env.selfhost
./scripts/generate-secrets.sh --write
$EDITOR .env.selfhost                       # set domains, URLs, studio hash, SMTP
# (point bit-gmbh.de / api.* / studio.* DNS at this server first)

docker compose -f docker-compose.selfhost.yml --env-file .env.selfhost up -d --build

# migrate from the old cloud project (once)
set -a; source .env.selfhost; set +a
./scripts/migrate-cloud-to-selfhost.sh all
cd web && node ../scripts/migrate-storage.mjs && cd ..

# verify
docker compose -f docker-compose.selfhost.yml --env-file .env.selfhost ps
curl -I https://bit-gmbh.de
```
