import { logoForCoingeckoId } from "./logos";

export type PayoutAssetId =
  | "usdt-ethereum"
  | "usdt-bsc"
  | "usdt-solana"
  | "usdt-tron"
  | "btc"
  | "eth"
  | "bnb"
  | "sol";

export type PayoutAsset = {
  id: PayoutAssetId;
  symbol: string;
  name: string;
  networkLabel: string;
  coingeckoId: string;
  logo?: string;
};

export const PAYOUT_ASSETS: PayoutAsset[] = [
  {
    id: "usdt-ethereum",
    symbol: "USDT",
    name: "Tether",
    networkLabel: "Ethereum (ERC-20)",
    coingeckoId: "tether",
  },
  {
    id: "usdt-bsc",
    symbol: "USDT",
    name: "Tether",
    networkLabel: "BNB Chain (BEP-20)",
    coingeckoId: "tether",
  },
  {
    id: "usdt-solana",
    symbol: "USDT",
    name: "Tether",
    networkLabel: "Solana",
    coingeckoId: "tether",
  },
  {
    id: "usdt-tron",
    symbol: "USDT",
    name: "Tether",
    networkLabel: "Tron (TRC-20)",
    coingeckoId: "tether",
  },
  {
    id: "btc",
    symbol: "BTC",
    name: "Bitcoin",
    networkLabel: "Bitcoin",
    coingeckoId: "bitcoin",
  },
  {
    id: "eth",
    symbol: "ETH",
    name: "Ethereum",
    networkLabel: "Ethereum",
    coingeckoId: "ethereum",
  },
  {
    id: "bnb",
    symbol: "BNB",
    name: "BNB",
    networkLabel: "BNB Chain",
    coingeckoId: "binancecoin",
  },
  {
    id: "sol",
    symbol: "SOL",
    name: "Solana",
    networkLabel: "Solana",
    coingeckoId: "solana",
  },
];

export function getPayoutLogo(asset: PayoutAsset): string | undefined {
  return asset.logo || logoForCoingeckoId(asset.coingeckoId);
}

export function getPayoutAsset(id: PayoutAssetId): PayoutAsset | undefined {
  return PAYOUT_ASSETS.find((a) => a.id === id);
}
