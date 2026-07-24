/** Boost promocional inicial (+20%). Ajustable vía NEXT_PUBLIC_PROMO_BOOST. */
export function getPromoBoost(): number {
  const raw = process.env.NEXT_PUBLIC_PROMO_BOOST;
  const parsed = raw != null ? Number(raw) : 0.2;
  if (!Number.isFinite(parsed) || parsed < 0) return 0.2;
  return parsed;
}

export function getPromoMultiplier(): number {
  return 1 + getPromoBoost();
}

export function getPromoPercentLabel(): string {
  return `${Math.round(getPromoBoost() * 100)}%`;
}

/** Precio unitario × cantidad = valor de mercado en USD. */
export function calcMarketUsd(amount: number, tokenPriceUsd: number): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  if (!Number.isFinite(tokenPriceUsd) || tokenPriceUsd < 0) return 0;
  return amount * tokenPriceUsd;
}

/** Valor de pago con boost promocional transparente. */
export function calcPaymentUsd(amount: number, tokenPriceUsd: number): number {
  return applyPromo(calcMarketUsd(amount, tokenPriceUsd));
}

export function applyPromo(marketUsd: number): number {
  if (!Number.isFinite(marketUsd) || marketUsd <= 0) return 0;
  return marketUsd * getPromoMultiplier();
}

/** USD / precio de la moneda de cobro = cantidad a recibir. */
export function calcPayoutAmount(
  paymentUsd: number,
  payoutPriceUsd: number,
): number {
  if (!Number.isFinite(paymentUsd) || paymentUsd <= 0) return 0;
  if (!Number.isFinite(payoutPriceUsd) || payoutPriceUsd <= 0) return 0;
  return paymentUsd / payoutPriceUsd;
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCrypto(value: number, maxDecimals = 8): string {
  if (!Number.isFinite(value) || value === 0) return "0";
  if (value >= 1000) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 2,
    }).format(value);
  }
  if (value >= 1) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 6,
    }).format(value);
  }
  return new Intl.NumberFormat("en-US", {
    maximumSignificantDigits: Math.min(maxDecimals, 8),
  }).format(value);
}

export const TICKER_IDS = [
  "bitcoin",
  "ethereum",
  "binancecoin",
  "solana",
  "tether",
] as const;

export const TICKER_LABELS: Record<(typeof TICKER_IDS)[number], string> = {
  bitcoin: "BTC",
  ethereum: "ETH",
  binancecoin: "BNB",
  solana: "SOL",
  tether: "USDT",
};
