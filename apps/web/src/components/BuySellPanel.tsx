"use client";

import { useMemo, useState } from "react";
import { useAccount, useWriteContract, useBalance, useReadContract, usePublicClient } from "wagmi";
import { parseUnits, maxUint256, formatUnits } from "viem";
import { poolLogicAbi, erc20Abi, easySwapperV2Abi } from "@/lib/abi";
import { polygonConfig } from "@/lib/polygon";

interface Asset {
  address: string;
  symbol: string;
  decimals?: number;
  isDeposit?: boolean;
}

interface BuySellPanelProps {
  poolAddress: string;
  poolSymbol?: string;
  sharePrice?: number;
  supportedAssets: Asset[];
  onSuccess?: () => void;
}

type Mode = "buy" | "sell";

export function BuySellPanel({ 
  poolAddress, 
  poolSymbol = "POOL", 
  sharePrice = 1,
  supportedAssets,
  onSuccess 
}: BuySellPanelProps) {
  const { address, isConnected } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  
  const [mode, setMode] = useState<Mode>("buy");
  const [selectedAsset, setSelectedAsset] = useState<string>(
    supportedAssets[0]?.address || ""
  );
  const [amount, setAmount] = useState("");
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<"idle" | "approving" | "depositing" | "withdrawing">("idle");
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [slippageBps, setSlippageBps] = useState<number>(50); // 0.5%

  // Get user balance for selected asset
  const { data: assetBalance } = useBalance({
    address,
    token: selectedAsset as `0x${string}`,
  });

  // Get user balance of pool tokens (for sell mode)
  const { data: poolBalance } = useBalance({
    address,
    token: poolAddress as `0x${string}`,
  });

  const selectedAssetMeta = supportedAssets.find(a => a.address === selectedAsset);
  const decimals = selectedAssetMeta?.decimals || 18;

  // Calculate expected output
  const inputAmount = parseFloat(amount) || 0;
  const estimatedOutput = mode === "buy" 
    ? inputAmount / sharePrice 
    : inputAmount * sharePrice;

  const depositAmount = useMemo(() => {
    if (!amount || inputAmount <= 0) return null;
    return parseUnits(amount, decimals);
  }, [amount, decimals, inputAmount]);

  const { data: depositQuote } = useReadContract({
    address: polygonConfig.easySwapperV2Proxy as `0x${string}`,
    abi: easySwapperV2Abi,
    functionName: "depositQuote",
    args: depositAmount && mode === "buy"
      ? [poolAddress as `0x${string}`, selectedAsset as `0x${string}`, depositAmount]
      : undefined,
    query: {
      enabled: !!depositAmount && mode === "buy",
    },
  });

  const expectedAmountReceived = useMemo(() => {
    if (!depositQuote || mode !== "buy") return 0n;
    return (depositQuote * BigInt(10_000 - slippageBps)) / 10_000n;
  }, [depositQuote, mode, slippageBps]);

  const handleMaxClick = () => {
    if (mode === "buy" && assetBalance) {
      setAmount(formatUnits(assetBalance.value, assetBalance.decimals));
    } else if (mode === "sell" && poolBalance) {
      setAmount(formatUnits(poolBalance.value, poolBalance.decimals));
    }
  };

  const handleSubmit = async () => {
    if (!address || !amount || inputAmount <= 0) return;
    
    setError(null);
    setSuccess(null);
    setTxHash(null);

    try {
      if (mode === "buy") {
        if (!polygonConfig.easySwapperV2Proxy) {
          throw new Error("EasySwapperV2 proxy address is not configured.");
        }
        // Step 1: Approve
        setTxStatus("approving");
        const approveHash = await writeContractAsync({
          address: selectedAsset as `0x${string}`,
          abi: erc20Abi,
          functionName: "approve",
          args: [polygonConfig.easySwapperV2Proxy as `0x${string}`, maxUint256],
        });
        if (!publicClient) throw new Error("Wallet client unavailable");
        await publicClient.waitForTransactionReceipt({ hash: approveHash });

        // Step 2: Deposit
        if (!depositAmount) throw new Error("Invalid deposit amount");
        setTxStatus("depositing");
        const depositArgs = [
          poolAddress as `0x${string}`,
          selectedAsset as `0x${string}`,
          depositAmount,
          expectedAmountReceived,
        ] as const;
        const depositSim = await publicClient.simulateContract({
          address: polygonConfig.easySwapperV2Proxy as `0x${string}`,
          abi: easySwapperV2Abi,
          functionName: "deposit",
          args: depositArgs,
          account: address,
        });
        const depositHash = await writeContractAsync(depositSim.request);
        setTxHash(depositHash);
        const depositReceipt = await publicClient.waitForTransactionReceipt({ hash: depositHash });
        
        if (depositReceipt.status === "reverted") {
          throw new Error("Deposit transaction reverted on-chain");
        }

        setSuccess("Deposit successful!");
        setAmount("");
        onSuccess?.();
      } else {
        // Withdraw
        setTxStatus("withdrawing");
        const withdrawAmount = parseUnits(amount, 18); // Pool tokens are 18 decimals
        if (!publicClient) throw new Error("Wallet client unavailable");
        const withdrawSim = await publicClient.simulateContract({
          address: poolAddress as `0x${string}`,
          abi: poolLogicAbi,
          functionName: "withdraw",
          args: [withdrawAmount],
          account: address,
        });
        const withdrawHash = await writeContractAsync(withdrawSim.request);
        setTxHash(withdrawHash);
        if (!publicClient) throw new Error("Wallet client unavailable");
        const withdrawReceipt = await publicClient.waitForTransactionReceipt({ hash: withdrawHash });
        
        if (withdrawReceipt.status === "reverted") {
          throw new Error("Withdrawal transaction reverted on-chain");
        }

        setSuccess("Withdrawal successful!");
        setAmount("");
        onSuccess?.();
      }
    } catch (err: any) {
      setError(err?.message || "Transaction failed");
    } finally {
      setTxStatus("idle");
    }
  };

  if (!isConnected) {
    return (
      <div className="card p-5 space-y-4">
        <h3 className="text-lg font-semibold">Buy / Sell</h3>
        <div className="text-center py-8 text-muted">
          <p>Connect your wallet to invest</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 space-y-4">
      <h3 className="text-lg font-semibold">Buy / Sell</h3>
      
      {/* Mode Toggle */}
      <div className="flex rounded-lg bg-white/5 p-1">
        <button
          onClick={() => setMode("buy")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === "buy" 
              ? "bg-green-500/20 text-green-400" 
              : "text-muted hover:text-white"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => setMode("sell")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            mode === "sell" 
              ? "bg-red-500/20 text-red-400" 
              : "text-muted hover:text-white"
          }`}
        >
          Sell
        </button>
      </div>

      {/* Send Section */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted">Send</span>
          <span className="text-muted">
            Balance: {mode === "buy" 
              ? (assetBalance ? formatUnits(assetBalance.value, assetBalance.decimals).slice(0, 10) : "0")
              : (poolBalance ? formatUnits(poolBalance.value, poolBalance.decimals).slice(0, 10) : "0")
            }
          </span>
        </div>
        
        <div className="bg-white/5 rounded-lg p-3 space-y-2">
          {mode === "buy" && (
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="w-full bg-transparent border-none text-sm font-semibold focus:outline-none"
            >
              {supportedAssets.filter(a => a.isDeposit !== false).map((asset) => (
                <option key={asset.address} value={asset.address} className="bg-gray-800">
                  {asset.symbol}
                </option>
              ))}
            </select>
          )}
          {mode === "sell" && (
            <div className="text-sm font-semibold">{poolSymbol}</div>
          )}
          
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-transparent text-2xl font-bold focus:outline-none"
            />
            <button
              onClick={handleMaxClick}
              className="px-2 py-1 text-xs rounded bg-white/10 hover:bg-white/20 transition-colors"
            >
              MAX
            </button>
          </div>
          
          {mode === "buy" && inputAmount > 0 && (
            <div className="text-sm text-muted">
              ≈ ${(inputAmount * (sharePrice || 1)).toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div className="flex justify-center">
        <div className="p-2 rounded-full bg-white/5">
          <svg className="w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>

      {/* Receive Section */}
      <div className="space-y-2">
        <div className="text-sm text-muted">Receive (estimated)</div>
        <div className="bg-white/5 rounded-lg p-3">
          <div className="text-sm font-semibold">
            {mode === "buy" ? poolSymbol : "Multiple Assets"}
          </div>
          <div className="text-2xl font-bold">
            {estimatedOutput > 0 
              ? estimatedOutput.toLocaleString(undefined, { maximumFractionDigits: 4 })
              : "0.00"
            }
          </div>
          {mode === "sell" && estimatedOutput > 0 && (
            <div className="text-sm text-muted">
              ≈ ${estimatedOutput.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
      </div>

      {/* Trade Details */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className="w-full flex items-center justify-between text-sm text-muted hover:text-white transition-colors"
      >
        <span>Trade Details</span>
        <svg 
          className={`w-4 h-4 transition-transform ${showDetails ? "rotate-180" : ""}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {showDetails && (
        <div className="text-sm space-y-1 text-muted bg-white/5 rounded-lg p-3">
          <div className="flex justify-between">
            <span>Share Price</span>
            <span>${sharePrice.toFixed(4)}</span>
          </div>
          <div className="flex justify-between">
            <span>Slippage Tolerance</span>
            <span>{(slippageBps / 100).toFixed(2)}%</span>
          </div>
          {mode === "buy" && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted">Set Slippage</span>
              <select
                value={slippageBps}
                onChange={(e) => setSlippageBps(Number(e.target.value))}
                className="bg-transparent border border-white/10 rounded-md px-2 py-1 text-sm"
              >
                <option value={10} className="bg-gray-800">0.10%</option>
                <option value={50} className="bg-gray-800">0.50%</option>
                <option value={100} className="bg-gray-800">1.00%</option>
                <option value={200} className="bg-gray-800">2.00%</option>
              </select>
            </div>
          )}
          <div className="flex justify-between">
            <span>Network</span>
            <span>Polygon</span>
          </div>
        </div>
      )}

      {/* Error/Success Messages */}
      {txStatus !== "idle" && (
        <div className="text-sm text-blue-300 bg-blue-400/10 rounded-lg p-3">
          {txStatus === "approving" && "Approving token spend..."}
          {txStatus === "depositing" && "Deposit submitted. Waiting for confirmation..."}
          {txStatus === "withdrawing" && "Withdrawal submitted. Waiting for confirmation..."}
          {txHash && (
            <div className="mt-2">
              <a
                href={`https://polygonscan.com/tx/${txHash}`}
                target="_blank"
                rel="noreferrer"
                className="text-accent2 hover:underline"
              >
                View on Polygonscan
              </a>
            </div>
          )}
        </div>
      )}
      {error && (
        <div className="text-sm text-red-400 bg-red-400/10 rounded-lg p-3">
          {error}
        </div>
      )}
      {success && (
        <div className="text-sm text-green-400 bg-green-400/10 rounded-lg p-3">
          {success}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleSubmit}
        disabled={isPending || txStatus !== "idle" || !amount || inputAmount <= 0}
        className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
          mode === "buy"
            ? "bg-green-500 hover:bg-green-600 disabled:bg-green-500/50"
            : "bg-red-500 hover:bg-red-600 disabled:bg-red-500/50"
        } disabled:cursor-not-allowed`}
      >
        {isPending || txStatus !== "idle"
          ? "Processing..."
          : mode === "buy" 
            ? "Buy" 
            : "Sell"
        }
      </button>
    </div>
  );
}
