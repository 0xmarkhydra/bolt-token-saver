# Architecture — Bolt Token Saver v0.5.0

## Current stack

- Node.js 20+ **ES modules**, no third-party runtime npm dependencies.
- Terminal output uses ANSI styling; keyboard input uses Node's built-in `readline`.
- `package.json` exposes the CLI through `bin.bolt-token-saver = ./src/cli.mjs`.
- `src/skill-catalog.mjs` maps 10 optional skills to allowlisted install plans, agent compatibility and manual instructions.
- `src/install-rtk-windows.mjs` implements a WinGet-free Windows x64 RTK install from the official SHA-256-verified GitHub release; writes only the user's executable directory and User PATH after consent.
- Works locally via scripts or from GitHub through `npx -y github:0xmarkhydra/bolt-token-saver` (requires Node + Git).

## Runtime flow

```text
src/cli.mjs
  ├─ detect() from core.mjs        OS, architecture, executable lookup
  ├─ inspect() from status.mjs     read-only, allowlisted settings summary
  ├─ dashboard()                   status / install / help / exit
  └─ setupWizard()
       ├─ select agents
       ├─ select tools
       ├─ plan(...) from core.mjs  static sequence of upstream CLI commands
       ├─ confirmSetup(...)        human approval + optional detailed preview
       └─ installScreen(...)
            ├─ backup(...)         snapshots known config files
            └─ run(...)            invokes upstream commands, reports each step
```

## Ownership boundaries

| Module | Owns | Must NOT own |
|---|---|---|
| `cli.mjs` | prompts, focus/navigation, user copy, confirmation, logs | hidden configuration edits |
| `core.mjs` | executable detection, installation plans, subprocess results | remote API keys, interactive UI |
| `status.mjs` | safe **read-only** config discovery | printing raw TOML/JSON, editing configs, upstream calls |
| `backup.mjs` | snapshots of existing known agent config files | restoration without separate explicit approval |
| `skill-catalog.mjs` | curated optional skills, per-agent command plans | free-form shell commands, downloading on import, installing entire collections |

## Operating system detection

`detect()` uses `process.platform`, `process.arch`, and PATH/known command directories. Presence means **executable found**, not that a plugin/hook works.
- Windows uses `winget` for select binaries; launch via `RUN-WINDOWS.cmd`.
- macOS may use Homebrew; Linux uses whichever supported package manager is present in the planner. A missing dependency can block a step.
- Windows `npm`/agent CLI shims may be `.cmd`; Node spawns accordingly.
- Install plans are evaluated at selection time; new PATH entries can require opening a new terminal.

## Trust boundaries

1. **User input** only selects allowlisted agent IDs and tool IDs; commands come from code, not free-form user text.
2. **External tools** can fetch installers/packages and modify global Claude/Codex settings. Always preview and confirm, and back up first.
3. **Configs** can contain secrets. `status.mjs` returns only whitelisted booleans and sanitized model names.
4. **Child process logs** are untrusted; never deliberately dump auth env or raw config. Redaction is defense in depth and is not a guarantee that arbitrary upstream output cannot contain secrets.
5. **Headroom proxy** can see prompts/tool context and must remain local. Enabling it requires using the `BOLT-*` launcher; installing it alone does not intercept default agent traffic.

## Known limitations to preserve honestly

- Installed/configured/working checks are not equivalent.
- Upstream command semantics can change; keep a verification checklist for integration changes.
- Existing backup covers known agent config **files**, not every nested plugin or hook artifact. There is no automatic rollback.
- Failed or blocked steps are surfaced in the UI, but there is no full transaction rollback.
- CI is declared for Windows/macOS/Linux but may not run if repository billing blocks GitHub Actions.

## Extending an integration

Update the allowlist/tool metadata and `plan()` in `src/core.mjs`, provide redacted read-only detection in `src/status.mjs` only if it is reliable, update the UI text in `src/cli.mjs`, then add mocked tests. Verify any new upstream command against its official docs and update [CONFIGURATION.md](CONFIGURATION.md).
