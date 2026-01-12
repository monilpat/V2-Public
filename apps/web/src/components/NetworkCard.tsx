"use client";

import { type NetworkConfig } from "@/config/networks";

interface NetworkCardProps {
  network: NetworkConfig;
  isSelected: boolean;
  onSelect: () => void;
  onAssetsClick?: () => void;
}

// Network icon components
const NetworkIcon = ({ chainId, className = "w-12 h-12" }: { chainId: number; className?: string }) => {
  switch (chainId) {
    case 1: // Ethereum
      return (
        <div className={`${className} rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center`}>
          <svg viewBox="0 0 32 32" className="w-7 h-7">
            <path fill="#627EEA" d="M16 0L5 16l11 6.5L27 16 16 0z"/>
            <path fill="#627EEA" opacity="0.6" d="M16 22.5L5 16l11 16 11-16-11 6.5z"/>
          </svg>
        </div>
      );
    case 137: // Polygon
      return (
        <div className={`${className} rounded-full bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center`}>
          <svg viewBox="0 0 32 32" className="w-7 h-7">
            <path fill="#8247E5" d="M21.6 13.5l-4.8-2.8a1.8 1.8 0 00-1.6 0l-4.8 2.8a1.6 1.6 0 00-.8 1.4v5.6c0 .6.3 1.1.8 1.4l4.8 2.8c.5.3 1.1.3 1.6 0l4.8-2.8c.5-.3.8-.8.8-1.4v-5.6c0-.6-.3-1.1-.8-1.4z"/>
          </svg>
        </div>
      );
    case 10: // Optimism
      return (
        <div className={`${className} rounded-full bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center`}>
          <svg viewBox="0 0 32 32" className="w-7 h-7">
            <circle fill="#FF0420" cx="16" cy="16" r="12"/>
            <text x="16" y="20" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">OP</text>
          </svg>
        </div>
      );
    case 42161: // Arbitrum
      return (
        <div className={`${className} rounded-full bg-gradient-to-br from-blue-100 to-cyan-200 flex items-center justify-center`}>
          <svg viewBox="0 0 32 32" className="w-7 h-7">
            <path fill="#28A0F0" d="M16 4L6 16l10 12 10-12L16 4z"/>
            <path fill="#96BEDC" d="M16 10l-5 6 5 6 5-6-5-6z"/>
          </svg>
        </div>
      );
    case 8453: // Base
      return (
        <div className={`${className} rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center`}>
          <svg viewBox="0 0 32 32" className="w-7 h-7">
            <circle fill="white" cx="16" cy="16" r="8"/>
            <circle fill="#0052FF" cx="16" cy="16" r="4"/>
          </svg>
        </div>
      );
    default:
      return (
        <div className={`${className} rounded-full bg-gray-200 flex items-center justify-center`}>
          <span className="text-gray-500 font-bold">?</span>
        </div>
      );
  }
};

// Feature check icon
const CheckIcon = () => (
  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

// External link icon
const ExternalLinkIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

// DApp logo placeholder
const DAppLogo = ({ name }: { name: string }) => {
  const colors: Record<string, string> = {
    "1inch": "bg-red-100 text-red-600",
    "Aave": "bg-purple-100 text-purple-600",
    "Aerodrome": "bg-blue-100 text-blue-600",
    "Compound": "bg-green-100 text-green-600",
    "Fluid": "bg-cyan-100 text-cyan-600",
    "KyberSwap": "bg-emerald-100 text-emerald-600",
    "Odos": "bg-yellow-100 text-yellow-600",
    "PancakeSwap": "bg-amber-100 text-amber-600",
    "Pendle": "bg-teal-100 text-teal-600",
    "Toros": "bg-indigo-100 text-indigo-600",
    "Uniswap": "bg-pink-100 text-pink-600",
    "Velodrome": "bg-slate-100 text-slate-600",
  };

  return (
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold ${colors[name] || "bg-gray-100 text-gray-600"}`}
      title={name}
    >
      {name.slice(0, 2)}
    </div>
  );
};

export function NetworkCard({
  network,
  isSelected,
  onSelect,
  onAssetsClick,
}: NetworkCardProps) {
  return (
    <div
      onClick={onSelect}
      className={`
        relative p-6 bg-white rounded-2xl border-2 cursor-pointer
        transition-all duration-200 ease-out
        hover:shadow-lg hover:-translate-y-1
        ${isSelected
          ? "border-cyan-400 shadow-md shadow-cyan-100"
          : "border-gray-100 hover:border-gray-200"
        }
      `}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* Network icon */}
      <div className="flex justify-center mb-4">
        <NetworkIcon chainId={network.chainId} />
      </div>

      {/* Network name with explorer link */}
      <div className="flex items-center justify-center gap-2 mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{network.name}</h3>
        <a
          href={network.blockExplorer}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-gray-400 hover:text-cyan-500 transition-colors"
        >
          <ExternalLinkIcon />
        </a>
      </div>

      {/* Features list */}
      <div className="space-y-2 mb-4">
        {network.features.map((feature) => (
          <div key={feature} className="flex items-center gap-2">
            <CheckIcon />
            <span className="text-sm text-gray-600">{feature}</span>
          </div>
        ))}
      </div>

      {/* Separator */}
      <div className="flex justify-center py-2">
        <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>

      {/* DApp logos */}
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        {network.dapps.slice(0, 6).map((dapp) => (
          <DAppLogo key={dapp} name={dapp} />
        ))}
        {network.dapps.length > 6 && (
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
            +{network.dapps.length - 6}
          </div>
        )}
      </div>

      {/* Assets link */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onAssetsClick?.();
        }}
        className="w-full text-center text-sm text-cyan-500 hover:text-cyan-600 font-medium transition-colors"
      >
        Assets Available
      </button>
    </div>
  );
}
