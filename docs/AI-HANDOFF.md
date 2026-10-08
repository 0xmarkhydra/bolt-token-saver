# Give this repository to Codex or Claude Code **to develop the installer**

> Looking for **AI to install optimizers on your own computer**? Use [AI_SETUP.md](../AI_SETUP.md), **not this document**. This page teaches coding agents how to modify the Bolt Token Saver source.

You don't need to paste the whole repository into chat. **Open the project as a workspace**, ask the AI to inspect the relevant docs, then describe the desired change and acceptance criteria.

## Why these files exist

- **Codex** reads repository-root `AGENTS.md` as project instructions.
- **Claude Code** reads repository-root `CLAUDE.md`, which imports `AGENTS.md`.
- `AGENTS.md` is short and points to implementation-specific docs. Long specs stay in `docs/` to reduce unnecessary context.
- This is **coding-agent onboarding**, not an automatic capability to execute on a user's device without filesystem/terminal permissions.

## 1. Prepare your workspace

```bash
git clone https://github.com/0xmarkhydra/bolt-token-saver.git
cd bolt-token-saver
npm run check
```

Or open an existing clone in the agent's workspace. Ensure Claude Code/Codex is installed and authorized to work in that directory.

## 2. Ask the agent to understand the code

### For Codex

```text
Read AGENTS.md and only the documentation relevant to the following task.
First summarize the current behavior, important files, security constraints,
and tests. Do not edit or install anything yet.
Task: <describe what you want to change>.
```

### For Claude Code

```text
Read the project's CLAUDE.md and the linked AGENTS.md rules.
Inspect the implementation related to my request. Explain your proposed
smallest viable change, acceptance tests, and any platform limitations.
Do not edit or install anything until I ask.
Task: <describe what you want to change>.
```

## 3. Ask the agent to implement a change

```text
Implement this feature in Bolt Token Saver:
GOAL: <one plain-language sentence>
USER FLOW: <what the person sees and presses>
IN SCOPE: <what you may change>
OUT OF SCOPE: <what you must not change>
ACCEPTANCE:
- <observable behavior 1>
- <observable behavior 2>
- No API key or endpoint URL leakage
- No system installation without explicit user confirmation
VERIFICATION:
- npm run check
- npm run doctor
- npm run plan
- PTY navigation and cancel test if TUI changes
Update relevant docs, explain limitations, and show the changed files.
Do not push or publish without permission.
```

For complicated tasks, put that specification in `docs/specs/<feature-name>.md` and ask the AI to **read and implement the file**, rather than pasting a long request every session. Start from [FEATURE-SPEC-TEMPLATE.md](FEATURE-SPEC-TEMPLATE.md).

## 4. Ask for a review

```text
Review the current diff against AGENTS.md, docs/PRODUCT.md, and my feature spec.
Look specifically for OS regressions (Windows/macOS/Linux), missing tests,
security issues (config redaction, shell commands, unexpected installs),
and UX problems for nontechnical users.
Run npm run check. Give me a short list of concrete findings with file paths.
```

## Examples of tasks to delegate

- "Translate the remaining user-facing technical warnings to simple Vietnamese without changing the commands."
- "Add an optional read-only verification screen for RTK, with mocked tests and no network calls."
- "Improve the TUI on 80-column Windows Terminal without introducing a new runtime dependency."
- "Add a user-confirmed repair step, keeping configuration backups and a documented rollback path."

## Handoff checklist for human reviewers

- Did the AI read `AGENTS.md` / `CLAUDE.md`?
- Is the task specific about which files and behavior may change?
- Did the agent run tests and distinguish untested OSes?
- Did it leave existing credentials, config and Git history safe?
- Can a nontechnical user still understand the screen?
