"use client";

import Link from "next/link";
import { assetMeta } from "@/lib/prices";

type ActivityType = "Deposit" | "Withdrawal" | "Trade";

interface ActivityEvent {
  type: ActivityType;
  txHash: string;
  blockNumber: number;
  timestamp: number;
  actor: string;
  outgoing?: {
    asset: string;
    amount: string;
    valueUsd?: number;
  };
  incoming?: {
    asset: string;
    amount: string;
    valueUsd?: number;
  };
}

interface ActivityTableProps {
  activities: ActivityEvent[];
  isLoading?: boolean;
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function shortenTxHash(hash: string): string {
  return `${hash.slice(0, 10)}…${hash.slice(-8)}`;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  // Less than 1 hour ago
  if (diff < 60 * 60 * 1000) {
    const mins = Math.floor(diff / (60 * 1000));
    return `${mins}m ago`;
  }
  // Less than 24 hours ago
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}h ago`;
  }
  // Less than 7 days ago
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}d ago`;
  }
  // Older
  return date.toLocaleDateString();
}

function getAssetSymbol(address: string): string {
  if (address === "multiple") return "Multiple Assets";
  const meta = assetMeta.get(address.toLowerCase());
  return meta?.symbol || shortenAddress(address);
}

function formatAmount(amount: string, decimals: number = 18): string {
  const value = Number(BigInt(amount)) / Math.pow(10, decimals);
  if (value > 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value > 1000) return `${(value / 1000).toFixed(2)}K`;
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

const typeColors: Record<ActivityType, string> = {
  Deposit: "text-green-400 bg-green-400/10",
  Withdrawal: "text-red-400 bg-red-400/10",
  Trade: "text-blue-400 bg-blue-400/10",
};

export function ActivityTable({ activities, isLoading }: ActivityTableProps) {
  if (isLoading) {
    return (
      <div className="text-center text-muted py-12">
        <div className="animate-pulse">Loading activity…</div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center text-muted py-12">
        No activity found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-muted border-b border-white/10">
          <tr>
            <th className="text-left py-3 px-2">Type</th>
            <th className="text-left py-3 px-2">Outgoing</th>
            <th className="text-left py-3 px-2">Incoming</th>
            <th className="text-left py-3 px-2">Actor</th>
            <th className="text-right py-3 px-2">Time</th>
            <th className="text-right py-3 px-2">Tx</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {activities.map((activity, idx) => (
            <tr key={`${activity.txHash}-${idx}`} className="hover:bg-white/5 transition-colors">
              <td className="py-3 px-2">
                <span className={`px-2 py-1 text-xs rounded-full ${typeColors[activity.type]}`}>
                  {activity.type}
                </span>
              </td>
              <td className="py-3 px-2">
                {activity.outgoing ? (
                  <div>
                    <div className="font-mono">{formatAmount(activity.outgoing.amount)}</div>
                    <div className="text-xs text-muted">{getAssetSymbol(activity.outgoing.asset)}</div>
                  </div>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
              <td className="py-3 px-2">
                {activity.incoming ? (
                  <div>
                    {activity.incoming.valueUsd ? (
                      <div className="font-semibold">${activity.incoming.valueUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                    ) : (
                      <div className="font-mono">{formatAmount(activity.incoming.amount)}</div>
                    )}
                    <div className="text-xs text-muted">{getAssetSymbol(activity.incoming.asset)}</div>
                  </div>
                ) : (
                  <span className="text-muted">-</span>
                )}
              </td>
              <td className="py-3 px-2">
                <Link
                  href={`https://polygonscan.com/address/${activity.actor}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent2 hover:underline font-mono text-xs"
                >
                  {shortenAddress(activity.actor)}
                </Link>
              </td>
              <td className="py-3 px-2 text-right text-muted">
                {formatTimestamp(activity.timestamp)}
              </td>
              <td className="py-3 px-2 text-right">
                <Link
                  href={`https://polygonscan.com/tx/${activity.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent2 hover:underline font-mono text-xs"
                >
                  {shortenTxHash(activity.txHash)}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
