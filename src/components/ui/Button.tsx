import type { ButtonHTMLAttributes, ReactNode } from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'bg-teal text-white border border-teal hover:bg-teal-hover active:bg-teal-hover disabled:opacity-50',
  secondary:
    'bg-surface text-ink border border-border-strong hover:bg-subtle active:bg-subtle disabled:opacity-50',
  ghost:
    'bg-transparent text-ink border border-transparent hover:bg-subtle active:bg-subtle disabled:opacity-50',
  danger:
    'bg-error text-white border border-error hover:opacity-90 disabled:opacity-50',
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1 text-xs font-medium',
  md: 'px-3.5 py-2 text-sm font-medium',
  lg: 'px-5 py-2.5 text-base font-medium',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  className = '',
  type = 'button',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-1.5 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

