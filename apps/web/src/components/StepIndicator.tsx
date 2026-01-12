"use client";

interface Step {
  id: number;
  label: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export function StepIndicator({ steps, currentStep, onStepClick }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center w-full">
      {steps.map((step, index) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;
        const isPending = step.id > currentStep;
        const isLast = index === steps.length - 1;

        return (
          <div key={step.id} className="flex items-center">
            {/* Step dot and label */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => onStepClick?.(step.id)}
                disabled={isPending}
                className={`
                  w-4 h-4 rounded-full border-2 transition-all duration-200
                  ${isCompleted || isActive
                    ? "bg-cyan-400 border-cyan-400"
                    : "bg-white border-gray-300"
                  }
                  ${!isPending && onStepClick ? "cursor-pointer hover:scale-110" : "cursor-default"}
                `}
              />
              <span
                className={`
                  mt-2 text-xs font-medium transition-colors duration-200
                  ${isActive ? "text-cyan-500" : "text-gray-400"}
                `}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line */}
            {!isLast && (
              <div
                className={`
                  w-24 h-0.5 mx-2 transition-colors duration-200
                  ${isCompleted ? "bg-cyan-400" : "bg-gray-200"}
                `}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
