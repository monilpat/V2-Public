import { Router, Request, Response } from "express";
import { getFactory, provider } from "../utils/factory";
import { dhedge } from "../dhedge";
import { resolveNetwork } from "../utils/network";
import { Network } from "@dhedge/v2-sdk";
import erc20 from "../../abi/ERC20.json";
import { ethers } from "ethers";
import { getManagerAndTrader } from "../utils/poolManager";

const statsRouter = Router();

// In-memory cache for share price history (for MVP)
const sharePriceCache = new Map<string, { timestamp: number; sharePrice: number; tvl: number }[]>();

import { fetchPriceUSD } from "../utils/prices";
import { formatUnits } from "ethers/lib/utils";

// Helper to compute TVL from composition using real prices
const computeTvl = async (composition: any[]): Promise<number> => {
  let total = 0;
  for (const item of composition) {
    try {
      const balance = BigInt(item.balance.hex || item.balance._hex || item.balance);
      const decimals = item.decimals || 18;
      const balanceFormatted = Number(formatUnits(balance, decimals));
      const price = await fetchPriceUSD(item.asset);
      total += balanceFormatted * price;
    } catch (e) {
      // Skip failed assets
      continue;
    }
  }
  return total;
};

// Helper to get share price (from pool's total supply and TVL)
const getSharePrice = async (poolAddress: string, composition: any[]): Promise<number> => {
  try {
    const contract = new ethers.Contract(poolAddress, erc20, provider);
    const totalSupply = await contract.totalSupply();
    const tvl = await computeTvl(composition);
    if (totalSupply.gt(0)) {
      return tvl / Number(ethers.utils.formatEther(totalSupply));
    }
    return 1; // Initial price
  } catch {
    return 1;
  }
};

statsRouter.get("/stats", async (_req: Request, res: Response) => {
  try {
    const network = resolveNetwork(_req.query.network as string | undefined);
    const factory = getFactory();
    const pools: string[] = await factory.getDeployedFunds();

    // Aggregate metrics
    let totalTvl = 0;
    const managerSet = new Set<string>();

    // For each pool, get basic info
    for (const poolAddr of pools) {
      try {
        const pool = await dhedge(network).loadPool(poolAddr);
        const composition = await pool.getComposition();
        const tvl = await computeTvl(composition);
        totalTvl += tvl;

        // Get manager address from PoolManagerLogic
        const { manager } = await getManagerAndTrader(poolAddr);
        if (manager && manager !== ethers.constants.AddressZero) {
          managerSet.add(manager.toLowerCase());
        }
      } catch (e) {
        // Skip failed pools
        continue;
      }
    }

    res.status(200).send({
      status: "success",
      stats: {
        totalTvl,
        vaultCount: pools.length,
        managerCount: managerSet.size || 0, // Stub: 0 for now
        totalFees: 0, // Stub: would need to query from contracts
        networks: [
          {
            network: network === Network.POLYGON ? "Polygon" : network,
            tvl: totalTvl,
            vaults: pools.length,
            managers: managerSet.size || 0,
            fees: 0,
          },
        ],
      },
    });
  } catch (err: any) {
    res.status(400).send({ status: "fail", msg: err?.message || err });
  }
});

export default statsRouter;
