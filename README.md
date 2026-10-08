# ⚡ Bolt Token Saver — Terminal UI

Install and configure token-saving tools for **Claude Code** and/or **OpenAI Codex** on **Windows, macOS and Linux**.

| Tool | Purpose |
|---|---|
| [RTK](https://github.com/rtk-ai/rtk) | Compress terminal output |
| [Headroom](https://github.com/chopratejas/headroom) | Context proxy |
| [Caveman](https://github.com/JuliusBrussee/caveman) | Concise model responses |
| [Ponytail](https://github.com/DietrichGebert/ponytail) | Lean implementations |

## One command on Windows, macOS, and Linux

With **Node.js 20+** and **Git** installed, open Windows Terminal / PowerShell / CMD, macOS Terminal, or a Linux terminal and run:

```bash
npx -y github:0xmarkhydra/bolt-token-saver
```

This starts the same interactive menu on all three operating systems. It auto-detects the OS/architecture and installed AI coding agents. **It will not install any optimization until you confirm the preview.**

- **Windows PowerShell** with a restrictive script policy: use `npx.cmd -y github:0xmarkhydra/bolt-token-saver` instead.
- **npm 12+** disables Git dependencies by default. If you get `EALLOWGIT`, explicitly opt in for this trusted repo: `npx --allow-git=root -y github:0xmarkhydra/bolt-token-saver`.
- To check the environment without installing: `npx -y github:0xmarkhydra/bolt-token-saver --doctor`.
- This GitHub installation requires Git. Publishing `bolt-token-saver` to the npm registry in the future would allow `npx -y bolt-token-saver` without Git, **but this npm package has not been published**.

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
