import "../styles/globals.css";
import { ReactNode } from "react";
import { Providers } from "./providers";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata = {
  title: "dHEDGE | Decentralized Asset Management",
  description: "Create and manage decentralized investment vaults across multiple networks",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-body" suppressHydrationWarning>
        <ThemeProvider>
          <Providers>
            <div className="min-h-screen bg-background text-foreground transition-colors">
              {children}
            </div>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
