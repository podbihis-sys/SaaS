# Subagents and background agents

Snapshot of <https://code.claude.com/docs/en/sub-agents>.

## Contents

- [What a subagent buys you](#what-a-subagent-buys-you)
- [Built-in subagents](#built-in-subagents)
- [Custom subagent files](#custom-subagent-files)
- [Frontmatter](#frontmatter)
- [What loads into a subagent](#what-loads-into-a-subagent)
- [Restricting delegation](#restricting-delegation)
- [Background agents](#background-agents)

## What a subagent buys you

A subagent runs in its own context window with its own system prompt, tool set and
permissions, and returns only its final message. Use one when a side task would
otherwise flood the main conversation with search results, logs or file dumps you'll
never reference again.

Concretely it gives you:

- **Context preservation** — exploration output stays out of the main window
- **Constraint enforcement** — a read-only agent physically cannot edit
- **Reuse** — the same worker configuration across projects
- **Cost control** — route mechanical work to a cheaper model

It costs a round trip and a fresh context that knows nothing about your conversation.
For a two-file lookup, searching directly is faster. Delegate when the answer is worth
more than the file dumps that produce it.

## Built-in subagents

| Agent | Model | Tools | Use |
| --- | --- | --- | --- |
| `Explore` | Inherits the session model (capped at Opus on the Claude API) | Read-only; Write/Edit denied | File discovery, code search, broad sweeps |
| `Plan` | Inherits | Read-only | Codebase research during plan mode |
| `general-purpose` | Inherits | All subagent tools | Multi-step work needing both research and changes |
| `claude` | Inherits | All subagent tools | Catch-all; the default for dispatched background sessions |
| `statusline-setup` | Sonnet | Read, Edit | `/statusline` |
| `claude-code-guide` | Haiku | Read-only + web | Questions about Claude Code features |

Explore and Plan deliberately skip CLAUDE.md and the parent's git status to stay fast
and cheap. Every other agent loads both.

When invoking Explore, state a thoroughness level: **quick** for a targeted lookup,
**medium** for balanced, **very thorough** for multiple locations and naming
conventions. Defining your own `Explore` agent overrides the built-in — that's the way
to pin it to `model: haiku`.

## Custom subagent files

Markdown with YAML frontmatter, in `.claude/agents/` (project) or `~/.claude/agents/`
(personal). Project wins on a name clash.

```markdown
---
name: rls-auditor
description: Audits multi-tenant isolation — checks that queries and RLS policies filter on company_id. Use before merging changes under backend/app/ or supabase/.
tools: Read, Grep, Glob
model: sonnet
---

You audit tenant isolation in a multi-tenant SaaS.

For every data-access path you inspect, establish three things:

1. Does the SQLAlchemy query filter on `company_id`, or does it rely on RLS alone?
2. Does the corresponding Postgres policy in `supabase/` cover SELECT, INSERT,
   UPDATE and DELETE?
3. Can the endpoint's `company_id` come from user input rather than the verified JWT?

Report each finding as: file:line, what breaks, and the concrete input that would
leak data across tenants. If you cannot construct that input, say so instead of
reporting the finding — speculative isolation bugs waste more review time than they
save.
```

`/agents` no longer opens a creation wizard; write the file, or ask Claude to.

## Frontmatter

| Field | Purpose |
| --- | --- |
| `name` | Identifier used to invoke and to match `SubagentStart`/`SubagentStop` hooks |
| `description` | When Claude should delegate here — the trigger, same as for skills |
| `tools` | Allowlist; omit to inherit everything available to subagents |
| `model` | `haiku`, `sonnet`, `opus`, a full model ID, or `inherit` |
| `memory` | Give the subagent its own persistent auto memory directory |
| `hooks` | Hooks scoped to this agent's lifecycle |

The `tools` list is the enforcement: a research agent with `Read, Grep, Glob` cannot
write, whatever its prompt says or a prompt injection asks.

## What loads into a subagent

Loaded: CLAUDE.md and project rules (except for Explore and Plan), the tool set,
the system prompt.

**Not** loaded: the main conversation's auto memory, and the conversation itself. A
subagent starts blind — the task prompt must carry every fact it needs. The exception
is a fork, which inherits the parent conversation and system prompt.

Its final message *is* the return value; it isn't shown to the user. Relay what
matters.

## Restricting delegation

```json
{
  "permissions": {
    "deny": ["Agent(general-purpose)"]
  }
}
```

Deny the `Agent` tool entirely to stop all delegation. `CLAUDE_CODE_DISABLE_EXPLORE_PLAN_AGENTS=1`
removes just Explore and Plan (Claude then reads files directly);
`CLAUDE_AGENT_SDK_DISABLE_BUILTIN_AGENTS=1` removes all built-ins in headless/SDK runs
so only your own remain.

`--agents '{"reviewer": {"description": "…", "prompt": "…"}}'` defines agents inline for
one run — handy in CI where you don't want to commit an agent file.
`--append-subagent-system-prompt` appends text to every subagent's system prompt.

## Background agents

Different mechanism: background agents are whole sessions, not sub-tasks inside one.

| Command | Effect |
| --- | --- |
| `claude --bg "investigate the flaky quote test"` | Start a background session, return immediately |
| `claude agents` | Monitor and dispatch parallel sessions (`--json` for scripting) |
| `claude attach <id>` | Attach to one |
| `claude logs <id>` | Print its output |
| `claude stop <id>` / `respawn` / `rm` | Lifecycle |
| `/background` | Detach the current session |
| `/tasks` | List background work including subagents |

A dispatched background session runs as the `claude` agent with your *settings'*
permission mode, not a parent conversation's — check that before dispatching anything
that writes. `disableAgentView: true` turns the whole feature off.
