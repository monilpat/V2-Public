import { fetchPriceUSD } from "./prices";
import { formatUnits } from "viem";
import { assetMeta } from "./prices";

export const computePortfolioValue = async (composition: any[]): Promise<number> => {
  let total = 0;
  for (const item of composition) {
    const meta = assetMeta.get(item.asset.toLowerCase());
    if (!meta) continue;
    const bal = Number(formatUnits(BigInt(item.balance.hex || item.balance._hex || item.balance), meta.decimals));
    const price = await fetchPriceUSD(item.asset);
    total += bal * price;
  }
  return total;
};
