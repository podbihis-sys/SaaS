# CLI and headless mode

Snapshot of <https://code.claude.com/docs/en/cli-reference>.

## Contents

- [Commands](#commands)
- [Print / headless mode](#print--headless-mode)
- [Sessions](#sessions)
- [Permissions and tools](#permissions-and-tools)
- [Model and effort](#model-and-effort)
- [Context and prompts](#context-and-prompts)
- [MCP and plugins](#mcp-and-plugins)
- [Worktrees and background](#worktrees-and-background)
- [Debugging](#debugging)
- [CI patterns](#ci-patterns)

## Commands

| Command | Purpose |
| --- | --- |
| `claude` | Interactive session |
| `claude "query"` | Interactive, with an opening prompt |
| `claude -p "query"` | Headless: answer and exit |
| `claude -c` / `-c -p "query"` | Continue the most recent conversation |
| `claude -r "<session>" "query"` | Resume by ID or name |
| `claude update` / `install [version]` | Update / (re)install the native binary |
| `claude auth login\|logout\|status` | Authentication |
| `claude setup-token` | Long-lived OAuth token for automation |
| `claude doctor` | Installation and settings diagnostics |
| `claude mcp …` | MCP server management |
| `claude plugin …` | Plugin management |
| `claude agents` | Monitor and dispatch parallel sessions |
| `claude attach\|logs\|stop\|respawn\|rm <id>` | Background session lifecycle |
| `claude daemon status\|stop --any` | Background supervisor |
| `claude project purge [path] [--dry-run]` | Delete local Claude Code state for a project |
| `claude ultrareview [target] [--json]` | Non-interactive deep review |

## Print / headless mode

| Flag | Effect |
| --- | --- |
| `-p`, `--print` | Non-interactive |
| `--output-format text\|json\|stream-json` | Response shape |
| `--input-format text\|stream-json` | Input shape |
| `--json-schema '<schema>'` | Force output validated against a JSON Schema |
| `--max-turns N` | Cap agentic turns |
| `--max-budget-usd N` | Stop after a dollar spend |
| `--no-session-persistence` | Don't write the session to disk |
| `--verbose` | Full turn-by-turn output |
| `--include-partial-messages` | Partial streaming events |
| `--include-hook-events` | Hook lifecycle events in the stream |
| `--forward-subagent-text` | Emit subagent text and thinking |
| `--replay-user-messages` | Echo stdin user messages on stdout |
| `--init` / `--init-only` / `--maintenance` | Run `Setup` (and `SessionStart`) hooks; `--init-only` exits after |

Piping works: `cat logs.txt | claude -p "explain the failure"`.

`--json-schema` is the reliable way to get machine-readable output — parsing prose out
of `text` mode breaks the first time the wording changes.

## Sessions

| Flag | Effect |
| --- | --- |
| `-c`, `--continue` | Most recent conversation |
| `-r`, `--resume <id\|name>` | Specific session |
| `--fork-session` | New session ID when resuming, leaving the original intact |
| `--session-id <uuid>` | Pin the session ID |
| `-n`, `--name` | Display name |
| `--from-pr <n>` | Filter sessions linked to a PR |

## Permissions and tools

| Flag | Effect |
| --- | --- |
| `--permission-mode <mode>` | `default`, `acceptEdits`, `plan`, `auto`, `dontAsk`, `bypassPermissions`, `manual` |
| `--dangerously-skip-permissions` | Same as `bypassPermissions` |
| `--allow-dangerously-skip-permissions` | Add it to the mode cycle without starting there |
| `--allowedTools` / `--disallowedTools` | Rule lists, same syntax as settings |
| `--tools "Bash,Edit,Read"` | Restrict which built-in tools exist at all |
| `--permission-prompt-tool <mcp-tool>` | Delegate permission prompts to an MCP tool |

`--dangerously-skip-permissions` in CI means anything the model decides to run, runs.
Prefer an explicit `--allowedTools` list plus `--tools`; a sandboxed container is not a
substitute for either when the container holds credentials.

## Model and effort

| Flag | Effect |
| --- | --- |
| `--model <alias\|id>` | e.g. `claude-opus-5`, `claude-sonnet-5`, `claude-haiku-4-5-20251001` |
| `--effort low\|medium\|high\|xhigh\|max\|ultracode` | Reasoning effort |
| `--fallback-model sonnet,haiku` | Fallbacks when the primary is unavailable |
| `--advisor <model>` | Server-side advisor tool |
| `--autocompact <auto\|500k>` | Auto-compact window for this session |
| `--betas <name>` | Beta headers |

## Context and prompts

| Flag | Effect |
| --- | --- |
| `--add-dir ../lib ../shared` | Extra working directories |
| `--settings ./settings.json` | Settings file or inline JSON |
| `--setting-sources user,project` | Which settings layers to load |
| `--append-system-prompt` / `--append-system-prompt-file` | Add to the system prompt |
| `--system-prompt` / `--system-prompt-file` | Replace it entirely |
| `--agents '<json>'` | Define subagents inline |
| `--append-subagent-system-prompt` | Append to every subagent's system prompt |

CLAUDE.md from `--add-dir` directories is skipped unless
`CLAUDE_CODE_ADDITIONAL_DIRECTORIES_CLAUDE_MD=1`.

## MCP and plugins

`--mcp-config <file|json>`, `--strict-mcp-config` (use only those),
`--plugin-dir <path>`, `--plugin-url <url>`, `--channels <server>`.

## Worktrees and background

`-w`, `--worktree <name>` starts in an isolated git worktree; `--tmux` adds a tmux
session. `--bg` / `--background` dispatches a background agent and returns immediately;
`--exec 'pytest -x'` runs a shell command as a PTY-backed background job.

## Debugging

| Flag | Effect |
| --- | --- |
| `--debug "api,mcp"` | Debug logging, optionally category-filtered |
| `--debug-file <path>` | Write debug logs to a file |
| `--bare` | Skip auto-discovery of customizations |
| `--safe-mode` | Start with all customizations disabled |
| `--disable-slash-commands` | No skills or commands |
| `-v`, `--version` | Version |

`--safe-mode` is the fastest way to answer "is my own config breaking this?" — if the
problem disappears, it's yours.

## CI patterns

Authenticate with a token from `claude setup-token` (as a repository secret), then:

```bash
claude -p "Review the diff against dev for tenant-isolation regressions." \
  --output-format json \
  --json-schema "$(cat .github/review-schema.json)" \
  --allowedTools "Read" "Grep" "Glob" "Bash(git diff *)" \
  --max-turns 12 \
  --max-budget-usd 2.00
```

Worth keeping in mind for automated runs:

- Set `--max-turns` and `--max-budget-usd`. An agent that loops on a broken build is
  the expensive failure mode.
- Use `--strict-mcp-config` so the CI run doesn't inherit whatever servers a developer
  configured.
- `--output-format stream-json --verbose` gives per-tool events, which is what you want
  in build logs when a run misbehaves.
- The Agent SDK (`@anthropic-ai/claude-agent-sdk`,
  `claude-agent-sdk` for Python) is the better fit once the automation needs real
  control flow rather than one prompt. See <https://code.claude.com/docs/en/agent-sdk/overview>.
