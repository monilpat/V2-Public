"use client";

import Link from "next/link";

interface WithdrawalEvent {
  txHash: string;
  blockNumber: number;
  timestamp: number;
  investor: string;
  valueWithdrawn: number;
  fundTokensWithdrawn: string;
}

interface WithdrawalsTableProps {
  withdrawals: WithdrawalEvent[];
  isLoading?: boolean;
  poolSymbol?: string;
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  if (diff < 60 * 60 * 1000) {
    const mins = Math.floor(diff / (60 * 1000));
    return `${mins}m ago`;
  }
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}h ago`;
  }
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days}d ago`;
  }
  return date.toLocaleDateString();
}

function formatAmount(amount: string, decimals: number = 18): string {
  const value = Number(BigInt(amount)) / Math.pow(10, decimals);
  if (value > 1000000) return `${(value / 1000000).toFixed(2)}M`;
  if (value > 1000) return `${(value / 1000).toFixed(2)}K`;
  return value.toLocaleString(undefined, { maximumFractionDigits: 4 });
}

export function WithdrawalsTable({ withdrawals, isLoading, poolSymbol = "POOL" }: WithdrawalsTableProps) {
  if (isLoading) {
    return (
      <div className="text-center text-muted py-12">
        <div className="animate-pulse">Loading withdrawals…</div>
      </div>
    );
  }

  if (!withdrawals || withdrawals.length === 0) {
    return (
      <div className="text-center text-muted py-12">
        No withdrawals found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-muted border-b border-white/10">
          <tr>
            <th className="text-right py-3 px-2">{poolSymbol} Burned</th>
            <th className="text-right py-3 px-2">Value (USD)</th>
            <th className="text-left py-3 px-2">Withdrawer</th>
            <th className="text-right py-3 px-2">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {withdrawals.map((withdrawal, idx) => (
            <tr key={`${withdrawal.txHash}-${idx}`} className="hover:bg-white/5 transition-colors">
              <td className="py-3 px-2 text-right font-mono">
                {formatAmount(withdrawal.fundTokensWithdrawn)}
              </td>
              <td className="py-3 px-2 text-right font-semibold text-red-400">
                ${withdrawal.valueWithdrawn.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </td>
              <td className="py-3 px-2">
                <Link
                  href={`https://polygonscan.com/address/${withdrawal.investor}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent2 hover:underline font-mono"
                >
                  {shortenAddress(withdrawal.investor)}
                </Link>
              </td>
              <td className="py-3 px-2 text-right">
                <Link
                  href={`https://polygonscan.com/tx/${withdrawal.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted hover:text-accent2"
                >
                  {formatTimestamp(withdrawal.timestamp)}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
