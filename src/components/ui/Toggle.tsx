export interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
  className?: string;
}

export function Toggle({ label, checked, onChange, description, className = '' }: ToggleProps) {
  return (
    <label className={`flex cursor-pointer items-start justify-between gap-3 ${className}`}>
      <div>
        <span className="text-sm font-medium text-ink">{label}</span>
        {description && <p className="text-xs text-ink-secondary">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-sm border transition-colors ${
          checked ? 'border-teal bg-teal' : 'border-border-strong bg-subtle'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-xs bg-white transition-transform ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </label>
  );
}

