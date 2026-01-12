import { Router, Request, Response } from "express";
import { resolveNetwork } from "../utils/network";
import { getFactory, getProvider } from "../utils/factory";
import erc20 from "../../abi/ERC20.json";
import { ethers } from "ethers";
import { fetchPriceUSD } from "../utils/prices";
import { formatUnits } from "ethers/lib/utils";
import { dhedge } from "../dhedge";

const statsRouter = Router();

statsRouter.get("/stats", async (req: Request, res: Response) => {
  try {
    const network = resolveNetwork(req.query.network as string | undefined);
    const factory = getFactory(network);
    const provider = getProvider(network);
    const pools: string[] = await factory.getDeployedFunds();

    let totalTvl = 0;
    for (const poolAddr of pools.slice(0, 50)) { // cap for speed
      try {
        const pool = await dhedge(network).loadPool(poolAddr);
        const composition = await pool.getComposition();
        for (const item of composition) {
          const balance = BigInt((item.balance as any)._hex || item.balance);
          const decimals = (item as any).decimals || 18;
          const balNum = Number(formatUnits(balance, decimals));
          const price = await fetchPriceUSD(item.asset);
          totalTvl += balNum * price;
        }
      } catch (_) {
        continue;
      }
    }

    res.status(200).send({
      status: "success",
      stats: {
        networks: 1,
        pools: pools.length,
        managers: pools.length, // placeholder
        tvl: totalTvl,
        daoFees: 0,
        managerFees: 0,
      },
    });
  } catch (err: any) {
    res.status(400).send({ status: "fail", msg: err?.message || err });
  }
});

export default statsRouter;
