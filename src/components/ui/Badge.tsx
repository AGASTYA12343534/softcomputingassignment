import type { ReactNode } from 'react';

export type BadgeTone = 'neutral' | 'teal' | 'orange' | 'success' | 'error' | 'warning';

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

const TONE_CLASSES: Record<BadgeTone, string> = {
  neutral: 'bg-subtle text-ink border-border',
  teal: 'bg-teal/10 text-teal border-teal/30',
  orange: 'bg-orange/10 text-orange border-orange/30',
  success: 'bg-success/10 text-success border-success/30',
  error: 'bg-error/10 text-error border-error/30',
  warning: 'bg-warning/10 text-warning border-warning/30',
};

export function Badge({ tone = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-xs border px-2 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

