import type { Network } from "./tokens";

const EVM_RE = /^0x[a-fA-F0-9]{40}$/;
const SOL_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
const BTC_RE =
  /^(bc1[a-z0-9]{25,87}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/;
/** Direcciones Tron (base58, empiezan por T). */
const TRON_RE = /^T[1-9A-HJ-NP-Za-km-z]{33}$/;

export function isValidEvmAddress(address: string): boolean {
  return EVM_RE.test(address.trim());
}

export function isValidSolAddress(address: string): boolean {
  return SOL_RE.test(address.trim());
}

export function isValidBtcAddress(address: string): boolean {
  return BTC_RE.test(address.trim());
}

export function isValidTronAddress(address: string): boolean {
  return TRON_RE.test(address.trim());
}

/** Valida wallet de destino según la moneda de cobro. */
export function isValidDestinationWallet(
  address: string,
  payoutId: string,
): boolean {
  const a = address.trim();
  if (!a) return false;
  if (payoutId === "btc") return isValidBtcAddress(a);
  if (payoutId === "sol" || payoutId === "usdt-solana") {
    return isValidSolAddress(a);
  }
  if (payoutId === "usdt-tron") return isValidTronAddress(a);
  return isValidEvmAddress(a);
}

/** Valida dirección según la red del token a enviar (treasury / source). */
export function isValidNetworkAddress(
  address: string,
  network: Network,
): boolean {
  if (network === "solana") return isValidSolAddress(address);
  return isValidEvmAddress(address);
}

export type TreasuryConfig = {
  eth: string;
  bsc: string;
  sol: string;
};

export function getTreasuryFromEnv(): TreasuryConfig {
  return {
    eth: process.env.TREASURY_ETH?.trim() || "",
    bsc: process.env.TREASURY_BSC?.trim() || "",
    sol: process.env.TREASURY_SOL?.trim() || "",
  };
}

export function getTreasuryForNetwork(
  network: Network,
  treasury?: TreasuryConfig,
): string {
  const t = treasury ?? getTreasuryFromEnv();
  if (network === "ethereum") return t.eth;
  if (network === "bsc") return t.bsc;
  return t.sol;
}

export function isTreasuryConfigured(network: Network): boolean {
  const addr = getTreasuryForNetwork(network);
  if (!addr) return false;
  return isValidNetworkAddress(addr, network);
}

/** Expuesto al cliente vía API (sin secretos). */
export function getPublicTreasuryStatus() {
  return {
    ethereum: isTreasuryConfigured("ethereum"),
    bsc: isTreasuryConfigured("bsc"),
    solana: isTreasuryConfigured("solana"),
    addresses: {
      ethereum: process.env.TREASURY_ETH?.trim() || null,
      bsc: process.env.TREASURY_BSC?.trim() || null,
      solana: process.env.TREASURY_SOL?.trim() || null,
    },
  };
}
