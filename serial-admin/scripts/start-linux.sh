#!/usr/bin/env bash
# Arranca Monetixa Serial Admin sin FUSE (usa carpeta linux-unpacked).
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
APP="$DIR/linux-unpacked/monetixaserialadmin"
if [[ ! -x "$APP" ]]; then
  APP="$DIR/linux-unpacked/MonetixaSerialAdmin"
fi
if [[ ! -x "$APP" ]]; then
  APP="$(find "$DIR/linux-unpacked" -maxdepth 1 -type f -executable ! -name '*.so*' | head -1 || true)"
fi
if [[ -z "${APP:-}" || ! -x "$APP" ]]; then
  echo "No se encontró el binario en linux-unpacked/"
  exit 1
fi
export ELECTRON_DISABLE_SANDBOX=1
exec env -u ELECTRON_RUN_AS_NODE "$APP" --no-sandbox "$@"
