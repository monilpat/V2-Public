import axios from "axios";
import { polygonConfig } from "@/lib/polygon";

const COINGECKO_PLATFORM = "polygon-pos";

const cache = new Map<string, number>();

export const fetchPriceUSD = async (address: string): Promise<number> => {
  const lower = address.toLowerCase();
  if (cache.has(lower)) return cache.get(lower)!;
  try {
    const resp = await axios.get(
      `https://api.coingecko.com/api/v3/simple/token_price/${COINGECKO_PLATFORM}`,
      { params: { contract_addresses: address, vs_currencies: "usd" } }
    );
    const price = resp.data?.[lower]?.usd;
    if (price) {
      cache.set(lower, price);
      return price;
    }
  } catch (e) {
    // ignore, fallback
  }
  return 0;
};

export const assetMeta = new Map(
  polygonConfig.assets.map((a) => [a.address.toLowerCase(), a])
);
