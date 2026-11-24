import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import {
  evaluateMF,
  type FuzzyRule,
  type FuzzySystem,
} from '@/engine';
import { Badge, Button, Card } from '@/components/ui';

export interface RuleBuilderProps {
  system: FuzzySystem;
  inputs: Record<string, number>;
  onAddRule: (rule: FuzzyRule) => void;
  onDeleteRule?: (ruleId: string) => void;
  allowDelete?: boolean;
}

export function RuleBuilder({
  system,
  inputs,
  onAddRule,
  onDeleteRule,
  allowDelete = true,
}: RuleBuilderProps) {
  const var0 = system.inputs[0];
  const var1 = system.inputs[1];

  const [set0, setSet0] = useState(var0.sets[0].id);
  const [set1, setSet1] = useState(var1.sets[0].id);
  const [operator, setOperator] = useState<'AND' | 'OR'>('AND');
  const [consequentId, setConsequentId] = useState(system.output.sets[0].id);

  const deg0 = evaluateMF(
    inputs[var0.id] ?? var0.min,
    var0.sets.find((s) => s.id === set0)!.mf
  ).value;
  const deg1 = evaluateMF(
    inputs[var1.id] ?? var1.min,
    var1.sets.find((s) => s.id === set1)!.mf
  ).value;

  const previewStrength = operator === 'AND' ? Math.min(deg0, deg1) : Math.max(deg0, deg1);

  const name0 = var0.sets.find((s) => s.id === set0)?.name ?? set0;
  const name1 = var1.sets.find((s) => s.id === set1)?.name ?? set1;
  const consName = system.output.sets.find((s) => s.id === consequentId)?.name ?? consequentId;

  const handleAdd = () => {
    const nextId = `R${system.rules.length + 1}-${Date.now().toString().slice(-3)}`;
    onAddRule({
      id: nextId,
      name: `${name0} ${operator} ${name1} -> ${consName}`,
      antecedents: [
        { variableId: var0.id, setId: set0 },
        { variableId: var1.id, setId: set1 },
      ],
      operator,
      consequent: { variableId: system.output.id, setId: consequentId },
    });
  };

  return (
    <Card className="space-y-4">
      <div>
        <h3 className="font-serif text-lg font-semibold text-ink">Visual Rule Builder</h3>
        <p className="text-xs text-ink-secondary">
          Construct an IF–THEN rule and inspect its live firing strength for the current inputs.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded border border-border bg-subtle p-3 text-sm">
        <span className="font-mono text-xs font-semibold text-teal">IF</span>
        <span className="text-xs text-ink-secondary">{var0.name} is</span>
        <select
          aria-label={`${var0.name} fuzzy set`}
          value={set0}
          onChange={(e) => setSet0(e.target.value)}
          className="rounded border border-border-strong bg-surface px-2 py-1 text-xs font-medium text-ink"
        >
          {var0.sets.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Rule operator"
          value={operator}
          onChange={(e) => setOperator(e.target.value as 'AND' | 'OR')}
          className="rounded border border-border-strong bg-surface px-2 py-1 font-mono text-xs font-semibold text-ink"
        >
          <option value="AND">AND</option>
          <option value="OR">OR</option>
        </select>

        <span className="text-xs text-ink-secondary">{var1.name} is</span>
        <select
          aria-label={`${var1.name} fuzzy set`}
          value={set1}
          onChange={(e) => setSet1(e.target.value)}
          className="rounded border border-border-strong bg-surface px-2 py-1 text-xs font-medium text-ink"
        >
          {var1.sets.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <span className="font-mono text-xs font-semibold text-teal">THEN</span>
        <span className="text-xs text-ink-secondary">{system.output.name} is</span>
        <select
          aria-label={`${system.output.name} fuzzy set`}
          value={consequentId}
          onChange={(e) => setConsequentId(e.target.value)}
          className="rounded border border-border-strong bg-surface px-2 py-1 text-xs font-medium text-ink"
        >
          {system.output.sets.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        <Button size="sm" variant="primary" onClick={handleAdd} className="ml-auto">
          <Plus className="h-3.5 w-3.5" />
          Add Rule
        </Button>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-border bg-surface px-3 py-2 text-xs">
        <div>
          <span className="text-ink-secondary">Plain English: </span>
          <strong className="text-ink">
            If {var0.name} is {name0} {operator.toLowerCase()} {var1.name} is {name1}, set{' '}
            {system.output.name} to {consName}.
          </strong>
        </div>
        <Badge tone={previewStrength > 0 ? 'teal' : 'neutral'}>
          Live w = {previewStrength.toFixed(2)}
        </Badge>
      </div>

      {allowDelete && (
        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {system.rules.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded border border-border bg-surface px-3 py-1.5 text-xs"
            >
              <span>
                <span className="font-mono font-semibold text-ink mr-2">{r.id}</span>
                {r.name}
              </span>
              {onDeleteRule && (
                <button
                  type="button"
                  onClick={() => onDeleteRule(r.id)}
                  aria-label={`Delete rule ${r.id}`}
                  className="rounded p-1 text-ink-secondary hover:bg-error/10 hover:text-error"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

