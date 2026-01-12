"use client";

import { useState, useRef } from "react";

interface TooltipProps {
  content: string;
  children?: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export function Tooltip({ content, children, position = "top" }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-slate-800 dark:border-t-slate-700 border-x-transparent border-b-transparent",
    bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-slate-800 dark:border-b-slate-700 border-x-transparent border-t-transparent",
    left: "left-full top-1/2 -translate-y-1/2 border-l-slate-800 dark:border-l-slate-700 border-y-transparent border-r-transparent",
    right: "right-full top-1/2 -translate-y-1/2 border-r-slate-800 dark:border-r-slate-700 border-y-transparent border-l-transparent",
  };

  return (
    <div className="relative inline-flex">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children || (
          <span className="w-5 h-5 rounded-full border border-muted text-muted text-xs flex items-center justify-center hover:bg-muted/10 transition-colors">
            ?
          </span>
        )}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          className={`
            absolute z-50 ${positionClasses[position]}
            px-3 py-2 text-sm text-white bg-slate-800 dark:bg-slate-700 rounded-lg shadow-lg
            whitespace-nowrap animate-fade-in
          `}
        >
          {content}
          <div
            className={`
              absolute w-0 h-0 border-4 ${arrowClasses[position]}
            `}
          />
        </div>
      )}
    </div>
  );
}

// Info icon with tooltip
export function InfoTooltip({ content }: { content: string }) {
  return (
    <Tooltip content={content}>
      <span className="w-5 h-5 rounded-full border border-muted text-muted text-xs flex items-center justify-center hover:bg-muted/10 transition-colors cursor-help">
        ?
      </span>
    </Tooltip>
  );
}
