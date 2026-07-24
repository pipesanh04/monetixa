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

El AppImage queda en `serial-admin/release/`.

## Cómo se conecta con Monetixa

Monetixa valida un serial si:

1. Está en `VALID_SERIALS`, o
2. Tiene firma válida (`SERIAL_SECRET`), o
3. Está en `data/issued-serials.json` (botón “Guardar en registro”)

No hace falta pegar cada serial nuevo en `.env.local` si usan el mismo `SERIAL_SECRET`.
