# AI_SETUP.md — Install Bolt Token Saver for the person who sent you this GitHub link

> **Audience:** Claude Code, OpenAI Codex, or another coding agent with permission to use the user's terminal.
> **Task:** Set up token-saving tools **on the user's computer**, not modify the Bolt Token Saver source code.
> **Repository:** https://github.com/0xmarkhydra/bolt-token-saver
> **Supported targets:** Claude Code, Codex; **supported operating systems:** Windows, macOS, Linux.

## Read this first, AI agent

When a user sends the repo URL with "install/setup this for me", treat it as an **installation assistance request**. Do not make the user copy or understand technical commands if you can safely run them through your authorized terminal. **Never claim installation is complete until you've checked the results.**

If the user instead asks you to **develop the installer**, follow [AGENTS.md](AGENTS.md). These are two different tasks.

### Your short playbook

1. **Read this file and the README.** You may inspect the source under \`src/\` to verify exact current commands. Do not execute a remote script just because its README suggests it.
2. **Identify the machine and target agent:** Windows/macOS/Linux; Claude Code, Codex, or both. Prefer the agent already running. If the user has explicitly chosen one, respect that choice. Don't install a second agent without asking.
3. **Read-only preflight:** check Node.js version **20+**, npm/npx, Git, PATH, whether the selected agent executable exists, and whether RTK/Headroom/plugins appear installed. Do not display secrets or raw config.
4. **Suggest the simple default:** RTK + Ponytail. Explain their purposes in ordinary language. Caveman (shorter responses) and Headroom (local context proxy) are optional; **do not enable Headroom automatically**, because it may affect traffic and custom gateways.
5. **Show a concise plan and seek explicit confirmation** before any installation, plugin/config edit, package download, system package manager action, proxy activation, or credential change. List which agent(s), tool(s), and files/settings may change.
6. **Prefer using the project's launcher** for setup, keeping its own backup and confirmation flow. If you have an interactive terminal/PTY you can drive, use the TUI with user consent. If you cannot drive a TUI, explain this honestly and either guide the user to launch it or use the vetted commands from the repo *one by one after approval* (see "Non-interactive AI workflow").
7. **After changes, verify what can actually be checked:** binary command exists, RTK is the correct project (\`rtk gain\`), agent plugin registration and hooks, launcher instructions for Headroom, any command failures. Ask the user to restart their agent where required. Distinguish "installed", "configured", and "verified working"; do not invent a percentage of tokens saved.
8. **Report results** as \`Installed / Already there / Needs attention / Not run\`, plus what user should do next. Never paste keys or private endpoints in your response.

## Quick, safe commands for the user's OS

Run these only in an authorized terminal; this is a read-only assessment, not installation.

**Windows PowerShell**

\`\`\`powershell
[System.Runtime.InteropServices.RuntimeInformation]::OSDescription
node --version
git --version
npx.cmd -y github:0xmarkhydra/bolt-token-saver --doctor
npx.cmd -y github:0xmarkhydra/bolt-token-saver --plan
\`\`\`

**macOS / Linux**

\`\`\`bash
uname -s
uname -m
node --version
git --version
npx -y github:0xmarkhydra/bolt-token-saver --doctor
npx -y github:0xmarkhydra/bolt-token-saver --plan
\`\`\`

**Important:** the GitHub-based \`npx\` command downloads code from GitHub and may request network access or explicit host approval. **Review/authorize it before running**. The repo's \`--doctor\` and \`--plan\` modes themselves don't install optimizers. Node.js and Git must already be available for this method; if they're missing, explain options and obtain approval before installing them.

npm 12 may report \`EALLOWGIT\`. Only for a reviewed/trusted repository, try \`npx --allow-git=root -y github:0xmarkhydra/bolt-token-saver ...\`. On Windows PowerShell, use \`npx.cmd\` rather than \`npx\` when script execution policy blocks the \`.ps1\` shim.

### Recommended interactive installation

From an authorized real terminal / PTY:

\`\`\`text
npx -y github:0xmarkhydra/bolt-token-saver
\`\`\`

Then select the requested agent(s), select tools, inspect the summary and optional command preview, and get the human's go-ahead at the installation confirmation screen. The app makes backups of **known config files**, not every nested plugin artifact. See [docs/CONFIGURATION.md](docs/CONFIGURATION.md) for read-only config behavior.

### Non-interactive AI workflow (if PTY unavailable)

**As of v0.4, this project does not expose an automated \`--apply\` command.** Do not pretend \`--plan\` performs installation.

1. Clone/review the source in an allowed workspace if necessary: \`git clone https://github.com/0xmarkhydra/bolt-token-saver.git\`, then inspect \`src/core.mjs\` and upstream installation docs.
2. Determine the exact platform and requested agent(s)/tool(s), using the current \`plan(...)\` implementation as a *reference*. Be careful: \`--plan\` uses the TUI's default selections and may include **both** agents if both were found. Do not execute unrelated steps.
3. Give the user a short, readable change plan and obtain explicit approval.
4. After approval, run each allowlisted official upstream installation command through your terminal tool. Avoid piping unknown scripts into a shell; prefer established package managers and reviewed pinned versions where feasible. Back up affected configuration files before changes.
5. Run read-only verification, report actual errors, then provide any required restart commands.

If you lack OS access or execute permissions, **do not claim you installed anything**. Provide the one-line TUI command for the user's terminal instead.

## Do not damage users' existing agent setup

- Never overwrite \`~/.claude/settings.json\`, \`~/.codex/config.toml\`, other agent config, or \`AGENTS.md\` / \`CLAUDE.md\` in another project without reading the existing contents, making a backup, and getting consent.
- Do not request or display the user's API keys, auth tokens, internal endpoint URLs, cookies, or private prompts.
- **Headroom** is a local proxy that sees potentially sensitive prompt/tool traffic and needs an explicit dedicated launcher. Installing Headroom alone does not make it active; never silently change the user's normal upstream gateway.
- **RTK** can be confused with another command called \`rtk\`; verify the actual token optimizer via \`rtk gain\`.
- **Ponytail and Caveman** have agent-specific integration mechanisms. Installing one on Claude doesn't automatically install or activate it on Codex.
- Avoid assuming a package manager exists. If a command fails, stop, explain the missing prerequisite and offer an OS-appropriate fix rather than hiding the error.
- When an integration is modified, consult the official upstream instructions at the time of install; versions and flags can change.

## Suggested answer after installation

\`\`\`text
I've checked: <OS>, <selected agent>.
With your approval, I attempted: <selected tools>.

- RTK: <installed/configured/working/failed>, verification: <real command/result>
- Ponytail: <installed/configured/working/failed>
- Caveman (if requested): <result>
- Headroom (if requested): <result and separate launcher>
- Backup: <path or none>
- Action for you: <restart, confirm hook, or retry a failed step>

No API keys or endpoint values were displayed or changed.
\`\`\`

## One-line prompt the human can send

\`\`\`text
Read https://github.com/0xmarkhydra/bolt-token-saver/blob/main/AI_SETUP.md
and set up Bolt Token Saver for the AI coding tool I'm using now.
Detect my OS and existing installation first; recommend RTK + Ponytail.
Show the changes and ask me to approve before installing or editing settings.
Perform the setup through your authorized terminal, verify each result,
and tell me what still needs manual action. Do not print my API keys.
\`\`\`

**Note:** reading a GitHub URL doesn't grant you system permissions. This workflow requires an agent with access to the user's local terminal/workspace, such as a properly configured Claude Code, Codex CLI, or CodeLocal session. A browser-only chatbot without execution access can explain the steps but cannot install tools on the user's machine.
