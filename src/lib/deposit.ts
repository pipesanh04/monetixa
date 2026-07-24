import type { Network, TokenConfig } from "./tokens";

/** QR por id de token (prioridad alta). */
export const TOKEN_QR_FILES: Record<string, string> = {
  "bnb-bitshiba": "/qr/bitshiba.jpeg",
  "bnb-babydoge": "/qr/babydoge.jpeg",
  "bnb-shib": "/qr/shib.jpeg",
  "bnb-tiger-new": "/qr/bnbtiger.jpeg",
  "bnb-tiger-old": "/qr/bnbtiger2.jpeg",
  "bnb-usdtz": "/qr/usdt.z.jpeg",
  "bnb-floki": "/qr/floki.jpeg",
  // Ethereum reutiliza QR de la misma marca (BSC)
  "eth-floki": "/qr/floki.jpeg",
  "eth-shib": "/qr/shib.jpeg",
};

/**
 * Fallback por símbolo cuando el mismo token existe en varias redes
 * (ej. FLOKI en ETH y BNB usan el mismo QR).
 */
export const SYMBOL_QR_FILES: Record<string, string> = {
  FLOKI: "/qr/floki.jpeg",
  SHIB: "/qr/shib.jpeg",
  BITSHIBA: "/qr/bitshiba.jpeg",
  BABYDOGE: "/qr/babydoge.jpeg",
  BNBTIGER: "/qr/bnbtiger.jpeg",
  "USDT.z": "/qr/usdt.z.jpeg",
};

/** Ruta del QR: depositQr → id → símbolo */
export function getDepositQrPath(token: TokenConfig): string | null {
  if (token.depositQr) return token.depositQr;
  if (TOKEN_QR_FILES[token.id]) return TOKEN_QR_FILES[token.id];
  return SYMBOL_QR_FILES[token.symbol] ?? null;
}

export function getNetworkDepositEnv(network: Network): string {
  if (network === "ethereum") return process.env.DEPOSIT_ETH?.trim() || "";
  if (network === "bsc") return process.env.DEPOSIT_BSC?.trim() || "";
  return process.env.DEPOSIT_SOL?.trim() || "";
}

export function getDepositWallet(token: TokenConfig): string | null {
  const specific = token.depositWallet?.trim();
  if (specific) return specific;
  const network = getNetworkDepositEnv(token.network);
  return network || null;
}

export function hasDepositQr(token: TokenConfig): boolean {
  return getDepositQrPath(token) != null || Boolean(getDepositWallet(token));
}

export function isValidTxHash(hash: string, network: Network): boolean {
  const h = hash.trim();
  if (!h) return false;
  if (network === "solana") {
    return /^[1-9A-HJ-NP-Za-km-z]{43,128}$/.test(h);
  }
  return /^0x[a-fA-F0-9]{64}$/.test(h);
}

export function qrDataUrl(data: string, size = 240): string {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
}
