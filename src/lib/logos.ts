/** Logos por coingeckoId — usados en catálogo y ticker. */
export const COINGECKO_LOGOS: Record<string, string> = {
  bitcoin:
    "https://coin-images.coingecko.com/coins/images/1/small/bitcoin.png",
  ethereum:
    "https://coin-images.coingecko.com/coins/images/279/small/ethereum.png",
  binancecoin:
    "https://coin-images.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  solana:
    "https://coin-images.coingecko.com/coins/images/4128/small/solana.png",
  tether:
    "https://coin-images.coingecko.com/coins/images/325/small/Tether.png",
  "usd-coin":
    "https://coin-images.coingecko.com/coins/images/6319/small/usdc.png",
  "shiba-inu":
    "https://coin-images.coingecko.com/coins/images/11939/small/shiba.png",
  "baby-doge-coin":
    "https://coin-images.coingecko.com/coins/images/16125/small/babydoge.jpg",
  floki:
    "https://coin-images.coingecko.com/coins/images/16746/small/PNG_image.png",
  "bnb-tiger-inu":
    "https://coin-images.coingecko.com/coins/images/69021/small/IMG-20220111-212721-633.jpg",
  "bnb-tiger-inu-old":
    "https://coin-images.coingecko.com/coins/images/16500/small/bnbtiger.jpg",
  pepe:
    "https://coin-images.coingecko.com/coins/images/29850/small/pepe-token.jpeg",
  "worldcoin-wld":
    "https://coin-images.coingecko.com/coins/images/31069/small/worldcoin.jpeg",
  "euro-coin":
    "https://coin-images.coingecko.com/coins/images/26045/small/euro.png",
  bitshiba:
    "https://coin-images.coingecko.com/coins/images/25208/small/bitshiba.png",
};

export function logoForCoingeckoId(id: string): string | undefined {
  return COINGECKO_LOGOS[id];
}
