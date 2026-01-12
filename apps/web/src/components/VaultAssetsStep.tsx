"use client";

import { useState, useMemo } from "react";
import { AssetToggle } from "./AssetToggle";
import { assetCategories, type AssetCategory } from "@/config/networks";

export interface Asset {
  symbol: string;
  address: string;
  decimals: number;
  isDeposit: boolean;
  category: string;
}

interface VaultAssetsStepProps {
  availableAssets: Asset[];
  selectedAssets: string[]; // addresses
  onChange: (addresses: string[]) => void;
}

export function VaultAssetsStep({
  availableAssets,
  selectedAssets,
  onChange,
}: VaultAssetsStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());

  // Filter assets by search and categories
  const filteredAssets = useMemo(() => {
    return availableAssets.filter((asset) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!asset.symbol.toLowerCase().includes(query) && 
            !asset.address.toLowerCase().includes(query)) {
          return false;
        }
      }
      // Category filter
      if (selectedCategories.size > 0 && !selectedCategories.has(asset.category)) {
        return false;
      }
      return true;
    });
  }, [availableAssets, searchQuery, selectedCategories]);

  // Selected assets with full data
  const selectedAssetData = useMemo(() => {
    return availableAssets.filter((a) => selectedAssets.includes(a.address));
  }, [availableAssets, selectedAssets]);

  const toggleCategory = (category: string) => {
    const newCategories = new Set(selectedCategories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }
    setSelectedCategories(newCategories);
  };

  const toggleAsset = (address: string) => {
    if (selectedAssets.includes(address)) {
      onChange(selectedAssets.filter((a) => a !== address));
    } else {
      if (selectedAssets.length < 12) {
        onChange([...selectedAssets, address]);
      }
    }
  };

  const removeAsset = (address: string) => {
    onChange(selectedAssets.filter((a) => a !== address));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Vault Assets</h2>
        <p className="text-sm text-gray-400 mt-1">V2 vault</p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Asset"
          className="w-full h-12 pl-12 pr-4 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent text-gray-900 placeholder:text-gray-400"
        />
      </div>

      {/* Category filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {assetCategories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => toggleCategory(category)}
            className={`
              h-12 px-4 rounded-xl border text-sm font-medium
              flex items-center justify-between
              transition-all duration-200
              ${selectedCategories.has(category)
                ? "border-cyan-400 bg-cyan-50 text-cyan-600"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }
            `}
          >
            <span>{category}</span>
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        ))}
      </div>

      {/* Asset list */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Available assets ({filteredAssets.length})
          </p>
          <p className="text-xs text-gray-400">
            {selectedAssets.length}/12 selected
          </p>
        </div>
        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-xl p-3 space-y-2">
          {filteredAssets.map((asset) => (
            <button
              key={asset.address}
              type="button"
              onClick={() => toggleAsset(asset.address)}
              className={`
                w-full flex items-center justify-between p-3 rounded-lg
                transition-all duration-200
                ${selectedAssets.includes(asset.address)
                  ? "bg-cyan-50 border border-cyan-200"
                  : "bg-gray-50 hover:bg-gray-100 border border-transparent"
                }
              `}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-xs text-white font-bold">
                  {asset.symbol.slice(0, 2)}
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-900">{asset.symbol}</p>
                  <p className="text-xs text-gray-400">{asset.category}</p>
                </div>
              </div>
              <div
                className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${selectedAssets.includes(asset.address)
                    ? "bg-cyan-400 border-cyan-400"
                    : "border-gray-300"
                  }
                `}
              >
                {selectedAssets.includes(asset.address) && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Selected assets */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700">Enabled Assets</h3>
          <span className="text-xs text-gray-400">Can be changed any time</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {selectedAssetData.length === 0 ? (
            <p className="text-sm text-gray-400">No assets selected</p>
          ) : (
            selectedAssetData.map((asset) => (
              <AssetToggle
                key={asset.address}
                symbol={asset.symbol}
                enabled={true}
                onChange={() => {}}
                onRemove={() => removeAsset(asset.address)}
                showRemove={true}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
