# AI skill catalog — compatibility and installation policy (v0.5)

This catalog is an **optional extension** to the main Bolt Token Saver token tools.
All claims below are based on upstream README instructions as inspected on 2026-10-08. Integration is **planned and previewed**, not end-to-end verified on Windows/macOS/Linux.

## Which tool does what?

| Screenshot item | Repo | Claude Code | Codex | Bolt TUI behavior |
|---|---|---|---|---|
| 01 Superpowers | [obra/superpowers](https://github.com/obra/superpowers) | Native plugin | Official plugin marketplace | Claude: plan/confirm install; Codex: manual \`/plugins\` |
| 02 Ponytail | [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) | Native plugin | Native plugin | Already part of core token optimization; not installed twice |
| 03 UI UX Pro Max | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Native plugin | Universal/global skill | Optional install with preview |
| 04 Graphify | [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify) | Skill | Skill | Optional \`uvx --from graphifyy\` (double-y!) |
| 05 Caveman | [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) | Native plugin | Skill | Already part of core; not installed twice |
| 06 Addy Osmani Skills | [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | Native plugin | Native plugin (requires supported Codex CLI) | Optional install with preview |
| 07 Understand Anything | [Egonex-AI/Understand-Anything](https://github.com/Egonex-AI/Understand-Anything) | Native plugin | Via official platform-specific installer | Claude: optional install; Codex: manual review of upstream script |
| 08 Awesome Claude Skills | [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) | Curated collection | Curated collection | **Browse only**; not one package and never auto-install all |
| 09 Archify | [tt-a1i/archify](https://github.com/tt-a1i/archify) | Skill | Skill | Optional install through Vercel Skills CLI |
| 10 Impeccable | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | Skill + hooks | Skill + hooks | Optional CLI install to selected providers |

**Important spelling correction:** The Archify owner is **\`tt-a1i\`** (the middle character is the digit \`1\`), **not** \`tt-ali\`.

### Compatibility has three meanings

1. **Upstream supports an agent:** their README documents that agent or a supported skill format.
2. **This TUI automates the install:** a documented command is implemented in \`src/skill-catalog.mjs\` (not always both agents).
3. **Actually working on a user's machine:** requires a real integration smoke test after installation. This project does not yet automate it.

Do not conflate any of these. In particular, a Claude-only installer is not a Codex installer.

## Simple workflow

1. Launch Bolt Token Saver as usual.
2. Choose **2. Khám phá & cài thêm AI Skills**.
3. Browse **two pages of five skills**, open details to see use, compatibility, source URL and warnings.
4. If automatic install is supported, select the detected agent(s).
5. Review a human-readable plan; optionally press **D** for exact commands. Only then may the user explicitly confirm execution.
6. Backup known Claude/Codex config files before running tool commands. Summarize per-step results.

\`RTK + Ponytail\` remain the suggested starting pair in the main **token optimizer** screen. None of the new skills are preselected or installed when opening the dashboard.

## Why not install all ten?

- The screenshot ranks **skills/plugins, not token savings**. Superpowers can prompt more planning/tests, and Understand Anything's first graph build may use substantial tokens.
- Some skills register hooks, download binaries, or change agent behavior. Users need to understand and approve those modifications.
- Skill packs may overlap (e.g. UI UX Pro Max and Impeccable); install the one needed for the user's task rather than every available option.
- A curated list isn't a single installer; bulk-installing third-party code from a list would be unsafe.

## Official instructions the planner is based on

- Superpowers: Claude \`superpowers@claude-plugins-official\`; Codex CLI \`/plugins\` → search \`superpowers\` → Install Plugin.
- UI UX Pro Max: Claude marketplace plugin; Codex universal/global skill via \`ui-ux-pro-max-cli\`, command \`uipro init --ai universal --global\`. Python 3 may be required **when using the skill**, not merely copying its files.
- Graphify: package **\`graphifyy\`**, skill registration via \`graphify claude install\` and \`graphify codex install\`. Requires \`uvx\` on PATH; no transparent remote shell script.
- Addy Osmani: Claude \`agent-skills@addy-agent-skills\`; Codex \`agent-skills@agent-skills\`.
- Understand Anything: Claude marketplace install; Codex's documented installer uses a shell/PowerShell script, therefore Bolt **does not execute that script blindly**.
- Archify: \`npx skills add tt-a1i/archify --skill archify --agent claude-code|codex --global --copy --yes\`.
- Impeccable: \`npx impeccable install --providers=claude,codex --scope=global\`; may install hooks, and Codex may require \`/hooks\` approval.

Upstream documentation can change. Before changing a command, re-check its official README and update tests and this file.

## Safety and limitations

- Catalog entries are an **allowlist**; avoid generic user-entered arbitrary GitHub URLs becoming executable commands.
- Installing source from the Internet still requires user approval.
- Preview includes any missing prerequisite; don't claim to have installed a skill if its step failed or was skipped.
- Installation is not a reversible transaction; existing backup covers only known config files. No automatic uninstaller/rollback.
- If a skill's CLI has interactive prompts, a non-interactive subprocess may fail or need manual follow-up. Report that rather than hanging silently.
- Since v0.5.2, the Dashboard and catalog show **installed** and (Claude only) **enabled** when recognized via Claude plugin inventory/settings or known global SKILL.md paths. No live **working** check exists; missing evidence is **not verified**, not proof a plugin is absent.

## For AI assistants given the GitHub URL

If the user asks you to set up one of these skills on their computer, read [../AI_SETUP.md](../AI_SETUP.md) as well. Identify the exact agent and OS, show planned commands, ask for confirmation, run with authorized terminal access, and verify the result without leaking secrets.
