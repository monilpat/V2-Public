"use client";

export type ChartTab = "performance" | "tradingview" | "valuemanaged";

interface ChartTabsProps {
  activeTab: ChartTab;
  onTabChange: (tab: ChartTab) => void;
}

const tabs: { id: ChartTab; label: string; badge?: string }[] = [
  { id: "performance", label: "Performance" },
  { id: "tradingview", label: "Trading View", badge: "New" },
  { id: "valuemanaged", label: "Value Managed" },
];

export function ChartTabs({ activeTab, onTabChange }: ChartTabsProps) {
  return (
    <div className="flex gap-2 mb-4">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              px-4 py-2 text-sm font-medium rounded-full transition-colors
              ${isActive 
                ? "bg-white/10 text-white border border-white/20" 
                : "text-muted hover:text-white hover:bg-white/5"
              }
            `}
          >
            {tab.label}
            {tab.badge && (
              <span className="ml-2 px-1.5 py-0.5 text-xs rounded bg-accent/20 text-accent">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
