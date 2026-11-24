import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Printer, Search } from 'lucide-react';
import { GLOSSARY_ENTRIES } from '@/content/glossary';
import { DEFAULT_FAN_RULES, FAN_SPEED_VAR, HUMIDITY_VAR, TEMPERATURE_VAR } from '@/engine';
import { Badge, Button, Card, FormulaBlock, Tabs } from '@/components/ui';

export default function GlossaryPage() {
  const [query, setQuery] = useState('');

  useEffect(() => {
    document.title = 'Glossary & Cheat Sheet — FuzzyLab';
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...GLOSSARY_ENTRIES].sort((a, b) => a.term.localeCompare(b.term));
    if (!q) return sorted;
    return sorted.filter(
      (e) =>
        e.term.toLowerCase().includes(q) ||
        e.shortDef.toLowerCase().includes(q) ||
        e.explanation.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <div className="space-y-6">
      <header className="no-print border-b border-border pb-4">
        <p className="font-mono text-xs uppercase tracking-wider text-teal">Quick Reference</p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-ink">
          Glossary & Formula Cheat Sheet
        </h1>
      </header>

      <Tabs
        defaultTabId="glossary"
        items={[
          {
            id: 'glossary',
            label: 'Alphabetical Glossary',
            content: (
              <div className="space-y-4">
                <div className="relative max-w-md">
                  <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-ink-secondary" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search terms (e.g. centroid, shoulder, firing)..."
                    aria-label="Search glossary"
                    className="w-full rounded border border-border-strong bg-surface py-2 pl-9 pr-3 text-sm text-ink"
                  />
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {filtered.map((entry) => (
                    <Card key={entry.term} className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h2 className="font-serif text-lg font-semibold text-ink">{entry.term}</h2>
                        <Link to={`/learn/module-${entry.moduleNumber}`}>
                          <Badge tone="teal">Module {entry.moduleNumber}</Badge>
                        </Link>
                      </div>
                      <p className="text-sm font-medium text-ink">{entry.shortDef}</p>
                      <p className="text-xs leading-relaxed text-ink-secondary">
                        {entry.explanation}
                      </p>
                      <p className="rounded bg-subtle px-2.5 py-1.5 font-mono text-[11px] text-ink">
                        Example: {entry.example}
                      </p>
                    </Card>
                  ))}
                </div>
              </div>
            ),
          },
          {
            id: 'cheatsheet',
            label: 'Formula Cheat Sheet (Print-Friendly)',
            content: (
              <div className="space-y-6">
                <div className="no-print flex justify-end">
                  <Button size="sm" variant="secondary" onClick={() => window.print()}>
                    <Printer className="h-3.5 w-3.5" />
                    Print Cheat Sheet
                  </Button>
                </div>

                <section className="print-break-avoid space-y-3">
                  <h2 className="font-serif text-xl font-bold text-ink">
                    1. Membership Functions
                  </h2>
                  <FormulaBlock
                    latex="\\mu_{\\text{tri}}(x; a,b,c) = \\max\\!\\left(0, \\min\\!\\left(\\frac{x-a}{b-a}, \\frac{c-x}{c-b}\\right)\\right), \\quad \\mu_{\\text{gauss}}(x; m,\\sigma)=\\exp\\!\\left(-\\frac{(x-m)^2}{2\\sigma^2}\\right)"
                    caption="Triangular (a ≤ b ≤ c, a < c) and Gaussian (σ > 0)"
                  />
                  <FormulaBlock
                    latex="\\mu_{\\text{trap}}(x; a,b,c,d) = \\begin{cases} 0 & x < a \\text{ or } x > d \\\\ \\frac{x-a}{b-a} & a \\le x < b \\\\ 1 & b \\le x \\le c \\\\ \\frac{d-x}{d-c} & c < x \\le d \\end{cases}"
                    caption="Trapezoidal (a ≤ b ≤ c ≤ d, a < d; check plateau b ≤ x ≤ c first for shoulders)"
                  />
                </section>

                <section className="print-break-avoid space-y-3">
                  <h2 className="font-serif text-xl font-bold text-ink">
                    2. Inference & Defuzzification
                  </h2>
                  <FormulaBlock
                    latex="w_i = \\min(\\mu_A, \\mu_B) \\text{ or } \\mu_A\\cdot\\mu_B, \\qquad \\mu_{\\text{agg}}(y) = \\max_i \\min(w_i, \\mu_{C_i}(y))"
                    caption="Mamdani Rule Firing, Minimum Implication, and Maximum Aggregation"
                  />
                  <FormulaBlock
                    latex="y^*_{\\text{CoA}} = \\frac{\\sum y\\,\\mu_{\\text{agg}}(y)}{\\sum \\mu_{\\text{agg}}(y)}, \\qquad y^*_{\\text{MoM}} = \\frac{1}{|M|}\\sum_{y\\in M} y"
                    caption="Centroid of Area and Mean of Maxima"
                  />
                </section>

                <section className="print-break-avoid space-y-3">
                  <h2 className="font-serif text-xl font-bold text-ink">
                    3. Room Fan Controller Specification
                  </h2>
                  <div className="grid gap-3 md:grid-cols-3 text-xs font-mono">
                    {[TEMPERATURE_VAR, HUMIDITY_VAR, FAN_SPEED_VAR].map((v) => (
                      <Card key={v.id} padding="sm">
                        <div className="font-sans font-semibold text-ink mb-1">
                          {v.name} [{v.min}, {v.max}] {v.unit}
                        </div>
                        {v.sets.map((s) => (
                          <div key={s.id} className="text-ink-secondary">
                            {s.name}:{' '}
                            {s.mf.type === 'triangular'
                              ? `tri(${s.mf.a}, ${s.mf.b}, ${s.mf.c})`
                              : s.mf.type === 'trapezoidal'
                                ? `trap(${s.mf.a}, ${s.mf.b}, ${s.mf.c}, ${s.mf.d})`
                                : `gauss(${s.mf.m}, ${s.mf.sigma})`}
                          </div>
                        ))}
                      </Card>
                    ))}
                  </div>
                  <Card padding="sm">
                    <div className="font-sans text-xs font-semibold text-ink mb-2">
                      9-Rule Base (IF Temperature AND Humidity THEN Fan Speed)
                    </div>
                    <div className="grid gap-1 sm:grid-cols-3 font-mono text-xs text-ink-secondary">
                      {DEFAULT_FAN_RULES.map((r) => (
                        <div key={r.id}>
                          <strong className="text-ink">{r.id}:</strong> {r.name}
                        </div>
                      ))}
                    </div>
                  </Card>
                </section>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}

