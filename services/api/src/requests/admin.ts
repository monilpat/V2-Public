import { SupportedAsset } from "@dhedge/v2-sdk";
import { Router } from "express";

const adminRouter = Router();
import { Request, Response } from "express";
import { dhedge } from "../dhedge";
import { resolveNetwork } from "../utils/network";
import { validateAssetList } from "../utils/assets";

adminRouter.post("/createPool", async (req: Request, res: Response) => {
  try {
    const network = resolveNetwork(req.query.network as string | undefined);
    validateAssetList(req.body.supportedAssets as any[]);
    const feeNum = Number(req.body.fee);
    if (feeNum > 5000) throw new Error("Performance fee exceeds cap (50%)");
    const managerFee = Number(req.body.managerFee || 0);
    if (managerFee > 300) throw new Error("Management fee exceeds cap (3%)");
    const pool = await dhedge(network).createPool(
      req.body.managerName,
      req.body.poolName,
      req.body.symbol,
      req.body.supportedAssets as unknown as SupportedAsset[],
      feeNum,
      managerFee
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
    validateAssetList(req.body.assets);
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

// Mint accrued performance/management fees to manager
adminRouter.post("/mintFees", async (req: Request, res: Response) => {
  try {
    const network = resolveNetwork(req.query.network as string | undefined);
    const poolAddress = req.query.pool as string;
    const pool = await dhedge(network).loadPool(poolAddress);
    // @ts-ignore sdk exposes mintManagerFee on pool
    const tx = await pool.mintManagerFee?.();
    if (!tx) throw new Error("mintManagerFee not available");
    res.status(200).send({ status: "success", msg: tx.hash });
  } catch (err: any) {
    res.status(400).send({ status: "fail", msg: err?.message || err });
  }
});

export default adminRouter;
