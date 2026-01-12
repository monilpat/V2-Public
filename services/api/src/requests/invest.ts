import { ethers as sdkEthers } from "@dhedge/v2-sdk";
import { Router, Request, Response } from "express";
import { ethers } from "ethers";
import { formatUnits } from "ethers/lib/utils";
import { dhedge } from "../dhedge";
import { resolveNetwork } from "../utils/network";
import { getFactory, getProvider } from "../utils/factory";
import { fetchPriceUSD } from "../utils/prices";
import erc20 from "../../abi/ERC20.json";

const investRouter = Router();

investRouter.post("/approveDeposit", async (req: Request, res: Response) => {
  try {
    const network = resolveNetwork(req.query.network as string | undefined);
    const poolAddress = req.query.pool as string;
    const pool = await dhedge(network).loadPool(poolAddress);
    const tx = await pool.approveDeposit(
      req.body.asset,
      sdkEthers.constants.MaxUint256
    );
    res.status(200).send({ status: "success", msg: tx.hash });
  } catch (err: any) {
    res.status(400).send({ status: "fail", msg: err?.message || err });
  }
});

investRouter.post("/deposit", async (req: Request, res: Response) => {
  try {
    const network = resolveNetwork(req.query.network as string | undefined);
    const poolAddress = req.query.pool as string;
    const pool = await dhedge(network).loadPool(poolAddress);
    const tx = await pool.deposit(req.body.asset, req.body.amount);
    res.status(200).send({ status: "success", msg: tx.hash });
  } catch (err) {
    res.status(400).send({ status: "fail", msg: err });
  }
});

investRouter.get("/user/:address/deposits", async (req: Request, res: Response) => {
  try {
    const network = resolveNetwork(req.query.network as string | undefined);
    const userAddress = req.params.address;
    const provider = getProvider(network);
    const factory = getFactory(network);
    const pools: string[] = await factory.getDeployedFunds();

    const deposits = await Promise.all(
      pools.map(async (poolAddress) => {
        try {
          const pool = await dhedge(network).loadPool(poolAddress);
          const contract = new ethers.Contract(poolAddress, erc20, provider);
          const balance = await contract.balanceOf(userAddress);
          
          if (balance.eq(0)) return null;

          const [name, symbol, decimals, totalSupply] = await Promise.all([
            contract.name(),
            contract.symbol(),
            contract.decimals(),
            contract.totalSupply(),
          ]);

          const composition = await pool.getComposition();
          // Compute TVL using real prices
          let tvl = 0;
          for (const item of composition) {
            try {
              const balHex = (item.balance as any)?._hex || (item.balance as any)?.hex || item.balance;
              const balance = BigInt(balHex);
              const decimals = (item as any).decimals || 18;
              const balanceFormatted = Number(formatUnits(balance, decimals));
              const price = await fetchPriceUSD(item.asset);
              tvl += balanceFormatted * price;
            } catch (e) {
              continue;
            }
          }
          const sharePrice = totalSupply.gt(0) ? tvl / Number(ethers.utils.formatEther(totalSupply)) : 1;
          const value = Number(ethers.utils.formatEther(balance)) * sharePrice;

          return {
            pool: poolAddress,
            name,
            symbol,
            balance: ethers.utils.formatEther(balance),
            sharePrice,
            value,
            pnl: 0, // Stub: would need cost basis
          };
        } catch {
          return null;
        }
      })
    );

    res.status(200).send({
      status: "success",
      deposits: deposits.filter((d) => d !== null),
    });
  } catch (err: any) {
    res.status(400).send({ status: "fail", msg: err?.message || err });
  }
});

export default investRouter;
