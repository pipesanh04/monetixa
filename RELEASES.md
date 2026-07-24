# Ejecutables Monetixa

## Serial Admin (solo Linux)

Carpeta: `serial-admin/release/`

| Archivo | Uso |
|---------|-----|
| `start-linux.sh` | **Recomendado** si AppImage falla por FUSE |
| `MonetixaSerialAdmin-0.1.0-linux-x64.tar.gz` | Empaque portable |
| `MonetixaSerialAdmin-0.1.0.AppImage` | AppImage (requiere libfuse2) |

```bash
cd serial-admin/release
./start-linux.sh
```

O sin FUSE:
```bash
./MonetixaSerialAdmin-0.1.0.AppImage --appimage-extract-and-run
```

Regenerar:
```bash
npm run serial:dist
```

## Monetixa (Linux + Windows)

Carpeta: `release/`

### Linux
| Archivo | Uso |
|---------|-----|
| `start-linux.sh` | **Recomendado** sin FUSE |
| `Monetixa-0.1.0-linux-x64.tar.gz` | Portable |
| `Monetixa-0.1.0.AppImage` | AppImage |

```bash
cd release
./start-linux.sh
```

### Windows
| Archivo | Uso |
|---------|-----|
| `Monetixa 0.1.3.exe` | **Portable** — copia y ábrelo en Windows (sin instalador) |
| `Monetixa Setup 0.1.3.exe` | **NSIS** — instalador con **auto-update** (requiere build con Wine o CI) |

```bash
# Portable (funciona desde Linux sin Wine)
npm run dist:win:portable

# NSIS + portable (NSIS necesita Wine 32-bit o GitHub Actions)
npm run dist:win
```

**Auto-update en Windows:** usa el instalador NSIS. Genera el Setup en GitHub Actions
(`.github/workflows/build-windows.yml`) o en un PC Windows, luego:

```bash
npm run updates:prepare
# Sube updates/ → public_html/monetixa/ (incluye latest.yml + Setup .exe)
```

Copia el `.exe` portable a un PC Windows y ábrelo.


### macOS
El build de Mac **debe hacerse en un Mac**:

```bash
npm run dist:mac
```

Quedará un `.dmg` / `.zip` en `release/`.

## Auto-actualización

Ver guía completa: [`UPDATES.md`](UPDATES.md)

Resumen: sube `version` en `package.json` → `npm run dist:linux` / `dist:win` → `npm run updates:prepare` → sube `updates/` a tu servidor → configura `UPDATE_FEED_URL`.

### GitHub Actions (Windows)

Workflow: [`.github/workflows/build-windows.yml`](.github/workflows/build-windows.yml)

1. Sube el código a `main` (incluye el workflow).
2. **Manual:** GitHub → Actions → **Build Windows** → Run workflow → descarga desde Release prerelease `windows-ci`.
3. **Por tag:** `git tag v0.1.4 && git push origin v0.1.4` (crea Release estable con los `.exe`).
4. Sube Setup + `latest.yml` a `public_html/monetixa/`.

> Los instaladores se publican en **GitHub Releases** (no Artifacts) para no consumir la cuota de storage de Actions.
