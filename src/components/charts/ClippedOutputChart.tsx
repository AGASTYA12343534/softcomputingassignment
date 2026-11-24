import { useId } from 'react';
import { evaluateMF, type FuzzySet, type ImplicationOperator, type LinguisticVariable } from '@/engine';
import { getSetStyle } from './chartUtils';

export interface ClippedOutputChartProps {
  outputVar: LinguisticVariable;
  consequentSet: FuzzySet;
  firingStrength: number;
  implication: ImplicationOperator;
  ruleLabel: string;
}

const VB_W = 300;
const VB_H = 140;
const PAD_L = 32;
const PAD_R = 12;
const PAD_T = 16;
const PAD_B = 26;
const PLOT_W = VB_W - PAD_L - PAD_R;
const PLOT_H = VB_H - PAD_T - PAD_B;

export function ClippedOutputChart({
  outputVar,
  consequentSet,
  firingStrength,
  implication,
  ruleLabel,
}: ClippedOutputChartProps) {
  const patternId = useId();
  const { min, max } = outputVar;
  const span = max - min || 1;
  const toX = (y: number) => PAD_L + ((y - min) / span) * PLOT_W;
  const toY = (mu: number) => PAD_T + (1 - mu) * PLOT_H;

  const setIndex = outputVar.sets.findIndex((s) => s.id === consequentSet.id);
  const style = getSetStyle(consequentSet, setIndex >= 0 ? setIndex : 0);

  const N = 80;
  const basePts: string[] = [];
  const clippedAreaPts: string[] = [`${toX(min).toFixed(1)},${toY(0).toFixed(1)}`];

  for (let i = 0; i <= N; i++) {
    const y = min + (span * i) / N;
    const baseMu = evaluateMF(y, consequentSet.mf).value;
    const clippedMu =
      implication === 'min'
        ? Math.min(firingStrength, baseMu)
        : firingStrength * baseMu;

    basePts.push(`${toX(y).toFixed(1)},${toY(baseMu).toFixed(1)}`);
    clippedAreaPts.push(`${toX(y).toFixed(1)},${toY(clippedMu).toFixed(1)}`);
  }
  clippedAreaPts.push(`${toX(max).toFixed(1)},${toY(0).toFixed(1)}`);

  return (
    <div className="rounded border border-border bg-surface p-2.5">
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold text-ink">{ruleLabel}</span>
        <span className="font-mono tabular-nums text-teal">
          w = {firingStrength.toFixed(2)}
        </span>
      </div>
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full h-auto"
        role="img"
        aria-label={`${ruleLabel} clipped output at firing strength ${firingStrength.toFixed(2)}`}
      >
        <defs>
          <pattern
            id={patternId}
            width="6"
            height="6"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="6" stroke={style.color} strokeWidth="1.6" strokeOpacity="0.45" />
          </pattern>
        </defs>

        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={VB_H - PAD_B} stroke="#B8AF9C" strokeWidth={1} />
        <line x1={PAD_L} y1={VB_H - PAD_B} x2={VB_W - PAD_R} y2={VB_H - PAD_B} stroke="#B8AF9C" strokeWidth={1} />

        {/* Unclipped faint outline */}
        <polyline
          fill="none"
          stroke={style.color}
          strokeOpacity={0.35}
          strokeWidth={1.5}
          strokeDasharray="3 3"
          points={basePts.join(' ')}
        />

        {/* Clipped hatched polygon */}
        <polygon
          fill={`url(#${patternId})`}
          stroke={style.color}
          strokeWidth={1.8}
          points={clippedAreaPts.join(' ')}
        />

        {/* Firing strength line */}
        {firingStrength > 0 && (
          <line
            x1={PAD_L}
            y1={toY(firingStrength)}
            x2={VB_W - PAD_R}
            y2={toY(firingStrength)}
            stroke="#D9772B"
            strokeWidth={1.1}
            strokeDasharray="2 2"
          />
        )}

        <text x={PAD_L - 4} y={toY(1) + 3} textAnchor="end" fontSize={9} fontFamily="JetBrains Mono" fill="#4A5468">
          1
        </text>
        <text x={PAD_L - 4} y={toY(0) + 3} textAnchor="end" fontSize={9} fontFamily="JetBrains Mono" fill="#4A5468">
          0
        </text>
        <text x={toX(min)} y={VB_H - 8} textAnchor="start" fontSize={9} fontFamily="JetBrains Mono" fill="#4A5468">
          {min}
        </text>
        <text x={toX(max)} y={VB_H - 8} textAnchor="end" fontSize={9} fontFamily="JetBrains Mono" fill="#4A5468">
          {max}%
        </text>
      </svg>
    </div>
  );
}

