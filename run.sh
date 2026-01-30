#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR/forja-del-nucleo"

PORT="${PORT:-5173}"

echo "Starting static server on http://localhost:$PORT"
python3 -m http.server "$PORT"
