"use client";
import { HistoryPoint } from "@/lib/metrics";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export function PerformanceChart({
  data,
  height = 300,
  dataKey = "price",
}: {
  data: HistoryPoint[];
  height?: number;
  dataKey?: "price" | "tvl";
}) {
  const chartData = data.map((d) => ({
    date: new Date(d.timestamp).toLocaleDateString(),
    price: d.sharePrice,
    tvl: d.tvl,
    timestamp: d.timestamp,
  }));

  const formatValue = (value: number) => {
    if (dataKey === "tvl") {
      return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
    }
    return `$${value.toFixed(4)}`;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={chartData}>
        <XAxis dataKey="date" stroke="#888" fontSize={12} />
        <YAxis 
          stroke="#888" 
          fontSize={12}
          tickFormatter={(value) => dataKey === "tvl" ? `$${(value / 1000).toFixed(1)}K` : `$${value.toFixed(2)}`}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              const data = payload[0].payload;
              return (
                <div className="bg-white/10 border border-white/20 rounded-lg p-2 text-sm">
                  <div className="font-semibold">{data.date}</div>
                  <div>{dataKey === "tvl" ? "TVL" : "Price"}: {formatValue(data[dataKey])}</div>
                </div>
              );
            }
            return null;
          }}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
