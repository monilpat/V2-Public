"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { useRouter } from "next/navigation";
import { decodeEventLog } from "viem";
import { StepIndicator } from "./StepIndicator";
import { VaultInfoStep, type VaultInfoData } from "./VaultInfoStep";
import { VaultAssetsStep, type Asset } from "./VaultAssetsStep";
import { VaultPreviewStep } from "./VaultPreviewStep";
import { type NetworkConfig, networks } from "@/config/networks";
import { poolFactoryAbi } from "@/lib/abi";
import { useToast } from "./toast";

interface CreateVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedNetwork: number;
}

const steps = [
  { id: 1, label: "Vault Info" },
  { id: 2, label: "Assets" },
  { id: 3, label: "Preview" },
];

export function CreateVaultModal({
  isOpen,
  onClose,
  selectedNetwork,
}: CreateVaultModalProps) {
  const { address } = useAccount();
  const { writeContractAsync, isPending } = useWriteContract();
  const publicClient = usePublicClient();
  const router = useRouter();
  const { Toast, push, clear } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const networkConfig = networks[selectedNetwork];

  // Vault info state
  const [vaultInfo, setVaultInfo] = useState<VaultInfoData>({
    vaultName: "",
    vaultSymbol: "",
    managerName: "",
    managerAddress: address || "",
    isPrivate: false,
    performanceFee: 0,
    managementFee: 0,
    entryFee: 0,
    exitFee: 0,
  });

  // Selected assets state
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);

  // Update manager address when wallet changes
  useEffect(() => {
    if (address) {
      setVaultInfo((prev) => ({ ...prev, managerAddress: address }));
    }
  }, [address]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setStatus(null);
      setError(null);
    }
  }, [isOpen]);

  const handleVaultInfoChange = useCallback((data: Partial<VaultInfoData>) => {
    setVaultInfo((prev) => ({ ...prev, ...data }));
  }, []);

  const handleAssetsChange = useCallback((addresses: string[]) => {
    setSelectedAssets(addresses.slice(0, networkConfig?.maxSupportedAssets || 12));
  }, [networkConfig]);

  const handleNext = () => {
    if (currentStep === 1) {
      // Validate step 1
      if (!vaultInfo.vaultName || !vaultInfo.vaultSymbol || !vaultInfo.managerName) {
        setError("Please fill in all required fields");
        return;
      }
      setError(null);
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate step 2
      if (selectedAssets.length === 0) {
        setError("Please select at least one asset");
        return;
      }
      if (selectedAssets.length > (networkConfig?.maxSupportedAssets || 12)) {
        setError(`Max ${networkConfig?.maxSupportedAssets || 12} assets allowed`);
        return;
      }
      setError(null);
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError(null);
    }
  };

  const handleCreate = async () => {
    if (!address || !networkConfig) {
      setError("Please connect your wallet");
      return;
    }

    try {
      setStatus("Creating vault...");
      setError(null);

      // Convert fees to basis points (multiply by 100 for percentage to bps)
      const perfFeeBps = Math.round(vaultInfo.performanceFee * 100);
      const mgmtFeeBps = Math.round(vaultInfo.managementFee * 100);

      if (selectedAssets.length === 0) {
        setError("Select at least one asset");
        return;
      }
      if (selectedAssets.length > networkConfig.maxSupportedAssets) {
        setError(`Max ${networkConfig.maxSupportedAssets} assets`);
        return;
      }

      const assets = selectedAssets.map((addr) => {
        const meta = networkConfig.assets.find((a) => a.address === addr);
        return {
          asset: addr as `0x${string}`,
          isDeposit: meta?.isDeposit ?? false,
        };
      });

      if (!assets.some((a) => a.isDeposit)) {
        setError("At least one deposit-enabled asset is required");
        return;
      }

      const txHash = await writeContractAsync({
        address: networkConfig.factoryAddress as `0x${string}`,
        abi: poolFactoryAbi,
        functionName: "createFund",
        args: [
          vaultInfo.isPrivate,
          address,
          vaultInfo.managerName,
          vaultInfo.vaultName,
          vaultInfo.vaultSymbol,
          BigInt(perfFeeBps),
          BigInt(mgmtFeeBps),
          BigInt(Math.round(vaultInfo.entryFee * 100)),
          BigInt(Math.round(vaultInfo.exitFee * 100)),
          assets,
        ],
        chainId: selectedNetwork,
        gas: 7_000_000n,
      });

      setStatus("Waiting for confirmation...");
      
      // Wait for receipt and extract the created fund address
      if (!publicClient) {
        throw new Error("Public client not available");
      }
      
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      
      // Find the FundCreated event in the logs
      let fundAddress: string | null = null;
      for (const log of receipt.logs) {
        try {
          const decoded = decodeEventLog({
            abi: poolFactoryAbi,
            data: log.data,
            topics: log.topics,
          });
          if (decoded.eventName === "FundCreated" && decoded.args) {
            fundAddress = (decoded.args as { fundAddress: string }).fundAddress;
            break;
          }
        } catch {
          // Not a FundCreated event, continue
        }
      }

      clear();
      push(`Vault "${vaultInfo.vaultName}" created successfully!`, "success");
      
      // Redirect to the new pool page
      if (fundAddress) {
        onClose();
        router.push(`/pool/${fundAddress}`);
      } else {
        setStatus(`Vault created! Tx: ${txHash}`);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to create vault");
      setStatus(null);
    }
  };

  // Get selected assets with full data
  const selectedAssetData: Asset[] = networkConfig?.assets.filter((a) =>
    selectedAssets.includes(a.address)
  ) || [];

  if (!isOpen) return null;

  return (
    <>
      {Toast}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto card mx-4 animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted hover:text-foreground transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Step indicator */}
        <div className="pt-8 pb-6 px-8 border-b border-border">
          <StepIndicator
            steps={steps}
            currentStep={currentStep}
            onStepClick={(step) => step < currentStep && setCurrentStep(step)}
          />
        </div>

        {/* Content */}
        <div className="p-8">
          {currentStep === 1 && (
            <VaultInfoStep data={vaultInfo} onChange={handleVaultInfoChange} />
          )}
          {currentStep === 2 && networkConfig && (
            <VaultAssetsStep
              availableAssets={networkConfig.assets}
              selectedAssets={selectedAssets}
              onChange={handleAssetsChange}
            />
          )}
          {currentStep === 3 && networkConfig && (
            <VaultPreviewStep
              vaultInfo={vaultInfo}
              selectedAssets={selectedAssetData}
              networkName={networkConfig.name}
            />
          )}

          {/* Error message */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          {/* Status message */}
          {status && (
            <div className="mt-4 p-3 bg-accent/10 border border-accent/30 rounded-lg text-sm text-accent">
              {status}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <button
            onClick={onClose}
            className="btn-ghost px-6 py-3 rounded-full"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="btn-ghost px-6 py-3 rounded-full flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
            )}

            {currentStep < 3 ? (
              <button
                onClick={handleNext}
                className="btn-primary px-6 py-3 rounded-full"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={isPending || !address}
                className="btn-primary px-6 py-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Creating..." : "Create New Vault"}
              </button>
            )}
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
