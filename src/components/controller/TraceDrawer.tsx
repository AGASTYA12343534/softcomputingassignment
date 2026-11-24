import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import type { InferenceTrace } from '@/engine';
import { Button, Modal } from '@/components/ui';

export interface TraceDrawerProps {
  open: boolean;
  onClose: () => void;
  trace: InferenceTrace;
}

export function TraceDrawer({ open, onClose, trace }: TraceDrawerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(trace, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be restricted in headless contexts
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Algorithm Trace Inspector" maxWidth="max-w-4xl">
      <div className="space-y-5 text-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
          <div className="text-xs text-ink-secondary">
            System: <strong className="text-ink">{trace.systemName}</strong> · AND:{' '}
            <code className="font-mono text-ink">{trace.config.andOperator}</code> · Implication:{' '}
            <code className="font-mono text-ink">{trace.config.implication}</code> · Resolution:{' '}
            <code className="font-mono text-ink">{trace.config.resolution}</code>
          </div>
          <Button size="sm" variant="secondary" onClick={handleCopy}>
            {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? 'Copied JSON' : 'Copy Trace JSON'}
          </Button>
        </div>

        {/* 1. Fuzzification */}
        <section>
          <h3 className="font-serif text-base font-semibold text-ink mb-2">1. Fuzzification</h3>
          <div className="overflow-x-auto rounded border border-border">
            <table className="w-full border-collapse text-xs font-mono">
              <thead className="bg-subtle text-ink-secondary">
                <tr>
                  <th className="px-2.5 py-1.5 text-left">Variable</th>
                  <th className="px-2.5 py-1.5 text-left">Set</th>
                  <th className="px-2.5 py-1.5 text-right">μ</th>
                  <th className="px-2.5 py-1.5 text-left">Branch & Arithmetic</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {trace.fuzzified.flatMap((fv) =>
                  fv.memberships.map((m) => (
                    <tr key={`${fv.variableId}-${m.setId}`}>
                      <td className="px-2.5 py-1.5">
                        {fv.variableName} ({fv.clampedInput}
                        {fv.unit})
                      </td>
                      <td className="px-2.5 py-1.5">{m.setName}</td>
                      <td className="px-2.5 py-1.5 text-right font-semibold">
                        {m.degree.toFixed(4)}
                      </td>
                      <td className="px-2.5 py-1.5 text-ink-secondary">
                        [{m.branch}] {m.arithmetic}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* 2. Rule Evaluations */}
        <section>
          <h3 className="font-serif text-base font-semibold text-ink mb-2">2. Rule Evaluations</h3>
          <div className="overflow-x-auto rounded border border-border">
            <table className="w-full border-collapse text-xs font-mono">
              <thead className="bg-subtle text-ink-secondary">
                <tr>
                  <th className="px-2.5 py-1.5 text-left">Rule</th>
                  <th className="px-2.5 py-1.5 text-left">Antecedents</th>
                  <th className="px-2.5 py-1.5 text-left">Op</th>
                  <th className="px-2.5 py-1.5 text-right">Strength w_i</th>
                  <th className="px-2.5 py-1.5 text-left">Consequent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {trace.ruleEvaluations.map((re) => (
                  <tr
                    key={re.rule.id}
                    className={re.activated ? 'bg-teal/5' : 'text-ink-secondary opacity-70'}
                  >
                    <td className="px-2.5 py-1.5 font-semibold">{re.rule.id}</td>
                    <td className="px-2.5 py-1.5">
                      {re.antecedentEvals
                        .map((a) => `${a.setName}(${a.degree.toFixed(3)})`)
                        .join(` ${re.rule.operator} `)}
                    </td>
                    <td className="px-2.5 py-1.5">{re.operatorUsed}</td>
                    <td className="px-2.5 py-1.5 text-right font-semibold">
                      {re.firingStrength.toFixed(4)}
                    </td>
                    <td className="px-2.5 py-1.5">{re.consequentSetName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* 3. Defuzzification */}
        <section>
          <h3 className="font-serif text-base font-semibold text-ink mb-2">
            3. Defuzzification Summary
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 font-mono text-xs">
            <div className="rounded border border-border bg-subtle p-3">
              <div className="font-semibold text-ink">Discrete Centroid (Δy = {trace.config.resolution})</div>
              {trace.defuzzification.centroid.ok ? (
                <div className="mt-1 space-y-0.5 text-ink-secondary">
                  <div>Σ y·μ(y) = {trace.defuzzification.centroid.numerator.toFixed(4)}</div>
                  <div>Σ μ(y) = {trace.defuzzification.centroid.denominator.toFixed(4)}</div>
                  <div className="font-semibold text-teal">
                    y* = {trace.defuzzification.centroid.value.toFixed(4)}
                  </div>
                </div>
              ) : (
                <div className="mt-1 text-error">{trace.defuzzification.centroid.reason}</div>
              )}
            </div>

            <div className="rounded border border-border bg-subtle p-3">
              <div className="font-semibold text-ink">Continuous Analytic Centroid (100k samples)</div>
              {trace.defuzzification.analyticCentroid.ok ? (
                <div className="mt-1 space-y-0.5 text-ink-secondary">
                  <div>∫ y·μ(y)dy = {trace.defuzzification.analyticCentroid.numerator.toFixed(4)}</div>
                  <div>∫ μ(y)dy = {trace.defuzzification.analyticCentroid.denominator.toFixed(4)}</div>
                  <div className="font-semibold text-teal">
                    y* = {trace.defuzzification.analyticCentroid.value.toFixed(4)}
                  </div>
                </div>
              ) : (
                <div className="mt-1 text-error">{trace.defuzzification.analyticCentroid.reason}</div>
              )}
            </div>

            <div className="rounded border border-border bg-subtle p-3">
              <div className="font-semibold text-ink">Bisector of Area</div>
              {trace.defuzzification.bisector.result.ok ? (
                <div className="mt-1 space-y-0.5 text-ink-secondary">
                  <div>Total sum = {trace.defuzzification.bisector.totalSum.toFixed(4)}</div>
                  <div>Half target = {trace.defuzzification.bisector.halfSum.toFixed(4)}</div>
                  <div className="font-semibold text-ink">
                    y* = {trace.defuzzification.bisector.result.value.toFixed(4)}
                  </div>
                </div>
              ) : (
                <div className="mt-1 text-error">{trace.defuzzification.bisector.result.reason}</div>
              )}
            </div>

            <div className="rounded border border-border bg-subtle p-3">
              <div className="font-semibold text-ink">Mean of Maxima (MoM)</div>
              {trace.defuzzification.mom.result.ok ? (
                <div className="mt-1 space-y-0.5 text-ink-secondary">
                  <div>Max μ = {trace.defuzzification.mom.maxMu.toFixed(4)}</div>
                  <div>
                    Maximal points ({trace.defuzzification.mom.maximalPoints.length}):{' '}
                    {trace.defuzzification.mom.maximalPoints.slice(0, 8).join(', ')}
                    {trace.defuzzification.mom.maximalPoints.length > 8 ? '…' : ''}
                  </div>
                  <div className="font-semibold text-ink">
                    y* = {trace.defuzzification.mom.result.value.toFixed(4)}
                  </div>
                </div>
              ) : (
                <div className="mt-1 text-error">{trace.defuzzification.mom.result.reason}</div>
              )}
            </div>
          </div>
        </section>
      </div>
    </Modal>
  );
}

