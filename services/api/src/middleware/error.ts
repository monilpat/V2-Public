import { Request, Response, NextFunction } from "express";

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  const message = err?.message || err?.toString?.() || "Unknown error";
  res.status(500).send({ status: "fail", msg: message });
}
