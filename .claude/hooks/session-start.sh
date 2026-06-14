#!/bin/bash
# SessionStart hook for Claude Code on the web.
#
# Ensures the ECC plugin (Everything Claude Code) is installed at user scope so
# its agents/skills/commands are available in every session. The 21st.dev
# "magic" MCP server is declared in the repo's .mcp.json and loads automatically
# (set TWENTYFIRST_API_KEY in the environment to enable its tools).
#
# Idempotent and fast: skips when ECC is already present. The web container is
# cached after this hook completes, so the install happens once and subsequent
# sessions start with ECC already loaded.
#
# Not -e: a plugin install hiccup must never block the session from starting.
set -uo pipefail

# Only run in the remote (Claude Code on the web) environment. Locally, users
# manage their own plugins.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

# Allow opt-out without editing this file.
if [ "${ECC_AUTOINSTALL:-on}" = "off" ]; then
  echo "ECC auto-install disabled via ECC_AUTOINSTALL=off."
  exit 0
fi

if claude plugin list 2>/dev/null | grep -q "ecc@ecc"; then
  echo "ECC plugin already installed — nothing to do."
  exit 0
fi

echo "Installing ECC plugin (affaan-m/ecc) at user scope…"
timeout 150 claude plugin marketplace add affaan-m/ecc --scope user 2>&1 \
  || echo "ECC: marketplace add failed (continuing without blocking session)."
timeout 150 claude plugin install ecc@ecc --scope user 2>&1 \
  || echo "ECC: plugin install failed (continuing without blocking session)."

if claude plugin list 2>/dev/null | grep -q "ecc@ecc"; then
  echo "ECC plugin installed. It will be active from the next session."
fi

exit 0
