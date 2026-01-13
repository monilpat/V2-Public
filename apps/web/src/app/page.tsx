"use client";

import Link from "next/link";
import { Nav } from "@/components/nav";
import { useQuery } from "@tanstack/react-query";
import { fetchPools, type PoolMeta } from "@/lib/pools";
import { useMemo } from "react";

// Featured vault cards for the homepage
function FeaturedVaultCard({ vault }: { vault: PoolMeta }) {
  const formattedTvl = vault.tvl 
    ? `$${vault.tvl >= 1000000 
        ? `${(vault.tvl / 1000000).toFixed(2)}M` 
        : vault.tvl >= 1000 
          ? `${(vault.tvl / 1000).toFixed(1)}K`
          : vault.tvl.toFixed(0)}`
    : "$—";

  return (
    <Link href={`/pool/${vault.address}`} className="block group">
      <div className="card p-6 hover:border-accent/50 transition-all duration-300 group-hover:-translate-y-1">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-semibold text-lg">{vault.name || "Unnamed Vault"}</h3>
            <p className="text-sm text-muted">{vault.symbol}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
            Active
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted mb-1">TVL</p>
            <p className="font-semibold">{formattedTvl}</p>
          </div>
          <div>
            <p className="text-muted mb-1">Performance</p>
            <p className="font-semibold text-green-400">—</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Feature card component
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="card p-6 text-center hover:border-accent/30 transition-colors">
      <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-accent/20 to-accent2/20 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted">{description}</p>
    </div>
  );
}

// Stat display component
function StatDisplay({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-accent to-accent2 bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-sm text-muted mt-1">{label}</div>
    </div>
  );
}

export default function Page() {
  const { data: poolsResponse } = useQuery({
    queryKey: ["pools", "all"],
    queryFn: () => fetchPools("137", { limit: 20, offset: 0 }),
  });
  const pools = poolsResponse?.pools ?? [];

  // Get top vaults by TVL
  const featuredVaults = useMemo(() => {
    if (!pools) return [];
    return [...pools]
      .filter(p => p.tvl && p.tvl > 0)
      .sort((a, b) => (b.tvl || 0) - (a.tvl || 0))
      .slice(0, 3);
  }, [pools]);

  // Calculate total TVL
  const totalTvl = useMemo(() => {
    if (!pools) return 0;
    return pools.reduce((acc, p) => acc + (p.tvl || 0), 0);
  }, [pools]);

  const formattedTvl = totalTvl >= 1000000 
    ? `$${(totalTvl / 1000000).toFixed(1)}M`
    : `$${(totalTvl / 1000).toFixed(0)}K`;

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Nav />
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        {/* Animated gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent2/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-8">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm text-accent">Live on Polygon, Optimism, Arbitrum & Base</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-foreground via-accent to-accent2 bg-clip-text text-transparent">
                Decentralized
              </span>
              <br />
              <span>Asset Management</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-muted mb-10 max-w-2xl mx-auto">
              Create and invest in non-custodial, permissionless investment vaults. 
              Your keys, your assets, transparent on-chain performance.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/explore"
                className="btn-primary px-8 py-4 rounded-full text-lg font-semibold"
              >
                Explore Vaults
              </Link>
              <Link
                href="/manage"
                className="btn-ghost px-8 py-4 rounded-full text-lg font-semibold"
              >
                Start Managing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatDisplay value={formattedTvl} label="Total Value Locked" />
            <StatDisplay value={pools?.length?.toString() || "—"} label="Active Vaults" />
            <StatDisplay value="5" label="Networks Supported" />
            <StatDisplay value="100+" label="Integrations" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose Us?
            </h2>
            <p className="text-muted max-w-2xl mx-auto">
              The most advanced decentralized asset management protocol across multiple chains
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              title="Non-Custodial"
              description="Your assets remain in your control at all times. No custody risk."
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              title="Audited & Secure"
              description="Battle-tested smart contracts with multiple security audits."
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              title="Multi-Chain"
              description="Deploy and manage vaults across Polygon, Optimism, Arbitrum, and more."
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
              title="Transparent"
              description="All performance data is verifiable on-chain. No hidden fees."
            />
          </div>
        </div>
      </section>

      {/* Featured Vaults Section */}
      {featuredVaults.length > 0 && (
        <section className="py-20 bg-background-secondary">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Vaults</h2>
                <p className="text-muted">Top performing vaults by TVL</p>
              </div>
              <Link
                href="/explore"
                className="text-accent hover:text-accent/80 font-medium flex items-center gap-2 transition-colors"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredVaults.map((vault) => (
                <FeaturedVaultCard key={vault.address} vault={vault} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="card p-10 md:p-16 text-center relative overflow-hidden">
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-accent2/5 pointer-events-none" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Start?
              </h2>
              <p className="text-muted mb-8 max-w-xl mx-auto">
                Whether you&apos;re an investor looking for alpha or a manager ready to build your reputation, 
                we have you covered.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/explore"
                  className="btn-primary px-8 py-4 rounded-full font-semibold"
                >
                  Browse Vaults
                </Link>
                <Link
                  href="/manage"
                  className="btn-ghost px-8 py-4 rounded-full font-semibold"
                >
                  Create a Vault
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-accent2" />
              </div>
              <p className="text-sm text-muted">
                Decentralized asset management for everyone.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Protocol</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li><Link href="/explore" className="hover:text-accent transition-colors">Explore</Link></li>
                <li><Link href="/manage" className="hover:text-accent transition-colors">Manage</Link></li>
                <li><Link href="/stats" className="hover:text-accent transition-colors">Stats</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li><a href="https://docs.dhedge.org" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Documentation</a></li>
                <li><a href="https://blog.dhedge.org" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Blog</a></li>
                <li><a href="https://github.com/dhedge" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">GitHub</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li><a href="https://discord.gg/dhedge" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Discord</a></li>
                <li><a href="https://twitter.com/dabordigital" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Twitter</a></li>
                <li><a href="https://snapshot.org/#/dhedge.eth" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Governance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-sm text-muted">
            <p>© {new Date().getFullYear()} All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
