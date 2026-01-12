"use client";

import Image from "next/image";

interface AssetToggleProps {
  symbol: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  onRemove?: () => void;
  showRemove?: boolean;
  icon?: string;
}

export function AssetToggle({
  symbol,
  enabled,
  onChange,
  onRemove,
  showRemove = true,
  icon,
}: AssetToggleProps) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full hover:border-gray-300 transition-colors">
      {/* Token icon placeholder */}
      {icon ? (
        <Image src={icon} alt={symbol} width={20} height={20} className="rounded-full" />
      ) : (
        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
          {symbol.slice(0, 2)}
        </div>
      )}
      
      {/* Symbol */}
      <span className="text-sm font-medium text-gray-700">{symbol}</span>
      
      {/* Toggle switch */}
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        className={`
          relative w-10 h-6 rounded-full transition-colors duration-200 ease-in-out
          ${enabled ? "bg-cyan-400" : "bg-gray-200"}
        `}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`
            absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm
            transition-transform duration-200 ease-in-out
            ${enabled ? "translate-x-4" : "translate-x-0"}
          `}
        />
      </button>
      
      {/* Remove button */}
      {showRemove && onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
          aria-label={`Remove ${symbol}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}

// Simple toggle component without asset styling
export function Toggle({
  enabled,
  onChange,
  size = "md",
}: {
  enabled: boolean;
  onChange: (enabled: boolean) => void;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: { track: "w-8 h-5", thumb: "w-4 h-4", translate: "translate-x-3" },
    md: { track: "w-10 h-6", thumb: "w-5 h-5", translate: "translate-x-4" },
    lg: { track: "w-12 h-7", thumb: "w-6 h-6", translate: "translate-x-5" },
  };

  const s = sizes[size];

  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`
        relative ${s.track} rounded-full transition-colors duration-200 ease-in-out
        ${enabled ? "bg-cyan-400" : "bg-gray-200"}
      `}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={`
          absolute top-0.5 left-0.5 ${s.thumb} bg-white rounded-full shadow-sm
          transition-transform duration-200 ease-in-out
          ${enabled ? s.translate : "translate-x-0"}
        `}
      />
    </button>
  );
}
