#!/usr/bin/env bash
set -euo pipefail
export PATH="$HOME/.local/bin:$PATH"
command -v headroom >/dev/null || { echo "Headroom not installed. Run installer first." >&2; exit 1; }
exec headroom wrap codex "$@"
