import { useMemo, useState } from 'react';
import {
  evaluateMF,
  fuzzifySystem,
  ROOM_FAN_SYSTEM,
  runInference,
  TEMPERATURE_VAR,
  type FuzzyRule,
} from '@/engine';
import { Button, Card, SegmentedControl, Slider } from '@/components/ui';
import { AggregationChart, ClippedOutputChart, MembershipChart } from '@/components/charts';
import { MFPlayground } from '@/components/playground/MFPlayground';
import { RuleBuilder } from '@/components/playground/RuleBuilder';
import { ControllerWorkspace } from '@/components/controller/ControllerWorkspace';
import { WalkthroughPlayer } from '@/components/simulation/WalkthroughPlayer';

/* Module 1: Boolean threshold vs Smooth Fuzzy Warmth */
export function Module1Activity() {
  const [temp, setTemp] = useState(21.5);
  const warmSet = TEMPERATURE_VAR.sets[1];
  const fuzzyWarm = evaluateMF(temp, warmSet.mf).value;
  const boolWarm = temp >= 22;

  return (
    <Card className="space-y-4">
      <h3 className="font-serif text-lg font-semibold text-ink">
        Activity: Crisp Threshold vs. Gradual Warmth
      </h3>
      <Slider
        label="Room Temperature"
        value={temp}
        min={0}
        max={40}
        step={0.5}
        unit="°C"
        onChange={setTemp}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded border border-border bg-subtle p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            Boolean Logic (Threshold ≥ 22 °C)
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-ink">
            {boolWarm ? '1 (WARM)' : '0 (NOT WARM)'}
          </div>
          <p className="mt-1 text-xs text-ink-secondary">
            Notice how moving from 21.5 °C to 22.0 °C causes an abrupt 0 → 1 jump.
          </p>
        </div>
        <div className="rounded border border-teal/40 bg-surface p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-teal">
            Fuzzy Logic (Warm Triangle)
          </div>
          <div className="mt-2 font-mono text-2xl font-bold text-teal">
            μ = {fuzzyWarm.toFixed(3)}
          </div>
          <div className="mt-2 h-2 w-full rounded-xs bg-subtle overflow-hidden border border-border">
            <div className="h-full bg-teal transition-all" style={{ width: `${fuzzyWarm * 100}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-ink-secondary">
            Membership rises smoothly from 0 at 12 °C to 1 at 24 °C without sudden jumps.
          </p>
        </div>
      </div>
    </Card>
  );
}

/* Module 2: Probability vs Membership Sorting Exercise */
const SORT_ITEMS = [
  {
    id: 's1',
    text: 'There is a 30% chance it will rain tomorrow afternoon.',
    answer: 'probability' as const,
    why: 'Rain either happens or does not; 30% measures uncertainty about a future crisp event.',
  },
  {
    id: 's2',
    text: 'A 19 °C room has membership 0.58 in the fuzzy set Warm.',
    answer: 'fuzzy' as const,
    why: 'We already know the exact temperature (19 °C); 0.58 measures how well it fits the vague label Warm.',
  },
  {
    id: 's3',
    text: 'A glass filled halfway has 0.5 membership in the set Full Glass.',
    answer: 'fuzzy' as const,
    why: 'Nothing is random—we can see the water level; 0.5 describes partial fullness.',
  },
  {
    id: 's4',
    text: 'A coin flip has a 0.50 likelihood of landing on heads.',
    answer: 'probability' as const,
    why: 'After the flip, the coin is 100% heads or 100% tails; 0.50 is pre-outcome randomness.',
  },
];

export function Module2Activity() {
  const [answers, setAnswers] = useState<Record<string, 'probability' | 'fuzzy'>>({});

  return (
    <Card className="space-y-4">
      <h3 className="font-serif text-lg font-semibold text-ink">
        Activity: Probability vs. Fuzzy Membership
      </h3>
      <p className="text-xs text-ink-secondary">
        Classify each statement as either Probability (randomness) or Fuzzy Membership (vagueness).
      </p>
      <div className="space-y-3">
        {SORT_ITEMS.map((item) => {
          const chosen = answers[item.id];
          const correct = chosen === item.answer;
          return (
            <div key={item.id} className="rounded border border-border bg-surface p-3 space-y-2">
              <p className="text-sm text-ink">{item.text}</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant={chosen === 'probability' ? 'primary' : 'secondary'}
                  onClick={() => setAnswers((p) => ({ ...p, [item.id]: 'probability' }))}
                >
                  Probability
                </Button>
                <Button
                  size="sm"
                  variant={chosen === 'fuzzy' ? 'primary' : 'secondary'}
                  onClick={() => setAnswers((p) => ({ ...p, [item.id]: 'fuzzy' }))}
                >
                  Fuzzy Membership
                </Button>
              </div>
              {chosen && (
                <p className={`text-xs ${correct ? 'text-success' : 'text-error'}`}>
                  <strong>{correct ? 'Correct:' : 'Incorrect:'}</strong> {item.why}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

/* Module 4: Live Fuzzification of Temperature & Humidity */
export function Module4Activity() {
  const [temp, setTemp] = useState(24);
  const [hum, setHum] = useState(45);
  const fuzzified = useMemo(
    () => fuzzifySystem(ROOM_FAN_SYSTEM, { temperature: temp, humidity: hum }),
    [temp, hum]
  );

  return (
    <Card className="space-y-4">
      <h3 className="font-serif text-lg font-semibold text-ink">
        Activity: Live Fuzzification Calculator
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="Temperature" value={temp} min={0} max={40} step={0.5} unit="°C" onChange={setTemp} />
        <Slider label="Humidity" value={hum} min={0} max={100} step={1} unit="%" onChange={setHum} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <MembershipChart variable={ROOM_FAN_SYSTEM.inputs[0]} currentValue={temp} />
        <MembershipChart variable={ROOM_FAN_SYSTEM.inputs[1]} currentValue={hum} />
      </div>
      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full border-collapse text-xs font-mono">
          <thead className="bg-subtle text-ink-secondary">
            <tr>
              <th className="px-3 py-2 text-left">Variable</th>
              <th className="px-3 py-2 text-left">Set</th>
              <th className="px-3 py-2 text-right">μ</th>
              <th className="px-3 py-2 text-left">Branch & Arithmetic</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {fuzzified.flatMap((fv) =>
              fv.memberships.map((m) => (
                <tr key={`${fv.variableId}-${m.setId}`} className={m.degree > 0 ? 'bg-teal/5' : ''}>
                  <td className="px-3 py-1.5 font-sans font-medium">{fv.variableName}</td>
                  <td className="px-3 py-1.5 font-sans">{m.setName}</td>
                  <td className="px-3 py-1.5 text-right font-semibold">{m.degree.toFixed(3)}</td>
                  <td className="px-3 py-1.5 text-ink-secondary">{m.arithmetic}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* Module 5: Interactive Rule Builder */
export function Module5Activity() {
  const [temp, setTemp] = useState(24);
  const [hum, setHum] = useState(45);
  const [rules, setRules] = useState<FuzzyRule[]>(ROOM_FAN_SYSTEM.rules.slice(0, 3));

  return (
    <div className="space-y-4">
      <Card className="grid gap-4 sm:grid-cols-2">
        <Slider label="Temperature" value={temp} min={0} max={40} step={0.5} unit="°C" onChange={setTemp} />
        <Slider label="Humidity" value={hum} min={0} max={100} step={1} unit="%" onChange={setHum} />
      </Card>
      <RuleBuilder
        system={{ ...ROOM_FAN_SYSTEM, rules }}
        inputs={{ temperature: temp, humidity: hum }}
        onAddRule={(r) => setRules((prev) => [...prev, r])}
        onDeleteRule={(id) => setRules((prev) => prev.filter((x) => x.id !== id))}
      />
    </div>
  );
}

/* Module 6: Compare Minimum vs Product AND */
export function Module6Activity() {
  const [temp, setTemp] = useState(18);
  const [hum, setHum] = useState(40);
  const [op, setOp] = useState<'min' | 'product'>('min');

  const minTrace = useMemo(
    () => runInference(ROOM_FAN_SYSTEM, { temperature: temp, humidity: hum }, { andOperator: 'min' }, { computeAnalytic: false }),
    [temp, hum]
  );
  const prodTrace = useMemo(
    () => runInference(ROOM_FAN_SYSTEM, { temperature: temp, humidity: hum }, { andOperator: 'product' }, { computeAnalytic: false }),
    [temp, hum]
  );
  const activeTrace = op === 'min' ? minTrace : prodTrace;

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-serif text-lg font-semibold text-ink">
          Activity: Minimum vs. Product AND
        </h3>
        <SegmentedControl
          ariaLabel="AND operator comparison"
          size="sm"
          value={op}
          onChange={setOp}
          options={[
            { value: 'min', label: 'Minimum (min)' },
            { value: 'product', label: 'Product (a · b)' },
          ]}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="Temperature" value={temp} min={0} max={40} step={0.5} unit="°C" onChange={setTemp} />
        <Slider label="Humidity" value={hum} min={0} max={100} step={1} unit="%" onChange={setHum} />
      </div>
      <div className="overflow-x-auto rounded border border-border">
        <table className="w-full border-collapse text-xs font-mono">
          <thead className="bg-subtle text-ink-secondary">
            <tr>
              <th className="px-3 py-2 text-left">Rule</th>
              <th className="px-3 py-2 text-right">Min Strength</th>
              <th className="px-3 py-2 text-right">Product Strength</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {minTrace.ruleEvaluations.map((re, i) => {
              const prod = prodTrace.ruleEvaluations[i];
              return (
                <tr key={re.rule.id} className={re.activated ? 'bg-teal/5' : 'opacity-60'}>
                  <td className="px-3 py-1.5 font-sans">
                    <strong>{re.rule.id}</strong>: {re.rule.name}
                  </td>
                  <td className="px-3 py-1.5 text-right">{re.firingStrength.toFixed(3)}</td>
                  <td className="px-3 py-1.5 text-right">{prod.firingStrength.toFixed(3)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {activeTrace.activeRules.map((re) => {
          const cSet = ROOM_FAN_SYSTEM.output.sets.find((s) => s.id === re.rule.consequent.setId)!;
          return (
            <ClippedOutputChart
              key={re.rule.id}
              outputVar={ROOM_FAN_SYSTEM.output}
              consequentSet={cSet}
              firingStrength={re.firingStrength}
              implication="min"
              ruleLabel={`${re.rule.id} (${op})`}
            />
          );
        })}
      </div>
    </Card>
  );
}

/* Module 7: Aggregation Envelope Explorer */
export function Module7Activity() {
  const [temp, setTemp] = useState(24);
  const [hum, setHum] = useState(45);
  const trace = useMemo(
    () => runInference(ROOM_FAN_SYSTEM, { temperature: temp, humidity: hum }, {}, { computeAnalytic: false }),
    [temp, hum]
  );

  return (
    <Card className="space-y-4">
      <h3 className="font-serif text-lg font-semibold text-ink">
        Activity: Watch Clipped Outputs Merge
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="Temperature" value={temp} min={0} max={40} step={0.5} unit="°C" onChange={setTemp} />
        <Slider label="Humidity" value={hum} min={0} max={100} step={1} unit="%" onChange={setHum} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {trace.activeRules.map((re) => {
          const cSet = ROOM_FAN_SYSTEM.output.sets.find((s) => s.id === re.rule.consequent.setId)!;
          return (
            <ClippedOutputChart
              key={re.rule.id}
              outputVar={ROOM_FAN_SYSTEM.output}
              consequentSet={cSet}
              firingStrength={re.firingStrength}
              implication="min"
              ruleLabel={`${re.rule.id}: ${re.consequentSetName}`}
            />
          );
        })}
      </div>
      <AggregationChart
        outputVar={ROOM_FAN_SYSTEM.output}
        samples={trace.aggregatedSamples}
        title="Pointwise Maximum Envelope"
      />
    </Card>
  );
}

/* Module 8: Compare Centroid, Bisector, and MoM */
export function Module8Activity() {
  const [temp, setTemp] = useState(24);
  const [hum, setHum] = useState(45);
  const trace = useMemo(
    () => runInference(ROOM_FAN_SYSTEM, { temperature: temp, humidity: hum }, {}, { computeAnalytic: false }),
    [temp, hum]
  );

  const markers = [];
  if (trace.defuzzification.centroid.ok) {
    markers.push({ label: 'Centroid', value: trace.defuzzification.centroid.value, color: '#D9772B' });
  }
  if (trace.defuzzification.bisector.result.ok) {
    markers.push({ label: 'Bisector', value: trace.defuzzification.bisector.result.value, color: '#2A7F82', dash: '4 3' });
  }
  if (trace.defuzzification.mom.result.ok) {
    markers.push({ label: 'MoM', value: trace.defuzzification.mom.result.value, color: '#14213D', dash: '2 2' });
  }

  return (
    <Card className="space-y-4">
      <h3 className="font-serif text-lg font-semibold text-ink">
        Activity: Compare Three Defuzzification Methods
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slider label="Temperature" value={temp} min={0} max={40} step={0.5} unit="°C" onChange={setTemp} />
        <Slider label="Humidity" value={hum} min={0} max={100} step={1} unit="%" onChange={setHum} />
      </div>
      <AggregationChart
        outputVar={ROOM_FAN_SYSTEM.output}
        samples={trace.aggregatedSamples}
        markers={markers}
      />
      <div className="grid gap-3 sm:grid-cols-3 text-xs">
        <div className="rounded border border-border bg-subtle p-3">
          <div className="font-semibold text-orange">Centroid (CoA)</div>
          <div className="mt-1 font-mono text-lg font-bold">
            {trace.defuzzification.centroid.ok ? `${trace.defuzzification.centroid.value.toFixed(2)}%` : '—'}
          </div>
          <p className="mt-1 text-ink-secondary">Best for smooth, proportional control.</p>
        </div>
        <div className="rounded border border-border bg-subtle p-3">
          <div className="font-semibold text-teal">Bisector (BoA)</div>
          <div className="mt-1 font-mono text-lg font-bold">
            {trace.defuzzification.bisector.result.ok ? `${trace.defuzzification.bisector.result.value.toFixed(2)}%` : '—'}
          </div>
          <p className="mt-1 text-ink-secondary">Splits total area into two equal halves.</p>
        </div>
        <div className="rounded border border-border bg-subtle p-3">
          <div className="font-semibold text-ink">Mean of Maxima (MoM)</div>
          <div className="mt-1 font-mono text-lg font-bold">
            {trace.defuzzification.mom.result.ok ? `${trace.defuzzification.mom.result.value.toFixed(2)}%` : '—'}
          </div>
          <p className="mt-1 text-ink-secondary">Best when choosing the most plausible peak.</p>
        </div>
      </div>
    </Card>
  );
}

export function ModuleActivityRenderer({ activityId }: { activityId: string }) {
  switch (activityId) {
    case 'm1':
      return <Module1Activity />;
    case 'm2':
      return <Module2Activity />;
    case 'm3':
      return <MFPlayground />;
    case 'm4':
      return <Module4Activity />;
    case 'm5':
      return <Module5Activity />;
    case 'm6':
      return <Module6Activity />;
    case 'm7':
      return <Module7Activity />;
    case 'm8':
      return <Module8Activity />;
    case 'm9':
      return (
        <div className="space-y-6">
          <WalkthroughPlayer />
          <ControllerWorkspace compact />
        </div>
      );
    default:
      return null;
  }
}
