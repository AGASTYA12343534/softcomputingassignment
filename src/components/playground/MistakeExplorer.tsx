import { useMemo } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { ROOM_FAN_SYSTEM, runInference, type EngineConfig, type FuzzySystem } from '@/engine';
import { Badge, Button, Card } from '@/components/ui';

export interface MistakePreset {
  id: string;
  title: string;
  summary: string;
  consequence: string;
  suggestedTemp: number;
  suggestedHumidity: number;
  mutate: (base: FuzzySystem) => { system: FuzzySystem; config?: Partial<EngineConfig> };
}

export const MISTAKE_PRESETS: MistakePreset[] = [
  {
    id: 'inverted-rule',
    title: 'Inverted Rule: Hot + Humid -> Low',
    summary: 'Rule R9 is accidentally mapped to Low fan speed instead of High.',
    consequence:
      'On a sweltering 36 °C, 85 % day, the fan slows down instead of speeding up, making the room hotter.',
    suggestedTemp: 36,
    suggestedHumidity: 85,
    mutate: (base) => {
      const copy: FuzzySystem = JSON.parse(JSON.stringify(base));
      const r9 = copy.rules.find((r) => r.id === 'R9');
      if (r9) {
        r9.consequent.setId = 'low';
        r9.name = 'Hot + Humid -> Low (MISTAKE)';
      }
      return { system: copy };
    },
  },
  {
    id: 'missing-rule',
    title: 'Missing Rule: Delete R5 (Warm + Normal)',
    summary: 'The central rule R5 (Warm + Normal -> Medium) is omitted from the rule base.',
    consequence:
      'At 24 °C and 50 % humidity, NO rule fires at all! The aggregated area drops to zero and defuzzification fails.',
    suggestedTemp: 24,
    suggestedHumidity: 50,
    mutate: (base) => {
      const copy: FuzzySystem = JSON.parse(JSON.stringify(base));
      copy.rules = copy.rules.filter((r) => r.id !== 'R5');
      return { system: copy };
    },
  },
  {
    id: 'coverage-gap',
    title: 'Coverage Gap in Temperature Sets',
    summary: 'Cool ends at 14 °C and Warm starts at 18 °C, leaving [14, 18] °C uncovered.',
    consequence:
      'Any room temperature between 14 °C and 18 °C has μ = 0 for every temperature set, causing a dead zone.',
    suggestedTemp: 16,
    suggestedHumidity: 50,
    mutate: (base) => {
      const copy: FuzzySystem = JSON.parse(JSON.stringify(base));
      const temp = copy.inputs[0];
      temp.sets[0].mf = { type: 'trapezoidal', a: 0, b: 0, c: 10, d: 14 };
      temp.sets[1].mf = { type: 'triangular', a: 18, b: 24, c: 36 };
      return { system: copy };
    },
  },
  {
    id: 'swapped-and-or',
    title: 'Swapped AND for OR in Rules',
    summary: 'All nine rules use OR (max) instead of AND (min).',
    consequence:
      'Even at 0 °C (Cool=1, Dry=1), rules with Cool OR Humid fire at 1.0, flooding the output with Medium and Low simultaneously.',
    suggestedTemp: 0,
    suggestedHumidity: 0,
    mutate: (base) => {
      const copy: FuzzySystem = JSON.parse(JSON.stringify(base));
      copy.rules = copy.rules.map((r) => ({ ...r, operator: 'OR' }));
      return { system: copy };
    },
  },
];

export interface MistakeExplorerProps {
  activeMistakeId: string | null;
  currentSystem: FuzzySystem;
  currentConfig: EngineConfig;
  temperature: number;
  humidity: number;
  onApplyMistake: (
    id: string,
    sys: FuzzySystem,
    cfg: Partial<EngineConfig> | undefined,
    t: number,
    h: number
  ) => void;
  onRestore: () => void;
}

export function MistakeExplorer({
  activeMistakeId,
  currentSystem,
  currentConfig,
  temperature,
  humidity,
  onApplyMistake,
  onRestore,
}: MistakeExplorerProps) {
  const baselineTrace = useMemo(
    () => runInference(ROOM_FAN_SYSTEM, { temperature, humidity }, {}, { computeAnalytic: false }),
    [temperature, humidity]
  );
  const currentTrace = useMemo(
    () => runInference(currentSystem, { temperature, humidity }, currentConfig, { computeAnalytic: false }),
    [currentSystem, currentConfig, temperature, humidity]
  );

  const baseVal = baselineTrace.defuzzification.selectedResult.ok
    ? `${baselineTrace.defuzzification.selectedResult.value.toFixed(2)}%`
    : 'Empty';
  const currVal = currentTrace.defuzzification.selectedResult.ok
    ? `${currentTrace.defuzzification.selectedResult.value.toFixed(2)}%`
    : 'No output (area = 0)';

  const activePreset = MISTAKE_PRESETS.find((m) => m.id === activeMistakeId);

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-serif text-lg font-semibold text-ink">Mistake Explorer</h3>
          <p className="text-xs text-ink-secondary">
            Apply a deliberate design mistake with one click to observe how fuzzy controllers fail.
          </p>
        </div>
        <Button size="sm" variant="primary" onClick={onRestore}>
          <RotateCcw className="h-3.5 w-3.5" />
          Restore Correct System
        </Button>
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {MISTAKE_PRESETS.map((m) => {
          const selected = activeMistakeId === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                const res = m.mutate(ROOM_FAN_SYSTEM);
                onApplyMistake(m.id, res.system, res.config, m.suggestedTemp, m.suggestedHumidity);
              }}
              className={`rounded border p-3 text-left text-xs transition-colors ${
                selected
                  ? 'border-error bg-error/10 text-ink'
                  : 'border-border bg-surface hover:bg-subtle'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-ink">{m.title}</span>
                {selected && <Badge tone="error">Active</Badge>}
              </div>
              <p className="mt-1 text-ink-secondary">{m.summary}</p>
            </button>
          );
        })}
      </div>

      {activePreset && (
        <div className="rounded border border-error/40 bg-error/5 p-3 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-error">
            <AlertTriangle className="h-4 w-4" />
            <span>What went wrong: {activePreset.title}</span>
          </div>
          <p className="text-ink">{activePreset.consequence}</p>
          <div className="flex flex-wrap gap-4 font-mono pt-1">
            <span>
              Correct baseline ({temperature}°C, {humidity}%): <strong>{baseVal}</strong>
            </span>
            <span>
              Broken system: <strong className="text-error">{currVal}</strong>
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

