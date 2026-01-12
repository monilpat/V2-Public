"use client";
import { PropsWithChildren } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig, appKit } from "@/lib/wallet";
import { AppKitProvider } from "@reown/appkit/react";
import { polygon } from "wagmi/chains";

const queryClient = new QueryClient();

export function Providers({ children }: PropsWithChildren) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AppKitProvider adapters={[appKit]} projectId={process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo"} themeMode="dark" networks={[polygon]}>
          {children}
        </AppKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
