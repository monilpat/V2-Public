"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE } from "@/lib/config";
import { assetMeta } from "@/lib/prices";
import { formatUnits } from "viem";
import Link from "next/link";

const fetchComposition = async (pool: string) => {
  const res = await axios.get(`${API_BASE}/poolComposition`, { params: { pool } });
  return res.data.msg as any[];
};

export default function PoolPage() {
  const params = useParams<{ address: string }>();
  const pool = params.address;
  const { data, isLoading, error } = useQuery({
    queryKey: ["composition", pool],
    queryFn: () => fetchComposition(pool),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted">Polygon Mainnet</div>
          <h1 className="text-3xl font-bold">Pool {pool.slice(0, 6)}…{pool.slice(-4)}</h1>
        </div>
        <Link href="/" className="text-sm text-muted hover:text-white">← Back</Link>
      </div>

      <div className="card p-5">
        {isLoading && <div className="text-muted text-sm">Loading composition…</div>}
        {error && <div className="text-amber-400 text-sm">Failed to load</div>}
        {data && (
          <table className="w-full text-sm">
            <thead className="text-muted">
              <tr>
                <th className="text-left">Asset</th>
                <th className="text-left">Balance</th>
                <th className="text-left">Price (USD)</th>
                <th className="text-left">Value (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.map((row, idx) => {
                const meta = assetMeta.get(row.asset.toLowerCase());
                const decimals = meta?.decimals ?? 18;
                const balance = Number(formatUnits(BigInt(row.balance.hex || row.balance._hex || row.balance), decimals));
                const price = row.rate
                  ? Number(formatUnits(BigInt(row.rate.hex || row.rate._hex || row.rate), 18))
                  : 0;
                const value = price * balance;
                return (
                  <tr key={idx}>
                    <td className="py-2 font-semibold">{meta?.symbol || row.asset}</td>
                    <td>{balance.toLocaleString()}</td>
                    <td>${price.toFixed(4)}</td>
                    <td>${value.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
