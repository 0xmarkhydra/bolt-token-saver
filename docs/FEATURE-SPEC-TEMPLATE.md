# Feature spec template (copy this file; do not implement the template itself)

**Status:** template / not an approved feature.
**Owner:** <person or team>
**Target:** <version/branch>
**Related docs:** [PRODUCT.md](PRODUCT.md), [ARCHITECTURE.md](ARCHITECTURE.md)

## Problem and user

<What is confusing or broken for the user? Use one paragraph.>

## Goal

<One measurable sentence defining success.>

## Scope

**Include:** <functions, screens, files or CLI behavior to implement>

**Exclude:** <explicitly out of scope; avoid accidental scope expansion>

## User journey

1. Given <starting state>
2. When <key pressed / action>
3. Then <visible result>
4. On cancel/error <safe outcome>

## Acceptance criteria

- [ ] <Functional criterion observable by user>
- [ ] <Safe defaults and back/cancel behavior>
- [ ] <No credentials or private URLs in terminal output>
- [ ] <No unexpected writes, network calls, or installers before explicit consent>
- [ ] <Consistent behavior on Windows, macOS and Linux, or limitations documented>
- [ ] <Existing keyboard navigation and Node 20+ compatibility preserved>
- [ ] <Tests and docs updated>

## Implementation hints (not authoritative)

- Likely entry points: `src/cli.mjs`, `src/core.mjs`, `src/status.mjs`.
- Prefer existing structure. Follow `AGENTS.md`; update tests with mocks.
- Validate any third-party integration command against upstream official instructions.

## Test plan

- Unit test additions: <test names / cases>
- Manual smoke test: <exact user keystrokes, include a cancellation path>
- Expected CLI commands: `npm run check`, `npm run doctor`, `npm run plan`

## Risks and rollback

- User configuration paths touched: <none / list paths>
- Data/secret exposure risk: <mitigations>
- Rollback or backup: <how to restore>

## Done when

<Short, factual test result + changed files + known limitations; request approval before push if not authorized.>
