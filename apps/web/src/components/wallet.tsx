"use client";
import { useAccount, useDisconnect } from "wagmi";
import { AppKitConnectButton } from "@reown/appkit/react";

export function Wallet() {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();

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
