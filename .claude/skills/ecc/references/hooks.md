# Hooks

Snapshot of <https://code.claude.com/docs/en/hooks>. Hooks are the only *enforcement*
extension point: they run as configured, regardless of what Claude decides.

## Contents

- [When to reach for a hook](#when-to-reach-for-a-hook)
- [Where hooks are configured](#where-hooks-are-configured)
- [Event catalogue](#event-catalogue)
- [Matchers](#matchers)
- [Hook types](#hook-types)
- [Input JSON](#input-json)
- [Exit codes](#exit-codes)
- [Output JSON](#output-json)
- [Worked examples](#worked-examples)
- [Debugging](#debugging)

## When to reach for a hook

Use a hook when the requirement is "this must happen every time" or "this must never
happen":

- Run a formatter/linter after every edit → `PostToolUse` on `Edit|Write`
- Block a destructive command → `PreToolUse` returning `permissionDecision: "deny"`
- Inject context at session start (branch, env, ticket) → `SessionStart`
- Refuse to stop while tests fail → `Stop` returning `decision: "block"`
- Prepare a cloud session (install deps, migrate) → `Setup` with the `init` matcher

Do *not* use a hook for advice or preferences — that's CLAUDE.md or a rule. A hook that
fires constantly and prints suggestions burns tokens and trains everyone to ignore it.

## Where hooks are configured

| Location | Scope |
| --- | --- |
| `~/.claude/settings.json` | All your projects |
| `.claude/settings.json` | The project, committed |
| `.claude/settings.local.json` | The project, personal |
| Managed policy settings | Organization-wide |
| Plugin `hooks/hooks.json` | Wherever the plugin is enabled |
| Skill / agent frontmatter `hooks:` | Only while that component is active |

Structure:

```json
{
  "hooks": {
    "<EventName>": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "...", "timeout": 30 }
        ]
      }
    ]
  }
}
```

Hooks in the same block run in parallel. `disableAllHooks: true` is the kill switch;
`allowManagedHooksOnly` (managed) restricts to org-approved hooks.

## Event catalogue

| Event | Fires | Matcher |
| --- | --- | --- |
| `SessionStart` | Session begins or resumes | `startup`, `resume`, `clear`, `compact`, `fork` |
| `Setup` | Init-only / maintenance runs | `init`, `maintenance` |
| `UserPromptSubmit` | User submits a prompt | none |
| `UserPromptExpansion` | A slash command expands | command name |
| `PreToolUse` | Before a tool runs | tool name |
| `PermissionRequest` | A tool needs a permission decision | tool name |
| `PermissionDenied` | Auto-mode denied a tool | tool name |
| `PostToolUse` | After a tool succeeds | tool name |
| `PostToolUseFailure` | After a tool fails | tool name |
| `PostToolBatch` | A parallel tool batch resolves | none |
| `Stop` | Claude finishes responding | none |
| `SubagentStart` / `SubagentStop` | Subagent spawned / finished | agent type |
| `TaskCreated` / `TaskCompleted` | Task lifecycle | none |
| `TeammateIdle` | A team agent goes idle | none |
| `StopFailure` | Turn ended with an API error | `rate_limit`, `overloaded`, `authentication_failed`, … |
| `PreCompact` / `PostCompact` | Around compaction | `manual`, `auto` |
| `Notification` | Claude sends a notification | `permission_prompt`, `idle_prompt`, `auth_success`, … |
| `MessageDisplay` | While message text streams | none |
| `InstructionsLoaded` | CLAUDE.md / rules loaded | `session_start`, `nested_traversal`, `path_glob_match`, `include`, `compact` |
| `ConfigChange` | A config file changed | `user_settings`, `project_settings`, `local_settings`, `policy_settings`, `skills` |
| `CwdChanged` | Working directory changed | none |
| `DirectoryAdded` | Directory added mid-session | `slash_command`, `register_repo_root` |
| `FileChanged` | A watched file changed | literal filenames, e.g. `.envrc\|.env` |
| `WorktreeCreate` / `WorktreeRemove` | Worktree lifecycle | none |
| `Elicitation` / `ElicitationResult` | MCP server asks for user input | MCP server name |
| `SessionEnd` | Session terminates | `clear`, `resume`, `logout`, `prompt_input_exit`, `bypass_permissions_disabled`, `other` |

## Matchers

| Pattern | Behaviour |
| --- | --- |
| `"*"`, `""`, omitted | Match everything |
| Plain identifier or pipe list | Exact match: `Bash`, `Edit\|Write`, `code-reviewer` |
| Anything containing regex metacharacters | Unanchored JavaScript regex: `^Notebook`, `mcp__memory__.*` |

MCP tools are matched as `mcp__<server>__<tool>`; plugin-bundled servers as
`mcp__plugin_<plugin>_<server>__<tool>`.

An `if` field on an individual hook adds a permission-rule-style condition, e.g.
`"if": "Bash(rm *)"`, so the script only runs for matching commands.

## Hook types

**command** — the workhorse. With `args` present it's exec form (no shell); without, it
runs through the shell so pipes and `&&` work.

```json
{ "type": "command", "command": "node", "args": ["${CLAUDE_PLUGIN_ROOT}/scripts/format.js", "--fix"] }
```

**http** — POSTs the event JSON to a URL. Must match `allowedHttpHookUrls`; declare any
env vars it may interpolate via `allowedEnvVars`.

**prompt** — hands the decision to a model: `{"type": "prompt", "prompt": "Is this command safe? Input: $ARGUMENTS"}`.

**mcp_tool** — calls an MCP tool with a templated input:
`{"type": "mcp_tool", "server": "security", "tool": "scan_file", "input": {"path": "${tool_input.file_path}"}}`.

Path placeholders available in commands: `${CLAUDE_PROJECT_DIR}`,
`${CLAUDE_PLUGIN_ROOT}`, `${CLAUDE_PLUGIN_DATA}`.

## Input JSON

Delivered on stdin. Common to every event:

```json
{
  "session_id": "abc123",
  "prompt_id": "550e8400-…",
  "transcript_path": "/home/user/.claude/projects/…/transcript.jsonl",
  "cwd": "/home/user/SaaS",
  "permission_mode": "default",
  "hook_event_name": "PreToolUse",
  "effort": { "level": "medium" },
  "agent_id": "subagent-123",
  "agent_type": "security-reviewer"
}
```

`permission_mode` is one of `default`, `plan`, `acceptEdits`, `auto`, `dontAsk`,
`bypassPermissions`. `agent_id` / `agent_type` only appear in subagent contexts.

Event-specific additions:

| Event | Extra fields |
| --- | --- |
| `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PermissionRequest`, `PermissionDenied` | `tool_name`, `tool_input` (the tool's argument object), `tool_use_id` |
| `UserPromptSubmit` | `prompt`, `displayPrompt` |
| `Stop`, `SubagentStop` | `last_assistant_message` |
| `Notification` | `type`, `message` |
| `FileChanged` | `file_path`, `change_type` |

## Exit codes

| Code | Meaning |
| --- | --- |
| `0` | Success. stdout is parsed as decision JSON if it is JSON. |
| `2` | Blocking error. stderr goes to Claude; the action is blocked where the event supports it. |
| other | Non-blocking error; stderr surfaces, the action proceeds. |

Events where exit 2 actually blocks: `PreToolUse` (blocks the call),
`PermissionRequest` (denies), `UserPromptSubmit` (blocks the prompt),
`UserPromptExpansion`, `Stop` / `SubagentStop` (forces Claude to continue), `PreCompact`,
`TaskCreated` (rolls back), `TaskCompleted`, `ConfigChange` (except policy settings).

`PostToolUse` and `PostToolUseFailure` cannot block — the tool already ran — but stderr
still reaches Claude, which is how "the linter you just broke says X" feedback works.

## Output JSON

Universal fields, valid for any event:

```json
{
  "continue": false,
  "stopReason": "Build failed — fix errors before continuing",
  "suppressOutput": true,
  "systemMessage": "Warning: production environment detected"
}
```

`PreToolUse`:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "PreToolUse",
    "permissionDecision": "deny",
    "permissionDecisionReason": "Destructive command blocked",
    "updatedInput": { "command": "safer command" },
    "additionalContext": "…"
  }
}
```

`permissionDecision` accepts `allow`, `deny`, `ask`, `defer`. `updatedInput` rewrites
the tool arguments before execution — useful for injecting a `--dry-run` rather than
blocking outright.

`PostToolUse`: `{"decision": "block", "reason": "…"}` plus
`hookSpecificOutput.updatedToolOutput` / `.additionalContext`.

`Stop` / `SubagentStop` / `UserPromptSubmit`: `{"decision": "block", "reason": "…"}`
plus `hookSpecificOutput.additionalContext` for non-blocking feedback.

`SessionStart` / `Setup` / `SubagentStart` inject context only:

```json
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "Branch: feat/quotes — target dev, never main",
    "sessionTitle": "Quotes work",
    "watchPaths": [".env", "supabase/**"],
    "reloadSkills": true
  }
}
```

## Worked examples

**Block force-push, project-wide.** Committed to `.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          { "type": "command", "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/guard-git.sh" }
        ]
      }
    ]
  }
}
```

```bash
#!/usr/bin/env bash
# .claude/hooks/guard-git.sh
set -euo pipefail
command=$(jq -r '.tool_input.command // ""')

case "$command" in
  *"git push"*"--force"*|*"git push"*" -f "*)
    jq -n '{
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: "Force-push is blocked; main and dev are protected."
      }
    }'
    ;;
  *) exit 0 ;;
esac
```

Read the command from `tool_input.command` rather than matching on the matcher alone —
the matcher only tells you the tool was `Bash`.

**Lint after backend edits.** `PostToolUse` cannot block, so this is feedback, not a
gate; the non-zero exit is what puts the ruff output in front of Claude.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/ruff-changed.sh", "timeout": 60 }
        ]
      }
    ]
  }
}
```

```bash
#!/usr/bin/env bash
set -euo pipefail
file=$(jq -r '.tool_input.file_path // ""')
[[ "$file" == *.py ]] || exit 0
cd "$CLAUDE_PROJECT_DIR/backend"
uv run ruff check "$file" >&2 || exit 2
```

**Session context for cloud sessions.** `SessionStart` with `additionalContext` is
cheaper than adding the same lines to CLAUDE.md, because it only costs on sessions
where it applies.

## Debugging

- `/hooks` lists what's configured and where it came from.
- `claude --debug hooks` traces matching and execution.
- `claude -p --output-format stream-json --verbose --include-hook-events "…"` emits
  hook lifecycle events in headless runs.
- A hook that "doesn't fire" is usually a matcher problem: a regex metacharacter turns
  the whole matcher into a regex, and MCP tool names need the full `mcp__…` form.
- A hook that fires but does nothing is usually printing JSON to stderr instead of
  stdout, or exiting non-zero on an event that ignores it.
