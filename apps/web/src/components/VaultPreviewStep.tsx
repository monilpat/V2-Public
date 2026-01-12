"use client";

import { Toggle } from "./AssetToggle";
import type { VaultInfoData } from "./VaultInfoStep";
import type { Asset } from "./VaultAssetsStep";

interface VaultPreviewStepProps {
  vaultInfo: VaultInfoData;
  selectedAssets: Asset[];
  networkName: string;
}

export function VaultPreviewStep({
  vaultInfo,
  selectedAssets,
  networkName,
}: VaultPreviewStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Check The Data</h2>
        <p className="text-sm text-gray-400 mt-1">V2 vault</p>
      </div>

      {/* Summary grid */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <p className="text-sm text-gray-400">Vault Name</p>
          <p className="font-semibold text-gray-900">{vaultInfo.vaultName || "—"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Vault Symbol</p>
          <p className="font-semibold text-gray-900">{vaultInfo.vaultSymbol || "—"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Manager Name</p>
          <p className="font-semibold text-gray-900">{vaultInfo.managerName || "—"}</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Vault Privacy</p>
          <p className="font-semibold text-gray-900">
            {vaultInfo.isPrivate ? "Private" : "Public"}
          </p>
        </div>
      </div>

      {/* Manager Address */}
      <div>
        <p className="text-sm text-gray-400">Manager Address</p>
        <p className="font-semibold text-gray-900 font-mono text-sm break-all">
          {vaultInfo.managerAddress || "—"}
        </p>
      </div>

      {/* Fees */}
      <div className="grid grid-cols-2 gap-x-8 gap-y-4">
        <div>
          <p className="text-sm text-gray-400">Management Fee</p>
          <p className="font-semibold text-gray-900">{vaultInfo.managementFee}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Performance Fee</p>
          <p className="font-semibold text-gray-900">{vaultInfo.performanceFee}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Entry Fee</p>
          <p className="font-semibold text-gray-900">{vaultInfo.entryFee}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-400">Exit Fee</p>
          <p className="font-semibold text-gray-900">{vaultInfo.exitFee}%</p>
        </div>
      </div>

      {/* Network */}
      <div>
        <p className="text-sm text-gray-400">Network</p>
        <p className="font-semibold text-gray-900">{networkName}</p>
      </div>

      {/* Vault Assets */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-400">Vault Assets</p>
          <span className="w-5 h-5 rounded-full border border-gray-300 text-gray-400 text-xs flex items-center justify-center cursor-help">
            ?
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedAssets.map((asset) => (
            <div
              key={asset.address}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-full"
            >
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-[10px] text-white font-bold">
                {asset.symbol.slice(0, 2)}
              </div>
              <span className="text-sm font-medium text-gray-700">{asset.symbol}</span>
              <Toggle enabled={true} onChange={() => {}} size="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* Info notice */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
        <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-gray-600">
          Deposit is locked for 24 hours after deposit.
        </p>
      </div>

      {/* Link */}
      <a
        href="https://docs.dhedge.org"
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1 text-sm text-cyan-500 hover:text-cyan-600 transition-colors"
      >
        What are supported protocols and transactions?
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  );
}
