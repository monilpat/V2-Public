import { ethers } from "@dhedge/v2-sdk";
import { Router } from "express";

const investRouter = Router();
import { Request, Response } from "express";
import { dhedge } from "../dhedge";
import { resolveNetwork } from "../utils/network";

investRouter.post("/approveDeposit", async (req: Request, res: Response) => {
  try {
    const network = resolveNetwork(req.query.network as string | undefined);
    const poolAddress = req.query.pool as string;
    const pool = await dhedge(network).loadPool(poolAddress);
    const tx = await pool.approveDeposit(
      req.body.asset,
      ethers.constants.MaxUint256
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

export default investRouter;
