import { Router, Request, Response } from "express";
import { getFactory, provider } from "../utils/factory";
import erc20 from "../../abi/ERC20.json";

const poolsRouter = Router();

poolsRouter.get("/pools", async (_req: Request, res: Response) => {
  try {
    const factory = getFactory();
    const pools: string[] = await factory.getDeployedFunds();
    const results = await Promise.all(
      pools.map(async (addr) => {
        try {
          const contract = new (provider as any).constructor.ethers.Contract(addr, erc20, provider);
          const [name, symbol] = await Promise.all([contract.name(), contract.symbol()]);
          return { address: addr, name, symbol };
        } catch (_) {
          return { address: addr, name: addr, symbol: "POOL" };
        }
      })
    );
    res.status(200).send({ status: "success", pools: results });
  } catch (err: any) {
    res.status(400).send({ status: "fail", msg: err?.message || err });
  }
});

export default poolsRouter;
