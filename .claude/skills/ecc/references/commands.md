# Built-in commands and bundled skills

Snapshot of <https://code.claude.com/docs/en/commands>. Type `/` in a session to see
what's actually available — plugins and project skills add to this list, and a
same-named project skill overrides a bundled one.

## Built-in commands

**Session and context**

| Command | Does |
| --- | --- |
| `/clear [name]` | Start a new conversation with empty context |
| `/compact [instructions]` | Summarize the conversation to free context |
| `/context [all]` | Visualize context usage; shows which memory files loaded |
| `/autocompact [auto\|<tokens>]` | Set the auto-compact window |
| `/resume [name]` | Return to an earlier conversation |
| `/branch [name]` | Branch the conversation to try another direction |
| `/rewind [checkpoint\|part]` | Roll code *and* conversation back to a checkpoint |
| `/export [filename]` | Export the conversation as plain text |
| `/copy [N]` | Copy the last response to the clipboard |
| `/status` | Session status, including active settings sources |
| `/usage`, `/cost` | Token and cost information |
| `/exit` | Quit |

**Configuration**

| Command | Does |
| --- | --- |
| `/config [key=value]` | Settings UI: theme, model, preferences |
| `/model [model]` | Switch model |
| `/effort [level\|auto]` | Set effort level |
| `/fast [on\|off]` | Toggle fast mode |
| `/permissions` | Edit allow / ask / deny rules |
| `/hooks` | View hook configuration |
| `/memory` | Edit CLAUDE.md files, toggle auto memory |
| `/init` | Generate a starting CLAUDE.md from the codebase |
| `/agents` | Manage subagent configurations |
| `/mcp [reconnect\|enable\|disable]` | MCP connections and OAuth |
| `/keybindings` | Open the keyboard shortcuts file |
| `/add-dir <path>`, `/cd <path>` | Add or change working directory |

**Working**

| Command | Does |
| --- | --- |
| `/plan` | Switch to plan mode before a large change |
| `/goal [condition\|clear]` | Set a goal to work toward across turns |
| `/diff` | Interactive diff viewer for uncommitted changes |
| `/review` | Fast single-pass read-only review of a GitHub PR |
| `/security-review` | Check the diff for security vulnerabilities |
| `/subtask <prompt>` | Hand a side task to a subagent |
| `/tasks` | List background work including subagents |
| `/background [prompt]` | Detach the session as a background agent |
| `/btw [question]` | Quick side question that doesn't enter the conversation |
| `/focus` | Show only key information |

**Platform**

`/login`, `/logout`, `/help`, `/feedback`, `/ide`, `/chrome`, `/desktop`, `/mobile`,
`/teleport` (pull a web session into the terminal), `/remote-control` (continue this
session from another device), `/color`, `/heapdump`.

## Bundled skills

| Skill | Does |
| --- | --- |
| `/code-review [level] [--fix] [--comment] [target]` | Review the diff for correctness bugs and cleanup |
| `/verify` | Verify code for correctness (manual invocation only) |
| `/debug [description]` | Enable debug logging and troubleshoot |
| `/doctor` | Setup checkup that diagnoses and can fix issues |
| `/batch <instruction>` | Orchestrate large-scale changes in parallel |
| `/loop [interval] [prompt]` | Run a prompt repeatedly while the session is open |
| `/fewer-permission-prompts` | Propose an allowlist from your transcripts |
| `/claude-api [migrate\|managed-agents-onboard\|prompt-audit]` | Claude API reference material |
| `/dataviz [request]` | Design guidance for charts and dashboards |
| `/design-sync [hint]`, `/design-login` | Sync a React design system to Claude Design |

## Bundled workflows

| Workflow | Does |
| --- | --- |
| `/deep-research <question>` | Fan out web searches, cross-check sources, synthesize a cited report |

## Useful in this repo

- `/context` before wondering why an instruction was ignored.
- `/doctor` after editing settings — it lists entries that were stripped as invalid.
- `/security-review` before opening a PR that touches auth, RLS or storage URLs.
- `/rewind` when a refactor went sideways; it reverts code *and* conversation, which
  `git checkout` alone does not.
