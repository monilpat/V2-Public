"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchPools } from "@/lib/pools";
import { VaultCard } from "@/components/VaultCard";
import { Nav } from "@/components/nav";
import { NetworkSelector } from "@/components/network-selector";

type SortOption = "tvl" | "returns24h" | "returns1w" | "returns1m";

export default function ExplorePage() {
  const [search, setSearch] = useState("");
  const [chain, setChain] = useState("polygon");
  const [sortBy, setSortBy] = useState<SortOption>("tvl");

  const { data: pools, isLoading } = useQuery({
    queryKey: ["pools", chain],
    queryFn: () => fetchPools(chain),
  });

  let filteredPools = pools || [];
  
  // Filter by search
  if (search) {
    const searchLower = search.toLowerCase();
    filteredPools = filteredPools.filter(
      (p: any) =>
        p.name?.toLowerCase().includes(searchLower) ||
        p.symbol?.toLowerCase().includes(searchLower) ||
        p.address?.toLowerCase().includes(searchLower)
    );
  }

  // Sort
  filteredPools = [...filteredPools].sort((a: any, b: any) => {
    const aVal = a[sortBy] || 0;
    const bVal = b[sortBy] || 0;
    return sortBy === "tvl" ? bVal - aVal : bVal - aVal;
  });

  return (
    <div className="space-y-8">
      <Nav />
      <header className="flex flex-col gap-2">
        <div className="text-sm text-muted">Explore Vaults</div>
        <h1 className="text-3xl font-bold">Discover dHEDGE Vaults</h1>
        <p className="text-muted mt-1">Browse and filter vaults by performance, risk, and chain.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-4">
        <input
          type="text"
          placeholder="Search vaults..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-white/5 rounded-lg px-4 py-2 text-sm"
        />
        <NetworkSelector value={chain} onChange={setChain} disabledIds={[1,10,42161]} />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="bg-white/5 rounded-lg px-4 py-2 text-sm"
        >
          <option value="tvl">Sort by TVL</option>
          <option value="returns24h">Sort by 24h Return</option>
          <option value="returns1w">Sort by 1W Return</option>
          <option value="returns1m">Sort by 1M Return</option>
        </select>
      </div>

      {isLoading ? (
        <div className="text-muted text-sm">Loading vaults...</div>
      ) : filteredPools.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="text-muted">No vaults found</div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredPools.map((pool: any) => (
            <VaultCard key={pool.address} pool={pool} />
          ))}
        </div>
      )}
    </div>
  );
}
