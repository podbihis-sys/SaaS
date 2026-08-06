---
name: ecc
description: >-
  Everything Claude Code — the reference for configuring, extending and automating
  Claude Code itself. Use this whenever the task touches Claude Code's own machinery
  rather than the SaaS product code — writing or debugging hooks, settings.json and
  permissions, CLAUDE.md and .claude/rules, skills and slash commands, subagents and
  background agents, MCP servers, plugins and marketplaces, headless and CI runs, or
  the CLI flags. Also use it when someone asks how to make Claude do something
  automatically, why their hook or skill or rule isn't firing, how to stop the
  permission prompts, or wants to add anything under .claude/ in this repo.
when_to_use: >-
  Triggered by mentions of hooks, settings.json, permissions, CLAUDE.md,
  .claude/rules, skills, SKILL.md, slash commands, subagents, agents, MCP, .mcp.json,
  plugins, marketplaces, headless mode, claude -p, CI automation with Claude, or any
  file under .claude/.
---

# ECC — Everything Claude Code

This skill is the project's map of Claude Code itself: how it loads configuration,
which extension point solves which problem, and where the exact syntax lives.

Claude Code has many extension points that look interchangeable but are not. Picking
the wrong one is the single most common failure — people write a CLAUDE.md rule and
expect enforcement, or build a hook where a skill belongs. Start with the decision
table, then read only the reference file you need.

## Pick the right mechanism first

| You want to… | Use | Why |
| --- | --- | --- |
| State a fact every session must know (build commands, layout, conventions) | `CLAUDE.md` | Loaded at launch, always in context, costs tokens every turn |
| Scope guidance to certain files (`backend/**`, `*.tsx`) | `.claude/rules/*.md` with `paths:` frontmatter | Loads only when Claude touches matching files |
| Package a repeatable procedure or long reference | Skill (`.claude/skills/<name>/SKILL.md`) | Body loads on demand, so length is nearly free until used |
| **Guarantee** something happens (block a command, run a linter after every edit) | Hook | The only enforcement layer; runs regardless of what Claude decides |
| Keep noisy exploration out of the main context | Subagent (`.claude/agents/<name>.md`) | Own context window, own tool restrictions |
| Connect an external system (DB, tracker, API) | MCP server | Real tools instead of pasted output |
| Ship several of the above together to many repos | Plugin + marketplace | One install, versioned |
| Reduce permission prompts | `permissions.allow` in settings | Rules merge across scopes; deny always wins |

The key distinction: **CLAUDE.md and skills are context — Claude may or may not follow
them. Hooks and permissions are configuration — the client enforces them.** If a rule
must never be violated, it belongs in a hook or a deny rule, not in prose.

## Reference files

Read the one that matches the task; they are self-contained.

| File | Covers |
| --- | --- |
| `references/configuration.md` | settings.json scopes & precedence, every notable key, permission rule syntax, env vars, CLAUDE.md / `.claude/rules` / auto memory |
| `references/hooks.md` | All hook events, matcher semantics, JSON input/output, exit codes, hook types (command/http/prompt/mcp_tool), worked examples |
| `references/skills.md` | SKILL.md anatomy, full frontmatter reference, string substitutions, naming rules, progressive disclosure, triggering troubleshooting |
| `references/agents.md` | Built-in subagents, custom agent files, tool restriction, background agents, when delegation pays off |
| `references/mcp.md` | Transports, scopes, `.mcp.json`, authentication, tool naming (`mcp__server__tool`), permissions for MCP tools |
| `references/plugins.md` | Plugin layout, `plugin.json`, marketplaces, `claude plugin` CLI, `skills-dir` plugins |
| `references/cli.md` | Every CLI command and flag, headless/print mode, output formats, CI patterns |
| `references/commands.md` | Built-in slash commands and bundled skills, one line each |

## How to work on Claude Code config

1. **Find out what's actually loaded before changing anything.** `/context` lists the
   memory files in play, `/status` shows which settings sources loaded, `/doctor`
   reports stripped or invalid entries. Most "my config doesn't work" reports are a
   file in the wrong place, not a wrong value.
2. **Change the narrowest scope that solves it.** Local (`settings.local.json`) for
   personal experiments, project (`settings.json`) once it should apply to the team.
   Permission rules merge across scopes rather than replacing each other.
3. **Verify by observation, not by assertion.** Hooks: run the triggering action and
   check it fired (`claude --debug hooks`). Skills: check the skill appears in `/` and
   actually loads. Rules: `/context` after touching a matching file. Saying "this
   should now work" without a run is how broken config gets committed.
4. **Prefer reversible.** Hooks with exit code 2 and `permissions.deny` can lock a
   session out of its own tooling. Test blocking hooks on a throwaway command first.

## Conventions in this repo

Everything Claude Code-related lives under `.claude/` at the repo root and is
committed, so the whole team gets the same setup:

```
.claude/
├── settings.json        # shared: permissions, hooks, env — safe to commit
├── settings.local.json  # personal, gitignored — never commit
├── skills/<name>/SKILL.md
├── agents/<name>.md
└── rules/<topic>.md     # path-scoped guidance
```

When adding anything here:

- **Keep secrets out.** `.claude/settings.json` is committed. Tokens go in the
  environment; reference them from hooks via `$VAR`, never inline. This repo already
  keeps credentials in `.env` (see `.env.example`) — follow that.
- **Match the monorepo.** The repo is `backend/` (FastAPI, uv, ruff, pytest), `web/`
  (Next.js, pnpm), `mobile/` (Expo), `shared/`, `supabase/`. A rule or hook that only
  concerns one of them should be path-scoped, not global — a `ruff` hook firing on
  `web/**` edits is just noise.
- **Respect the branch policy.** `main` and `dev` are protected (see README). Any
  automation that commits or pushes must target a feature branch.
- **Cross-check against the live docs** at <https://code.claude.com/docs> when a
  detail matters. Claude Code ships frequently and the reference files here are a
  snapshot; flags and fields do get added. When docs and this skill disagree, the
  docs win — and update the reference file in the same change.
