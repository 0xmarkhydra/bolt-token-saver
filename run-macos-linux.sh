#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")"
if ! command -v node >/dev/null 2>&1; then
  echo "Node.js 20+ required: https://nodejs.org/en/download"
  exit 1
fi
node -e 'process.exit(Number(process.versions.node.split(".")[0])>=20?0:1)' || { echo "Please upgrade Node.js"; exit 1; }
exec node src/cli.mjs "$@"
