"use client";
import { Trade } from "@/lib/metrics";
import Link from "next/link";

export function TradeHistoryTable({ trades }: { trades: Trade[] }) {
  if (trades.length === 0) {
    return (
      <div className="card p-5">
        <div className="text-sm text-muted">No trade history available</div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <h3 className="text-lg font-semibold mb-4">Recent Transactions</h3>
      <table className="w-full text-sm">
        <thead className="text-muted border-b border-white/10">
          <tr>
            <th className="text-left py-2">Date</th>
            <th className="text-left py-2">Type</th>
            <th className="text-left py-2">Manager</th>
            <th className="text-left py-2">Block</th>
            <th className="text-left py-2">Transaction</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {trades.map((trade, idx) => (
            <tr key={idx}>
              <td className="py-2">
                {new Date(trade.timestamp).toLocaleDateString()} {new Date(trade.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </td>
              <td className="py-2">
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  trade.type === "Exchange" 
                    ? "bg-accent/20 text-accent"
                    : trade.type === "Add Liquidity"
                      ? "bg-green-500/20 text-green-400"
                      : trade.type === "Remove Liquidity"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-muted/20 text-muted"
                }`}>
                  {trade.type}
                </span>
              </td>
              <td className="py-2 font-mono text-xs">
                {trade.manager.slice(0, 6)}...{trade.manager.slice(-4)}
              </td>
              <td className="py-2 text-muted">
                {trade.blockNumber.toLocaleString()}
              </td>
              <td className="py-2">
                <Link
                  href={`https://polygonscan.com/tx/${trade.txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent2 hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
