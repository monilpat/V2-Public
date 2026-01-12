import axios from "axios";
import { API_BASE } from "@/lib/config";
import { polygonConfig } from "@/lib/polygon";

export type PoolMeta = {
  address: string;
  name: string;
  symbol: string;
  network?: number;
  tvl?: number;
  returns24h?: number;
  returns1w?: number;
  returns1m?: number;
  riskScore?: number;
};

export const fetchPools = async (network?: string): Promise<PoolMeta[]> => {
  try {
    const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
    const res = await axios.get(`${baseUrl}/pools`, { params: { network } });
    if (res.data?.pools?.length) return res.data.pools;
  } catch (e) {
    // fallback below
  }
  return polygonConfig.pools.map((p: any) => ({
    address: p.address || p,
    name: p.name || p.address || p,
    symbol: p.symbol || "POOL",
    network: 137,
  }));
};
