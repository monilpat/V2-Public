"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE } from "@/lib/config";
import { assetMeta } from "@/lib/prices";
import { formatUnits } from "viem";
import Link from "next/link";
import { Nav } from "@/components/nav";
import { PerformanceChart } from "@/components/PerformanceChart";
import { ReturnsCard } from "@/components/ReturnsCard";
import { RiskScoreBadge } from "@/components/RiskScoreBadge";
import { TradeHistoryTable } from "@/components/TradeHistoryTable";
import { fetchPoolMetrics, fetchPoolHistory, fetchPoolTrades } from "@/lib/metrics";
import { polygonConfig } from "@/lib/polygon";
import { useWriteContract, useReadContract } from "wagmi";
import { poolLogicAbi, poolManagerLogicAbi } from "@/lib/abi";
import { useToast } from "@/components/toast";
import { useState } from "react";

const fetchComposition = async (pool: string) => {
  const res = await axios.get(`${API_BASE}/poolComposition`, { params: { pool } });
  return res.data.msg as any[];
};

export default function PoolPage() {
  const params = useParams<{ address: string }>();
  const poolAddress = params.address as string;
  const { Toast, push } = useToast();
  const { writeContractAsync } = useWriteContract();
  const { data: managerLogic } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: poolLogicAbi,
    functionName: "poolManagerLogic",
  });
  const [feeDraft, setFeeDraft] = useState({
    perf: "",
    mgmt: "",
    entry: "",
    exit: "",
  });

  const { data: composition, isLoading: compositionLoading, error: compositionError } = useQuery({
    queryKey: ["composition", poolAddress],
    queryFn: () => fetchComposition(poolAddress),
  });

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["poolMetrics", poolAddress],
    queryFn: () => fetchPoolMetrics(poolAddress),
  });

  const { data: history, isLoading: historyLoading } = useQuery({
    queryKey: ["poolHistory", poolAddress],
    queryFn: () => fetchPoolHistory(poolAddress),
  });

  const { data: trades, isLoading: tradesLoading } = useQuery({
    queryKey: ["poolTrades", poolAddress],
    queryFn: () => fetchPoolTrades(poolAddress),
  });

  // Get pool name/symbol (stub - would fetch from ERC20)
  const poolName = poolAddress.slice(0, 6) + "…" + poolAddress.slice(-4);
  const poolSymbol = "POOL";

  // Get supported assets (stub - would query from pool contract)
  const supportedAssets = polygonConfig.assets.filter((a) => a.isDeposit);

  return (
    <div className="space-y-8">
      <Nav />
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-muted">Polygon Mainnet</div>
          <h1 className="text-3xl font-bold">{poolName}</h1>
        </div>
        <Link href="/explore" className="text-sm text-muted hover:text-white">
          ← Back to Explore
        </Link>
      </div>
      <Toast />

      {/* Performance Chart */}
      {history && history.length > 0 && (
        <div className="card p-5">
          <h2 className="text-lg font-semibold mb-4">Performance Chart</h2>
          <PerformanceChart data={history} />
        </div>
      )}

      {/* PnL Intervals */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <ReturnsCard label="24h Return" value={metrics.returns24h} period="24 hours" />
          <ReturnsCard label="1W Return" value={metrics.returns1w} period="1 week" />
          <ReturnsCard label="1M Return" value={metrics.returns1m} period="1 month" />
          <div className="card p-4 space-y-1">
            <div className="text-sm text-muted">Risk Score</div>
            <div className="pt-2">
              <RiskScoreBadge score={metrics.riskScore} />
            </div>
          </div>
        </div>
      )}

      {/* Vault Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5 space-y-3">
          <h3 className="text-lg font-semibold">Vault Information</h3>
          {metrics && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted">TVL</span>
                <span className="font-semibold">
                  ${metrics.tvl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Performance Fee</span>
                <span className="font-semibold">{(metrics.performanceFee / 100).toFixed(2)}%</span>
              </div>
              {metrics.managementFee !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted">Management Fee</span>
                  <span className="font-semibold">{(metrics.managementFee / 100).toFixed(2)}%</span>
                </div>
              )}
              {metrics.entryFee !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted">Entry Fee</span>
                  <span className="font-semibold">{(metrics.entryFee / 100).toFixed(2)}%</span>
                </div>
              )}
              {metrics.exitFee !== undefined && (
                <div className="flex justify-between">
                  <span className="text-muted">Exit Fee</span>
                  <span className="font-semibold">{(metrics.exitFee / 100).toFixed(2)}%</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted">Exit Cooldown</span>
                <span className="font-semibold">
                  {Math.floor(metrics.exitCooldown / (24 * 60 * 60))} days
                </span>
              </div>
              <button
                className="btn-ghost mt-2"
                disabled={!managerLogic}
                onClick={async () => {
                  if (!managerLogic) return;
                  try {
                    push("Minting fees...", "info");
                    await writeContractAsync({
                      address: managerLogic as `0x${string}`,
                      abi: poolManagerLogicAbi,
                      functionName: "mintManagerFee",
                    });
                    push("Fees minted to manager", "success");
                  } catch (e: any) {
                    push(e?.message || "Mint failed", "error");
                  }
                }}
              >
                Mint Fees
              </button>
            </div>
          )}
        </div>

        <div className="card p-5 space-y-3">
          <h3 className="text-lg font-semibold">Trader & Manager</h3>
          {metrics && (
            <div className="space-y-2 text-sm">
              <div>
                <div className="text-muted mb-1">Trader</div>
                <Link
                  href={`https://polygonscan.com/address/${metrics.trader}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent2 hover:underline break-all"
                >
                  {metrics.trader === "0x0000000000000000000000000000000000000000"
                    ? "Not set"
                    : metrics.trader}
                </Link>
              </div>
              <div>
                <div className="text-muted mb-1">Manager</div>
                <Link
                  href={`https://polygonscan.com/address/${metrics.manager}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent2 hover:underline break-all"
                >
                  {metrics.manager === "0x0000000000000000000000000000000000000000"
                    ? "Not set"
                    : metrics.manager}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Asset Whitelist */}
      <div className="card p-5">
        <h3 className="text-lg font-semibold mb-4">Supported Deposit Assets</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {supportedAssets.map((asset) => (
            <div key={asset.address} className="bg-white/5 rounded-lg px-3 py-2 text-sm">
              <div className="font-semibold">{asset.symbol}</div>
              <div className="text-xs text-muted break-all">{asset.address}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Trade History */}
      {trades && <TradeHistoryTable trades={trades} />}

      {/* Composition Table */}
      <div className="card p-5">
        <h3 className="text-lg font-semibold mb-4">Current Composition</h3>
        {compositionLoading && <div className="text-muted text-sm">Loading composition…</div>}
        {compositionError && <div className="text-amber-400 text-sm">Failed to load</div>}
        {composition && (
          <table className="w-full text-sm">
            <thead className="text-muted border-b border-white/10">
              <tr>
                <th className="text-left py-2">Asset</th>
                <th className="text-left py-2">Balance</th>
                <th className="text-left py-2">Price (USD)</th>
                <th className="text-left py-2">Value (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {composition.map((row: any, idx: number) => {
                const meta = assetMeta.get(row.asset.toLowerCase());
                const decimals = meta?.decimals ?? 18;
                const balance = Number(
                  formatUnits(BigInt(row.balance.hex || row.balance._hex || row.balance), decimals)
                );
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
