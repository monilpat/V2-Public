"use client";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { fetchUserDeposits } from "@/lib/metrics";
import { Nav } from "@/components/nav";
import Link from "next/link";
import { formatReturns } from "@/lib/returns";
import { NetworkSelector } from "@/components/network-selector";

export default function MyDepositsPage() {
  const [network, setNetwork] = useState("137"); // Polygon chain ID
  const { address, isConnected } = useAccount();
  const { data: deposits, isLoading } = useQuery({
    queryKey: ["userDeposits", address, network],
    queryFn: () => (address ? fetchUserDeposits(address, network) : []),
    enabled: !!address && isConnected,
  });

  const totalValue = deposits?.reduce((sum, d) => sum + d.value, 0) || 0;

  if (!isConnected || !address) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Nav />
        </div>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="card p-8 text-center">
            <div className="text-lg font-semibold mb-2">Connect Your Wallet</div>
            <div className="text-muted">Please connect your wallet to view your deposits.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Nav />
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col gap-2">
          <div className="text-sm text-muted">My Portfolio</div>
          <h1 className="text-3xl font-bold">My Deposits</h1>
          <p className="text-muted mt-1">
            Total Value: <span className="font-semibold">${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</span>
          </p>
          <NetworkSelector value={network} onChange={setNetwork} disabledIds={[1,10,42161]} />
        </header>

        {isLoading ? (
          <div className="text-muted text-sm">Loading deposits...</div>
        ) : !deposits || deposits.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="text-lg font-semibold mb-2">No Deposits Yet</div>
            <div className="text-muted mb-4">You haven&apos;t deposited into any vaults.</div>
            <Link href="/explore" className="btn-primary inline-block">
              Explore Vaults
            </Link>
          </div>
        ) : (
          <div className="card p-5">
            <table className="w-full text-sm">
              <thead className="text-muted border-b border-white/10">
                <tr>
                  <th className="text-left py-2">Vault</th>
                  <th className="text-left py-2">Balance</th>
                  <th className="text-left py-2">Value (USD)</th>
                  <th className="text-left py-2">PnL</th>
                  <th className="text-left py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {deposits.map((deposit) => (
                  <tr key={deposit.pool}>
                    <td className="py-3">
                      <Link
                        href={`/pool/${deposit.pool}`}
                        className="font-semibold hover:text-accent2"
                      >
                        {deposit.name} ({deposit.symbol})
                      </Link>
                    </td>
                    <td className="py-3">
                      {parseFloat(deposit.balance).toFixed(4)} {deposit.symbol}
                    </td>
                    <td className="py-3">${deposit.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className={`py-3 ${deposit.pnl >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {formatReturns(deposit.pnl)}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/pool/${deposit.pool}?action=deposit`}
                          className="text-xs btn-ghost px-2 py-1"
                        >
                          Deposit
                        </Link>
                        <Link
                          href={`/pool/${deposit.pool}?action=withdraw`}
                          className="text-xs btn-ghost px-2 py-1"
                        >
                          Withdraw
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
