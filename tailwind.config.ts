import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        paper: 'var(--bg-paper)',
        surface: 'var(--bg-surface)',
        subtle: 'var(--bg-subtle)',
        lab: 'var(--bg-lab)',
        border: {
          DEFAULT: 'var(--border-default)',
          strong: 'var(--border-strong)',
        },
        ink: {
          DEFAULT: 'var(--text-ink)',
          secondary: 'var(--text-secondary)',
        },
        teal: {
          DEFAULT: 'var(--accent-teal)',
          hover: 'var(--accent-teal-hover)',
        },
        orange: {
          DEFAULT: 'var(--accent-orange)',
        },
        success: 'var(--status-success)',
        error: 'var(--status-error)',
        warning: 'var(--status-warning)',
      },
      fontFamily: {
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        xs: '2px',
        sm: '3px',
        DEFAULT: '4px',
        md: '6px',
        lg: '6px',
      },
      maxWidth: {
        prose: '68ch',
      },
    },
  },
  plugins: [],
};

export default config;

