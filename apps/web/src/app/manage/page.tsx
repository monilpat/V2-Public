"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Nav } from "@/components/nav";
import { NetworkCard } from "@/components/NetworkCard";
import { CreateVaultModal } from "@/components/CreateVaultModal";
import { networkList, type NetworkConfig } from "@/config/networks";

export default function ManagePage() {
  const { isConnected } = useAccount();
  const [selectedNetwork, setSelectedNetwork] = useState<number>(137); // Default to Polygon
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAssetsModal, setShowAssetsModal] = useState<NetworkConfig | null>(null);

  const handleCreateVault = () => {
    if (!isConnected) {
      return;
    }
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Nav />
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Start Your Manager Journey
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            Create a vault to build your on-chain trading reputation, attract depositors, and accumulate revenue
          </p>
        </div>

        {/* Choose Network Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <p className="text-muted">Choose a network that suits you</p>
            <button
              onClick={handleCreateVault}
              disabled={!isConnected}
              className="btn-primary px-8 py-3 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConnected ? "Create New Vault" : "Connect Wallet to Create"}
            </button>
          </div>

          {/* Network Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {networkList.map((network) => (
              <NetworkCard
                key={network.chainId}
                network={network}
                isSelected={selectedNetwork === network.chainId}
                onSelect={() => setSelectedNetwork(network.chainId)}
                onAssetsClick={() => setShowAssetsModal(network)}
              />
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 rounded-full">
            <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm text-accent">
              Select a network to see available features and supported assets
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-accent to-accent2" />
              </div>
              <p className="text-sm text-muted">
                Decentralized asset management
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">INFO</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li><a href="https://docs.dhedge.org" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Docs</a></li>
                <li><a href="/stats" className="hover:text-accent transition-colors">Stats</a></li>
                <li><a href="https://blog.dhedge.org" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">GOV</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li><a href="https://snapshot.org/#/dhedge.eth" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Proposals</a></li>
                <li><a href="https://snapshot.org/#/dhedge.eth" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Voting</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">DEV</h4>
              <ul className="space-y-2 text-sm text-muted">
                <li><a href="https://github.com/dhedge" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">GitHub</a></li>
                <li><a href="https://docs.dhedge.org/audit" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors">Audit</a></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Create Vault Modal */}
      <CreateVaultModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedNetwork={selectedNetwork}
      />

      {/* Assets Modal */}
      {showAssetsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAssetsModal(null)}
          />
          <div className="relative w-full max-w-lg card mx-4 p-6 animate-scale-in">
            <button
              onClick={() => setShowAssetsModal(null)}
              className="absolute top-4 right-4 p-2 text-muted hover:text-foreground transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h3 className="text-xl font-bold mb-4">
              {showAssetsModal.name} Assets
            </h3>
            <p className="text-sm text-muted mb-4">
              Available assets for vault management on {showAssetsModal.name}
            </p>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {showAssetsModal.assets.map((asset) => (
                <div
                  key={asset.address}
                  className="flex items-center justify-between p-3 bg-background-secondary rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-accent2 flex items-center justify-center text-xs text-black font-bold">
                      {asset.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium">{asset.symbol}</p>
                      <p className="text-xs text-muted">{asset.category}</p>
                    </div>
                  </div>
                  {asset.isDeposit && (
                    <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">
                      Deposit
                    </span>
                  )}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAssetsModal(null)}
              className="w-full mt-4 btn-primary py-3 rounded-full"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
