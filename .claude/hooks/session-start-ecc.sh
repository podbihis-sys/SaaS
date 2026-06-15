#!/usr/bin/env bash
# SessionStart hook: install the ECC ("Everything Claude Code") suite into
# ~/.claude so its skills/agents/commands are available in Claude Code on the web.
#
# Source: https://github.com/affaan-m/ECC  (262 skills, 64 agents, 84 commands)
#
# Web sessions run in an ephemeral container with only a fresh clone of this
# repo, so ECC is (re)installed at the start of every remote session. This hook
# is best-effort: it never blocks session startup, even if the network or the
# clone fails.
#
# Tuning (optional environment variables):
#   ECC_REPO_URL  - override the source repository
#   ECC_REF       - pin to a branch, tag, or commit for reproducible installs
#   ECC_SKIP      - set to "1" to disable this hook entirely

set -uo pipefail

log() { echo "[ecc-install] $*" >&2; }

# Only run in Claude Code on the web (remote) sessions; never touch a local box.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  log "local session; skipping ECC install"
  exit 0
fi

if [ "${ECC_SKIP:-}" = "1" ]; then
  log "ECC_SKIP=1; skipping ECC install"
  exit 0
fi

ECC_REPO="${ECC_REPO_URL:-https://github.com/affaan-m/ECC.git}"
ECC_REF="${ECC_REF:-}"            # empty = default branch (latest)
ECC_SRC="${HOME}/.cache/ecc"
CLAUDE_HOME="${HOME}/.claude"

clone_ecc() {
  rm -rf "${ECC_SRC}"
  local base=(--depth 1)
  [ -n "${ECC_REF}" ] && base+=(--branch "${ECC_REF}")
  # Prefer a lean partial+sparse clone (skills/agents/commands only);
  # fall back to a plain shallow clone if the server/git rejects it.
  if git clone "${base[@]}" --filter=blob:none --sparse "${ECC_REPO}" "${ECC_SRC}" 2>/dev/null; then
    git -C "${ECC_SRC}" sparse-checkout set skills agents commands || return 1
  else
    rm -rf "${ECC_SRC}"
    git clone "${base[@]}" "${ECC_REPO}" "${ECC_SRC}" || return 1
  fi
}

update_ecc() {
  git -C "${ECC_SRC}" fetch --depth 1 origin "${ECC_REF:-HEAD}" || return 1
  git -C "${ECC_SRC}" reset --hard FETCH_HEAD || return 1
}

sync_ecc() {
  if [ -d "${ECC_SRC}/.git" ]; then
    update_ecc || clone_ecc || return 1
  else
    clone_ecc || return 1
  fi
}

install_ecc() {
  sync_ecc || return 1
  mkdir -p "${CLAUDE_HOME}/skills" "${CLAUDE_HOME}/agents" "${CLAUDE_HOME}/commands"
  # Skills must be direct children of ~/.claude/skills (Claude Code does not
  # recurse into nested namespaces), so copy the contents of skills/ directly.
  [ -d "${ECC_SRC}/skills" ] && cp -R "${ECC_SRC}/skills/." "${CLAUDE_HOME}/skills/"
  compgen -G "${ECC_SRC}/agents/*.md"   >/dev/null && cp "${ECC_SRC}"/agents/*.md   "${CLAUDE_HOME}/agents/"
  compgen -G "${ECC_SRC}/commands/*.md" >/dev/null && cp "${ECC_SRC}"/commands/*.md "${CLAUDE_HOME}/commands/"
  return 0
}

if install_ecc; then
  n=$(find "${CLAUDE_HOME}/skills" -maxdepth 2 -name SKILL.md 2>/dev/null | wc -l | tr -d ' ')
  log "ECC ready: ${n} skills available under ${CLAUDE_HOME}/skills"
else
  log "ECC install skipped (clone/network error); session continues without it"
fi

exit 0
