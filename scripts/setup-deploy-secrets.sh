#!/usr/bin/env bash
# Sets all GitHub Actions secrets required for deploy-backend.yml and deploy-web.yml.
# Usage:
#   1) gh auth login   (if not already)
#   2) Copy scripts/.deploy.env.example -> scripts/.deploy.env and fill values
#   3) bash scripts/setup-deploy-secrets.sh
set -euo pipefail

REPO="${REPO:-podbihis-sys/SaaS}"
HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${HERE}/.deploy.env"

if [ ! -f "$ENV_FILE" ]; then
    echo "Missing $ENV_FILE — copy .deploy.env.example and fill values." >&2
    exit 1
fi

set -a; . "$ENV_FILE"; set +a

required=(
    FLY_API_TOKEN
    VERCEL_TOKEN
    DATABASE_URL
    SUPABASE_JWT_SECRET
    SUPABASE_SERVICE_ROLE_KEY
    SUPABASE_ANON_KEY
    OPENAI_API_KEY
    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY
    NEXT_PUBLIC_API_URL
    CORS_ORIGINS
)

for k in "${required[@]}"; do
    v="${!k:-}"
    if [ -z "$v" ]; then
        echo "Missing $k in $ENV_FILE" >&2
        exit 1
    fi
    echo "→ setting $k"
    gh secret set "$k" --body "$v" --repo "$REPO" >/dev/null
done

echo "Done. ${#required[@]} secrets set on $REPO."
echo "Next: trigger workflows"
echo "  gh workflow run deploy-backend --repo $REPO"
echo "  gh workflow run deploy-web     --repo $REPO"
