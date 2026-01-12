"use client";

import Link from "next/link";
import { formatUnits } from "viem";

interface Depositor {
  address: string;
  balance: string;
  balanceFormatted: number;
  valueUsd: number;
  label?: string;
}

interface DepositorsTableProps {
  depositors: Depositor[];
  isLoading?: boolean;
  poolSymbol?: string;
}

function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

export function DepositorsTable({ depositors, isLoading, poolSymbol = "POOL" }: DepositorsTableProps) {
  if (isLoading) {
    return (
      <div className="text-center text-muted py-12">
        <div className="animate-pulse">Loading depositors…</div>
      </div>
    );
  }

  if (!depositors || depositors.length === 0) {
    return (
      <div className="text-center text-muted py-12">
        No depositors found
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-muted border-b border-white/10">
          <tr>
            <th className="text-left py-3 px-2">#</th>
            <th className="text-left py-3 px-2">Depositor Address</th>
            <th className="text-right py-3 px-2">Balance ({poolSymbol})</th>
            <th className="text-right py-3 px-2">Value (USD)</th>
            <th className="text-left py-3 px-2">Label</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {depositors.map((depositor, idx) => (
            <tr key={depositor.address} className="hover:bg-white/5 transition-colors">
              <td className="py-3 px-2 text-muted">{idx + 1}</td>
              <td className="py-3 px-2">
                <div className="flex items-center gap-2">
                  <Link
                    href={`https://polygonscan.com/address/${depositor.address}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-accent2 hover:underline font-mono"
                  >
                    {shortenAddress(depositor.address)}
                  </Link>
                  <button
                    onClick={() => copyToClipboard(depositor.address)}
                    className="text-muted hover:text-white p-1 rounded transition-colors"
                    title="Copy address"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </td>
              <td className="py-3 px-2 text-right font-mono">
                {depositor.balanceFormatted.toLocaleString(undefined, { 
                  maximumFractionDigits: 4,
                  minimumFractionDigits: 2 
                })}
              </td>
              <td className="py-3 px-2 text-right font-semibold">
                ${depositor.valueUsd.toLocaleString(undefined, { 
                  maximumFractionDigits: 2,
                  minimumFractionDigits: 2 
                })}
              </td>
              <td className="py-3 px-2">
                {depositor.label && (
                  <span className="px-2 py-1 text-xs rounded-full bg-accent/20 text-accent">
                    {depositor.label}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
