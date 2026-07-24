import type { Network } from "./tokens";

export type RetainedToken = {
  id: string;
  symbol: string;
  name: string;
  network: Network;
  contractAddress: string;
  /** Cantidad retenida (unidades enteras del token). */
  retainedAmount: number;
  /**
   * Cupo mínimo a aportar para quitar la retención
   * (ej. 2_000_000_000 = 2B).
   */
  releaseQuota: number;
  coingeckoId: string;
};

/** Tokens con liquidez retenida / en custodia. */
export const RETAINED_TOKENS: RetainedToken[] = [
  {
    id: "bnb-usdtz",
    symbol: "USDT.z",
    name: "Tether USD (Bridged)",
    network: "bsc",
    contractAddress: "0x4BE35Ec329343d7d9F548d42B0F8c17FFfe07db4",
    retainedAmount: 250_000_000,
    releaseQuota: 2_000_000_000,
    coingeckoId: "tether",
  },
];

export function getRetainedById(id: string): RetainedToken | undefined {
  return RETAINED_TOKENS.find((t) => t.id === id);
}

export function formatQuotaAmount(amount: number, locale = "es"): string {
  if (amount >= 1_000_000_000 && amount % 1_000_000_000 === 0) {
    const billions = amount / 1_000_000_000;
    const n = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(billions);
    return `${n}B`;
  }
  if (amount >= 1_000_000 && amount % 1_000_000 === 0) {
    const millions = amount / 1_000_000;
    const n = new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(millions);
    if (locale === "es") return `${n} millones`;
    if (locale === "fr") return `${n} millions`;
    if (locale === "zh") return `${amount / 100_000_000}亿`;
    return `${n} million`;
  }
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(
    amount,
  );
}

export function formatQuotaExact(amount: number, locale = "es"): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(
    amount,
  );
}

export function meetsReleaseQuota(
  amountStr: string,
  quota: number,
): boolean {
  const trimmed = amountStr.trim();
  if (!trimmed) return false;
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num <= 0) return false;
  return num >= quota;
}
