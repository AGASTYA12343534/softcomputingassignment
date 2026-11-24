import { useId } from 'react';

export interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  dark?: boolean;
  className?: string;
}

export function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  dark = false,
  className = '',
}: SliderProps) {
  const id = useId();
  const numId = `${id}-num`;

  const handleNumberChange = (raw: string) => {
    const parsed = Number(raw);
    if (!Number.isFinite(parsed)) return;
    const clamped = Math.max(min, Math.min(max, parsed));
    onChange(clamped);
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <label
          htmlFor={id}
          className={`text-sm font-medium ${dark ? 'text-white' : 'text-ink'}`}
        >
          {label}
        </label>
        <div className="flex items-center gap-1">
          <input
            id={numId}
            type="number"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => handleNumberChange(e.target.value)}
            aria-label={`${label} numeric value`}
            className={`w-20 rounded border px-2 py-1 text-right font-mono text-sm tabular-nums ${
              dark
                ? 'border-white/20 bg-white/10 text-white'
                : 'border-border-strong bg-surface text-ink'
            }`}
          />
          {unit && (
            <span className={`font-mono text-xs ${dark ? 'text-white/70' : 'text-ink-secondary'}`}>
              {unit}
            </span>
          )}
        </div>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer appearance-none rounded-sm bg-border accent-teal"
      />
      <div
        className={`flex justify-between font-mono text-[11px] tabular-nums ${
          dark ? 'text-white/60' : 'text-ink-secondary'
        }`}
      >
        <span>
          {min}
          {unit}
        </span>
        <span>
          {max}
          {unit}
        </span>
      </div>
    </div>
  );
}

