"use client";

import { FeeSlider } from "./FeeSlider";
import { InfoTooltip } from "./Tooltip";

export interface VaultInfoData {
  vaultName: string;
  vaultSymbol: string;
  managerName: string;
  managerAddress: string;
  isPrivate: boolean;
  performanceFee: number;
  managementFee: number;
  entryFee: number;
  exitFee: number;
}

interface VaultInfoStepProps {
  data: VaultInfoData;
  onChange: (data: Partial<VaultInfoData>) => void;
}

export function VaultInfoStep({ data, onChange }: VaultInfoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Create New Vault</h2>
        <p className="text-sm text-gray-400 mt-1">V2 vault</p>
      </div>

      {/* Vault Name & Symbol - Two columns */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Vault Name</label>
          <input
            type="text"
            value={data.vaultName}
            onChange={(e) => onChange({ vaultName: e.target.value })}
            placeholder="Awesome Fund"
            className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-gray-900 placeholder:text-gray-400"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Vault Symbol</label>
          <input
            type="text"
            value={data.vaultSymbol}
            onChange={(e) => onChange({ vaultSymbol: e.target.value.toUpperCase() })}
            placeholder="DHVT"
            maxLength={10}
            className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-gray-900 placeholder:text-gray-400 uppercase"
          />
        </div>
      </div>

      {/* Manager Name & Vault Privacy */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Manager Name</label>
            <InfoTooltip content="Your display name visible to depositors" />
          </div>
          <input
            type="text"
            value={data.managerName}
            onChange={(e) => onChange({ managerName: e.target.value })}
            placeholder="Day Ralio"
            className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-gray-900 placeholder:text-gray-400"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Vault Privacy</label>
            <InfoTooltip content="Private vaults require whitelist for deposits" />
          </div>
          <div className="flex h-12 rounded-xl border border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => onChange({ isPrivate: true })}
              className={`
                flex-1 text-sm font-medium transition-colors
                ${data.isPrivate 
                  ? "bg-cyan-400 text-white" 
                  : "bg-white text-gray-500 hover:bg-gray-50"
                }
              `}
            >
              Private
            </button>
            <button
              type="button"
              onClick={() => onChange({ isPrivate: false })}
              className={`
                flex-1 text-sm font-medium transition-colors
                ${!data.isPrivate 
                  ? "bg-cyan-400 text-white" 
                  : "bg-white text-gray-500 hover:bg-gray-50"
                }
              `}
            >
              Public
            </button>
          </div>
        </div>
      </div>

      {/* Manager Address */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">Manager Address</label>
        <input
          type="text"
          value={data.managerAddress}
          disabled
          className="w-full h-12 px-4 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed font-mono text-sm"
        />
      </div>

      {/* Performance Fee Slider */}
      <div className="pt-2">
        <FeeSlider
          value={data.performanceFee}
          onChange={(value) => onChange({ performanceFee: value })}
          label="Performance Fee"
          min={0}
          max={50}
        />
      </div>

      {/* Management, Entry, Exit Fees - Three columns */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Management Fee</label>
            <InfoTooltip content="Annual fee on AUM (max 3%)" />
          </div>
          <div className="relative">
            <input
              type="number"
              value={data.managementFee}
              onChange={(e) => onChange({ managementFee: Math.min(3, Math.max(0, Number(e.target.value))) })}
              min={0}
              max={3}
              step={0.1}
              className="w-full h-12 px-4 pr-10 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-gray-900"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Entry Fee</label>
          <div className="relative">
            <input
              type="number"
              value={data.entryFee}
              onChange={(e) => onChange({ entryFee: Math.min(1, Math.max(0, Number(e.target.value))) })}
              min={0}
              max={1}
              step={0.1}
              className="w-full h-12 px-4 pr-10 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-gray-900"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Exit Fee</label>
          <div className="relative">
            <input
              type="number"
              value={data.exitFee}
              onChange={(e) => onChange({ exitFee: Math.min(1, Math.max(0, Number(e.target.value))) })}
              min={0}
              max={1}
              step={0.1}
              className="w-full h-12 px-4 pr-10 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-gray-900"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
