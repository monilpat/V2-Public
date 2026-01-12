"use client";

import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";

interface YourShareCardProps {
  poolAddress: string;
  poolSymbol?: string;
  poolName?: string;
  sharePrice?: number;
}

export function YourShareCard({ 
  poolAddress, 
  poolSymbol = "POOL", 
  poolName = "Pool Token",
  sharePrice = 1 
}: YourShareCardProps) {
  const { address, isConnected } = useAccount();
  
  // Get user balance of pool tokens
  const { data: balance, isLoading } = useBalance({
    address,
    token: poolAddress as `0x${string}`,
  });

  if (!isConnected) {
    return null;
  }

  const balanceFormatted = balance 
    ? parseFloat(formatUnits(balance.value, balance.decimals))
    : 0;
  const valueUsd = balanceFormatted * sharePrice;

  const handleAddToWallet = async () => {
    const ethereum = (window as any).ethereum;
    if (!ethereum) return;
    
    try {
      await ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: poolAddress,
            symbol: poolSymbol.slice(0, 11), // Max 11 chars
            decimals: 18,
          },
        },
      });
    } catch (error) {
      console.error("Failed to add token to wallet:", error);
    }
  };

  return (
    <div className="card p-5 space-y-4">
      <h3 className="text-lg font-semibold">Your Share</h3>
      
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          <div className="h-8 bg-white/10 rounded w-2/3"></div>
          <div className="h-6 bg-white/10 rounded w-1/2"></div>
        </div>
      ) : balanceFormatted > 0 ? (
        <div className="space-y-4">
          {/* Balance */}
          <div>
            <div className="text-sm text-muted mb-1">Balance</div>
            <div className="text-2xl font-bold">
              {balanceFormatted.toLocaleString(undefined, { 
                maximumFractionDigits: 4,
                minimumFractionDigits: 2 
              })}
              <span className="text-muted text-lg ml-2">{poolSymbol}</span>
            </div>
          </div>

          {/* Value */}
          <div>
            <div className="text-sm text-muted mb-1">Value</div>
            <div className="text-xl font-semibold text-green-400">
              ${valueUsd.toLocaleString(undefined, { 
                maximumFractionDigits: 2,
                minimumFractionDigits: 2 
              })}
            </div>
          </div>

          {/* Share of Pool */}
          <div className="flex items-center gap-2 text-sm text-muted">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
            <span>Share Price: ${sharePrice.toFixed(4)}</span>
          </div>

          {/* Add to Wallet Button */}
          <button
            onClick={handleAddToWallet}
            className="w-full py-2 px-4 rounded-lg border border-white/10 text-sm font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add to Wallet
          </button>
        </div>
      ) : (
        <div className="text-center py-4 text-muted">
          <p className="mb-2">You don&apos;t own any shares of this vault yet.</p>
          <p className="text-sm">Use the Buy panel to invest.</p>
        </div>
      )}
    </div>
  );
}
