import { HistoryPoint } from "./metrics";

export const calculateReturns = (
  history: HistoryPoint[],
  period: "24h" | "1w" | "1m"
): number => {
  if (history.length === 0) return 0;

  const now = Date.now();
  const periods = {
    "24h": 24 * 60 * 60 * 1000,
    "1w": 7 * 24 * 60 * 60 * 1000,
    "1m": 30 * 24 * 60 * 60 * 1000,
  };

  const cutoff = now - periods[period];
  const currentPrice = history[history.length - 1]?.sharePrice || 0;
  const pastPrice = history.find((h) => h.timestamp >= cutoff)?.sharePrice || currentPrice;

  if (pastPrice === 0) return 0;
  return ((currentPrice - pastPrice) / pastPrice) * 100;
};

export const formatReturns = (value: number): string => {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};
