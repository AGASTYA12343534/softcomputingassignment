export interface StepItem {
  id: string | number;
  label: string;
}

export interface StepperProps {
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

export function Stepper({ steps, currentStep, onStepClick, className = '' }: StepperProps) {
  return (
    <nav aria-label="Walkthrough stages" className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {steps.map((step, idx) => {
        const stepNum = idx + 1;
        const isActive = stepNum === currentStep;
        const isPast = stepNum < currentStep;

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => onStepClick?.(stepNum)}
            aria-current={isActive ? 'step' : undefined}
            className={`inline-flex items-center gap-1.5 rounded border px-2.5 py-1 text-xs font-medium transition-colors ${
              isActive
                ? 'border-teal bg-teal text-white'
                : isPast
                  ? 'border-teal/40 bg-teal/10 text-teal hover:bg-teal/20'
                  : 'border-border bg-surface text-ink-secondary hover:bg-subtle hover:text-ink'
            }`}
          >
            <span className="font-mono text-[11px]">{stepNum}</span>
            <span>{step.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

