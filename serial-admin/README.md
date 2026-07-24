# Monetixa Serial Admin

App de escritorio para generar seriales profesionales que **Monetixa acepta automáticamente**.

## Formato

```
MBX-PRO-A7K2-9MPQ-C3F1
```

El último bloque es un **checksum** firmado con `SERIAL_SECRET` (mismo valor en Monetixa y en este admin).

## Requisitos

En `../.env.local` (Monetixa):

```env
SERIAL_SECRET=monetixa-change-me-pro-2026
```

Cambia ese secreto en producción.

## Uso (desarrollo)

```bash
cd serial-admin
npm install
npm start
```

## Ejecutable Linux

```bash
cd serial-admin
npm install
npm run dist:linux
```

El AppImage / `start-linux.sh` queda en `serial-admin/release/`.

```bash
cd release && ./start-linux.sh
```

## Ejecutable Windows

```bash
cd serial-admin
npm install
npm run dist:win:portable   # desde Linux (portable)
# o en GitHub Actions: Build Serial Admin Windows → Run workflow
```

Artefacto local: `serial-admin/release/MonetixaSerialAdmin-0.1.0.exe`

En GitHub: Release prerelease `serial-admin-windows-ci` (NSIS + portable).

## Cómo se conecta con Monetixa

Monetixa valida un serial si:

1. Está en `VALID_SERIALS`, o
2. Tiene firma válida (`SERIAL_SECRET`), o
3. Está en `data/issued-serials.json` (botón “Guardar en registro”)

No hace falta pegar cada serial nuevo en `.env.local` si usan el mismo `SERIAL_SECRET`.
