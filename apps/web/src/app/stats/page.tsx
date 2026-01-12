"use client";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchProtocolStats } from "@/lib/metrics";
import { StatCard } from "@/components/stats";
import { Nav } from "@/components/nav";
import { NetworkSelector } from "@/components/network-selector";

export default function StatsPage() {
  const [network, setNetwork] = useState("polygon");
  const { data: stats, isLoading } = useQuery({
    queryKey: ["protocolStats", network],
    queryFn: () => fetchProtocolStats(network),
  });

  return (
    <div className="space-y-8">
      <Nav />
      <header className="flex flex-col gap-2">
        <div className="text-sm text-muted">Protocol Statistics</div>
        <h1 className="text-3xl font-bold">dHEDGE Protocol Overview</h1>
        <p className="text-muted mt-1">Total value locked, vaults, managers, and fees across all networks.</p>
        <NetworkSelector value={network} onChange={setNetwork} disabledIds={[1,10,42161]} />
      </header>

      {isLoading ? (
        <div className="text-muted text-sm">Loading stats...</div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <StatCard
              label="Total TVL"
              value={`$${stats.totalTvl.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            />
            <StatCard label="Total Vaults" value={stats.vaultCount.toString()} />
            <StatCard label="Active Managers" value={stats.managerCount.toString()} />
            <StatCard
              label="Total Fees"
              value={stats.totalFees > 0 ? `$${stats.totalFees.toLocaleString()}` : "N/A"}
            />
          </div>

          <div className="card p-5">
            <h2 className="text-lg font-semibold mb-4">Per-Network Breakdown</h2>
            <table className="w-full text-sm">
              <thead className="text-muted border-b border-white/10">
                <tr>
                  <th className="text-left py-2">Network</th>
                  <th className="text-left py-2">TVL</th>
                  <th className="text-left py-2">Vaults</th>
                  <th className="text-left py-2">Managers</th>
                  <th className="text-left py-2">Fees</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {stats.networks.map((network, idx) => (
                  <tr key={idx}>
                    <td className="py-2 font-semibold">{network.network}</td>
                    <td className="py-2">${network.tvl.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                    <td className="py-2">{network.vaults}</td>
                    <td className="py-2">{network.managers}</td>
                    <td className="py-2">{network.fees > 0 ? `$${network.fees.toLocaleString()}` : "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="text-amber-400 text-sm">Failed to load stats</div>
      )}
    </div>
  );
}
