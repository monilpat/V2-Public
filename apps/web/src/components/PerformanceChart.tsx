"use client";
import { HistoryPoint } from "@/lib/metrics";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function PerformanceChart({
  data,
  height = 300,
}: {
  data: HistoryPoint[];
  height?: number;
}) {
  const chartData = data.map((d) => ({
    date: new Date(d.timestamp).toLocaleDateString(),
    price: d.sharePrice,
    tvl: d.tvl,
    timestamp: d.timestamp,
  }));

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" stroke="#888" fontSize={12} />
        <YAxis stroke="#888" fontSize={12} />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-white/10 border border-white/20 rounded-lg p-2 text-sm">
                  <div className="font-semibold">{data.date}</div>
                  <div>Price: ${data.price.toFixed(4)}</div>
                  <div>TVL: ${data.tvl.toLocaleString()}</div>
                </div>
              );
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey="price"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
