#!/usr/bin/env bash
# -----------------------------------------------------------------------------
# Generates the self-hosting secrets (POSTGRES_PASSWORD, JWT_SECRET, ANON_KEY,
# SERVICE_ROLE_KEY) and prints them ready to paste into .env.selfhost.
#
# Usage:
#   ./scripts/generate-secrets.sh                 # print to stdout
#   ./scripts/generate-secrets.sh --write         # update ./.env.selfhost in place
#
# The ANON_KEY / SERVICE_ROLE_KEY are HS256 JWTs signed with JWT_SECRET, valid
# for 10 years, matching what Supabase expects.
# -----------------------------------------------------------------------------
set -euo pipefail

command -v openssl >/dev/null || { echo "openssl is required" >&2; exit 1; }
command -v python3 >/dev/null || { echo "python3 is required" >&2; exit 1; }

POSTGRES_PASSWORD="$(openssl rand -hex 24)"
JWT_SECRET="$(openssl rand -hex 32)"

gen_jwt() {
  local role="$1"
  python3 - "$JWT_SECRET" "$role" <<'PY'
import base64, hashlib, hmac, json, sys, time
secret, role = sys.argv[1], sys.argv[2]
def b64(raw): return base64.urlsafe_b64encode(raw).rstrip(b"=")
now = int(time.time())
header = b64(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
payload = b64(json.dumps(
    {"role": role, "iss": "supabase", "iat": now, "exp": now + 60 * 60 * 24 * 365 * 10},
    separators=(",", ":"),
).encode())
signing_input = header + b"." + payload
sig = b64(hmac.new(secret.encode(), signing_input, hashlib.sha256).digest())
print((signing_input + b"." + sig).decode())
PY
}

ANON_KEY="$(gen_jwt anon)"
SERVICE_ROLE_KEY="$(gen_jwt service_role)"

if [[ "${1:-}" == "--write" ]]; then
  ENV_FILE="${2:-.env.selfhost}"
  [[ -f "$ENV_FILE" ]] || { echo "$ENV_FILE not found. Run: cp .env.selfhost.example $ENV_FILE" >&2; exit 1; }
  # Portable in-place edit (GNU + BSD sed).
  sed_i() { if sed --version >/dev/null 2>&1; then sed -i "$@"; else sed -i '' "$@"; fi; }
  set_var() { sed_i "s|^$1=.*|$1=$2|" "$ENV_FILE"; }
  set_var POSTGRES_PASSWORD "$POSTGRES_PASSWORD"
  set_var JWT_SECRET "$JWT_SECRET"
  set_var ANON_KEY "$ANON_KEY"
  set_var SERVICE_ROLE_KEY "$SERVICE_ROLE_KEY"
  set_var NEXT_PUBLIC_BIT_SUPABASE_ANON_KEY "$ANON_KEY"
  set_var NEXT_PUBLIC_SUPABASE_ANON_KEY "$ANON_KEY"
  echo "Updated secrets in $ENV_FILE"
  echo "  (review API_DOMAIN/SITE_DOMAIN and the *_URL values manually)"
else
  cat <<EOF
# ---- generated secrets: paste into .env.selfhost ----
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
JWT_SECRET=$JWT_SECRET
ANON_KEY=$ANON_KEY
SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY

# Also set these to the ANON_KEY above:
NEXT_PUBLIC_BIT_SUPABASE_ANON_KEY=$ANON_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
EOF
fi
