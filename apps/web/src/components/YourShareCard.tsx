"use client";

import { useState } from "react";
import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";

interface YourShareCardProps {
  poolAddress: string;
  poolSymbol?: string;
  poolName?: string;
  sharePrice?: number;
}

declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown }) => Promise<unknown>;
    };
  }
}

export function YourShareCard({ 
  poolAddress, 
  poolSymbol = "POOL", 
  poolName = "Pool Token",
  sharePrice = 1 
}: YourShareCardProps) {
  const { address, isConnected } = useAccount();
  const [addStatus, setAddStatus] = useState<"idle" | "adding" | "success" | "error">("idle");
  
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
    if (!window.ethereum) {
      alert("No wallet detected. Please install MetaMask or another Web3 wallet.");
      return;
    }
    
    setAddStatus("adding");
    try {
      const wasAdded = await window.ethereum.request({
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
      
      if (wasAdded) {
        setAddStatus("success");
        setTimeout(() => setAddStatus("idle"), 2000);
      } else {
        setAddStatus("idle");
      }
    } catch (error) {
      console.error("Failed to add token to wallet:", error);
      setAddStatus("error");
      setTimeout(() => setAddStatus("idle"), 2000);
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
            disabled={addStatus === "adding"}
            className={`w-full py-2 px-4 rounded-lg border text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
              addStatus === "success" 
                ? "border-green-500/50 text-green-400 bg-green-500/10" 
                : addStatus === "error"
                  ? "border-red-500/50 text-red-400 bg-red-500/10"
                  : "border-white/10 hover:bg-white/5"
            }`}
          >
            {addStatus === "adding" ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : addStatus === "success" ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Added!
              </>
            ) : addStatus === "error" ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Failed
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add to Wallet
              </>
            )}
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
