# Monetixa

App de escritorio (Electron + Next.js) para buyback/canje de tokens en **Ethereum**, **BNB Chain** y **Solana**.

Repo: [github.com/pipesanh04/monetixa](https://github.com/pipesanh04/monetixa)

---

## ¿Sirve en otro PC?

### Opción A — Ejecutable (recomendado para pruebas)

Sí. Copia el `.exe` (Windows) o el AppImage / `start-linux.sh` (Linux) y ábrelo.

- No hace falta clonar el repo ni `npm install`.
- Windows puede avisar de “app desconocida” (no está firmada): elige ejecutar de todos modos.
- Seriales demo: `DEMO-SERIAL-2026`, `MBX-ALPHA-001`

Los instaladores **no** están en GitHub (pesan mucho). Se generan localmente y quedan en `release/`.

### Opción B — Código desde GitHub (desarrollo / volver a empaquetar)

También sirve, pero hay que instalar dependencias y crear `.env.local` (ese archivo **no** se sube a Git por seguridad).

```bash
git clone git@github.com:pipesanh04/monetixa.git
cd monetixa
npm install
```

Luego sigue la sección **Crear `.env.local`** y ejecuta:

```bash
npm run dev                 # navegador
# o
npm run electron:start      # ventana Electron (hace build)
```

---

## Crear `.env.local` (paso a paso)

`.env.local` no está en el repo. En cada PC nuevo hay que crearlo así:

### 1. Copiar la plantilla

```bash
cp .env.example .env.local
```

### 2. Abrir el archivo

```bash
# Linux / macOS
nano .env.local

# o ábrelo en Cursor / VS Code
```

### 3. Revisar y completar variables

| Variable | Qué es | Ejemplo / notas |
|----------|--------|-----------------|
| `VALID_SERIALS` | Seriales fijos que pueden entrar | `DEMO-SERIAL-2026,MBX-ALPHA-001,MBX-BETA-002` |
| `SERIAL_SECRET` | Secreto para firmar seriales `MBX-…` | Debe ser **el mismo** en Monetixa y en Serial Admin |
| `DEPOSIT_ETH` / `DEPOSIT_BSC` / `DEPOSIT_SOL` | Wallets de depósito (fallback) | Déjalas vacías si usas QR por token |
| `NOTIFY_EMAIL` | Correo al confirmar TXN | Tu email de operaciones |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | Envío de correo | Opcional; sin SMTP solo se registra la orden |
| `NEXT_PUBLIC_APP_NAME` | Nombre en la UI | `Monetixa` |
| `NEXT_PUBLIC_PROMO_BOOST` | Boost sobre precio de mercado | `0.20` = +20%. Ajusta a tu política |
| `NEXT_PUBLIC_SUSPENDED_TOKENS` | Tokens pausados (símbolo o id) | `bnb-usdt` o `USDT,FLOKI`. Vacío = todos activos |
| `UPDATE_FEED_URL` | URL del feed de auto-update | `https://sanbustv.io/monetixa` |

### 4. Guardar y reiniciar

Después de editar `.env.local`:

- En desarrollo: detén `npm run dev` y vuelve a arrancarlo.
- En ejecutable empaquetado: vuelve a generar el build (`npm run dist:linux` / portable Windows) para que el `.env` embebido tome los cambios, **o** configura el `.env` en la carpeta de datos de la app.

### Plantilla mínima para arrancar

```env
VALID_SERIALS=DEMO-SERIAL-2026,MBX-ALPHA-001,MBX-BETA-002
SERIAL_SECRET=monetixa-change-me-pro-2026
NEXT_PUBLIC_APP_NAME=Monetixa
NEXT_PUBLIC_PROMO_BOOST=0.20
NEXT_PUBLIC_SUSPENDED_TOKENS=
UPDATE_FEED_URL=https://sanbustv.io/monetixa
NOTIFY_EMAIL=gladiusfinance.org@gmail.com
```

---

## Generar ejecutables

```bash
npm install

# Linux → release/ (AppImage + start-linux.sh)
npm run dist:linux

# Windows (desde Linux: portable; NSIS necesita Wine)
CSC_IDENTITY_AUTO_DISCOVERY=false npx electron-builder --win portable --publish never
# o: npm run dist:win   (si tienes Wine para el Setup)

# Mac (solo en macOS)
npm run dist:mac
```

Artefactos en `release/`.

### Linux sin FUSE

```bash
cd release
./start-linux.sh
```

### Feed de actualizaciones

Ver [UPDATES.md](UPDATES.md). Resumen:

```bash
# 1) Sube version en package.json
# 2) npm run dist:linux
# 3) npm run updates:prepare
# 4) Sube updates/ a Hostinger → public_html/monetixa/
```

---

## Serial Admin

Herramienta aparte para emitir seriales firmados (`serial-admin/`):

```bash
npm --prefix serial-admin install
npm run serial:admin
```

Usa el **mismo** `SERIAL_SECRET` que Monetixa.

---

## Notas útiles

- **Añadir tokens:** [`src/lib/tokens.ts`](src/lib/tokens.ts)
- **Idiomas:** ES / EN / FR / ZH (selector en login y dashboard)
- **Suspender tokens:** `NEXT_PUBLIC_SUSPENDED_TOKENS` (coma: `USDT` suspende todas las redes; `bnb-usdt` solo BSC)
- Documentación extra: [RELEASES.md](RELEASES.md), [TOKEN_IDS.md](TOKEN_IDS.md), [UPDATES.md](UPDATES.md)
