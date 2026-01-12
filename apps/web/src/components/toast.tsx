"use client";
import { useState } from "react";

export function useToast() {
  const [toast, setToast] = useState<{ message: string; tone?: "error" | "success" | "info" } | null>(null);
  const push = (message: string, tone: "error" | "success" | "info" = "info") => setToast({ message, tone });
  const clear = () => setToast(null);
  const Toast = toast ? (
    <div
      className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg border ${
        toast.tone === "error" ? "border-red-500/40 bg-red-500/10" : toast.tone === "success" ? "border-emerald-400/40 bg-emerald-400/10" : "border-white/20 bg-white/10"
      }`}
    >
      <div className="text-sm">{toast.message}</div>
    </div>
  ) : null;
  return { Toast, push, clear };
}
