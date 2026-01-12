"use client";
import Link from "next/link";
import { RiskScoreBadge } from "./RiskScoreBadge";
import { formatReturns } from "@/lib/returns";

export type VaultCardProps = {
  pool: {
    address: string;
    name: string;
    symbol: string;
    tvl?: number;
    returns24h?: number;
    returns1w?: number;
    returns1m?: number;
    riskScore?: number;
  };
};

export function VaultCard({ pool }: VaultCardProps) {
  return (
    <Link href={`/(pool)/${pool.address}`} className="block">
      <div className="card p-5 space-y-3 hover:bg-white/5 transition-colors">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted">Vault</div>
            <div className="text-xl font-semibold">{pool.name}</div>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/5 text-sm">{pool.symbol}</span>
        </div>

        {pool.tvl !== undefined && (
          <div className="text-sm">
            <span className="text-muted">TVL</span>{" "}
            <span className="font-semibold">
              ${pool.tvl.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2 text-xs">
          {pool.returns24h !== undefined && (
            <div>
              <div className="text-muted">24h</div>
              <div className={pool.returns24h >= 0 ? "text-green-400" : "text-red-400"}>
                {formatReturns(pool.returns24h)}
              </div>
            </div>
          )}
          {pool.returns1w !== undefined && (
            <div>
              <div className="text-muted">1W</div>
              <div className={pool.returns1w >= 0 ? "text-green-400" : "text-red-400"}>
                {formatReturns(pool.returns1w)}
              </div>
            </div>
          )}
          {pool.returns1m !== undefined && (
            <div>
              <div className="text-muted">1M</div>
              <div className={pool.returns1m >= 0 ? "text-green-400" : "text-red-400"}>
                {formatReturns(pool.returns1m)}
              </div>
            </div>
          )}
        </div>

        {pool.riskScore !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted">Risk:</span>
            <RiskScoreBadge score={pool.riskScore} />
          </div>
        )}

        <div className="text-xs text-muted break-all">{pool.address}</div>
      </div>
    </Link>
  );
}
