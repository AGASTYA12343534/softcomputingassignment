import { useMemo, useState } from 'react';
import { Camera } from 'lucide-react';
import { runInference, type EngineConfig, type FuzzySystem } from '@/engine';
import { Button, Card, Slider } from '@/components/ui';
import { AggregationChart } from '@/components/charts';

export interface WhatIfSimulatorProps {
  system: FuzzySystem;
  config: EngineConfig;
  currentTemp: number;
  currentHumidity: number;
}

export function WhatIfSimulator({
  system,
  config,
  currentTemp,
  currentHumidity,
}: WhatIfSimulatorProps) {
  const [beforeInputs, setBeforeInputs] = useState({
    temperature: currentTemp,
    humidity: currentHumidity,
  });
  const [afterInputs, setAfterInputs] = useState({
    temperature: Math.min(40, currentTemp + 6),
    humidity: Math.min(100, currentHumidity + 15),
  });

  const beforeTrace = useMemo(
    () => runInference(system, beforeInputs, config, { computeAnalytic: false }),
    [system, beforeInputs, config]
  );
  const afterTrace = useMemo(
    () => runInference(system, afterInputs, config, { computeAnalytic: false }),
    [system, afterInputs, config]
  );

  const bVal = beforeTrace.defuzzification.selectedResult.ok
    ? beforeTrace.defuzzification.selectedResult.value
    : null;
  const aVal = afterTrace.defuzzification.selectedResult.ok
    ? afterTrace.defuzzification.selectedResult.value
    : null;
  const delta = bVal !== null && aVal !== null ? aVal - bVal : null;

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-serif text-lg font-semibold text-ink">What-If Simulator</h3>
          <p className="text-xs text-ink-secondary">
            Snapshot a baseline (&ldquo;Before&rdquo;) and adjust &ldquo;After&rdquo; inputs to see
            exact membership, rule strength, and output deltas.
          </p>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() =>
            setBeforeInputs({ temperature: currentTemp, humidity: currentHumidity })
          }
        >
          <Camera className="h-3.5 w-3.5" />
          Snapshot Current as Before
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded border border-border bg-subtle p-3 space-y-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
            Before (Baseline Snapshot)
          </div>
          <div className="font-mono text-sm text-ink">
            T = {beforeInputs.temperature} °C · H = {beforeInputs.humidity} %
          </div>
          <div className="font-mono text-2xl font-bold text-ink">
            {bVal !== null ? `${bVal.toFixed(2)}%` : '—'}
          </div>
        </div>

        <div className="rounded border border-teal/40 bg-surface p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-teal">
              After (Experiment)
            </span>
            {delta !== null && (
              <span
                className={`font-mono text-xs font-semibold ${
                  delta >= 0 ? 'text-orange' : 'text-teal'
                }`}
              >
                {delta >= 0 ? `+${delta.toFixed(2)}%` : `${delta.toFixed(2)}%`}
              </span>
            )}
          </div>
          <Slider
            label="After Temp"
            value={afterInputs.temperature}
            min={0}
            max={40}
            step={0.5}
            unit="°C"
            onChange={(t) => setAfterInputs((p) => ({ ...p, temperature: t }))}
          />
          <Slider
            label="After Humidity"
            value={afterInputs.humidity}
            min={0}
            max={100}
            step={1}
            unit="%"
            onChange={(h) => setAfterInputs((p) => ({ ...p, humidity: h }))}
          />
          <div className="font-mono text-2xl font-bold text-teal">
            {aVal !== null ? `${aVal.toFixed(2)}%` : '—'}
          </div>
        </div>
      </div>

      <AggregationChart
        outputVar={system.output}
        samples={afterTrace.aggregatedSamples}
        compareSamples={beforeTrace.aggregatedSamples}
        markers={[
          ...(bVal !== null ? [{ label: 'Before', value: bVal, color: '#4A5468', dash: '4 3' }] : []),
          ...(aVal !== null ? [{ label: 'After', value: aVal, color: '#D9772B' }] : []),
        ]}
        title="Aggregated Envelope: Before (dashed) vs After (solid)"
      />
    </Card>
  );
}

