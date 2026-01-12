"use client";

export function RiskScoreBadge({ score }: { score: number }) {
  // Convert 0-100 score to 1-5 scale
  const riskLevel = Math.ceil((score / 100) * 5);
  const maxLevel = 5;
  
  let colorClass = "bg-green-500/20 text-green-400 border-green-400/40";
  let label = "Low";

  if (riskLevel >= 4) {
    colorClass = "bg-red-500/20 text-red-400 border-red-400/40";
    label = "High";
  } else if (riskLevel >= 3) {
    colorClass = "bg-yellow-500/20 text-yellow-400 border-yellow-400/40";
    label = "Medium";
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${colorClass}`}>
      Risk: {riskLevel}/{maxLevel}
    </span>
  );
}
