"use client";

export function RiskScoreBadge({ score }: { score: number }) {
  let colorClass = "bg-green-500/20 text-green-400";
  let label = "Low";

  if (score >= 67) {
    colorClass = "bg-red-500/20 text-red-400";
    label = "High";
  } else if (score >= 34) {
    colorClass = "bg-yellow-500/20 text-yellow-400";
    label = "Medium";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colorClass}`}>
      {label} ({score}/100)
    </span>
  );
}
