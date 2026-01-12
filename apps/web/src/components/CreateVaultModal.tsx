"use client";

import { useState, useCallback, useEffect } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { StepIndicator } from "./StepIndicator";
import { VaultInfoStep, type VaultInfoData } from "./VaultInfoStep";
import { VaultAssetsStep, type Asset } from "./VaultAssetsStep";
import { VaultPreviewStep } from "./VaultPreviewStep";
import { type NetworkConfig, networks } from "@/config/networks";
import { poolFactoryAbi } from "@/lib/abi";

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
          assets,
        ],
        chainId: selectedNetwork,
        gas: 7_000_000n,
      });

      setStatus(`Vault created! Tx: ${txHash}`);
      
      // Close modal after success
      setTimeout(() => {
        onClose();
      }, 2000);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl mx-4 animate-scale-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Step indicator */}
        <div className="pt-8 pb-6 px-8 border-b border-gray-100">
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
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Status message */}
          {status && (
            <div className="mt-4 p-3 bg-cyan-50 border border-cyan-200 rounded-lg text-sm text-cyan-600">
              {status}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-6 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-3 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors flex items-center gap-2"
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
                className="px-6 py-3 text-sm font-medium text-white bg-cyan-400 rounded-full hover:bg-cyan-500 transition-colors"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleCreate}
                disabled={isPending || !address}
                className="px-6 py-3 text-sm font-medium text-white bg-cyan-400 rounded-full hover:bg-cyan-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? "Creating..." : "Create New Vault"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
