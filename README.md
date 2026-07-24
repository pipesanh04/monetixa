# Monetixa — Buyback de tokens (escritorio)

App de buyback/canje en **Ethereum**, **BNB Chain** y **Solana**. Pensada como **ejecutable de escritorio** (Windows, Linux, Mac) con Electron. Precios de mercado + **boost promocional configurable** (inicial +20%).

## Desarrollo (navegador local)

```bash
cp .env.example .env.local
npm install
npm run dev
```

Seriales demo: `DEMO-SERIAL-2026`, `MBX-ALPHA-001`, `MBX-BETA-002`

## Ejecutable de escritorio

```bash
# Instalar deps (incluye Electron)
npm install

# Probar ventana de escritorio (requiere `npm run build` previo, o en paralelo `npm run dev` + electron:dev)
npm run electron:start

# Empaquetar instaladores
npm run dist          # según tu SO
npm run dist:linux    # AppImage + deb
npm run dist:win      # NSIS
npm run dist:mac      # DMG
```

Los artefactos quedan en `release/`.

En escritorio **no se abre por un link público**: Electron levanta un servidor local interno (`127.0.0.1`) solo dentro de la ventana.

## Boost promocional (+20%)

En `.env.local`:

```
NEXT_PUBLIC_PROMO_BOOST=0.20
```

La UI muestra valor de mercado y pago promocional por separado. Cambia el valor cuando ajustes porcentajes.

## Añadir tokens

Edita [`src/lib/tokens.ts`](src/lib/tokens.ts).

## Treasury

```
TREASURY_ETH=0x...
TREASURY_BSC=0x...
TREASURY_SOL=...
```

Si están vacías, el flujo usa modo demo (sin on-chain).
