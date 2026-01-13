"use client";
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPools, PoolMeta } from "@/lib/pools";
import { VaultCard } from "@/components/VaultCard";
import { Nav } from "@/components/nav";
import { NetworkSelector } from "@/components/network-selector";
import { formatReturns } from "@/lib/returns";
import { RiskScoreBadge } from "@/components/RiskScoreBadge";
import { chainName } from "@/lib/chains";
import Link from "next/link";

type SortOption = "tvl" | "returns1m" | "score";
type NetworkFilter = "all" | "137" | "1" | "10" | "42161" | "8453";

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [chain, setChain] = useState("137");
  const [sortBy, setSortBy] = useState<SortOption>("score");
  const [networkFilter, setNetworkFilter] = useState<NetworkFilter>("all");
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const { data: pools, isLoading } = useQuery({
    queryKey: ["pools", chain, page, pageSize],
    queryFn: () => fetchPools(chain, { limit: pageSize, offset: page * pageSize }),
  });

  const filteredAndSortedPools = useMemo(() => {
    let filtered = pools || [];
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (p: PoolMeta) =>
          p.name?.toLowerCase().includes(searchLower) ||
          p.symbol?.toLowerCase().includes(searchLower) ||
          p.address?.toLowerCase().includes(searchLower)
      );
    }

    // Filter by network
    if (networkFilter !== "all") {
      filtered = filtered.filter((p: PoolMeta) => p.network?.toString() === networkFilter);
    }

    // Sort
    const sorted = [...filtered].sort((a: PoolMeta, b: PoolMeta) => {
      if (sortBy === "tvl") {
        return (b.tvl || 0) - (a.tvl || 0);
      } else if (sortBy === "returns1m") {
        return (b.returns1m || 0) - (a.returns1m || 0);
      } else {
        return (b.score || 0) - (a.score || 0);
      }
    });

    return sorted;
  }, [pools, search, networkFilter, sortBy]);

  const topVaults = filteredAndSortedPools.slice(0, 3);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Nav />
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Explore</h1>
        </header>

      {/* Top Vaults Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Top Vaults</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy("tvl")}
              className={`px-4 py-2 rounded-lg text-sm ${
                sortBy === "tvl" ? "bg-white/10" : "bg-white/5"
              }`}
            >
              Most Capital
            </button>
            <button
              onClick={() => setSortBy("returns1m")}
              className={`px-4 py-2 rounded-lg text-sm ${
                sortBy === "returns1m" ? "bg-white/10" : "bg-white/5"
              }`}
            >
              Top Performing
            </button>
            <button
              onClick={() => setSortBy("score")}
              className={`px-4 py-2 rounded-lg text-sm ${
                sortBy === "score" ? "bg-white/10" : "bg-white/5"
              }`}
            >
              Top Score
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="text-muted text-sm">Loading vaults...</div>
        ) : topVaults.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-3">
            {topVaults.map((pool: PoolMeta) => (
              <VaultCard key={pool.address} pool={pool} />
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <div className="text-muted">No vaults found</div>
          </div>
        )}
      </section>

      {/* Leaderboard Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Leaderboard</h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          {/* Network Filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setNetworkFilter("all")}
              className={`px-3 py-1 rounded-lg text-sm ${
                networkFilter === "all" ? "bg-white/10" : "bg-white/5"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setNetworkFilter("137")}
              className={`px-3 py-1 rounded-lg text-sm ${
                networkFilter === "137" ? "bg-white/10" : "bg-white/5"
              }`}
            >
              Polygon
            </button>
            <button
              onClick={() => setNetworkFilter("1")}
              className={`px-3 py-1 rounded-lg text-sm ${
                networkFilter === "1" ? "bg-white/10" : "bg-white/5"
              }`}
            >
              Ethereum
            </button>
            <button
              onClick={() => setNetworkFilter("8453")}
              className={`px-3 py-1 rounded-lg text-sm ${
                networkFilter === "8453" ? "bg-white/10" : "bg-white/5"
              }`}
            >
              Base
            </button>
          </div>

          {/* Search */}
          <input
            type="text"
            placeholder="Search Vault"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 max-w-xs bg-white/5 rounded-lg px-4 py-2 text-sm"
          />
        </div>

        {/* Leaderboard Table */}
        {isLoading ? (
          <div className="text-muted text-sm">Loading leaderboard...</div>
        ) : filteredAndSortedPools.length > 0 ? (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted">Network</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted">Vault</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted cursor-pointer">
                      Managed
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted cursor-pointer">
                      1D
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted cursor-pointer">
                      1W
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted cursor-pointer">
                      1M
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted cursor-pointer">
                      6M
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted cursor-pointer">
                      1Y
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted cursor-pointer">
                      Total
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted cursor-pointer">
                      Risk
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted cursor-pointer">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAndSortedPools.map((pool: PoolMeta) => {
                    // Calculate total return (using 1M as proxy for now, would need historical data)
                    const totalReturn = pool.returns1m || 0;
                    // Calculate risk score (1-5 scale from 0-100)
                    const riskLevel = pool.riskScore 
                      ? Math.ceil((pool.riskScore / 100) * 5) 
                      : 3;
                    
                    return (
                      <tr key={pool.address} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-xs">{chainName(pool.network || 137)}</span>
                        </td>
                        <td className="px-4 py-3">
                          <Link 
                            href={`/pool/${pool.address}`}
                            className="flex items-center gap-2 hover:text-accent2 transition-colors"
                          >
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-semibold">
                              {pool.symbol.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold">{pool.name}</div>
                              <div className="text-xs text-muted">{pool.symbol}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {pool.tvl !== undefined ? (
                            <span className="font-semibold">
                              ${pool.tvl >= 1000000 
                                ? `${(pool.tvl / 1000000).toFixed(2)}M`
                                : pool.tvl >= 1000
                                ? `${(pool.tvl / 1000).toFixed(1)}K`
                                : pool.tvl.toFixed(0)}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {pool.returns24h !== undefined ? (
                            <span className={pool.returns24h >= 0 ? "text-green-400" : "text-red-400"}>
                              {formatReturns(pool.returns24h)}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {pool.returns1w !== undefined ? (
                            <span className={pool.returns1w >= 0 ? "text-green-400" : "text-red-400"}>
                              {formatReturns(pool.returns1w)}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {pool.returns1m !== undefined ? (
                            <span className={pool.returns1m >= 0 ? "text-green-400" : "text-red-400"}>
                              {formatReturns(pool.returns1m)}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-muted">-</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="text-muted">-</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {totalReturn !== 0 ? (
                            <span className={totalReturn >= 0 ? "text-green-400" : "text-red-400"}>
                              {formatReturns(totalReturn)}
                            </span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <RiskScoreBadge score={pool.riskScore || 50} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          {pool.score !== undefined ? (
                            <span className="font-semibold">{pool.score}</span>
                          ) : (
                            <span className="text-muted">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="px-3 py-1 rounded-lg text-sm bg-white/5 disabled:opacity-50"
              >
                Prev
              </button>
              <div className="text-xs text-muted">Page {page + 1}</div>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={filteredAndSortedPools.length < pageSize}
                className="px-3 py-1 rounded-lg text-sm bg-white/5 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        ) : (
          <div className="card p-8 text-center">
            <div className="text-muted">No vaults found matching your filters</div>
          </div>
        )}
      </section>
      </div>
    </div>
  );
}
