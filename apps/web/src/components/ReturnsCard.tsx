"use client";

export function ReturnsCard({
  label,
  value,
  period,
}: {
  label: string;
  value: number;
  period: string;
}) {
  const isPositive = value >= 0;
  const colorClass = isPositive ? "text-green-400" : "text-red-400";
  const sign = isPositive ? "+" : "";

  return (
    <div className="card p-4 space-y-1">
      <div className="text-sm text-muted">{label}</div>
      <div className={`text-2xl font-semibold ${colorClass}`}>
        {sign}
        {value.toFixed(2)}%
      </div>
      <div className="text-xs text-muted">{period}</div>
    </div>
  );
}
