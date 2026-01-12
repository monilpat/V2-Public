"use client";

import { useState, useCallback } from "react";

interface FeeSliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  suffix?: string;
}

const markers = [0, 5, 10, 15, 20, 30, 40, 50];

export function FeeSlider({
  value,
  onChange,
  min = 0,
  max = 50,
  step = 1,
  label = "Performance Fee",
  suffix = "%",
}: FeeSliderProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  const handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value);
      onChange(newValue);
      setInputValue(newValue.toString());
    },
    [onChange]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInputValue(newValue);
      const num = Number(newValue);
      if (!isNaN(num) && num >= min && num <= max) {
        onChange(num);
      }
    },
    [onChange, min, max]
  );

  const handleInputBlur = useCallback(() => {
    const num = Number(inputValue);
    if (isNaN(num) || num < min) {
      setInputValue(min.toString());
      onChange(min);
    } else if (num > max) {
      setInputValue(max.toString());
      onChange(max);
    }
  }, [inputValue, min, max, onChange]);

  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="space-y-3">
      {label && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{label}</span>
          <button
            type="button"
            className="w-5 h-5 rounded-full border border-muted text-muted text-xs flex items-center justify-center hover:bg-muted/10 transition-colors"
            title="Performance fee is charged on profits"
          >
            ?
          </button>
        </div>
      )}
      
      <div className="flex items-center gap-4">
        {/* Input box */}
        <div className="relative">
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            min={min}
            max={max}
            step={step}
            className="w-20 h-10 px-3 pr-8 text-center border border-border rounded-lg bg-background-secondary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent font-medium"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted text-sm">
            {suffix}
          </span>
        </div>

        {/* Slider container */}
        <div className="flex-1 relative">
          {/* Track background */}
          <div className="relative h-2 bg-muted/20 rounded-full">
            {/* Filled track */}
            <div
              className="absolute h-full bg-gradient-to-r from-accent to-accent2 rounded-full transition-all duration-150"
              style={{ width: `${percentage}%` }}
            />
            
            {/* Markers */}
            <div className="absolute w-full h-full flex justify-between items-center px-0">
              {markers.map((marker) => {
                const markerPercent = ((marker - min) / (max - min)) * 100;
                const isActive = value >= marker;
                return (
                  <div
                    key={marker}
                    className={`absolute w-2 h-2 rounded-full transform -translate-x-1/2 transition-colors duration-150 ${
                      isActive ? "bg-accent" : "bg-muted/30"
                    }`}
                    style={{ left: `${markerPercent}%` }}
                  />
                );
              })}
            </div>
          </div>

          {/* Range input (invisible, for interaction) */}
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={handleSliderChange}
            className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
          />

          {/* Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-background border-2 border-accent rounded-full shadow-md transform -translate-x-1/2 pointer-events-none transition-all duration-150"
            style={{ left: `${percentage}%` }}
          />

          {/* Marker labels */}
          <div className="relative mt-3 flex justify-between text-xs text-muted">
            {markers.map((marker) => {
              const markerPercent = ((marker - min) / (max - min)) * 100;
              return (
                <span
                  key={marker}
                  className="absolute transform -translate-x-1/2"
                  style={{ left: `${markerPercent}%` }}
                >
                  {marker}%
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
