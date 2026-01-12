"use client";

export type PoolTab = "depositors" | "activity" | "deposits" | "withdrawals" | "stats";

interface PoolTabsProps {
  activeTab: PoolTab;
  onTabChange: (tab: PoolTab) => void;
  counts?: {
    depositors?: number;
    activity?: number;
    deposits?: number;
    withdrawals?: number;
  };
}

const tabs: { id: PoolTab; label: string }[] = [
  { id: "depositors", label: "Depositors" },
  { id: "activity", label: "Activity" },
  { id: "deposits", label: "Deposits" },
  { id: "withdrawals", label: "Withdrawals" },
  { id: "stats", label: "Stats" },
];

export function PoolTabs({ activeTab, onTabChange, counts }: PoolTabsProps) {
  return (
    <div className="border-b border-white/10">
      <nav className="flex gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const count = counts?.[tab.id as keyof typeof counts];
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors
                border-b-2 -mb-px
                ${isActive 
                  ? "border-accent text-white" 
                  : "border-transparent text-muted hover:text-white hover:border-white/30"
                }
              `}
            >
              {tab.label}
              {count !== undefined && count > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-white/10">
                  {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
