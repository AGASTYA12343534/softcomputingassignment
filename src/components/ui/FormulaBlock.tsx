import { useMemo, useState, type MouseEvent } from 'react';
import katex from 'katex';
import { FORMULA_SYMBOLS, type FormulaSymbolInfo } from '@/content/formulas';
import { X } from 'lucide-react';

export interface FormulaBlockProps {
  latex: string;
  displayMode?: boolean;
  caption?: string;
  symbolKeys?: string[];
  className?: string;
}

export function FormulaBlock({
  latex,
  displayMode = true,
  caption,
  symbolKeys,
  className = '',
}: FormulaBlockProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<FormulaSymbolInfo | null>(null);

  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        strict: false,
        trust: (context) => context.command === '\\htmlData' || context.command === '\\htmlClass',
      });
    } catch {
      return latex;
    }
  }, [latex, displayMode]);

  const handleClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = (e.target as HTMLElement).closest('[data-symbol]');
    if (!target) return;
    const symKey = target.getAttribute('data-symbol');
    if (symKey && FORMULA_SYMBOLS[symKey]) {
      setSelectedSymbol(FORMULA_SYMBOLS[symKey]);
    }
  };

  const availableSymbols = useMemo(() => {
    if (!symbolKeys) return [];
    return symbolKeys.map((k) => FORMULA_SYMBOLS[k]).filter(Boolean);
  }, [symbolKeys]);

  if (!displayMode) {
    return (
      <span
        className={`inline-block align-middle ${className}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }

  return (
    <div className={`rounded border border-border bg-surface p-4 ${className}`}>
      <div
        onClick={handleClick}
        className="overflow-x-auto py-1 text-center text-ink"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {caption && (
        <p className="mt-2 text-center text-xs text-ink-secondary">{caption}</p>
      )}
      {availableSymbols.length > 0 && (
        <div className="mt-3 border-t border-border pt-2.5">
          <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-secondary">
            Formula Explorer — click any symbol
          </div>
          <div className="flex flex-wrap gap-1.5">
            {availableSymbols.map((sym) => {
              const active = selectedSymbol?.id === sym.id;
              return (
                <button
                  key={sym.id}
                  type="button"
                  onClick={() => setSelectedSymbol(active ? null : sym)}
                  className={`rounded-xs border px-2 py-0.5 font-mono text-xs transition-colors ${
                    active
                      ? 'border-teal bg-teal text-white'
                      : 'border-border-strong bg-subtle text-ink hover:border-teal'
                  }`}
                >
                  {sym.symbol} — {sym.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
      {selectedSymbol && (
        <div
          role="region"
          aria-label={`Symbol details for ${selectedSymbol.name}`}
          className="mt-3 rounded border border-teal/40 bg-subtle p-3 text-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-mono font-semibold text-teal">{selectedSymbol.symbol}</span>
              <span className="ml-2 font-semibold text-ink">{selectedSymbol.name}</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedSymbol(null)}
              aria-label="Close symbol explanation"
              className="rounded p-0.5 text-ink-secondary hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-1 text-ink">{selectedSymbol.meaning}</p>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-secondary">
            <span>
              <strong className="text-ink">Range:</strong> {selectedSymbol.unitOrRange}
            </span>
            <span>
              <strong className="text-ink">Example:</strong> {selectedSymbol.example}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

