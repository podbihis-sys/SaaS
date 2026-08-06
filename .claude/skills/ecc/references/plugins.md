# Plugins and marketplaces

Snapshot of <https://code.claude.com/docs/en/plugins-reference>. A plugin is a
self-contained directory bundling skills, agents, hooks, MCP servers and more, so a
setup can be installed and versioned instead of copy-pasted between repos.

## Contents

- [When a plugin is worth it](#when-a-plugin-is-worth-it)
- [Layout](#layout)
- [plugin.json](#pluginjson)
- [Component locations](#component-locations)
- [CLI](#cli)
- [skills-dir plugins](#skills-dir-plugins)
- [Marketplaces](#marketplaces)

## When a plugin is worth it

Committing `.claude/` to one repo covers one repo. A plugin is the answer when the same
skills, hooks or agents need to reach several repos or several people, with versioning
and an install step. Below that threshold, `.claude/` in the repo is simpler and has no
distribution problem.

## Layout

```
my-plugin/
├── .claude-plugin/
│   └── plugin.json        # manifest (optional)
├── skills/
│   └── code-reviewer/SKILL.md
├── commands/              # skills as flat .md files
├── agents/                # subagent definitions
├── hooks/hooks.json
├── .mcp.json              # MCP servers
├── .lsp.json              # language servers
├── workflows/             # workflow scripts
├── output-styles/
├── themes/
├── monitors/monitors.json
├── bin/                   # executables added to PATH
├── scripts/               # hook/utility scripts
└── settings.json          # default settings
```

Only `plugin.json` goes inside `.claude-plugin/`. Every other directory sits at the
plugin root — putting `skills/` inside `.claude-plugin/` is the classic mistake and the
plugin silently ships nothing.

A `CLAUDE.md` at the plugin root is **not** loaded as project context. Plugins
contribute context through skills, agents and hooks. To ship instructions, ship a skill.

A plugin with a bare `SKILL.md` at its root, no `skills/` directory and no `skills`
manifest key, loads as a single-skill plugin. Set frontmatter `name` — otherwise the
invocation name falls back to the install directory, which for marketplace installs is
a version string that changes on every update.

## plugin.json

| Field | Notes |
| --- | --- |
| `name` | Identifier used for namespacing and lookup |
| `displayName` | Human-readable label in `/plugin`; may contain spaces |
| `version` | Semver. Omit and Claude Code uses the git SHA, treating every commit as a new version |
| `description`, `homepage`, `repository`, `license`, `keywords` | Metadata |
| `author` | `{"name": "…", "email": "…"}` |
| `defaultEnabled` | `false` ships the plugin installed-but-off; use it for anything that costs money or reaches an external service |
| `metadata` | Free-form; never affects behaviour |
| `$schema` | `https://json.schemastore.org/claude-code-plugin-manifest.json` |

Manifest keys can also point at non-default paths (e.g. `"commands": ["./commands/deploy.md"]`).
When both a default folder and a matching manifest key exist, the manifest wins and
`claude plugin list` warns about the ignored folder.

Validate before publishing:

```bash
claude plugin validate ./my-plugin --strict
```

Unrecognised fields are warnings; a wrong *type* on a known field (e.g. `keywords` as a
string) is a load error.

## Component locations

| Component | Default path |
| --- | --- |
| Manifest | `.claude-plugin/plugin.json` |
| Skills | `skills/<name>/SKILL.md` |
| Commands | `commands/*.md` (prefer `skills/` for new plugins) |
| Agents | `agents/*.md` |
| Hooks | `hooks/hooks.json` |
| MCP servers | `.mcp.json` |
| LSP servers | `.lsp.json` |
| Workflows | `workflows/` |
| Output styles / themes | `output-styles/`, `themes/` |
| Monitors | `monitors/monitors.json` (experimental) |

Inside plugin files, `${CLAUDE_PLUGIN_ROOT}` resolves to the install directory and
`${CLAUDE_PLUGIN_DATA}` to its persistent data directory. Use them for every internal
path — the install location is not stable.

## CLI

| Command | Purpose |
| --- | --- |
| `claude plugin init <name> [--with skills hooks]` | Scaffold at `~/.claude/skills/<name>/` |
| `claude plugin install <plugin>@<marketplace> [--scope project\|local]` | Install |
| `claude plugin uninstall <plugin> [--prune]` | Remove |
| `claude plugin enable` / `disable <plugin>` | Toggle without uninstalling |
| `claude plugin list` | Installed plugins and warnings |
| `claude plugin validate <path> [--strict]` | Check the manifest |
| `claude plugin prune` | Remove orphaned dependencies |
| `claude plugin marketplace add <source>` | Register a marketplace |
| `/plugin` | In-session browser and picker |

For a run without installing: `--plugin-dir ./my-plugin` or
`--plugin-url https://example.com/plugin.zip`. `disableSideloadFlags` (managed) rejects
both at startup.

## skills-dir plugins

Any folder under a skills directory containing `.claude-plugin/plugin.json` loads as
`<name>@skills-dir` on the next session — no marketplace, no install. It's discovered
in place rather than copied to the plugin cache, which makes it the fastest way to
develop a plugin: edit, restart, see the change.

## Marketplaces

A marketplace is a git repo (or URL) with a `marketplace.json` listing plugins and
where to fetch them. Register with `claude plugin marketplace add <source>`, then
install with `claude plugin install <plugin>@<marketplace>`.

`version` in a plugin's marketplace entry is overridden by `version` in its
`plugin.json`. `defaultEnabled` works the other way round — the marketplace entry wins.

Managed controls: `blockedMarketplaces` and `strictKnownMarketplaces` restrict where
plugins may come from.

For cloud sessions, a plugin declared in the repo's `.claude/settings.json` installs at
session start; a plugin enabled only in your user settings does not travel.
