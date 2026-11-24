import { useEffect, useMemo } from 'react';
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { ROOM_FAN_SYSTEM, runInference } from '@/engine';
import { useSimulationStore, type WalkthroughStage } from '@/state/simulationStore';
import { Button, Card, FormulaBlock, Stepper } from '@/components/ui';
import {
  AggregationChart,
  ClippedOutputChart,
  FanGauge,
  MembershipChart,
} from '@/components/charts';

const STAGE_STEPS = [
  { id: 1, label: 'Inputs' },
  { id: 2, label: 'Fuzzify' },
  { id: 3, label: 'Rules' },
  { id: 4, label: 'Imply' },
  { id: 5, label: 'Aggregate' },
  { id: 6, label: 'Defuzzify' },
  { id: 7, label: 'Output' },
];

export function WalkthroughPlayer() {
  const {
    temperature,
    humidity,
    config,
    walkthroughStage,
    isPlaying,
    playbackSpeed,
    setWalkthroughStage,
    nextStage,
    prevStage,
    togglePlay,
    setPlaying,
    setPlaybackSpeed,
    resetWalkthrough,
  } = useSimulationStore();

  const trace = useMemo(
    () => runInference(ROOM_FAN_SYSTEM, { temperature, humidity }, config),
    [temperature, humidity, config]
  );

  const stageMeta = useMemo(() => {
    const tempFuzz = trace.fuzzified[0];
    const humFuzz = trace.fuzzified[1];
    const selected = trace.defuzzification.selectedResult;

    switch (walkthroughStage) {
      case 1:
        return {
          title: 'Stage 1: Input Collection',
          what: 'The controller reads crisp sensor measurements for Temperature and Humidity.',
          why: 'Real sensors output exact numbers, which we must capture before translating them into fuzzy concepts.',
          latex: 'x_1 = T \\in [0, 40]\\text{ °C}, \\quad x_2 = H \\in [0, 100]\\%',
          values: `Temperature = ${temperature} °C, Humidity = ${humidity} %`,
          plain: `We start with two exact readings: a room temperature of ${temperature} °C and relative humidity of ${humidity} %.`,
        };
      case 2:
        return {
          title: 'Stage 2: Fuzzification',
          what: 'Each crisp input is evaluated against its linguistic membership functions.',
          why: 'A single value like 45 % humidity can partially belong to both Dry and Normal at the same time.',
          latex: '\\mu_A(x) \\in [0, 1]',
          values: [
            ...tempFuzz.memberships.map((m) => `T:${m.setName}=${m.degree.toFixed(2)}`),
            ...humFuzz.memberships.map((m) => `H:${m.setName}=${m.degree.toFixed(2)}`),
          ].join(' · '),
          plain: `${temperature} °C and ${humidity} % are converted into degrees between 0 and 1 for Cool/Warm/Hot and Dry/Normal/Humid.`,
        };
      case 3:
        return {
          title: 'Stage 3: Rule Evaluation',
          what: 'Every IF–THEN rule combines its antecedent membership degrees to compute a firing strength.',
          why: 'Rules whose conditions match the current room state more strongly should have more influence on the fan speed.',
          latex:
            config.andOperator === 'min'
              ? 'w_i = \\min(\\mu_{A_i}(T), \\mu_{B_i}(H))'
              : 'w_i = \\mu_{A_i}(T) \\cdot \\mu_{B_i}(H)',
          values:
            trace.activeRules.length > 0
              ? trace.activeRules
                  .map((r) => `${r.rule.id} (${r.consequentSetName}) = ${r.firingStrength.toFixed(2)}`)
                  .join(', ')
              : 'No rules active (all w_i = 0)',
          plain: `${trace.activeRules.length} of 9 rules fired with strength > 0 using the ${config.andOperator} operator.`,
        };
      case 4:
        return {
          title: 'Stage 4: Implication',
          what: 'Each active rule shapes its output fuzzy set by clipping (or scaling) it at its firing strength.',
          why: 'A rule with strength 0.2 should only contribute 20% of the height of its consequent set.',
          latex: '\\mu_{\\text{clipped}, i}(y) = \\min(w_i, \\mu_{C_i}(y))',
          values: trace.activeRules
            .map((r) => `${r.rule.id} clips ${r.consequentSetName} at ${r.firingStrength.toFixed(2)}`)
            .join('; ') || 'No active sets to clip',
          plain: 'We slice the top off each active rule’s output shape at its firing strength w_i.',
        };
      case 5:
        return {
          title: 'Stage 5: Aggregation',
          what: 'All clipped output shapes are merged into one combined envelope using pointwise maximum.',
          why: 'The controller needs a single unified fuzzy recommendation before choosing a final speed.',
          latex: '\\mu_{\\text{agg}}(y) = \\max_i \\mu_{\\text{clipped}, i}(y)',
          values: `Peak aggregated μ = ${trace.defuzzification.mom.maxMu.toFixed(2)} across ${trace.aggregatedSamples.length} sample points`,
          plain: 'We lay all clipped shapes on top of each other and trace the highest outer boundary.',
        };
      case 6:
        return {
          title: 'Stage 6: Defuzzification',
          what: 'The aggregated fuzzy shape is reduced to a single crisp number.',
          why: 'A physical fan motor cannot run at "mostly Medium"; it needs a specific percentage.',
          latex: 'y^* = \\frac{\\sum y \\cdot \\mu_{\\text{agg}}(y)}{\\sum \\mu_{\\text{agg}}(y)}',
          values: selected.ok
            ? `${config.defuzzMethod.toUpperCase()} y* = ${selected.value.toFixed(2)}% (num=${selected.numerator.toFixed(2)}, den=${selected.denominator.toFixed(2)})`
            : selected.reason,
          plain: selected.ok
            ? `Computing the balance point of the shaded region gives ${selected.value.toFixed(2)}%.`
            : 'Because the area is zero, no crisp output can be calculated.',
        };
      case 7:
        return {
          title: 'Stage 7: Final Output',
          what: 'The crisp fan speed is sent to the actuator alongside a human-readable summary.',
          why: 'Closing the loop turns fuzzy human rules into smooth, predictable physical control.',
          latex: '\\text{Fan Speed} = y^*',
          values: selected.ok
            ? `Final Fan Speed = ${selected.value.toFixed(2)}% (${trace.dominantOutput?.setName ?? 'N/A'})`
            : 'No output',
          plain: trace.explanation,
        };
    }
  }, [walkthroughStage, trace, temperature, humidity, config]);

  // Auto-play timer proportional to explanation length
  useEffect(() => {
    if (!isPlaying) return;
    const textLen = stageMeta.what.length + stageMeta.why.length + stageMeta.plain.length;
    const baseMs = Math.max(2200, Math.min(5500, textLen * 22));
    const timer = window.setTimeout(() => {
      if (walkthroughStage >= 7) {
        setPlaying(false);
      } else {
        nextStage();
      }
    }, baseMs / playbackSpeed);

    return () => window.clearTimeout(timer);
  }, [isPlaying, walkthroughStage, playbackSpeed, stageMeta, nextStage, setPlaying]);

  // Keyboard shortcuts: Space (play/pause), Left/Right arrows, R (reset)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextStage();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStage();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        resetWalkthrough();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [togglePlay, nextStage, prevStage, resetWalkthrough]);

  const selected = trace.defuzzification.selectedResult;

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div>
          <h3 className="font-serif text-lg font-semibold text-ink">
            Step-by-Step Inference Walkthrough
          </h3>
          <p className="text-xs text-ink-secondary">
            Shortcuts: <kbd className="rounded border border-border px-1 font-mono">Space</kbd> play/pause ·{' '}
            <kbd className="rounded border border-border px-1 font-mono">←</kbd>{' '}
            <kbd className="rounded border border-border px-1 font-mono">→</kbd> step ·{' '}
            <kbd className="rounded border border-border px-1 font-mono">R</kbd> reset
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="secondary" onClick={prevStage} disabled={walkthroughStage === 1} aria-label="Previous stage">
            <SkipBack className="h-3.5 w-3.5" />
            Prev
          </Button>
          <Button size="sm" variant="primary" onClick={togglePlay}>
            {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {isPlaying ? 'Pause' : 'Play'}
          </Button>
          <Button size="sm" variant="secondary" onClick={nextStage} disabled={walkthroughStage === 7} aria-label="Next stage">
            Next
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="ghost" onClick={resetWalkthrough} aria-label="Reset walkthrough">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <select
            aria-label="Playback speed"
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value) as 0.75 | 1 | 1.5 | 2)}
            className="rounded border border-border-strong bg-surface px-2 py-1 font-mono text-xs text-ink"
          >
            <option value={0.75}>0.75x</option>
            <option value={1}>1x</option>
            <option value={1.5}>1.5x</option>
            <option value={2}>2x</option>
          </select>
        </div>
      </div>

      <Stepper
        steps={STAGE_STEPS}
        currentStep={walkthroughStage}
        onStepClick={(s) => setWalkthroughStage(s as WalkthroughStage)}
      />

      <div className="grid gap-5 lg:grid-cols-12">
        {/* 5 required explanation blocks */}
        <div className="lg:col-span-6 space-y-3 text-sm">
          <h4 className="font-serif text-base font-semibold text-teal">{stageMeta.title}</h4>
          <div className="rounded border border-border bg-subtle p-3 space-y-2">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                What is happening:
              </span>
              <p className="text-ink">{stageMeta.what}</p>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
                Why it is happening:
              </span>
              <p className="text-ink">{stageMeta.why}</p>
            </div>
          </div>

          <FormulaBlock latex={stageMeta.latex} />

          <div className="rounded border border-border bg-surface p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Actual Values from Trace
            </div>
            <p className="mt-1 font-mono text-xs text-ink">{stageMeta.values}</p>
          </div>

          <div className="rounded border-l-4 border-l-teal border border-border bg-surface p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-teal">
              Plain-Language Explanation
            </div>
            <p className="mt-1 text-ink">{stageMeta.plain}</p>
          </div>
        </div>

        {/* Stage Visual */}
        <div className="lg:col-span-6 rounded border border-border bg-subtle/40 p-4 flex flex-col justify-center">
          {(walkthroughStage === 1 || walkthroughStage === 2) && (
            <div className="space-y-3">
              <MembershipChart
                variable={ROOM_FAN_SYSTEM.inputs[0]}
                currentValue={temperature}
                title="Temperature"
              />
              <MembershipChart
                variable={ROOM_FAN_SYSTEM.inputs[1]}
                currentValue={humidity}
                title="Humidity"
              />
            </div>
          )}

          {walkthroughStage === 3 && (
            <div className="space-y-1.5">
              {trace.ruleEvaluations.map((re) => (
                <div
                  key={re.rule.id}
                  className={`flex items-center justify-between rounded border px-3 py-1.5 text-xs ${
                    re.activated
                      ? 'border-teal bg-teal/10 font-medium text-ink'
                      : 'border-border bg-surface text-ink-secondary opacity-50'
                  }`}
                >
                  <span>
                    <strong className="font-mono">{re.rule.id}</strong>: {re.rule.name}
                  </span>
                  <span className="font-mono">{re.firingStrength.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}

          {walkthroughStage === 4 && (
            <div className="grid gap-2.5 sm:grid-cols-2">
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

          {(walkthroughStage === 5 || walkthroughStage === 6) && (
            <AggregationChart
              outputVar={ROOM_FAN_SYSTEM.output}
              samples={trace.aggregatedSamples}
              markers={
                walkthroughStage === 6 && selected.ok
                  ? [{ label: config.defuzzMethod.toUpperCase(), value: selected.value, color: '#D9772B' }]
                  : []
              }
              title={walkthroughStage === 5 ? 'Aggregated Envelope' : 'Defuzzified Output'}
            />
          )}

          {walkthroughStage === 7 && (
            <div className="space-y-4">
              <FanGauge speedPercent={selected.ok ? selected.value : null} />
              <AggregationChart
                outputVar={ROOM_FAN_SYSTEM.output}
                samples={trace.aggregatedSamples}
                markers={
                  selected.ok
                    ? [{ label: 'Final', value: selected.value, color: '#D9772B' }]
                    : []
                }
              />
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

