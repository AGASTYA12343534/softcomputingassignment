import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, FileText, RotateCcw } from 'lucide-react';
import {
  CONTROLLER_PRESETS,
  ROOM_FAN_SYSTEM,
  runInference,
  type DefuzzMethod,
} from '@/engine';
import { useSimulationStore } from '@/state/simulationStore';
import {
  Badge,
  Button,
  Callout,
  Card,
  FormulaBlock,
  SegmentedControl,
  Slider,
  Toggle,
} from '@/components/ui';
import {
  AggregationChart,
  ClippedOutputChart,
  FanGauge,
  MembershipChart,
  type DefuzzMarker,
} from '@/components/charts';
import { TraceDrawer } from './TraceDrawer';

interface PipelinePanelProps {
  stepNumber: number;
  title: string;
  summary: string;
  mathLatex?: string;
  mathNote?: string;
  children: React.ReactNode;
}

function PipelinePanel({
  stepNumber,
  title,
  summary,
  mathLatex,
  mathNote,
  children,
}: PipelinePanelProps) {
  const [showMath, setShowMath] = useState(false);

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-xs bg-subtle font-mono text-xs font-semibold text-ink">
              {stepNumber}
            </span>
            <h2 className="font-serif text-lg font-semibold text-ink">{title}</h2>
          </div>
          <p className="mt-1 text-sm text-ink-secondary">{summary}</p>
        </div>
        {mathLatex && (
          <button
            type="button"
            onClick={() => setShowMath((v) => !v)}
            aria-expanded={showMath}
            className="inline-flex items-center gap-1 rounded border border-border bg-subtle px-2.5 py-1 text-xs font-medium text-ink hover:border-teal"
          >
            {showMath ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
            Show the math
          </button>
        )}
      </div>

      {showMath && mathLatex && (
        <div className="mt-3 space-y-2">
          <FormulaBlock latex={mathLatex} caption={mathNote} />
        </div>
      )}

      <div className="mt-4">{children}</div>
    </Card>
  );
}

export function ControllerWorkspace({ compact = false }: { compact?: boolean }) {
  const {
    temperature,
    humidity,
    config,
    setTemperature,
    setHumidity,
    setInputs,
    setAndOperator,
    setDefuzzMethod,
    resetControllerDefaults,
  } = useSimulationStore();

  const [compareAllMethods, setCompareAllMethods] = useState(false);
  const [traceOpen, setTraceOpen] = useState(false);

  const trace = useMemo(
    () => runInference(ROOM_FAN_SYSTEM, { temperature, humidity }, config),
    [temperature, humidity, config]
  );

  const tempFuzz = trace.fuzzified[0];
  const humFuzz = trace.fuzzified[1];
  const selected = trace.defuzzification.selectedResult;

  const tempSentence = tempFuzz.memberships
    .filter((m) => m.degree > 0)
    .map((m) => `${m.degree === 1 ? 'completely' : `${(m.degree * 100).toFixed(0)}%`} ${m.setName}`)
    .join(' and ');

  const humSentence = humFuzz.memberships
    .filter((m) => m.degree > 0)
    .map((m) => `${m.degree === 1 ? 'completely' : `${(m.degree * 100).toFixed(0)}%`} ${m.setName}`)
    .join(' and ');

  const markers: DefuzzMarker[] = [];
  if (compareAllMethods) {
    if (trace.defuzzification.centroid.ok) {
      markers.push({ label: 'Centroid', value: trace.defuzzification.centroid.value, color: '#D9772B' });
    }
    if (trace.defuzzification.bisector.result.ok) {
      markers.push({
        label: 'Bisector',
        value: trace.defuzzification.bisector.result.value,
        color: '#2A7F82',
        dash: '4 3',
      });
    }
    if (trace.defuzzification.mom.result.ok) {
      markers.push({
        label: 'MoM',
        value: trace.defuzzification.mom.result.value,
        color: '#14213D',
        dash: '2 2',
      });
    }
  } else if (selected.ok) {
    const label =
      config.defuzzMethod === 'centroid'
        ? 'Centroid'
        : config.defuzzMethod === 'bisector'
          ? 'Bisector'
          : 'MoM';
    markers.push({ label, value: selected.value, color: '#D9772B' });
  }

  return (
    <div className="space-y-6">
      <div className={`grid gap-6 ${compact ? 'lg:grid-cols-12' : 'xl:grid-cols-12'}`}>
        {/* Left Column: Inputs & Settings */}
        <div className={compact ? 'lg:col-span-4 space-y-4' : 'xl:col-span-3 space-y-4'}>
          <Card>
            <div className="flex items-center justify-between border-b border-border pb-2.5 mb-3">
              <h2 className="font-serif text-base font-semibold text-ink">Inputs & Presets</h2>
              <Button size="sm" variant="ghost" onClick={resetControllerDefaults} title="Reset defaults">
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>

            <div className="space-y-4">
              <Slider
                label="Temperature"
                value={temperature}
                min={0}
                max={40}
                step={0.5}
                unit="°C"
                onChange={setTemperature}
              />
              <Slider
                label="Humidity"
                value={humidity}
                min={0}
                max={100}
                step={1}
                unit="%"
                onChange={setHumidity}
              />
            </div>

            <div className="mt-4 border-t border-border pt-3">
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                onClick={() => setInputs(24, 45)}
              >
                Load reference case (24 °C / 45 %)
              </Button>
            </div>

            <div className="mt-4 border-t border-border pt-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                Scenario Presets
              </div>
              <div className="space-y-1.5">
                {CONTROLLER_PRESETS.map((p) => {
                  const isActive = temperature === p.temperature && humidity === p.humidity;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setInputs(p.temperature, p.humidity)}
                      className={`w-full rounded border px-2.5 py-2 text-left text-xs transition-colors ${
                        isActive
                          ? 'border-teal bg-teal/10 text-ink font-medium'
                          : 'border-border bg-subtle/50 text-ink-secondary hover:bg-subtle hover:text-ink'
                      }`}
                    >
                      <div className="font-medium text-ink">{p.label}</div>
                      <div className="mt-0.5 text-[11px] opacity-85">{p.description}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-serif text-base font-semibold text-ink mb-3">
              Inference Settings
            </h2>
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-xs font-medium text-ink-secondary">AND Operator</div>
                <SegmentedControl
                  ariaLabel="AND Operator"
                  size="sm"
                  value={config.andOperator}
                  onChange={setAndOperator}
                  options={[
                    { value: 'min', label: 'Minimum' },
                    { value: 'product', label: 'Product' },
                  ]}
                />
              </div>

              <div>
                <div className="mb-1 text-xs font-medium text-ink-secondary">Defuzzification</div>
                <SegmentedControl<DefuzzMethod>
                  ariaLabel="Defuzzification Method"
                  size="sm"
                  value={config.defuzzMethod}
                  onChange={setDefuzzMethod}
                  options={[
                    { value: 'centroid', label: 'Centroid' },
                    { value: 'bisector', label: 'Bisector' },
                    { value: 'mom', label: 'MoM' },
                  ]}
                />
              </div>

              <Toggle
                label="Compare all three methods"
                checked={compareAllMethods}
                onChange={setCompareAllMethods}
              />
            </div>
          </Card>
        </div>

        {/* Center Stage: Pipeline Panels */}
        <div className={compact ? 'lg:col-span-8 space-y-5' : 'xl:col-span-6 space-y-5'}>
          {/* 1. Membership Graphs */}
          <PipelinePanel
            stepNumber={1}
            title="Membership Functions"
            summary="Input sensors are mapped against linguistic categories (Cool/Warm/Hot and Dry/Normal/Humid)."
            mathLatex="\mu_{\text{tri}}(x; a,b,c) = \max\left(0, \min\left(\frac{x-a}{b-a}, \frac{c-x}{c-b}\right)\right)"
          >
            <div className="grid gap-4 md:grid-cols-2">
              <MembershipChart
                variable={ROOM_FAN_SYSTEM.inputs[0]}
                currentValue={temperature}
                title="Temperature (°C)"
              />
              <MembershipChart
                variable={ROOM_FAN_SYSTEM.inputs[1]}
                currentValue={humidity}
                title="Humidity (%)"
              />
            </div>
            <div className="mt-4 border-t border-border pt-3">
              <MembershipChart
                variable={ROOM_FAN_SYSTEM.output}
                title="Output Universe: Fan Speed (%)"
              />
            </div>
          </PipelinePanel>

          {/* 2. Fuzzification */}
          <PipelinePanel
            stepNumber={2}
            title="Fuzzification"
            summary="Each crisp reading is converted into membership degrees in [0, 1]."
            mathLatex="\mu(x) \in [0, 1] \quad \text{for every fuzzy set}"
          >
            <p className="mb-3 text-sm text-ink">
              <strong>{temperature} °C</strong> is {tempSentence}. <strong>{humidity} %</strong>{' '}
              humidity is {humSentence}.
            </p>
            <div className="overflow-x-auto rounded border border-border">
              <table className="w-full border-collapse text-xs">
                <thead className="bg-subtle text-ink-secondary">
                  <tr>
                    <th className="px-3 py-2 text-left">Variable</th>
                    <th className="px-3 py-2 text-left">Set</th>
                    <th className="px-3 py-2 text-right">μ</th>
                    <th className="px-3 py-2 text-left">Calculation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border font-mono">
                  {trace.fuzzified.flatMap((fv) =>
                    fv.memberships.map((m) => (
                      <tr
                        key={`${fv.variableId}-${m.setId}`}
                        className={m.degree > 0 ? 'bg-teal/5' : 'text-ink-secondary'}
                      >
                        <td className="px-3 py-1.5 font-sans font-medium text-ink">
                          {fv.variableName}
                        </td>
                        <td className="px-3 py-1.5 font-sans">{m.setName}</td>
                        <td className="px-3 py-1.5 text-right font-semibold">
                          {m.degree.toFixed(3)}
                        </td>
                        <td className="px-3 py-1.5 text-[11px]">{m.arithmetic}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </PipelinePanel>

          {/* 3. Rule Evaluation */}
          <PipelinePanel
            stepNumber={3}
            title="Rule Evaluation"
            summary={`All nine IF–THEN rules are evaluated using ${config.andOperator === 'min' ? 'Minimum' : 'Product'} AND.`}
            mathLatex={
              config.andOperator === 'min'
                ? 'w_i = \\min(\\mu_A(x_1), \\mu_B(x_2))'
                : 'w_i = \\mu_A(x_1) \\cdot \\mu_B(x_2)'
            }
          >
            <div className="space-y-1.5">
              {trace.ruleEvaluations.map((re) => (
                <div
                  key={re.rule.id}
                  className={`flex flex-wrap items-center justify-between gap-2 rounded border px-3 py-2 text-xs ${
                    re.activated
                      ? 'border-teal/50 bg-teal/5 text-ink'
                      : 'border-border bg-surface text-ink-secondary opacity-65'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-semibold">{re.rule.id}</span>
                    <span>
                      IF {re.antecedentEvals.map((a) => `${a.setName} (${a.degree.toFixed(2)})`).join(' AND ')}{' '}
                      THEN <strong>{re.consequentSetName}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span>w = {re.firingStrength.toFixed(3)}</span>
                    {re.activated && <Badge tone="teal">Active</Badge>}
                  </div>
                </div>
              ))}
            </div>
          </PipelinePanel>

          {/* 4. Implication */}
          <PipelinePanel
            stepNumber={4}
            title="Implication (Clipping)"
            summary="Each active rule clips its consequent Fan Speed set at its firing strength."
            mathLatex="\mu_{\text{clipped}, i}(y) = \min(w_i, \mu_{C_i}(y))"
          >
            {trace.activeRules.length === 0 ? (
              <Callout kind="warning" title="No Active Rules">
                No rule fired, so no consequent sets were clipped.
              </Callout>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {trace.activeRules.map((re) => {
                  const cSet = ROOM_FAN_SYSTEM.output.sets.find(
                    (s) => s.id === re.rule.consequent.setId
                  )!;
                  return (
                    <ClippedOutputChart
                      key={re.rule.id}
                      outputVar={ROOM_FAN_SYSTEM.output}
                      consequentSet={cSet}
                      firingStrength={re.firingStrength}
                      implication={config.implication}
                      ruleLabel={`${re.rule.id}: ${re.consequentSetName}`}
                    />
                  );
                })}
              </div>
            )}
          </PipelinePanel>

          {/* 5. Aggregation */}
          <PipelinePanel
            stepNumber={5}
            title="Aggregation"
            summary="All clipped rule outputs are combined by taking the pointwise maximum."
            mathLatex="\mu_{\text{agg}}(y) = \max_i \mu_{\text{clipped}, i}(y)"
          >
            <AggregationChart
              outputVar={ROOM_FAN_SYSTEM.output}
              samples={trace.aggregatedSamples}
              markers={markers}
              title="Aggregated Output Envelope"
            />
          </PipelinePanel>

          {/* 6. Defuzzification */}
          <PipelinePanel
            stepNumber={6}
            title="Defuzzification"
            summary="The fuzzy envelope is converted into a single crisp fan speed percentage."
            mathLatex="y^* = \frac{\sum_{y=0}^{100} y \cdot \mu_{\text{agg}}(y)}{\sum_{y=0}^{100} \mu_{\text{agg}}(y)}"
          >
            {!selected.ok ? (
              <Callout kind="warning" title="Empty Aggregate">
                {selected.reason}
              </Callout>
            ) : (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-3 font-mono text-xs">
                  <div className="rounded border border-border bg-subtle p-3">
                    <div className="text-ink-secondary">Centroid (discrete)</div>
                    <div className="mt-1 text-lg font-bold text-ink">
                      {trace.defuzzification.centroid.ok
                        ? `${trace.defuzzification.centroid.value.toFixed(2)}%`
                        : '—'}
                    </div>
                    {trace.defuzzification.centroid.ok && (
                      <div className="mt-1 text-[11px] text-ink-secondary">
                        {trace.defuzzification.centroid.numerator.toFixed(2)} /{' '}
                        {trace.defuzzification.centroid.denominator.toFixed(2)}
                      </div>
                    )}
                  </div>

                  <div className="rounded border border-border bg-subtle p-3">
                    <div className="text-ink-secondary">Bisector</div>
                    <div className="mt-1 text-lg font-bold text-ink">
                      {trace.defuzzification.bisector.result.ok
                        ? `${trace.defuzzification.bisector.result.value.toFixed(2)}%`
                        : '—'}
                    </div>
                    <div className="mt-1 text-[11px] text-ink-secondary">
                      Half-area = {trace.defuzzification.bisector.halfSum.toFixed(2)}
                    </div>
                  </div>

                  <div className="rounded border border-border bg-subtle p-3">
                    <div className="text-ink-secondary">Mean of Maxima</div>
                    <div className="mt-1 text-lg font-bold text-ink">
                      {trace.defuzzification.mom.result.ok
                        ? `${trace.defuzzification.mom.result.value.toFixed(2)}%`
                        : '—'}
                    </div>
                    <div className="mt-1 text-[11px] text-ink-secondary">
                      Peak μ = {trace.defuzzification.mom.maxMu.toFixed(2)}
                    </div>
                  </div>
                </div>

                {config.resolution === 1 &&
                  trace.defuzzification.centroid.ok &&
                  trace.defuzzification.analyticCentroid.ok && (
                    <div className="rounded border border-border bg-surface p-3 text-xs text-ink-secondary">
                      <strong className="text-ink">Discrete vs. Continuous Reference:</strong> On the
                      101-point integer grid (Δy = 1), the discrete centroid is{' '}
                      <span className="font-mono font-semibold text-ink">
                        {trace.defuzzification.centroid.value.toFixed(2)}%
                      </span>
                      , while the continuous-area analytic centroid is{' '}
                      <span className="font-mono font-semibold text-ink">
                        {trace.defuzzification.analyticCentroid.value.toFixed(3)}%
                      </span>
                      . They differ slightly because the 1% grid samples the trapezoid corners as
                      discrete bars rather than continuous slopes.
                    </div>
                  )}
              </div>
            )}
          </PipelinePanel>
        </div>

        {/* Right Column: Output Summary */}
        <div className={compact ? 'lg:col-span-12' : 'xl:col-span-3'}>
          <div className="xl:sticky xl:top-20 space-y-4">
            <Card>
              <div className="border-b border-border pb-2.5 mb-3 flex items-center justify-between">
                <h2 className="font-serif text-base font-semibold text-ink">Output Summary</h2>
                {trace.dominantOutput && (
                  <Badge tone="teal">
                    {trace.dominantOutput.setName} ({trace.dominantOutput.strength.toFixed(2)})
                  </Badge>
                )}
              </div>

              <FanGauge speedPercent={selected.ok ? selected.value : null} />

              <p className="mt-4 text-sm leading-relaxed text-ink-secondary">
                {trace.explanation}
              </p>

              <div className="mt-4 border-t border-border pt-3">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => setTraceOpen(true)}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Open Algorithm Trace
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <TraceDrawer open={traceOpen} onClose={() => setTraceOpen(false)} trace={trace} />
    </div>
  );
}

