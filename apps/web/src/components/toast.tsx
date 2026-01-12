"use client";
import { useState } from "react";

export function useToast() {
  const [toast, setToast] = useState<{ message: string; tone?: "error" | "success" | "info" } | null>(null);
  const push = (message: string, tone: "error" | "success" | "info" = "info") => setToast({ message, tone });
  const clear = () => setToast(null);
  const Toast = toast ? (
    <div
      className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-lg border animate-slide-up ${
        toast.tone === "error" 
          ? "border-red-500/40 bg-red-500/10 text-red-400" 
          : toast.tone === "success" 
            ? "border-accent/40 bg-accent/10 text-accent" 
            : "border-border bg-card text-foreground"
      }`}
    >
      <div className="text-sm font-medium">{toast.message}</div>
    </div>
  ) : null;
  return { Toast, push, clear };
}
