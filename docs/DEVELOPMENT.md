# Local development and testing

## Prerequisites

- Node.js **20+**, Git, an interactive terminal.
- No `npm install` required to run or test the current project.
- Windows contributors may use CMD / PowerShell; TUI itself uses Node, not Bash.

## Commands

```bash
npm run check                  # Syntax check + all unit tests
npm test                       # Node test runner
npm run doctor                 # Read-only environment check
npm run plan                   # Print recommended commands; do not install
node src/cli.mjs --status      # Read-only detection summary
node src/cli.mjs --version
npm start                      # Interactive TUI (requires a real terminal)
```

## Test strategy

- `test/core.test.mjs`: cross-platform planning and command runner with mocked binaries/spawn.
- `test/status.test.mjs`: missing configs, safe model names, positive plugin/hook heuristics, and API key/endpoint redaction.
- `test/skill-catalog.test.mjs`: 10 unique sources, per-agent compatibility, safe command previews, collection/core no-op behavior.
- For interactive changes, test in a PTY using keyboard input, navigate each screen, cancel at the install confirmation screen, and verify that **no install step ran**.
- For OS-specific changes, verify tests on that OS if available; otherwise state the limitation clearly.
- Check `git diff --check` and ensure any examples in the README match the current CLI.

## How to work with the planner

`plan({agents, tools, system})` must produce allowlisted command descriptors; it should not mutate the system.
`run(plan, {lookup,execute,onState,onOutput})` handles execution and is dependency-injected for tests.
Add an upstream command only after confirming its exact supported CLI flags. Mock all execution in tests.

## How to work with config detection

`inspect({home,env,system})` returns a safe summary. It should not return credentials or raw file contents. Keep the API small and test with fake fixture directories.

## Typical feature workflow

1. Read the relevant part of [PRODUCT.md](PRODUCT.md) and [ARCHITECTURE.md](ARCHITECTURE.md) as needed, not every doc.
2. Record expected behavior and acceptance tests for meaningful changes; use [FEATURE-SPEC-TEMPLATE.md](FEATURE-SPEC-TEMPLATE.md).
3. Make a focused implementation change.
4. Run `npm run check`, `npm run doctor`, `npm run plan`, PTY smoke test when UI changed.
5. Update README/relevant docs when the user-facing behavior changed.
6. Review diff and commit with a descriptive message. Push only when authorized.

## Windows RTK fallback

When WinGet is absent on Windows x64, `plan()` uses
`src/install-rtk-windows.mjs` via the current Node executable.
That script fetches the official `rtk-ai/rtk` latest release,
checks the GitHub-provided SHA-256 digest, extracts the Windows `rtk.exe`,
and adds `~/.local/bin` to the **User PATH** (not system PATH).
`execStep()` resolves known executable paths so RTK initialization can
run immediately without waiting for the current terminal to refresh PATH.
This path is **not supported on ARM64**. Unit tests simulate planning and
integrity checks but do not install anything on Windows.

## Troubleshooting developer environment

- `npx ...` not found: install Node.js 20+.
- GitHub `npx` `EALLOWGIT` on npm 12+: opt in with `--allow-git=root` for the specific repository.
- Windows PowerShell blocks `npx.ps1`: use `npx.cmd`.
- No TTY: use `--doctor` / `--plan` rather than trying to automate an interactive terminal.
- The GitHub Actions jobs may be refused if the repository owner's billing is locked. This is separate from a failure of the source tests.
