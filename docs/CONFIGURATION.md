# Config discovery and privacy rules

This document describes the **implemented v0.5.4** read-only configuration screen. Optional skills from [SKILL-CATALOG.md](SKILL-CATALOG.md) use limited plugin/skill heuristics; **Ponytail** additionally checks its six exact bundled `SKILL.md` files for Claude and Codex separately. It does **not** claim that tools are functioning end-to-end.

## Sources inspected

| Agent | File(s) examined | Fields shown to the user |
|---|---|---|
| Claude Code | `$CLAUDE_CONFIG_DIR/settings.json` or `~/.claude/settings.json`; `~/.claude/plugins/installed_plugins.json` (under configured Claude dir) | config exists, sanitized model, custom endpoint **yes/no**, credential detected **yes/no**, RTK hook indication, plugin indicators |
| Codex | `$CODEX_HOME/config.toml` or `~/.codex/config.toml`; `hooks.json` | config exists, top-level model, endpoint **yes/no**, API key env present **yes/no**, RTK hook indication, skill/plugin indications |

Headroom detection also runs a bounded, read-only `uv tool list` when uv is available. It parses only the `headroom-ai` package marker and never returns or prints raw tool output. If uv has Headroom installed but the command is missing from PATH, it is labeled **installed**, with a warning about `uv tool update-shell`. No proxy is started, and the status is never **working**.

Caveman and Ponytail detection distinguish actual plugin/skill file evidence from an `enabledPlugins` configuration flag. A flag by itself is **configured only**: it must not be reported as a verified installation.

For Ponytail, the reader checks bounded Claude/Codex plugin-cache directories, Claude registry `installPath` values, and six specific bundled skill names; it reports an independent `0/6`–`6/6` count for each agent. A cached skill file does not prove the plugin is enabled or active. Registration in Claude's `installed_plugins.json` and the `[plugins.\"ponytail@ponytail\"]` Codex config section are reported separately. Only metadata is returned, never the local paths.\n\nThe tool also checks the known skill paths `~/.codex/skills/<tool>/SKILL.md` and `~/.agents/skills/<tool>/SKILL.md`. Presence is **not equivalent to active support**.

## Data never displayed

- API keys, OAuth tokens, passwords, or values from auth configuration.
- Private upstream URL, proxy URL, or arbitrary endpoint body.
- Raw TOML/JSON settings, custom headers, cookies, or plugin install metadata.
- Full prompts or private source code.

The status reader exposes only explicit summary fields. A model name is shown only if it matches a short safe character whitelist; otherwise it becomes a generic "configured, value hidden" label.

## Status terminology

- **Agent found:** its executable is on PATH or a known executable folder.
- **Tool found:** binary/known config artifact was detected.
- **Enabled:** a known config flag signals activation (not always possible to prove).
- **Working:** requires an explicit non-destructive integration test; **not implemented**.
- **Token saved:** requires measured before/after data; **not implemented**.

Do not label a tool "working" solely because its install command returned exit code 0.

## Current feature constraints

- The config screen has **no edit, toggle, or save buttons**.
- It does not call model APIs and must not validate credentials over the network.
- It intentionally does not show endpoint values, even when a user has a custom gateway.
- These are heuristic discoveries; upstream agents can change config structure.
- Headroom presence alone is not proof of proxy use: the separate launcher must be used.

## Development test requirements

Changes to the reader should add a synthetic temp-home fixture in `test/status.test.mjs` and assert that sentinel API keys and endpoint strings do **not** appear in the serialized summary. Also test missing/malformed config without crashing. Avoid fixtures containing any real secrets.