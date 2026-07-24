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
| `Monetixa 0.1.0.exe` | Portable (no requiere instalador) |

Copia el `.exe` a un PC Windows y ábrelo.

### macOS
El build de Mac **debe hacerse en un Mac**:

```bash
npm run dist:mac
```

Quedará un `.dmg` / `.zip` en `release/`.

## Auto-actualización

Ver guía completa: [`UPDATES.md`](UPDATES.md)

Resumen: sube `version` en `package.json` → `npm run dist:linux` / `dist:win` → `npm run updates:prepare` → sube `updates/` a tu servidor → configura `UPDATE_FEED_URL`.
