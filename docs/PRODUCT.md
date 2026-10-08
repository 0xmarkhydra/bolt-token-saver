# Product behavior and user journey

## Who this is for

**Primary user:** someone who can open a terminal and press keys but does not understand hooks, PATH, proxies, package managers, or config file formats.
**Secondary user:** an AI coding agent or developer maintaining the installer.

## Core promise

"Run one command, see what's on your computer, choose what you want to optimize, and approve the changes before anything gets installed."

Bolt Token Saver **does not** promise a specific percentage of token/billing savings or magically optimize every API call.

## Current UX (v0.4.0)

1. **Dashboard:** detect platform/CPU, installed `claude` and `codex`, and heuristic states for RTK, Headroom, Caveman, Ponytail.
2. **Install:** select Claude Code, Codex, or both. Already detected agents are preselected.
3. **Tools:** default recommendation is RTK + Ponytail. Headroom and Caveman are optional. Selection supports arrow keys and Space.
4. **Confirm:** show plain-language summary; press `D` to view exact technical commands. The default focused action is **go back**, not install.
5. **Execute only on consent:** attempt backup first; execute the selected installer steps; show per-step outcome and a final summary.
6. **Read-only config:** allow users to inspect *safe metadata* for each agent without revealing keys or raw config.
7. **Help and exit:** simple built-in guidance and `Q` to exit.

## UX rules

- Use Vietnamese for end-user screens, short explanations, and avoid unexplained jargon.
- Separate detection from verification: `Found`, `Configured`, `Verified working` must not be conflated.
- Warnings should be actionable: state what is missing and what the user can do.
- Every state-changing action requires an explicit opt-in, with a route back.
- Nothing on the dashboard or config screen should call upstream model APIs.
- Do not obscure that Headroom needs a **separate launch command** after installation.
- Test the actual terminal dimensions; aim for readable output at ~80 columns and allow scrolling for long logs.

## Scope and non-goals

**Current:** local TUI, 4 upstream integrations, config detection, installation plans, backups, test suite, CI definition, macOS local smoke test.

**Not implemented:** visual editing/toggling of plugin settings; live health checks; token analytics dashboard; safe automated uninstall/rollback; standalone binaries with bundled Node; npm registry publishing; verification of all installers on real Windows/Linux machines.

Do not describe any non-goal as a shipped feature. If building one, write acceptance criteria and tests first.

## Definition of a good user result

User can say: "I can tell whether my AI agent was found, understand the available choices, see what will happen, exit without changes, and identify whether installation steps succeeded or need attention."
