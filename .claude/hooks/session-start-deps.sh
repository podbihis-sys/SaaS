#!/usr/bin/env bash
# SessionStart hook: install project dependencies so tests and linters run in
# Claude Code on the web sessions.
#
#   backend/  Python 3.12 via uv (venv at backend/.venv) + pip extras [dev]
#   web/      npm (Next.js)
#   mobile/   npm (Expo / React Native)
#   shared/   no manifest; consumed by web + mobile via TS paths
#
# Mirrors the install/lint/test commands used by .github/workflows/{backend,web,mobile}.yml.
# Remote-only, idempotent, non-interactive, and best-effort: a single stack
# failing (e.g. transient network) never blocks session startup.

set -uo pipefail

log() { echo "[deps] $*" >&2; }

# Only run in Claude Code on the web (remote) sessions.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  log "local session; skipping dependency install"
  exit 0
fi

ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"

setup_backend() {
  command -v uv >/dev/null 2>&1 || { log "uv not found; skipping backend"; return 1; }
  cd "${ROOT}/backend" || return 1
  # uv provisions a managed CPython 3.12 even though the base image ships 3.11.
  uv venv --python 3.12 .venv >/dev/null || return 1
  uv pip install --python "${ROOT}/backend/.venv/bin/python" -e ".[dev]" || return 1
}

setup_web() {
  cd "${ROOT}/web" || return 1
  npm install --legacy-peer-deps --no-audit --no-fund || return 1
}

setup_mobile() {
  cd "${ROOT}/mobile" || return 1
  npm install --legacy-peer-deps --no-audit --no-fund || return 1
}

ok=(); fail=()
for stack in backend web mobile; do
  if "setup_${stack}"; then ok+=("${stack}"); else fail+=("${stack}"); fi
done

# Persist environment so backend tests/linters and the web build work out of the
# box. Defaults mirror the CI env; ${VAR:-default} preserves anything already set.
if [ -n "${CLAUDE_ENV_FILE:-}" ]; then
  {
    echo "export PATH=\"${ROOT}/backend/.venv/bin:\$PATH\""
    echo 'export ENV="${ENV:-test}"'
    echo 'export DATABASE_URL="${DATABASE_URL:-sqlite+aiosqlite:///:memory:}"'
    echo 'export TEST_DATABASE_URL="${TEST_DATABASE_URL:-sqlite+aiosqlite:///:memory:}"'
    echo 'export SUPABASE_JWT_SECRET="${SUPABASE_JWT_SECRET:-ci-secret}"'
    echo 'export OPENAI_API_KEY="${OPENAI_API_KEY:-ci-openai-key}"'
    echo 'export NEXT_PUBLIC_SUPABASE_URL="${NEXT_PUBLIC_SUPABASE_URL:-https://example.supabase.co}"'
    echo 'export NEXT_PUBLIC_SUPABASE_ANON_KEY="${NEXT_PUBLIC_SUPABASE_ANON_KEY:-ci-anon-key}"'
    echo 'export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:8000}"'
  } >> "${CLAUDE_ENV_FILE}"
fi

log "ready: [${ok[*]:-none}]  failed: [${fail[*]:-none}]"
exit 0
