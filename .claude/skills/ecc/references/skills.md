# Skills and slash commands

Snapshot of <https://code.claude.com/docs/en/skills>. Custom commands have been merged
into skills: `.claude/commands/deploy.md` and `.claude/skills/deploy/SKILL.md` both
produce `/deploy` and behave the same. Skills add a directory for supporting files and
richer frontmatter.

## Contents

- [Why a skill](#why-a-skill)
- [Where skills live](#where-skills-live)
- [Anatomy](#anatomy)
- [Frontmatter reference](#frontmatter-reference)
- [String substitutions](#string-substitutions)
- [Command names](#command-names)
- [Writing skills that work](#writing-skills-that-work)
- [Running a skill in a subagent](#running-a-skill-in-a-subagent)
- [Restricting skills](#restricting-skills)
- [Troubleshooting](#troubleshooting)

## Why a skill

Write one when you keep pasting the same checklist or procedure into chat, or when a
section of CLAUDE.md has turned from a fact into a process. The decisive property: a
skill's body loads **only when used**, so a 400-line reference costs nothing until it's
needed — unlike CLAUDE.md, which is paid for every turn of every session.

## Where skills live

| Level | Path | Applies to |
| --- | --- | --- |
| Enterprise | managed settings location | Everyone in the org |
| Personal | `~/.claude/skills/<name>/SKILL.md` | All your projects |
| Project | `.claude/skills/<name>/SKILL.md` | This repo |
| Plugin | `<plugin>/skills/<name>/SKILL.md` | Wherever the plugin is enabled |

Same name at several levels: enterprise > personal > project, and any of them overrides
a bundled skill of that name. Plugin skills are namespaced `plugin:skill`, so they
never collide.

Nested `.claude/skills/` directories below the working directory also load — when
Claude touches a file in `web/`, skills from `web/.claude/skills/` become available.
On a name clash the nested one appears as `web:deploy`. That's the mechanism to use in
this monorepo when a procedure only makes sense for one package.

For cloud/Cowork sessions, commit the skill to the repo's `.claude/skills/` (or ship it
in a repo-declared plugin) — a skill enabled only in your personal settings does not
travel.

## Anatomy

```
.claude/skills/my-skill/
├── SKILL.md          # required: frontmatter + instructions
├── references/       # docs loaded on demand
├── scripts/          # executables the skill tells Claude to run
└── assets/           # templates, fonts, icons used in output
```

Three loading levels, and designing for them is most of the craft:

1. **name + description** — always in context. Keep it tight, make it triggerable.
2. **SKILL.md body** — loaded whenever the skill fires. Aim under 500 lines.
3. **Bundled files** — read only when the body points at them. Effectively unlimited.

So: put routing in the body, put bulk in `references/`, and say clearly *when* to read
each reference file. A body that inlines everything defeats the point.

## Frontmatter reference

All fields optional; `description` is what makes the skill fire.

| Field | Purpose |
| --- | --- |
| `name` | Display label in listings. For personal/project skills the *command* still comes from the directory name |
| `description` | What it does and when to use it. Put the key use case first — `description` + `when_to_use` is truncated at 1,536 characters |
| `when_to_use` | Extra trigger phrases and example requests, appended to `description` |
| `argument-hint` | Autocomplete hint, e.g. `[issue-number]` |
| `arguments` | Named positional arguments for `$name` substitution |
| `disable-model-invocation` | `true` = only you can invoke it with `/name`; Claude won't load it on its own |
| `user-invocable` | `false` = hidden from the `/` menu; background knowledge only |
| `allowed-tools` | Tools pre-approved for the turn that invokes the skill; clears on your next message |
| `disallowed-tools` | Tools removed from the pool while the skill is active |
| `model` | Model override for the rest of the turn (`inherit` to keep the current one) |
| `effort` | `low` \| `medium` \| `high` \| `xhigh` \| `max` while active |
| `context` | `fork` runs the skill in a forked subagent |
| `agent` | Which subagent type to use with `context: fork` |
| `background` | With `context: fork`, `false` waits for the result in the same turn |
| `hooks` | Hooks scoped to this skill's lifecycle |
| `paths` | Globs limiting when Claude auto-loads the skill |
| `shell` | `bash` (default) or `powershell` for inline `` !`…` `` blocks |
| `metadata` | Free-form map for your own tooling; Claude Code ignores it |
| `license`, `compatibility` | Agent Skills spec fields; accepted, not acted on |

Booleans accept `yes`/`no`/`on`/`off`/`1`/`0` as well as `true`/`false`.

**Distributing outside Claude Code** (claude.ai upload, Skills API, `package_skill.py`)
allows only six fields: `name`, `description`, `license`, `compatibility`, `metadata`,
`allowed-tools`. Anything else is a hard error at packaging time, so a skill meant to
travel should stick to those.

## String substitutions

| Variable | Expands to |
| --- | --- |
| `$ARGUMENTS` | Everything passed after `/skill-name` |
| `$ARGUMENTS[N]` / `$N` | One argument, 0-based; shell-style quoting |
| `$name` | Named argument declared in `arguments` |
| `${CLAUDE_SESSION_ID}` | Current session ID |
| `${CLAUDE_EFFORT}` | Active effort level |
| `${CLAUDE_SKILL_DIR}` | Directory containing this `SKILL.md` |
| `${CLAUDE_PROJECT_DIR}` | Project root |

If `$ARGUMENTS` doesn't appear in the body, arguments are appended as
`ARGUMENTS: <value>`. Escape a literal with a backslash: `\$1.00`.

`${CLAUDE_SKILL_DIR}` is substituted in both the body and `allowed-tools` Bash rules,
which is how a skill runs its own bundled script without a prompt:

```yaml
---
name: render-chart
description: Render a chart from a CSV file
allowed-tools: Bash(${CLAUDE_SKILL_DIR}/scripts/render.sh *)
---

Run `${CLAUDE_SKILL_DIR}/scripts/render.sh <csv-file>` to render the chart.
```

Inline shell (`` !`command` ``) and ` ```! ` blocks execute at expansion time and inject
their output — useful for `!`git status --short`` style context. `@file` references
pull file contents in.

## Command names

| Layout | Command comes from |
| --- | --- |
| `.claude/skills/deploy-staging/SKILL.md` | Directory name → `/deploy-staging` |
| Nested with a clash: `web/.claude/skills/deploy/` | `/web:deploy` |
| `.claude/commands/deploy.md` | File name → `/deploy` |
| `plugin/skills/review/SKILL.md` | `/plugin:review`, or frontmatter `name` for the last segment |
| `plugin/SKILL.md` (plugin root) | Frontmatter `name`, falling back to the plugin directory name |

For personal and project skills the frontmatter `name` is a display label only — it
does not change the command. Renaming the directory does.

## Writing skills that work

- **The description is the trigger.** Everything about *when* belongs there, not in the
  body — the body isn't in context at decision time. Claude under-triggers skills by
  default, so name concrete phrases and situations rather than being tastefully vague.
- **Imperative voice.** "Run the migration, then verify with X" beats "you might
  consider…".
- **Explain why.** Rules with reasons survive situations the author didn't foresee; a
  wall of MUST/NEVER just gets pattern-matched around. If you're writing ALL CAPS, the
  instruction probably needs a reason instead of volume.
- **Show the output shape** when the format matters — a template block beats prose.
- **Don't over-fit.** A skill tuned to three examples is useless on the fourth. Write
  the general procedure, use examples as illustration.
- **Bundle the script.** If every run of a skill has Claude writing the same helper,
  write it once into `scripts/` and point at it.

`/verify` and `/code-review` are worth reading as examples of bundled skills.

## Running a skill in a subagent

`context: fork` runs the skill in a forked subagent — it inherits the conversation but
keeps its output out of the main context. Pair with `agent:` to pick the type and
`background: false` when you need the result inside the same turn. Good for long
read-heavy procedures (audits, sweeps); pointless for short ones, where the fork
overhead exceeds the context saved.

## Restricting skills

Permission rules apply to skills too:

```json
{
  "permissions": {
    "deny": ["Skill(dangerous-skill)"],
    "allow": ["Skill(deploy)", "Skill(ecc)"]
  }
}
```

`disableBundledSkills` drops the built-in ones; `disableSkillShellExecution` turns off
inline `` !`…` `` execution; `--disable-slash-commands` kills all of them for a run.

## Troubleshooting

**Not triggering.** Almost always the description. Add the phrasings users actually
type, name the file types and situations, and check the combined
`description` + `when_to_use` isn't past 1,536 characters — the tail gets cut. Also
confirm the skill is where you think: `/` should list it, and a project skill needs the
repo root as the working directory (or a nested path that matches).

**Triggering too often.** Narrow the description, add `paths`, or set
`disable-model-invocation: true` so it's manual-only.

**Loads but doesn't do the right thing.** Usually the body is too long or too abstract.
Split reference material out and leave a clear routing table behind.

The `skill-creator` skill runs an evaluation loop — test prompts with and without the
skill, graded — when a skill is worth tuning properly.
