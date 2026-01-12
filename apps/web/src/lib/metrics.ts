import axios from "axios";
import { API_BASE } from "./config";

export type PoolMetrics = {
  tvl: number;
  returns24h: number;
  returns1w: number;
  returns1m: number;
  riskScore: number;
  trader: string;
  manager: string;
  performanceFee: number;
  managementFee?: number;
  entryFee?: number;
  exitFee?: number;
  exitCooldown: number;
};

export type HistoryPoint = {
  timestamp: number;
  sharePrice: number;
  tvl: number;
};

export type Trade = {
  timestamp: number;
  fromAsset: string;
  toAsset: string;
  amount: string;
  txHash: string;
};

export type UserDeposit = {
  pool: string;
  name: string;
  symbol: string;
  balance: string;
  sharePrice: number;
  value: number;
  pnl: number;
};

export type ProtocolStats = {
  totalTvl: number;
  vaultCount: number;
  managerCount: number;
  totalFees: number;
  networks: Array<{
    network: string;
    tvl: number;
    vaults: number;
    managers: number;
    fees: number;
  }>;
};

export const fetchPoolMetrics = async (poolAddress: string, network?: string): Promise<PoolMetrics> => {
  const res = await axios.get(`${API_BASE}/pool/${poolAddress}/metrics`, {
    params: network ? { network } : {},
  });
  return res.data.metrics;
};

export const fetchPoolHistory = async (poolAddress: string, network?: string): Promise<HistoryPoint[]> => {
  const res = await axios.get(`${API_BASE}/pool/${poolAddress}/history`, {
    params: network ? { network } : {},
  });
  return res.data.history;
};

export const fetchPoolTrades = async (poolAddress: string, network?: string): Promise<Trade[]> => {
  const res = await axios.get(`${API_BASE}/pool/${poolAddress}/trades`, {
    params: network ? { network } : {},
  });
  return res.data.trades;
};

export const fetchUserDeposits = async (userAddress: string, network?: string): Promise<UserDeposit[]> => {
  const res = await axios.get(`${API_BASE}/user/${userAddress}/deposits`, {
    params: network ? { network } : {},
  });
  return res.data.deposits;
};

export const fetchProtocolStats = async (network?: string): Promise<ProtocolStats> => {
  const res = await axios.get(`${API_BASE}/stats`, {
    params: network ? { network } : {},
  });
  return res.data.stats;
};
