export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercent?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercent = false,
  className = '',
}: ProgressBarProps) {
  const pct = max > 0 ? Math.max(0, Math.min(100, Math.round((value / max) * 100))) : 0;

  return (
    <div className={`space-y-1 ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs text-ink-secondary">
          {label && <span>{label}</span>}
          {showPercent && <span className="font-mono tabular-nums">{pct}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'Progress'}
        className="h-2 w-full overflow-hidden rounded-xs border border-border bg-subtle"
      >
        <div
          className="h-full bg-teal transition-all duration-200"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

