"use client";
import { PropsWithChildren, useState } from "react";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { wagmiConfig, appKit } from "@/lib/wallet";
import { AppKitProvider } from "@reown/appkit/react";
import { polygon } from "wagmi/chains";

export function Providers({ children }: PropsWithChildren) {
  // Create QueryClient inside component to avoid hydration issues
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // With SSR, we usually want to set some default staleTime
        // above 0 to avoid refetching immediately on the client
        staleTime: 60 * 1000,
      },
    },
  }));

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
