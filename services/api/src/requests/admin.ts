import { SupportedAsset } from "@dhedge/v2-sdk";
import { Router } from "express";

const adminRouter = Router();
import { Request, Response } from "express";
import { dhedge } from "../dhedge";
import { resolveNetwork } from "../utils/network";

adminRouter.post("/createPool", async (req: Request, res: Response) => {
  try {
    const network = resolveNetwork(req.query.network as string | undefined);
    const pool = await dhedge(network).createPool(
      req.body.managerName,
      req.body.poolName,
      req.body.symbol,
      req.body.supportedAssets as unknown as SupportedAsset[],
      Number(req.body.fee)
    );
    res.status(200).send({
      status: "success",
      msg: pool.address,
    });
  } catch (err: any) {
    res.status(400).send({ status: "fail", msg: err?.message || err });
  }
});

adminRouter.get("/poolComposition", async (req: Request, res: Response) => {
  try {
    const network = resolveNetwork(req.query.network as string | undefined);
    const poolAddress = req.query.pool as string;
    const pool = await dhedge(network).loadPool(poolAddress);
    const composition = await pool.getComposition();
    res.status(200).send({ status: "success", msg: composition });
  } catch (err) {
    res.status(400).send({ status: "fail", msg: err });
  }
});

adminRouter.post("/changeAssets", async (req: Request, res: Response) => {
  try {
    const network = resolveNetwork(req.query.network as string | undefined);
    const poolAddress = req.query.pool as string;
    const pool = await dhedge(network).loadPool(poolAddress);
    const tx = await pool.changeAssets(req.body.assets);
    res.status(200).send({ status: "success", msg: tx.hash });
  } catch (err) {
    res.status(400).send({ status: "fail", msg: err });
  }
});

adminRouter.post("/setTrader", async (req: Request, res: Response) => {
  try {
    const network = resolveNetwork(req.query.network as string | undefined);
    const poolAddress = req.query.pool as string;
    const pool = await dhedge(network).loadPool(poolAddress);
    const tx = await pool.setTrader(req.body.traderAccount);
    res.status(200).send({ status: "success", msg: tx.hash });
  } catch (err) {
    res.status(400).send({ status: "fail", msg: err });
  }
});

export default adminRouter;
