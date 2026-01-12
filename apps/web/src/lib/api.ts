import axios from "axios";
import { API_BASE } from "@/lib/config";

export const api = axios.create({ baseURL: API_BASE });

export const createPool = (payload: any) => api.post("/createPool", payload);
export const poolComposition = (pool: string) => api.get("/poolComposition", { params: { pool } });
export const approveDeposit = (pool: string, asset: string) =>
  api.post(`/approveDeposit?pool=${pool}`, { asset });
export const deposit = (pool: string, asset: string, amount: string) =>
  api.post(`/deposit?pool=${pool}`, { asset, amount });
export const setTrader = (pool: string, traderAccount: string) =>
  api.post(`/setTrader?pool=${pool}`, { traderAccount });
export const approveTrade = (pool: string, platform: string, asset: string) =>
  api.post(`/approve?pool=${pool}&platform=${platform}`, { asset });
export const trade = (
  pool: string,
  params: { from: string; to: string; share?: number; amount?: string; slippage?: number; platform?: string; feeAmount?: number }
) => api.get(`/trade`, { params: { pool, ...params } });
