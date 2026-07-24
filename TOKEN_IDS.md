# IDs de tokens (referencia)

Usa estos **ids** o **símbolos** en `.env.local` para suspender monetización:

```env
NEXT_PUBLIC_SUSPENDED_TOKENS=USDT
# o por id específico:
NEXT_PUBLIC_SUSPENDED_TOKENS=eth-usdt,bnb-usdt,sol-usdt
```

Fuente oficial del catálogo: [`src/lib/tokens.ts`](src/lib/tokens.ts)

---

## Ethereum

| ID | Símbolo | Nombre |
|----|---------|--------|
| `eth-native` | ETH | Ethereum |
| `eth-usdt` | USDT | Tether USD |
| `eth-floki` | FLOKI | Floki |
| `eth-usdc` | USDC | USD Coin |
| `eth-shib` | SHIB | Shiba Inu |
| `eth-wld` | WLD | Worldcoin |
| `eth-pepe` | PEPE | Pepe |
| `eth-eurc` | EURC | Euro Coin |

## BNB Chain

| ID | Símbolo | Nombre |
|----|---------|--------|
| `bnb-native` | BNB | BNB |
| `bnb-usdt` | USDT | Tether USD (BEP20) |
| `bnb-bitshiba` | BITSHIBA | BitShiba |
| `bnb-babydoge` | BABYDOGE | Baby Doge Coin |
| `bnb-shib` | SHIB | Shiba Inu (BEP20) |
| `bnb-tiger-new` | BNBTIGER | BNB Tiger (nuevo) |
| `bnb-tiger-old` | BNBTIGER | BNB Tiger (legacy) |
| `bnb-usdtz` | USDT.z | Tether USD (Bridged) |
| `bnb-floki` | FLOKI | Floki (BEP20) |

## Solana

| ID | Símbolo | Nombre |
|----|---------|--------|
| `sol-native` | SOL | Solana |
| `sol-usdt` | USDT | Tether USD (Solana) |

---

## Lista rápida (solo IDs)

```
eth-native
eth-usdt
eth-floki
eth-usdc
eth-shib
eth-wld
eth-pepe
eth-eurc
bnb-native
bnb-usdt
bnb-bitshiba
bnb-babydoge
bnb-shib
bnb-tiger-new
bnb-tiger-old
bnb-usdtz
bnb-floki
sol-native
sol-usdt
```

## Notas

- Si suspendes por **símbolo** (ej. `USDT`), se suspenden **todas** las redes con ese símbolo.
- Si suspendes por **id** (ej. `bnb-usdt`), solo ese token.
- `USDT.z` es símbolo distinto a `USDT`; para suspenderlo usa `USDT.z` o `bnb-usdtz`.
