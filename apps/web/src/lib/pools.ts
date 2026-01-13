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
  score?: number;
};

export const fetchPools = async (
  network?: string,
  options?: { limit?: number; offset?: number }
): Promise<{ pools: PoolMeta[]; total?: number }> => {
  try {
    const baseUrl = API_BASE.endsWith('/') ? API_BASE.slice(0, -1) : API_BASE;
    const params: Record<string, number | string> = {};
    if (options?.limit !== undefined) params.limit = options.limit;
    if (options?.offset !== undefined) params.offset = options.offset;
    const res = await axios.get(`${baseUrl}/pools`, { 
      params,
      timeout: 60000, // 10 second timeout
    });
    if (res.data?.status === "success" && res.data?.pools?.length) {
      return {
        pools: res.data.pools.map((p: any) => ({
          ...p,
          network: p.network || 137,
        })),
        total: typeof res.data.total === "number" ? res.data.total : undefined,
      };
    }
  } catch (e) {
    // Log error but don't throw - fallback to config
    console.warn("Failed to fetch pools from API, using fallback:", e);
  }
  // Fallback to config pools
  return {
    pools: polygonConfig.pools.map((p: any) => ({
      address: p.address || p,
      name: p.name || p.address || p,
      symbol: p.symbol || "POOL",
      network: 137,
    })),
  };
};

export const fetchManagedPools = async (
  managerAddress: string
): Promise<{ pools: PoolMeta[]; error?: string }> => {
  try {
    const baseUrl = API_BASE.endsWith("/") ? API_BASE.slice(0, -1) : API_BASE;
    const res = await axios.get(`${baseUrl}/user/${managerAddress}/managed-pools`, {
      timeout: 30000,
    });
    if (res.data?.status === "success" || res.data?.status === "partial") {
      return {
        pools: (res.data.pools || []).map((p: any) => ({
          ...p,
          network: p.network || 137,
        })),
        error: res.data.error,
      };
    }
    return { pools: [], error: res.data?.msg || res.data?.error };
  } catch (e: any) {
    console.warn("Failed to fetch managed pools:", e?.message);
    return { pools: [], error: e?.message || "Failed to fetch managed pools" };
  }
};
