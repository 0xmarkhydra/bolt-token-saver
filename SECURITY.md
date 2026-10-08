# Security policy

- Installers execute commands only after the user reviews and confirms them.
- Dependencies are fetched from upstream package managers/GitHub.
- Existing global agent configuration is backed up before changes.
- API keys are never requested/stored by Bolt Token Saver.
- Proxy traffic can contain private prompts and source code: keep Headroom local.
- Inspect commands when updating upstream versions; do not run arbitrary user input.
- Report issues through GitHub Issues without posting credentials or private source code.
