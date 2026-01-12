import "../styles/globals.css";
import { ReactNode } from "react";
import { Providers } from "./providers";

export const metadata = {
  title: "dHEDGE | Polygon",
  description: "Manage dHEDGE vaults on Polygon",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-canvas text-white font-body">
        <Providers>
          <div className="mx-auto max-w-6xl px-6 py-8 space-y-8">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
