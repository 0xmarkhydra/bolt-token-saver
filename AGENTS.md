# Instructions for Codex, Claude Code, and other coding agents

This file applies to the whole repository. Keep it concise: read other docs **only when the task needs them**.

## Which task is the user asking for?

- **User sent a GitHub link and asked you to INSTALL/SET UP token optimizers on their computer?** Read [AI_SETUP.md](AI_SETUP.md) **first** and follow the user-install workflow. Do **not** start rewriting this repository. Inspect OS/config, propose steps, get explicit consent, install via authorized terminal, verify.
- **User asked to implement, debug, or maintain this GitHub repository?** Follow the developer instructions below.

## Mission and product contract

Bolt Token Saver is a lightweight, dependency-free **Node.js 20+ Terminal UI**, not a desktop app.
It helps nontechnical users install/configure RTK, Headroom, Caveman and Ponytail for Claude Code and OpenAI Codex on Windows, macOS and Linux.

**Do not confuse** "binary detected", "plugin configured", "hook enabled", "working", or "measured token savings". They are distinct statuses. Never invent savings percentages.

## Repo map

- `src/cli.mjs` — interactive dashboard, keyboard navigation, wizard, preview, results.
- `src/core.mjs` — agent/tool metadata, OS/PATH detection, installer plan and execution.
- `src/status.mjs` — **read-only** configuration/status inspection with strict redaction; includes installed/enabled detection for optional skills.
- `src/backup.mjs` — backup of existing user agent configurations before changes.
- `src/skill-catalog.mjs` — allowlisted optional skill catalog and per-agent install plan; **no auto-installs**.
- `src/install-rtk-windows.mjs` — Windows x64 RTK fallback through official GitHub Release and SHA-256 verification, user PATH only.
- `test/*.test.mjs` — Node built-in test runner.
- `RUN-WINDOWS.cmd`, `run-macos-linux.sh` — local launchers.
- `BOLT-CLAUDE.cmd`, `BOLT-CODEX.cmd`, `bolt-claude.sh`, `bolt-codex.sh` — Headroom-specific wrappers.
- `.github/workflows/` — cross-platform CI and ZIP release workflow.

## Read only the relevant references

- Product goals, user journeys, accepted behavior: [docs/PRODUCT.md](docs/PRODUCT.md)
- Code boundaries, data flow, safety: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- Supported detection and configuration rules: [docs/CONFIGURATION.md](docs/CONFIGURATION.md)
- Optional AI Skills: [docs/SKILL-CATALOG.md](docs/SKILL-CATALOG.md)
- Setup, tests, debugging: [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- How to hand off a feature to an AI agent: [docs/AI-HANDOFF.md](docs/AI-HANDOFF.md)
- New feature specification template: [docs/FEATURE-SPEC-TEMPLATE.md](docs/FEATURE-SPEC-TEMPLATE.md)

## Required engineering behavior

1. Inspect the relevant implementation and tests before changing it. Prefer a small, targeted patch, not an unrelated rewrite.
2. Use **ES modules and built-in Node APIs**; avoid adding production dependencies unless justified and approved by the task.
3. Keep Windows CMD/PowerShell, macOS, Linux, and Node.js 20+ in scope. Do not assume a POSIX shell on Windows.
4. Do not perform installation, run upstream installers, alter user configuration, or call third-party proxies during automated tests. Mock command execution.
5. Keep status reads passive: **never print credentials, tokens, private config bodies, endpoint URLs, or secrets**. Treat logs from external installers as untrusted.
6. Preserve the flow: dashboard → agent selection → tool selection → human-readable preview → explicit confirmation → backup → install → result. No installation before consent.
7. For added skills, keep them optional in a separate catalog, verify official install commands, and never claim they save tokens unless measured.
8. Favor Vietnamese first for end-user TUI copy. Keep agent-facing technical docs readable in English; update screenshots/examples when behavior changes.
8. Third-party installation commands must be verified against official upstream docs when modified; report unsupported options rather than guessing.
9. Follow the change's requested scope. Do not silently introduce auto-updaters, telemetry, model/API key prompts, or privileged system changes.
10. If a feature is incomplete or unverified, say so in the UI/docs; a command exiting 0 is not proof the tool works end-to-end.

## Verification before declaring done

Run:

```bash
npm run check
node src/cli.mjs --doctor
node src/cli.mjs --plan
```

For TUI input changes, also verify navigation in a real PTY: dashboard, view config, agent/tool selection, preview, cancel, exit **without confirming installation**.
Add tests for changed behavior, especially Windows planning and secret redaction.
Use `git diff --check` and report tests, limitations, and exact changed files. Do not claim Windows/Linux end-to-end testing unless actually performed.

## Definition of done

- UX meets the user-facing acceptance criteria.
- No credential leakage or unconfirmed install path introduced.
- Docs and tests reflect actual code; commands are copy-pastable.
- Commit/push only when requested or authorized. Never force-push.
