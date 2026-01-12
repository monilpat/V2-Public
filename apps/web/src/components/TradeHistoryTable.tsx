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
      <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
      <table className="w-full text-sm">
        <thead className="text-muted border-b border-white/10">
          <tr>
            <th className="text-left py-2">Date</th>
            <th className="text-left py-2">From</th>
            <th className="text-left py-2">To</th>
            <th className="text-left py-2">Amount</th>
            <th className="text-left py-2">Transaction</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {trades.map((trade, idx) => (
            <tr key={idx}>
              <td className="py-2">
                {new Date(trade.timestamp).toLocaleDateString()}
              </td>
              <td className="py-2 font-semibold">{trade.fromAsset.slice(0, 6)}...</td>
              <td className="py-2 font-semibold">{trade.toAsset.slice(0, 6)}...</td>
              <td className="py-2">{trade.amount}</td>
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
