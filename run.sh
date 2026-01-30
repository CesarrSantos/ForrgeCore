#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

PORT="${PORT:-5173}"

if ! command -v python3 >/dev/null 2>&1; then
  echo "python3 no está instalado. Instálalo y vuelve a intentar."
  echo "En Ubuntu/Debian: sudo apt-get install python3"
  exit 1
fi

echo "Starting static server on http://localhost:$PORT"
python3 -m http.server "$PORT"
