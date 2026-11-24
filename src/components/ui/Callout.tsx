import type { ReactNode } from 'react';
import { BookOpen, Lightbulb, Calculator, AlertTriangle, HelpCircle, Info } from 'lucide-react';

export type CalloutKind = 'definition' | 'intuition' | 'example' | 'math' | 'warning' | 'hint';

export interface CalloutProps {
  kind: CalloutKind;
  title?: string;
  children: ReactNode;
  className?: string;
}

const CALLOUT_META: Record<
  CalloutKind,
  { label: string; border: string; bg: string; icon: typeof Info; accent: string }
> = {
  definition: {
    label: 'Definition',
    border: 'border-l-teal',
    bg: 'bg-surface',
    icon: BookOpen,
    accent: 'text-teal',
  },
  intuition: {
    label: 'Intuition',
    border: 'border-l-ink',
    bg: 'bg-subtle',
    icon: Lightbulb,
    accent: 'text-ink',
  },
  example: {
    label: 'Worked Example',
    border: 'border-l-orange',
    bg: 'bg-surface',
    icon: Info,
    accent: 'text-orange',
  },
  math: {
    label: 'The Math',
    border: 'border-l-teal',
    bg: 'bg-subtle',
    icon: Calculator,
    accent: 'text-teal',
  },
  warning: {
    label: 'Common Misconception',
    border: 'border-l-warning',
    bg: 'bg-surface',
    icon: AlertTriangle,
    accent: 'text-warning',
  },
  hint: {
    label: 'Hint',
    border: 'border-l-teal',
    bg: 'bg-subtle',
    icon: HelpCircle,
    accent: 'text-teal',
  },
};

export function Callout({ kind, title, children, className = '' }: CalloutProps) {
  const meta = CALLOUT_META[kind];
  const Icon = meta.icon;

  return (
    <aside
      className={`rounded border border-border border-l-4 ${meta.border} ${meta.bg} p-4 ${className}`}
      aria-label={title ?? meta.label}
    >
      <div className={`mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${meta.accent}`}>
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        <span>{title ?? meta.label}</span>
      </div>
      <div className="text-sm leading-relaxed text-ink">{children}</div>
    </aside>
  );
}

