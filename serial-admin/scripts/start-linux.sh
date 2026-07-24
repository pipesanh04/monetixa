#!/usr/bin/env bash
# Arranca Monetixa Serial Admin sin FUSE (usa carpeta linux-unpacked).
set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
UNPACKED="$DIR/linux-unpacked"

# electron-builder nombra el binario según package.name
CANDIDATES=(
  "$UNPACKED/monetixa-serial-admin"
  "$UNPACKED/MonetixaSerialAdmin"
  "$UNPACKED/monetixaserialadmin"
)

APP=""
for c in "${CANDIDATES[@]}"; do
  if [[ -x "$c" ]]; then
    APP="$c"
    break
  fi
done

if [[ -z "$APP" ]]; then
  APP="$(
    find "$UNPACKED" -maxdepth 1 -type f -executable \
      ! -name '*.so*' \
      ! -name 'chrome*' \
      ! -name 'lib*' \
      2>/dev/null | head -1 || true
  )"
fi

if [[ -z "${APP:-}" || ! -x "$APP" ]]; then
  echo "No se encontró el binario en linux-unpacked/"
  echo "Esperado: monetixa-serial-admin"
  exit 1
fi

export ELECTRON_DISABLE_SANDBOX=1
exec env -u ELECTRON_RUN_AS_NODE "$APP" --no-sandbox "$@"
