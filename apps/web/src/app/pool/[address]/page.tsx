"use client";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { API_BASE } from "@/lib/config";
import { assetMeta } from "@/lib/prices";
import { formatUnits } from "viem";
import Link from "next/link";
import { useState } from "react";
import { Nav } from "@/components/nav";
import { PerformanceChart } from "@/components/PerformanceChart";
import { ReturnsCard } from "@/components/ReturnsCard";
import { RiskScoreBadge } from "@/components/RiskScoreBadge";
import { TradeHistoryTable } from "@/components/TradeHistoryTable";
import { PoolTabs, PoolTab } from "@/components/PoolTabs";
import { DepositorsTable } from "@/components/DepositorsTable";
import { ActivityTable } from "@/components/ActivityTable";
import { DepositsTable } from "@/components/DepositsTable";
import { WithdrawalsTable } from "@/components/WithdrawalsTable";
import { BuySellPanel } from "@/components/BuySellPanel";
import { YourShareCard } from "@/components/YourShareCard";
import { 
  fetchPoolMetrics, 
  fetchPoolHistory, 
  fetchPoolTrades,
  fetchPoolDepositors,
  fetchPoolDeposits,
  fetchPoolWithdrawals,
  fetchPoolActivity,
} from "@/lib/metrics";
import { polygonConfig } from "@/lib/polygon";
import { useWriteContract, useReadContract, useAccount } from "wagmi";
import { poolLogicAbi, poolManagerLogicAbi } from "@/lib/abi";
import { useToast } from "@/components/toast";

const fetchComposition = async (pool: string) => {
  const res = await axios.get(`${API_BASE}/poolComposition`, { params: { pool } });
  return res.data.msg as any[];
};

export default function PoolPage() {
  const params = useParams<{ address: string }>();
  const poolAddress = params.address as string;
  const { Toast, push } = useToast();
  const { writeContractAsync } = useWriteContract();
  const { isConnected } = useAccount();
  const { data: managerLogic } = useReadContract({
    address: poolAddress as `0x${string}`,
    abi: poolLogicAbi,
    functionName: "poolManagerLogic",
  });
  
  const [activeTab, setActiveTab] = useState<PoolTab>("depositors");
  const [feeDraft, setFeeDraft] = useState({
    perf: "",
    mgmt: "",
    entry: "",
    exit: "",
  });

  // Existing queries
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

  // Tab-specific queries (lazy loaded)
  const { data: depositorsData, isLoading: depositorsLoading } = useQuery({
    queryKey: ["poolDepositors", poolAddress],
    queryFn: () => fetchPoolDepositors(poolAddress),
    enabled: activeTab === "depositors",
  });

  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ["poolActivity", poolAddress],
    queryFn: () => fetchPoolActivity(poolAddress),
    enabled: activeTab === "activity",
  });

  const { data: depositsData, isLoading: depositsLoading } = useQuery({
    queryKey: ["poolDepositsHistory", poolAddress],
    queryFn: () => fetchPoolDeposits(poolAddress, 10),
    enabled: activeTab === "deposits",
  });

  const { data: withdrawalsData, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ["poolWithdrawalsHistory", poolAddress],
    queryFn: () => fetchPoolWithdrawals(poolAddress, 10),
    enabled: activeTab === "withdrawals",
  });

  // Get pool name/symbol (stub - would fetch from ERC20)
  const poolName = poolAddress.slice(0, 6) + "…" + poolAddress.slice(-4);
  const poolSymbol = "POOL";

  // Get supported assets
  const supportedAssets = polygonConfig.assets.filter((a) => a.isDeposit);

  // Calculate share price from metrics
  const sharePrice = metrics?.tvl && composition ? 
    metrics.tvl / (composition.reduce((sum, c) => {
      const bal = Number(formatUnits(BigInt(c.balance?.hex || c.balance?._hex || c.balance || 0), 18));
      return sum + bal;
    }, 0) || 1) : 1;

  // Tab counts
  const tabCounts = {
    depositors: depositorsData?.totalDepositors,
    activity: activityData?.totalRecords,
    deposits: depositsData?.totalDeposits,
    withdrawals: withdrawalsData?.totalWithdrawals,
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "depositors":
        return (
          <DepositorsTable 
            depositors={depositorsData?.depositors || []} 
            isLoading={depositorsLoading}
            poolSymbol={poolSymbol}
          />
        );
      case "activity":
        return (
          <ActivityTable 
            activities={activityData?.activities || []} 
            isLoading={activityLoading}
          />
        );
      case "deposits":
        return (
          <DepositsTable 
            deposits={depositsData?.deposits || []} 
            isLoading={depositsLoading}
            poolSymbol={poolSymbol}
          />
        );
      case "withdrawals":
        return (
          <WithdrawalsTable 
            withdrawals={withdrawalsData?.withdrawals || []} 
            isLoading={withdrawalsLoading}
            poolSymbol={poolSymbol}
          />
        );
      case "stats":
        return (
          <div className="space-y-6">
            {/* Vault Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-muted">Vault Information</h4>
                <div className="bg-white/5 rounded-lg p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted">Vault Address</span>
                    <Link
                      href={`https://polygonscan.com/address/${poolAddress}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-accent2 hover:underline font-mono"
                    >
                      {poolAddress.slice(0, 10)}…{poolAddress.slice(-8)}
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Token Price</span>
                    <span className="font-semibold">${sharePrice.toFixed(4)}</span>
                  </div>
                  {metrics && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-muted">TVL</span>
                        <span className="font-semibold">
                          ${metrics.tvl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted">Performance Fee</span>
                        <span>{(metrics.performanceFee / 100).toFixed(2)}%</span>
                      </div>
                      {metrics.managementFee !== undefined && (
                        <div className="flex justify-between">
                          <span className="text-muted">Management Fee</span>
                          <span>{(metrics.managementFee / 100).toFixed(2)}%</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted">Exit Cooldown</span>
                        <span>{Math.floor(metrics.exitCooldown / (24 * 60 * 60))} days</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-muted">Manager Information</h4>
                <div className="bg-white/5 rounded-lg p-4 space-y-2 text-sm">
                  {metrics && (
                    <>
                      <div className="flex justify-between items-start">
                        <span className="text-muted">Manager</span>
                        <Link
                          href={`https://polygonscan.com/address/${metrics.manager}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent2 hover:underline font-mono text-right"
                        >
                          {metrics.manager === "0x0000000000000000000000000000000000000000"
                            ? "Not set"
                            : `${metrics.manager.slice(0, 10)}…`}
                        </Link>
                      </div>
                      <div className="flex justify-between items-start">
                        <span className="text-muted">Trader</span>
                        <Link
                          href={`https://polygonscan.com/address/${metrics.trader}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-accent2 hover:underline font-mono text-right"
                        >
                          {metrics.trader === "0x0000000000000000000000000000000000000000"
                            ? "Not set"
                            : `${metrics.trader.slice(0, 10)}…`}
                        </Link>
                      </div>
                      {managerLogic && (
                        <div className="flex justify-between items-start">
                          <span className="text-muted">Manager Logic</span>
                          <Link
                            href={`https://polygonscan.com/address/${managerLogic}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-accent2 hover:underline font-mono text-right"
                          >
                            {String(managerLogic).slice(0, 10)}…
                          </Link>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-3">
              <h4 className="font-semibold text-muted">Performance Metrics</h4>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {metrics && (
                    <>
                      <div>
                        <div className="text-muted mb-1">24h Return</div>
                        <div className={`font-semibold ${metrics.returns24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {metrics.returns24h >= 0 ? '+' : ''}{metrics.returns24h.toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted mb-1">1W Return</div>
                        <div className={`font-semibold ${metrics.returns1w >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {metrics.returns1w >= 0 ? '+' : ''}{metrics.returns1w.toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted mb-1">1M Return</div>
                        <div className={`font-semibold ${metrics.returns1m >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {metrics.returns1m >= 0 ? '+' : ''}{metrics.returns1m.toFixed(2)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted mb-1">Risk Score</div>
                        <RiskScoreBadge score={metrics.riskScore} />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Sortino/Volatility placeholders */}
            <div className="space-y-3">
              <h4 className="font-semibold text-muted">Risk Analysis</h4>
              <div className="bg-white/5 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted mb-1">Sortino Ratio</div>
                    <div className="font-semibold text-muted">Coming soon</div>
                  </div>
                  <div>
                    <div className="text-muted mb-1">Downside Volatility</div>
                    <div className="font-semibold text-muted">Coming soon</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

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
      {Toast}

      {/* Main Layout: Content + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Chart */}
          {history && history.length > 0 && (
            <div className="card p-5">
              <h2 className="text-lg font-semibold mb-4">Performance Chart</h2>
              <PerformanceChart data={history} />
            </div>
          )}

          {/* PnL Intervals */}
          {metrics && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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

          {/* Tabs */}
          <div className="card">
            <PoolTabs 
              activeTab={activeTab} 
              onTabChange={setActiveTab}
              counts={tabCounts}
            />
            <div className="p-5">
              {renderTabContent()}
            </div>
          </div>

          {/* Trade History */}
          {trades && trades.length > 0 && <TradeHistoryTable trades={trades} />}

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

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Your Share Card */}
          <YourShareCard 
            poolAddress={poolAddress}
            poolSymbol={poolSymbol}
            poolName={poolName}
            sharePrice={sharePrice}
          />

          {/* Buy/Sell Panel */}
          <BuySellPanel
            poolAddress={poolAddress}
            poolSymbol={poolSymbol}
            sharePrice={sharePrice}
            supportedAssets={supportedAssets}
          />

          {/* Manager Actions (if connected) */}
          {isConnected && (
            <div className="card p-5 space-y-4">
              <h3 className="text-lg font-semibold">Manager Actions</h3>
              
              <button
                className="btn-ghost w-full"
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

              <div className="border-t border-white/10 pt-4 space-y-2">
                <div className="text-sm font-semibold">Announce Fee Change</div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    className="bg-white/5 rounded px-2 py-1 text-xs"
                    placeholder="Perf fee (bps)"
                    value={feeDraft.perf}
                    onChange={(e) => setFeeDraft((s) => ({ ...s, perf: e.target.value }))}
                  />
                  <input
                    className="bg-white/5 rounded px-2 py-1 text-xs"
                    placeholder="Mgmt fee (bps)"
                    value={feeDraft.mgmt}
                    onChange={(e) => setFeeDraft((s) => ({ ...s, mgmt: e.target.value }))}
                  />
                  <input
                    className="bg-white/5 rounded px-2 py-1 text-xs"
                    placeholder="Entry fee (bps)"
                    value={feeDraft.entry}
                    onChange={(e) => setFeeDraft((s) => ({ ...s, entry: e.target.value }))}
                  />
                  <input
                    className="bg-white/5 rounded px-2 py-1 text-xs"
                    placeholder="Exit fee (bps)"
                    value={feeDraft.exit}
                    onChange={(e) => setFeeDraft((s) => ({ ...s, exit: e.target.value }))}
                  />
                </div>
                <button
                  className="btn-ghost w-full text-sm"
                  disabled={!managerLogic}
                  onClick={async () => {
                    if (!managerLogic) return;
                    try {
                      const perf = BigInt(Number(feeDraft.perf || "0"));
                      const mgmt = BigInt(Number(feeDraft.mgmt || "0"));
                      const entry = BigInt(Number(feeDraft.entry || "0"));
                      const exit = BigInt(Number(feeDraft.exit || "0"));
                      push("Announcing fee change (14d delay)...", "info");
                      await writeContractAsync({
                        address: managerLogic as `0x${string}`,
                        abi: poolManagerLogicAbi,
                        functionName: "announceFeeIncrease",
                        args: [perf, mgmt, entry, exit],
                      });
                      push("Fee change announced. Commit after delay.", "success");
                    } catch (e: any) {
                      push(e?.message || "Announce failed", "error");
                    }
                  }}
                >
                  Announce Fees (14d)
                </button>
                <button
                  className="btn-ghost w-full text-sm"
                  disabled={!managerLogic}
                  onClick={async () => {
                    try {
                      push("Committing fee change...", "info");
                      await writeContractAsync({
                        address: managerLogic as `0x${string}`,
                        abi: poolManagerLogicAbi,
                        functionName: "commitFeeIncrease",
                      });
                      push("Fee change committed", "success");
                    } catch (e: any) {
                      push(e?.message || "Commit failed", "error");
                    }
                  }}
                >
                  Commit Fees
                </button>
              </div>
            </div>
          )}

          {/* Supported Deposit Assets */}
          <div className="card p-5">
            <h3 className="text-lg font-semibold mb-4">Supported Assets</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {supportedAssets.slice(0, 10).map((asset) => (
                <div key={asset.address} className="bg-white/5 rounded-lg px-3 py-2 text-sm">
                  <div className="font-semibold">{asset.symbol}</div>
                </div>
              ))}
              {supportedAssets.length > 10 && (
                <div className="text-sm text-muted text-center">
                  +{supportedAssets.length - 10} more assets
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
