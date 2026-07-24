#!/usr/bin/env bash
# Arranca Monetixa sin FUSE (usa carpeta linux-unpacked).
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
APP="$DIR/linux-unpacked/monetixa"
if [[ ! -x "$APP" ]]; then
  APP="$(find "$DIR/linux-unpacked" -maxdepth 1 -type f -executable ! -name '*.so*' | head -1)"
fi
if [[ -z "${APP:-}" || ! -x "$APP" ]]; then
  echo "No se encontró el binario en linux-unpacked/"
  exit 1
fi
export ELECTRON_DISABLE_SANDBOX=1
exec env -u ELECTRON_RUN_AS_NODE "$APP" --no-sandbox "$@"
