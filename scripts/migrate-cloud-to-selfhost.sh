#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# Migrates the BIT data from the Supabase CLOUD project into the self-hosted DB.
#
# What it moves:
#   - public.bit_* tables  (schema + data + indexes + RLS policies)
#   - auth.users / auth.identities          (data only -> preserves logins)
#   - storage.buckets / storage.objects      (data only -> file metadata)
#
# The actual storage FILES are copied separately by scripts/migrate-storage.mjs.
#
# Requirements: pg_dump + psql (Postgres 15 client tools) on your machine.
#
# Usage:
#   set -a; source .env.selfhost; set +a
#   ./scripts/migrate-cloud-to-selfhost.sh dump      # 1) dump from cloud
#   ./scripts/migrate-cloud-to-selfhost.sh restore   # 2) load into self-host
#   ./scripts/migrate-cloud-to-selfhost.sh all       # do both
# -----------------------------------------------------------------------------
set -euo pipefail

DUMP_DIR="${DUMP_DIR:-./migration-dump}"
BIT_TABLES=(bit_products bit_categories bit_admins bit_admin_invites bit_content bit_news)

# Self-hosted DB is published on localhost by docker-compose.selfhost.yml.
SELFHOST_DB_URL="${SELFHOST_DB_URL:-postgresql://postgres:${POSTGRES_PASSWORD}@127.0.0.1:5432/postgres}"

require() { command -v "$1" >/dev/null || { echo "Missing required tool: $1" >&2; exit 1; }; }
require pg_dump
require psql

dump() {
  : "${CLOUD_DB_URL:?Set CLOUD_DB_URL (cloud project connection string) in .env.selfhost}"
  mkdir -p "$DUMP_DIR"

  echo ">> Dumping public.bit_* (schema + data) ..."
  local table_args=()
  for t in "${BIT_TABLES[@]}"; do table_args+=(-t "public.${t}"); done
  pg_dump "$CLOUD_DB_URL" \
    --no-owner --no-privileges --no-comments \
    "${table_args[@]}" \
    > "$DUMP_DIR/01_bit_public.sql"

  echo ">> Dumping auth.users / auth.identities (data only) ..."
  pg_dump "$CLOUD_DB_URL" \
    --no-owner --no-privileges --data-only \
    -t auth.users -t auth.identities \
    > "$DUMP_DIR/02_auth.sql"

  echo ">> Dumping storage.buckets / storage.objects (data only) ..."
  pg_dump "$CLOUD_DB_URL" \
    --no-owner --no-privileges --data-only \
    -t storage.buckets -t storage.objects \
    > "$DUMP_DIR/03_storage_meta.sql"

  echo ">> Dump complete in $DUMP_DIR"
}

restore() {
  : "${POSTGRES_PASSWORD:?Set POSTGRES_PASSWORD in .env.selfhost}"
  echo ">> Target: $SELFHOST_DB_URL"

  echo ">> Restoring public.bit_* ..."
  psql "$SELFHOST_DB_URL" -v ON_ERROR_STOP=1 -f "$DUMP_DIR/01_bit_public.sql"

  echo ">> Restoring auth users/identities (ignore duplicate-key notices) ..."
  # auth schema already exists (created by GoTrue). Ignore conflicts on re-runs.
  psql "$SELFHOST_DB_URL" -f "$DUMP_DIR/02_auth.sql" || true

  echo ">> Restoring storage metadata (ignore duplicate-key notices) ..."
  psql "$SELFHOST_DB_URL" -f "$DUMP_DIR/03_storage_meta.sql" || true

  echo ">> Restore complete. Now copy storage files: ./scripts/migrate-storage.mjs"
}

case "${1:-all}" in
  dump) dump ;;
  restore) restore ;;
  all) dump; restore ;;
  *) echo "Usage: $0 {dump|restore|all}" >&2; exit 1 ;;
esac
