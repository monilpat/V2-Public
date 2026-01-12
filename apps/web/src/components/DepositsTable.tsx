"use client";

import Link from "next/link";
import { assetMeta } from "@/lib/prices";

interface DepositEvent {
  txHash: string;
  blockNumber: number;
  timestamp: number;
  investor: string;
  assetDeposited: string;
  amountDeposited: string;
  valueDeposited: number;
  fundTokensReceived: string;
}

interface DepositsTableProps {
  deposits: DepositEvent[];
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

function getAssetSymbol(address: string): string {
  const meta = assetMeta.get(address.toLowerCase());
  return meta?.symbol || shortenAddress(address);
}

export function DepositsTable({ deposits, isLoading, poolSymbol = "POOL" }: DepositsTableProps) {
  if (isLoading) {
    return (
      <div className="text-center text-muted py-12">
        <div className="animate-pulse">Loading deposits…</div>
      </div>
    );
  }

  if (!deposits || deposits.length === 0) {
    return (
      <div className="text-center text-muted py-12">
        No deposits found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-muted border-b border-white/10">
          <tr>
            <th className="text-left py-3 px-2">Asset</th>
            <th className="text-right py-3 px-2">Amount</th>
            <th className="text-right py-3 px-2">Value (USD)</th>
            <th className="text-right py-3 px-2">{poolSymbol} Received</th>
            <th className="text-left py-3 px-2">Depositor</th>
            <th className="text-right py-3 px-2">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {deposits.map((deposit, idx) => (
            <tr key={`${deposit.txHash}-${idx}`} className="hover:bg-white/5 transition-colors">
              <td className="py-3 px-2 font-semibold">
                {getAssetSymbol(deposit.assetDeposited)}
              </td>
              <td className="py-3 px-2 text-right font-mono">
                {formatAmount(deposit.amountDeposited)}
              </td>
              <td className="py-3 px-2 text-right font-semibold text-green-400">
                ${deposit.valueDeposited.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </td>
              <td className="py-3 px-2 text-right font-mono">
                {formatAmount(deposit.fundTokensReceived)}
              </td>
              <td className="py-3 px-2">
                <Link
                  href={`https://polygonscan.com/address/${deposit.investor}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent2 hover:underline font-mono"
                >
                  {shortenAddress(deposit.investor)}
                </Link>
              </td>
              <td className="py-3 px-2 text-right">
                <Link
                  href={`https://polygonscan.com/tx/${deposit.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted hover:text-accent2"
                >
                  {formatTimestamp(deposit.timestamp)}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
