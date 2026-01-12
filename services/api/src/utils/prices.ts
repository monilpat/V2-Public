import axios from "axios";

const COINGECKO_PLATFORM = "polygon-pos";
const cache = new Map<string, { price: number; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const fetchPriceUSD = async (address: string): Promise<number> => {
  const lower = address.toLowerCase();
  const cached = cache.get(lower);
  
  // Return cached price if still valid
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.price;
  }

  try {
    const resp = await axios.get(
      `https://api.coingecko.com/api/v3/simple/token_price/${COINGECKO_PLATFORM}`,
      { 
        params: { contract_addresses: address, vs_currencies: "usd" },
        timeout: 5000,
      }
    );
    const price = resp.data?.[lower]?.usd;
    if (price) {
      cache.set(lower, { price, timestamp: Date.now() });
      return price;
    }
  } catch (e) {
    console.warn(`Failed to fetch price for ${address}:`, e);
  }
  
  // Return cached price even if expired, or 0
  return cached?.price || 0;
};
