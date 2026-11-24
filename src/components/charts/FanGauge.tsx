import { motion, useReducedMotion } from 'framer-motion';

export interface FanGaugeProps {
  speedPercent: number | null;
  label?: string;
}

export function FanGauge({ speedPercent, label = 'Fan Speed' }: FanGaugeProps) {
  const prefersReduced = useReducedMotion();
  const valid = typeof speedPercent === 'number' && Number.isFinite(speedPercent);
  const clamped = valid ? Math.max(0, Math.min(100, speedPercent)) : 0;

  // Duration decreases as speed increases; 0% => static
  const duration = clamped > 1 ? Math.max(0.35, 3.2 - (clamped / 100) * 2.8) : 0;

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded border border-border bg-subtle">
        <motion.svg
          viewBox="0 0 64 64"
          className="h-14 w-14 text-ink"
          aria-hidden="true"
          animate={
            !prefersReduced && duration > 0
              ? { rotate: 360 }
              : { rotate: 0 }
          }
          transition={
            !prefersReduced && duration > 0
              ? { repeat: Infinity, ease: 'linear', duration }
              : { duration: 0 }
          }
        >
          <circle cx="32" cy="32" r="28" fill="none" stroke="#D9D2C3" strokeWidth="1.5" />
          {/* Three blades */}
          <path
            d="M32 32 C27 22, 27 10, 32 8 C37 10, 37 22, 32 32 Z"
            fill="#2A7F82"
          />
          <path
            d="M32 32 C42 29, 53 34, 53 40 C48 44, 38 39, 32 32 Z"
            fill="#2A7F82"
          />
          <path
            d="M32 32 C22 39, 13 44, 11 39 C12 33, 22 29, 32 32 Z"
            fill="#2A7F82"
          />
          <circle cx="32" cy="32" r="4" fill="#14213D" />
        </motion.svg>
      </div>
      <div>
        <div className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
          {label}
        </div>
        <div
          className="font-mono text-3xl font-bold tabular-nums text-ink"
          aria-live="polite"
        >
          {valid ? `${clamped.toFixed(2)}%` : '—'}
        </div>
        <div className="text-xs text-ink-secondary">
          {valid
            ? clamped < 33
              ? 'Low airflow'
              : clamped < 67
                ? 'Moderate airflow'
                : 'High airflow'
            : 'No active rule output'}
        </div>
      </div>
    </div>
  );
}

