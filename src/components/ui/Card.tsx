import type { HTMLAttributes, ReactNode } from 'react';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  subtle?: boolean;
}

const PADDING_CLASSES = {
  none: '',
  sm: 'p-3',
  md: 'p-4 sm:p-5',
  lg: 'p-5 sm:p-6',
};

export function Card({
  children,
  padding = 'md',
  subtle = false,
  className = '',
  ...rest
}: CardProps) {
  return (
    <div
      className={`rounded border border-border ${subtle ? 'bg-subtle' : 'bg-surface'} ${PADDING_CLASSES[padding]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

