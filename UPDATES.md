# Auto-actualización de Monetixa

Cuando publiques una versión nueva, las apps instaladas la detectan, la descargan y piden reiniciar.

## Destino en Hostinger

Carpeta del File Manager:

```
public_html/monetixa/
```

Ahí van los archivos del feed (estáticos). La URL pública será:

```
https://TU-DOMINIO.com/monetixa
```

**Importante:** no uses la URL del File Manager (`srv…-files.hstgr.io/...`). Usa el dominio del sitio (el que apunta a `public_html`).

## 1. Configura la URL del feed

En `.env.local` (y en el `.env` empaquetado / `userData/.env`):

```env
UPDATE_FEED_URL=https://TU-DOMINIO.com/monetixa
```

Sin barra final. Ejemplo si tu dominio es `ejemplo.com`:

```env
UPDATE_FEED_URL=https://ejemplo.com/monetixa
```

## 2. Publicar una actualización

```bash
# 1) Sube la versión (obligatorio para que se detecte)
#    Edita package.json → "version": "0.1.1"

# 2) Genera ejecutables
npm run dist:linux
npm run dist:win
# en Mac: npm run dist:mac
# Alternativa Windows: GitHub Actions → Build Windows (NSIS + portable)

# 3) Copia artefactos al feed local
npm run updates:prepare

# 4) Sube TODO el contenido de updates/ a Hostinger → public_html/monetixa/
#    (Upload en el File Manager, o FTP/SFTP)
```

### Windows vía GitHub Actions

1. Actions → **Build Windows** → Run workflow (o `git push` de un tag `v*`).
2. Descarga el artifact `monetixa-updates-*` (incluye `latest.yml` + Setup `.exe`).
3. Súbelo a `public_html/monetixa/`.

## 3. Qué debe quedar en `public_html/monetixa/`

```
public_html/monetixa/
  latest-linux.yml
  Monetixa-0.1.1.AppImage
  Monetixa-0.1.1.AppImage.blockmap   (si existe)
  latest.yml                        (Windows)
  Monetixa Setup 0.1.1.exe          (Windows NSIS)
  …
```

Comprueba en el navegador (debe descargar/ver el YAML, no 404):

```
https://TU-DOMINIO.com/monetixa/latest-linux.yml
```

## 4. Probar en local

```bash
npm run updates:prepare
npm run updates:serve
```

En el `.env` de la app empaquetada:

```env
UPDATE_FEED_URL=http://127.0.0.1:9090
```

## Qué ve el usuario

1. Al abrir Monetixa busca updates (y cada 6 h).
2. Si hay versión nueva → aviso “Actualización disponible”.
3. Descarga en segundo plano.
4. Al terminar → “Reiniciar ahora” / “Más tarde”.

## Notas importantes

- **Debes subir el número de `version` en `package.json`** en cada release.
- Linux: funciona bien con **AppImage**.
- Windows: mejor el instalador **NSIS** (no el portable) para auto-update.
- Mac: requiere build en macOS; la firma de Apple es recomendable en producción.
- Serial Admin es aparte; este feed es solo para Monetixa.
- Hostinger: asegúrate de que `.yml` y `.AppImage` se sirven como archivos estáticos (por defecto sí).
