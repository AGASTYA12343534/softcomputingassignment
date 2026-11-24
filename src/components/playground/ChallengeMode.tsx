import { useMemo, useState } from 'react';
import { CheckCircle2, HelpCircle, Eye } from 'lucide-react';
import { runInference, type EngineConfig, type FuzzySystem } from '@/engine';
import { Badge, Button, Card } from '@/components/ui';

export interface ChallengeDef {
  id: string;
  difficulty: 'Starter' | 'Intermediate' | 'Advanced';
  title: string;
  prompt: string;
  hints: [string, string, string];
  solutionText: string;
  check: (
    system: FuzzySystem,
    config: EngineConfig,
    temp: number,
    hum: number
  ) => { passed: boolean; feedback: string };
}

export const CHALLENGES: ChallengeDef[] = [
  {
    id: 'ch-1',
    difficulty: 'Starter',
    title: 'Push Fan Speed Above 80%',
    prompt: 'Adjust Temperature and Humidity so the defuzzified fan speed strictly exceeds 80%.',
    hints: [
      'You need rules that point to High (R6, R8, R9) to dominate.',
      'Try setting Temperature above 32 °C and Humidity above 70 %.',
      'At Temperature = 36 °C and Humidity = 80 %, only R9 (High) fires at 1.0.',
    ],
    solutionText: 'Set Temperature ≥ 34 °C and Humidity ≥ 75 % (e.g., 36 °C, 80 % yields ~81.7%).',
    check: (sys, cfg, t, h) => {
      const tr = runInference(sys, { temperature: t, humidity: h }, cfg, { computeAnalytic: false });
      const val = tr.defuzzification.selectedResult.ok ? tr.defuzzification.selectedResult.value : 0;
      return {
        passed: val > 80,
        feedback: `Current output is ${val.toFixed(2)}% (target: > 80%).`,
      };
    },
  },
  {
    id: 'ch-2',
    difficulty: 'Intermediate',
    title: 'Activate Exactly Three Rules',
    prompt: 'Find Temperature and Humidity inputs for which exactly 3 rules fire (strength > 0).',
    hints: [
      'A variable must sit on a boundary where 1 set is active and the other variable has 2 sets active — wait: 1 × 2 = 2 rules, 2 × 2 = 4 rules!',
      'To get 3 rules, one variable must overlap 2 sets while a custom rule is removed, OR wait: with 3x3 grid rules, can you get 3? Only if you delete 1 of the 4 overlapping rules, OR use OR operator!',
      'In the Lab, either switch a rule or delete one of the 4 active rules at (18 °C, 40 %), or add a rule in Rule Builder!',
    ],
    solutionText:
      'With 2 sets active on both inputs (e.g. 18 °C, 40 %), 4 rules fire. Delete 1 of those 4 rules in Rule Builder (or add a 3rd rule when 2 fire) to get exactly 3 active rules.',
    check: (sys, cfg, t, h) => {
      const tr = runInference(sys, { temperature: t, humidity: h }, cfg, { computeAnalytic: false });
      return {
        passed: tr.activeRules.length === 3,
        feedback: `Currently ${tr.activeRules.length} rule(s) active (target: exactly 3).`,
      };
    },
  },
  {
    id: 'ch-3',
    difficulty: 'Intermediate',
    title: 'Reassign Cool + Humid to Low',
    prompt:
      'Edit rule R3 (Cool + Humid) in the Lab so its consequent is Low instead of Medium, then test at 8 °C, 85 %.',
    hints: [
      'Find R3 in the Rule Builder list or Mistake/Rule editor.',
      'Delete R3 and add a new rule: IF Temperature is Cool AND Humidity is Humid THEN Fan Speed is Low.',
      'Test with Temperature = 8 °C and Humidity = 85 % — fan speed should drop below 25%.',
    ],
    solutionText:
      'Replace R3 with Cool AND Humid -> Low; at (8 °C, 85 %), output drops from 50% to ~18.3%.',
    check: (sys, cfg, t, h) => {
      const hasCoolHumidLow = sys.rules.some(
        (r) =>
          r.consequent.setId === 'low' &&
          r.antecedents.some((a) => a.setId === 'cool') &&
          r.antecedents.some((a) => a.setId === 'humid')
      );
      const tr = runInference(sys, { temperature: t, humidity: h }, cfg, { computeAnalytic: false });
      const val = tr.defuzzification.selectedResult.ok ? tr.defuzzification.selectedResult.value : 100;
      return {
        passed: hasCoolHumidLow && val < 30,
        feedback: hasCoolHumidLow
          ? `Rule updated! Current output at (${t}°C, ${h}%) is ${val.toFixed(2)}% (need < 30%).`
          : 'No Cool + Humid -> Low rule found yet.',
      };
    },
  },
  {
    id: 'ch-4',
    difficulty: 'Advanced',
    title: 'Maximize Min vs Product AND Difference',
    prompt:
      'Find inputs where Minimum AND and Product AND differ in firing strength by at least 0.25 on an active rule.',
    hints: [
      'When one degree is 1.0, min(1, b) = b and 1 * b = b — zero difference!',
      'To maximize a - a*b where a <= b, set a = b = 0.5! Then min(0.5, 0.5) = 0.5 while 0.5 * 0.5 = 0.25.',
      'Set Temperature = 18 °C (Cool=0.5, Warm=0.5) and Humidity = 37.5 % (or 38 %: Dry=0.48, Normal=0.52).',
    ],
    solutionText:
      'At Temperature = 18 °C and Humidity = 37.5 % (or 38 %), μ = 0.5 and 0.5, giving min = 0.50 vs product = 0.25 (difference = 0.25).',
    check: (sys, _cfg, t, h) => {
      const minTr = runInference(sys, { temperature: t, humidity: h }, { andOperator: 'min' }, { computeAnalytic: false });
      const prodTr = runInference(sys, { temperature: t, humidity: h }, { andOperator: 'product' }, { computeAnalytic: false });
      let maxDiff = 0;
      for (let i = 0; i < minTr.ruleEvaluations.length; i++) {
        const diff = Math.abs(
          minTr.ruleEvaluations[i].firingStrength - (prodTr.ruleEvaluations[i]?.firingStrength ?? 0)
        );
        if (diff > maxDiff) maxDiff = diff;
      }
      return {
        passed: maxDiff >= 0.24,
        feedback: `Max rule-strength difference between min and product at (${t}°C, ${h}%) is ${maxDiff.toFixed(3)} (target: ≥ 0.24).`,
      };
    },
  },
];

export interface ChallengeModeProps {
  system: FuzzySystem;
  config: EngineConfig;
  temperature: number;
  humidity: number;
}

export function ChallengeMode({ system, config, temperature, humidity }: ChallengeModeProps) {
  const [hintLevels, setHintLevels] = useState<Record<string, number>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [checkedResults, setCheckedResults] = useState<
    Record<string, { passed: boolean; feedback: string }>
  >({});

  const results = useMemo(() => checkedResults, [checkedResults]);

  return (
    <div className="space-y-4">
      {CHALLENGES.map((ch) => {
        const res = results[ch.id];
        const hintLvl = hintLevels[ch.id] ?? 0;
        const showSol = revealed[ch.id] ?? false;

        return (
          <Card key={ch.id} className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Badge
                  tone={
                    ch.difficulty === 'Starter'
                      ? 'teal'
                      : ch.difficulty === 'Intermediate'
                        ? 'orange'
                        : 'neutral'
                  }
                >
                  {ch.difficulty}
                </Badge>
                <h3 className="font-serif text-base font-semibold text-ink">{ch.title}</h3>
              </div>
              {res?.passed && (
                <Badge tone="success">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Solved
                </Badge>
              )}
            </div>

            <p className="text-sm text-ink-secondary">{ch.prompt}</p>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() =>
                  setCheckedResults((prev) => ({
                    ...prev,
                    [ch.id]: ch.check(system, config, temperature, humidity),
                  }))
                }
              >
                Check Solution
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={hintLvl >= 3}
                onClick={() =>
                  setHintLevels((prev) => ({
                    ...prev,
                    [ch.id]: Math.min(3, (prev[ch.id] ?? 0) + 1),
                  }))
                }
              >
                <HelpCircle className="h-3.5 w-3.5" />
                {hintLvl === 0 ? 'Show Hint (1/3)' : hintLvl < 3 ? `Next Hint (${hintLvl}/3)` : 'All Hints Shown'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setRevealed((prev) => ({ ...prev, [ch.id]: !prev[ch.id] }))}
              >
                <Eye className="h-3.5 w-3.5" />
                {showSol ? 'Hide Solution' : 'Reveal Solution'}
              </Button>
            </div>

            {res && (
              <div
                className={`rounded border px-3 py-2 text-xs ${
                  res.passed
                    ? 'border-success/40 bg-success/10 text-success'
                    : 'border-warning/40 bg-warning/10 text-ink'
                }`}
              >
                {res.feedback}
              </div>
            )}

            {hintLvl > 0 && (
              <div className="space-y-1 rounded border border-border bg-subtle p-3 text-xs text-ink">
                {ch.hints.slice(0, hintLvl).map((h, i) => (
                  <div key={i}>
                    <strong className="font-mono text-teal">Hint {i + 1}:</strong> {h}
                  </div>
                ))}
              </div>
            )}

            {showSol && (
              <div className="rounded border border-teal/40 bg-teal/5 p-3 text-xs text-ink">
                <strong>Solution:</strong> {ch.solutionText}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

