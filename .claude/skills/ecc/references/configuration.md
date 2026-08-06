# Configuration: settings, permissions, memory

Snapshot of <https://code.claude.com/docs/en/settings>, `/permissions`, and
<https://code.claude.com/docs/en/memory>. Verify against the live docs when a detail
decides a design.

## Contents

- [Settings files and precedence](#settings-files-and-precedence)
- [Notable settings keys](#notable-settings-keys)
- [Permission rules](#permission-rules)
- [Environment variables](#environment-variables)
- [CLAUDE.md](#claudemd)
- [.claude/rules](#claude-rules)
- [Auto memory](#auto-memory)
- [Debugging config](#debugging-config)

## Settings files and precedence

| Scope | Location | Applies to | Committed? |
| --- | --- | --- | --- |
| Managed | `/etc/claude-code/managed-settings.json` (Linux/WSL), plist on macOS, registry on Windows | Everyone on the machine / in the org | IT-deployed |
| User | `~/.claude/settings.json` | You, every project | No |
| Project | `.claude/settings.json` | Everyone in the repo | Yes |
| Local | `.claude/settings.local.json` | You, this repo | No (gitignored) |

Precedence, highest first: **managed → CLI arguments → local → project → user.**

Permission rules are the exception: they *merge* across scopes instead of overriding,
and `deny` beats `ask` beats `allow` no matter which file it came from.

`allow` rules in a committed `.claude/settings.json` only take effect after you accept
the workspace-trust dialog. `settings.local.json` rules don't need it — that's the
security boundary between "a file someone pushed" and "a file you wrote".

Editing `permissions`, `hooks` and credential helpers hot-reloads; `model` and
`outputStyle` are read at session start.

Add `"$schema": "https://json.schemastore.org/claude-code-settings.json"` for editor
autocomplete.

## Notable settings keys

Not exhaustive — the full table is in the docs. These are the ones that come up.

**Model and effort**

| Key | Meaning |
| --- | --- |
| `model` | Session model, read at start; switch live with `/model` |
| `fallbackModel` | Up to 3 fallbacks when the primary is overloaded |
| `effortLevel` | `low` \| `medium` \| `high` \| `xhigh`, persisted across sessions |
| `availableModels` / `enforceAvailableModels` | Restrict which models may be selected |
| `alwaysThinkingEnabled` | Extended thinking on by default |
| `fastMode` | Faster output on the same Opus model — not a smaller model |

**Context**

| Key | Meaning |
| --- | --- |
| `autoCompactEnabled` (default `true`) | Compact automatically near the context limit |
| `autoCompactWindow` | Token threshold (100k–1M) that triggers compaction |
| `claudeMdExcludes` | Globs/absolute paths of CLAUDE.md files to skip — useful in monorepos |
| `autoMemoryEnabled` (default `true`) / `autoMemoryDirectory` | Auto memory on/off and where it lives |

**Permissions and safety**

| Key | Meaning |
| --- | --- |
| `permissions.allow` / `.ask` / `.deny` | Rule lists, see below |
| `permissions.disableAutoMode` | Prevent auto mode from being turned on |
| `disableAllHooks` | Kill switch for all hooks and the custom status line |
| `allowedHttpHookUrls` | Allowlist of URL patterns HTTP hooks may target (`*` wildcard) |
| `sandbox.credentials` | Mask (`mask`) or block (`deny`) files and env vars inside the sandbox |

**MCP and plugins**

| Key | Meaning |
| --- | --- |
| `enableAllProjectMcpServers` | Auto-approve every server in `.mcp.json` |
| `enabledMcpjsonServers` / `disabledMcpjsonServers` | Approve or reject specific `.mcp.json` servers |
| `disableClaudeAiConnectors` | Don't auto-fetch claude.ai MCP connectors |

**Environment and git**

| Key | Meaning |
| --- | --- |
| `env` | Object of env vars applied to every session and subprocess |
| `defaultShell` | `bash` (default) or `powershell` for `!` commands |
| `attribution.commit` / `attribution.pr` | Customize or blank out the git/PR attribution footer |
| `cleanupPeriodDays` (default 30) | Age cutoff for deleting session files |

### Example project settings

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(uv run pytest *)",
      "Bash(uv run ruff *)",
      "Bash(pnpm lint)",
      "Bash(git status)",
      "Bash(git diff *)"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Bash(git push --force *)"
    ]
  },
  "env": {
    "PYTHONDONTWRITEBYTECODE": "1"
  }
}
```

## Permission rules

Format is `ToolName(pattern)`; a bare `ToolName` matches every use of that tool.

- `Bash(npm run test *)` — prefix match on the command string. Note this matches the
  *literal command text*, so `Bash(git push)` does not cover `git push --force`; write
  the deny rule you actually need rather than assuming the allow rule is tight.
- `Read(./src/**)`, `Write(./docs/**)` — glob paths, `*` within a segment, `**` across.
- `Read(./.env)`, `Read(./secrets/**)` — the standard secret guards.
- MCP tools use their full callable name: `mcp__github__create_pull_request`, or
  `mcp__github__*` for a whole server. Plugin-bundled servers are
  `mcp__plugin_<plugin>_<server>__<tool>` — a matcher against the bare server key
  never fires for them.

Three lists:

- `allow` — runs without prompting.
- `ask` — prompts even in modes that would otherwise auto-approve.
- `deny` — blocked outright; wins over everything, including managed `allow`.

Deny rules are the enforcement layer for "never read the production `.env`" style
requirements. A line in CLAUDE.md is not.

Permission modes (`--permission-mode`, or cycle in-session): `default`, `plan`,
`acceptEdits`, `auto`, `dontAsk`, `bypassPermissions`, `manual`.

`/permissions` opens the editor; `/fewer-permission-prompts` scans your transcripts and
proposes an allowlist from what you actually approved.

## Environment variables

| Variable | Effect |
| --- | --- |
| `CLAUDE_CODE_MODEL` | Override the model for one session |
| `CLAUDE_CODE_EFFORT_LEVEL` | Override effort for one session |
| `MAX_THINKING_TOKENS` | Cap thinking tokens (`0` disables) |
| `DISABLE_AUTO_COMPACT` | Turn off auto-compaction |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | Turn off auto memory |
| `CLAUDE_CODE_DISABLE_BUNDLED_SKILLS` | Drop the bundled skills |
| `CLAUDE_CODE_DISABLE_EXPLORE_PLAN_AGENTS` | Remove the built-in Explore/Plan subagents |
| `CLAUDE_AGENT_SDK_DISABLE_BUILTIN_AGENTS` | Same, for headless/SDK runs |
| `CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD` | Also load CLAUDE.md from `--add-dir` directories |
| `CLAUDE_CODE_ENABLE_TELEMETRY` + `OTEL_*` | OpenTelemetry export |
| `DISABLE_AUTOUPDATER` | Pin the installed version |
| `NO_COLOR` / `FORCE_COLOR` | Colour control |

Set per-project values through `env` in settings rather than shell profiles, so they
apply to subprocesses and hooks too.

## CLAUDE.md

Load order, broadest to narrowest — all discovered files are concatenated, not
overridden:

| Scope | Path |
| --- | --- |
| Managed policy | `/etc/claude-code/CLAUDE.md` (Linux/WSL), `/Library/Application Support/ClaudeCode/CLAUDE.md` (macOS), `C:\Program Files\ClaudeCode\CLAUDE.md` |
| User | `~/.claude/CLAUDE.md` |
| Project | `./CLAUDE.md` or `./.claude/CLAUDE.md` |
| Local | `./CLAUDE.local.md` (gitignore it) |

Claude walks *up* the tree from the working directory and loads every `CLAUDE.md` and
`CLAUDE.local.md` it finds, root-first. Files in *sub*directories load lazily, when
Claude first reads a file there.

Writing rules that actually get followed:

- **Under 200 lines.** Longer files cost context every turn and adherence drops.
- **Specific and checkable**: "Run `make lint` before committing", not "test properly".
- **No contradictions.** Two conflicting lines mean Claude picks one arbitrarily.
- CLAUDE.md is delivered as context, not enforcement. If it *must* happen, use a hook.

`@path/to/file` imports another file (relative paths resolve against the importing
file, max 4 hops deep, backticks escape it). Imports still load at launch — they
organise, they don't save context. An import resolving outside the project triggers a
one-time approval dialog.

`AGENTS.md`: Claude Code doesn't read it. Create a `CLAUDE.md` containing `@AGENTS.md`,
or symlink.

Project-root CLAUDE.md is re-injected after `/compact`; nested files and path-scoped
rules are not — they reload when a matching file is next read.

`/init` generates a starting CLAUDE.md from the codebase; `/memory` opens the files;
`/context` shows which ones actually loaded.

## .claude/rules

Markdown files in `.claude/rules/` (discovered recursively, user-level equivalent in
`~/.claude/rules/`). Rules without frontmatter load at launch alongside
`.claude/CLAUDE.md`. Rules with `paths:` load only when Claude touches a matching file:

```markdown
---
paths:
  - "backend/**/*.py"
---

# Backend rules

- Async SQLAlchemy sessions only; no sync engine.
- Every query filters on `company_id` — RLS is a backstop, not the primary guard.
- Run `uv run ruff check --fix` and `uv run pytest` before proposing a diff.
```

Patterns support globs and brace expansion (`src/**/*.{ts,tsx}`). This is the right
home for per-package guidance in this monorepo: `backend/**`, `web/**`, `mobile/**`,
`supabase/**` each get their own file instead of one bloated CLAUDE.md.

Symlinks work, so a shared rules directory can be linked into several repos.

## Auto memory

Claude writes its own notes to `~/.claude/projects/<project>/memory/`, keyed by git
repo (shared across worktrees, never across machines). `MEMORY.md` is an index: only
its first 200 lines / 25 KB load each session; topic files are read on demand.

It's plain markdown — read, edit or delete it. `/memory` opens the folder. Disable per
project with `"autoMemoryEnabled": false`.

Auto memory is *not* inherited by subagents (except forks). A subagent can keep its own
via its `memory` field.

## Debugging config

| Command | Answers |
| --- | --- |
| `/context` | Which memory files and rules actually loaded |
| `/status` | Which settings sources are active |
| `/doctor` | Install and settings diagnostics; lists stripped invalid entries |
| `claude --debug "api,mcp"` | Category-filtered debug logging |
| `InstructionsLoaded` hook | Log exactly which instruction files load, when and why |

Managed settings parse tolerantly: invalid entries are stripped with a warning rather
than failing the whole file, so one typo can't disable every policy. `claude doctor`
lists what got stripped.
