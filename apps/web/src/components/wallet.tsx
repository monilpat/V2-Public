"use client";
import { useAccount, useDisconnect } from "wagmi";
import { AppKitConnectButton } from "@reown/appkit/react";
import { useEffect, useState } from "react";

export function Wallet() {
  const [mounted, setMounted] = useState(false);
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted">Loading...</span>
      </div>
    );
  }

  if (address) {
    return (
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted">Connected</span>
        <span className="px-3 py-1 rounded-full bg-white/10 text-sm">{address.slice(0, 6)}…{address.slice(-4)}</span>
        <button className="btn-ghost" onClick={() => disconnect()}>Disconnect</button>
      </div>
    );
  }

  return <AppKitConnectButton label="Connect Wallet" />;
}
