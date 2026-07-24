import { logoForCoingeckoId } from "./logos";

export type Network = "ethereum" | "bsc" | "solana";

export type TokenConfig = {
  id: string;
  symbol: string;
  name: string;
  network: Network;
  /** Contract address (EVM) or mint address (Solana). Empty = native coin. */
  contractAddress: string;
  decimals: number;
  coingeckoId: string;
  /** URL del logo. Si se omite, se usa el mapa de CoinGecko. */
  logo?: string;
  isNative?: boolean;
  /** Dígitos mínimos en la parte entera de la cantidad (ej. 17 → mín. 10^16). */
  minDigits?: number;
  /** Cantidad mínima exacta (tiene prioridad sobre minDigits). Ej. 3.5B → 3500000000 */
  minAmount?: number;
  /** Wallet donde el cliente debe enviar el token (manual / QR). */
  depositWallet?: string;
  /** Ruta QR custom en /public, ej. /qr/bnb-bitshiba.png */
  depositQr?: string;
};

/**
 * Catálogo extensible: añade un objeto al array para integrar un token nuevo.
 * `minDigits`: cantidad mínima en dígitos enteros (sin perder precisión).
 */
export const TOKENS: TokenConfig[] = [
  // —— Ethereum ——
  {
    id: "eth-native",
    symbol: "ETH",
    name: "Ethereum",
    network: "ethereum",
    contractAddress: "",
    decimals: 18,
    coingeckoId: "ethereum",
    isNative: true,
  },
  {
    id: "eth-usdt",
    symbol: "USDT",
    name: "Tether USD",
    network: "ethereum",
    contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: 6,
    coingeckoId: "tether",
  },
  {
    id: "eth-floki",
    symbol: "FLOKI",
    name: "Floki",
    network: "ethereum",
    contractAddress: "0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E",
    decimals: 9,
    coingeckoId: "floki",
    minDigits: 11,
  },
  {
    id: "eth-usdc",
    symbol: "USDC",
    name: "USD Coin",
    network: "ethereum",
    contractAddress: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    decimals: 6,
    coingeckoId: "usd-coin",
    minDigits: 7,
  },
  {
    id: "eth-shib",
    symbol: "SHIB",
    name: "Shiba Inu",
    network: "ethereum",
    contractAddress: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
    decimals: 18,
    coingeckoId: "shiba-inu",
    minDigits: 12,
  },
  {
    id: "eth-wld",
    symbol: "WLD",
    name: "Worldcoin",
    network: "ethereum",
    contractAddress: "0x163f8C2467924be0ae7B5347228CABF260318753",
    decimals: 18,
    coingeckoId: "worldcoin-wld",
    minDigits: 7,
  },
  {
    id: "eth-pepe",
    symbol: "PEPE",
    name: "Pepe",
    network: "ethereum",
    contractAddress: "0x6982508145454Ce325dDbE47a25d4ec3d2311933",
    decimals: 18,
    coingeckoId: "pepe",
    minDigits: 13,
  },
  {
    id: "eth-eurc",
    symbol: "EURC",
    name: "Euro Coin",
    network: "ethereum",
    contractAddress: "0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c",
    decimals: 6,
    coingeckoId: "euro-coin",
    minDigits: 7,
  },

  // —— BNB Chain ——
  {
    id: "bnb-native",
    symbol: "BNB",
    name: "BNB",
    network: "bsc",
    contractAddress: "",
    decimals: 18,
    coingeckoId: "binancecoin",
    isNative: true,
  },
  {
    id: "bnb-usdt",
    symbol: "USDT",
    name: "Tether USD (BEP20)",
    network: "bsc",
    contractAddress: "0x55d398326f99059fF775485246999027B3197955",
    decimals: 18,
    coingeckoId: "tether",
  },
  {
    id: "bnb-bitshiba",
    symbol: "BITSHIBA",
    name: "BitShiba",
    network: "bsc",
    contractAddress: "0xB84cBbF09b3Ed388a45cD875ebba41a20365e6e7",
    decimals: 18,
    coingeckoId: "bitshiba",
    minDigits: 16,
  },
  {
    id: "bnb-babydoge",
    symbol: "BABYDOGE",
    name: "Baby Doge Coin",
    network: "bsc",
    contractAddress: "0xc748673057861a797275CD8A068AbB95A902e8de",
    decimals: 9,
    coingeckoId: "baby-doge-coin",
    minDigits: 16,
  },
  {
    id: "bnb-shib",
    symbol: "SHIB",
    name: "Shiba Inu (BEP20)",
    network: "bsc",
    contractAddress: "0x2859e4544C4bB03966803b044A93563Bd2D0DD4D",
    decimals: 18,
    coingeckoId: "shiba-inu",
    minDigits: 12,
  },
  {
    id: "bnb-tiger-new",
    symbol: "BNBTIGER",
    name: "BNB Tiger (nuevo)",
    network: "bsc",
    contractAddress: "0xf8584516b7d2c156c763c874d6813e06b57e4cb5",
    decimals: 9,
    coingeckoId: "bnb-tiger-inu",
    minDigits: 17,
  },
  {
    id: "bnb-tiger-old",
    symbol: "BNBTIGER",
    name: "BNB Tiger (legacy)",
    network: "bsc",
    contractAddress: "0xAC68931B666E086E9de380CFDb0Fb5704a35dc2D",
    decimals: 9,
    coingeckoId: "bnb-tiger-inu-old",
    minDigits: 24,
  },
  {
    id: "bnb-usdtz",
    symbol: "USDT.z",
    name: "Tether USD (Bridged)",
    network: "bsc",
    contractAddress: "0x4BE35Ec329343d7d9F548d42B0F8c17FFfe07db4",
    decimals: 18,
    coingeckoId: "tether",
    minAmount: 3_500_000_000, // 3.5B
  },
  {
    id: "bnb-floki",
    symbol: "FLOKI",
    name: "Floki (BEP20)",
    network: "bsc",
    contractAddress: "0xfb5b838b6cfeedc2873ab27866079ac55363d37e",
    decimals: 9,
    coingeckoId: "floki",
    minDigits: 11,
  },

  // —— Solana ——
  {
    id: "sol-native",
    symbol: "SOL",
    name: "Solana",
    network: "solana",
    contractAddress: "",
    decimals: 9,
    coingeckoId: "solana",
    isNative: true,
  },
  {
    id: "sol-usdt",
    symbol: "USDT",
    name: "Tether USD (Solana)",
    network: "solana",
    contractAddress: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
    decimals: 6,
    coingeckoId: "tether",
  },
];

export const NETWORK_LABELS: Record<Network, string> = {
  ethereum: "Ethereum",
  bsc: "BNB Chain",
  solana: "Solana",
};

/** Formatea 10^(digits-1) como string con comas (sin Number, evita hydration). */
export function formatMinFromDigits(digits: number): string {
  if (digits <= 0) return "0";
  const raw = `1${"0".repeat(digits - 1)}`;
  return raw.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function countIntegerDigits(amountStr: string): number {
  const trimmed = amountStr.trim();
  if (!trimmed) return 0;
  const intPart = trimmed.split(".")[0].replace(/^0+/, "") || "0";
  return intPart === "0" ? 0 : intPart.length;
}

export function getTokenLogo(token: TokenConfig): string | undefined {
  return token.logo || logoForCoingeckoId(token.coingeckoId);
}

export function getTokenById(id: string): TokenConfig | undefined {
  return TOKENS.find((t) => t.id === id);
}

/**
 * Tokens suspendidos temporalmente vía NEXT_PUBLIC_SUSPENDED_TOKENS.
 * Acepta ids (eth-usdt) o símbolos (USDT), separados por coma.
 * Ejemplo: USDT,bnb-floki,SHIB
 */
export function getSuspendedEntries(): string[] {
  const raw = process.env.NEXT_PUBLIC_SUSPENDED_TOKENS || "";
  return raw
    .split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

export function isTokenSuspended(token: TokenConfig): boolean {
  const entries = getSuspendedEntries();
  if (entries.length === 0) return false;
  const id = token.id.toUpperCase();
  const symbol = token.symbol.toUpperCase();
  return entries.some((e) => e === id || e === symbol);
}

export function getTokensByNetwork(network: Network): TokenConfig[] {
  return TOKENS.filter((t) => t.network === network);
}

export function getAvailableTokensByNetwork(network: Network): TokenConfig[] {
  return getTokensByNetwork(network).filter((t) => !isTokenSuspended(t));
}

export function meetsMinAmount(token: TokenConfig, amountStr: string): boolean {
  const trimmed = amountStr.trim();
  if (!trimmed) return false;
  const num = Number(trimmed);
  if (!Number.isFinite(num) || num <= 0) return false;
  if (token.minAmount != null) {
    return num >= token.minAmount;
  }
  if (!token.minDigits) return true;
  return countIntegerDigits(trimmed) >= token.minDigits;
}

export function formatMinAmount(token: TokenConfig): string | null {
  if (token.minAmount != null) {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(token.minAmount);
  }
  if (!token.minDigits) return null;
  return formatMinFromDigits(token.minDigits);
}

/** Muestra una parte del contrato/mint: 0xB84c…6e7 o Es9v…NYB */
export function formatContractShort(token: TokenConfig): string | null {
  const addr = token.contractAddress.trim();
  if (!addr) return null;
  if (token.network === "solana" && addr.length > 10) {
    return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
  }
  if (addr.startsWith("0x") && addr.length >= 10) {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }
  if (addr.length > 10) {
    return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
  }
  return addr;
}
