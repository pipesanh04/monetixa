#!/usr/bin/env bash
# Descarga el Release de GitHub y sube el feed a Hostinger por FTP.
#
# Uso:
#   export GH_TOKEN=...   # opcional si el repo es privado
#   export FTP_HOST=ftp.tudominio.com
#   export FTP_USER=...
#   export FTP_PASS=...
#   export FTP_DIR=public_html/monetixa
#   ./scripts/upload-updates.sh v0.1.5
set -euo pipefail

TAG="${1:-}"
if [[ -z "$TAG" ]]; then
  TAG="v$(node -p "require('./package.json').version")"
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/updates-upload"
REPO="${GITHUB_REPOSITORY:-pipesanh04/monetixa}"
API="https://api.github.com/repos/${REPO}/releases/tags/${TAG}"

rm -rf "$OUT"
mkdir -p "$OUT"

echo "==> Release $TAG"

AUTH_HEADER=()
if [[ -n "${GH_TOKEN:-}${GITHUB_TOKEN:-}" ]]; then
  AUTH_HEADER=(-H "Authorization: Bearer ${GH_TOKEN:-$GITHUB_TOKEN}")
fi

wget -qO "$OUT/release.json" "${AUTH_HEADER[@]}" "$API" || {
  echo "No se pudo leer el release $TAG (¿privado? define GH_TOKEN)"
  exit 1
}

python3 - <<'PY' "$OUT"
import json, sys, os, urllib.request
out = sys.argv[1]
data = json.load(open(os.path.join(out, "release.json")))
assets = data.get("assets") or []
if not assets:
    raise SystemExit("Release sin assets")
token = os.environ.get("GH_TOKEN") or os.environ.get("GITHUB_TOKEN") or ""
for a in assets:
    name = a["name"]
    url = a["url"]  # API asset URL (needs Accept header)
    dest = os.path.join(out, name)
    print(" descargando", name)
    req = urllib.request.Request(url, headers={
        "Accept": "application/octet-stream",
        "User-Agent": "monetixa-upload",
        **({"Authorization": f"Bearer {token}"} if token else {}),
    })
    with urllib.request.urlopen(req) as r, open(dest, "wb") as f:
        while True:
            chunk = r.read(1024 * 1024)
            if not chunk:
                break
            f.write(chunk)
print("listo")
PY

echo "==> Archivos en $OUT"
ls -lah "$OUT"

if [[ -z "${FTP_HOST:-}" || -z "${FTP_USER:-}" || -z "${FTP_PASS:-}" ]]; then
  echo
  echo "Faltan FTP_HOST / FTP_USER / FTP_PASS."
  echo "Los archivos quedaron en updates-upload/ — súbelos a public_html/monetixa/"
  echo "Necesarios: Monetixa.Setup.*.exe + *.blockmap + latest.yml + .htaccess"
  exit 0
fi

FTP_DIR="${FTP_DIR:-public_html/monetixa}"
echo "==> Subiendo a ftp://${FTP_HOST}/${FTP_DIR}"

# Prefer lftp, fallback python ftplib
if command -v lftp >/dev/null 2>&1; then
  lftp -c "
    set ssl:verify-certificate no;
    open -u ${FTP_USER},${FTP_PASS} ${FTP_HOST};
    cd ${FTP_DIR};
    mput -E ${OUT}/Monetixa.Setup.*.exe ${OUT}/Monetixa.Setup.*.blockmap ${OUT}/latest.yml ${OUT}/.htaccess 2>/dev/null || true;
    mput -E ${OUT}/*.exe ${OUT}/*.blockmap ${OUT}/latest.yml ${OUT}/.htaccess;
    bye
  "
else
  python3 - <<'PY' "$OUT" "$FTP_HOST" "$FTP_USER" "$FTP_PASS" "$FTP_DIR"
import ftplib, os, sys, ssl
out, host, user, passwd, remote = sys.argv[1:]
ftp = ftplib.FTP_TLS(host, timeout=120)
ftp.login(user, passwd)
try:
    ftp.prot_p()
except Exception:
    pass
for part in remote.strip("/").split("/"):
    if not part:
        continue
    try:
        ftp.cwd(part)
    except Exception:
        ftp.mkd(part)
        ftp.cwd(part)
wanted = []
for name in os.listdir(out):
    if name.endswith(".exe") or name.endswith(".blockmap") or name in ("latest.yml", ".htaccess"):
        if name.startswith("Monetixa-") and name.endswith("-portable.exe"):
            continue  # portable opcional
        wanted.append(name)
for name in sorted(wanted):
    path = os.path.join(out, name)
    size = os.path.getsize(path)
    print(f" subiendo {name} ({size} bytes)")
    with open(path, "rb") as f:
        ftp.storbinary(f"STOR {name}", f, blocksize=1024 * 256)
ftp.quit()
print("Upload OK")
PY
fi

echo "==> Verificando URL pública"
wget -qO- "https://sanbustv.io/monetixa/latest.yml" || true
