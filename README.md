# ⚡ Bolt Token Saver — Terminal UI

Install and configure token-saving tools for **Claude Code** and/or **OpenAI Codex** on **Windows, macOS and Linux**.

| Tool | Purpose |
|---|---|
| [RTK](https://github.com/rtk-ai/rtk) | Compress terminal output |
| [Headroom](https://github.com/chopratejas/headroom) | Context proxy |
| [Caveman](https://github.com/JuliusBrussee/caveman) | Concise model responses |
| [Ponytail](https://github.com/DietrichGebert/ponytail) | Lean implementations |

## Run

**Windows:** Download the repository ZIP, extract it, double-click `RUN-WINDOWS.cmd`. If Node.js is absent, the launcher offers installation through WinGet.

**macOS / Linux:**
```bash
bash run-macos-linux.sh
```

Requires Node.js 20+ (zero npm dependencies). Navigate using **↑ ↓**, **Space**, **Enter**, **Esc** and **Q**.

The TUI detects installed agents, lets you choose any tool combination, previews commands and asks for confirmation. It backs up existing Claude/Codex settings to `~/.bolt-token-saver/backups/` before installing third-party tools.

## Inspect without installing

```bash
npm run doctor
npm run plan
npm run check
```

## After installation

- Restart Claude/Codex to activate hooks/plugins.
- For Headroom: launch with `BOLT-CLAUDE.cmd` or `BOLT-CODEX.cmd` (Windows); `bash bolt-claude.sh` or `bash bolt-codex.sh` (macOS/Linux).
- On Codex, inspect and approve Ponytail's hooks using `/hooks` where applicable.
- Configure gateway/upstream credentials outside this installer. Do not expose local proxy publicly.
- RTK statistics are estimates about filtered command output, not guaranteed billing reductions.

## Security and limitations

This is a community installer, not affiliated with OpenAI or Anthropic. Upstream commands change over time; verify the source before installing. A successful command exit does not prove end-to-end functionality. Tool installation needs Internet access and may require OS package manager permissions. No API keys are collected by Bolt Token Saver.

## License

MIT
