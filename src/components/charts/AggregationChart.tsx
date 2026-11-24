import { useId } from 'react';
import { evaluateMF, type LinguisticVariable, type SamplePoint } from '@/engine';
import { getSetStyle } from './chartUtils';

export interface DefuzzMarker {
  label: string;
  value: number;
  color: string;
  dash?: string;
}

export interface AggregationChartProps {
  outputVar: LinguisticVariable;
  samples: SamplePoint[];
  compareSamples?: SamplePoint[];
  markers?: DefuzzMarker[];
  dark?: boolean;
  title?: string;
}

const VB_W = 520;
const VB_H = 220;
const PAD_L = 42;
const PAD_R = 16;
const PAD_T = 26;
const PAD_B = 34;
const PLOT_W = VB_W - PAD_L - PAD_R;
const PLOT_H = VB_H - PAD_T - PAD_B;

export function AggregationChart({
  outputVar,
  samples,
  compareSamples,
  markers = [],
  dark = false,
  title,
}: AggregationChartProps) {
  const patternId = useId();
  const { min, max, unit, sets, name } = outputVar;
  const span = max - min || 1;
  const toX = (y: number) => PAD_L + ((y - min) / span) * PLOT_W;
  const toY = (mu: number) => PAD_T + (1 - mu) * PLOT_H;

  const gridColor = dark ? 'rgba(255,255,255,0.12)' : '#E8E2D5';
  const axisText = dark ? 'rgba(255,255,255,0.72)' : '#4A5468';

  const areaPts: string[] = [`${toX(min).toFixed(1)},${toY(0).toFixed(1)}`];
  for (const pt of samples) {
    areaPts.push(`${toX(pt.y).toFixed(1)},${toY(pt.mu).toFixed(1)}`);
  }
  areaPts.push(`${toX(max).toFixed(1)},${toY(0).toFixed(1)}`);

  const compareLinePts = compareSamples
    ? compareSamples.map((pt) => `${toX(pt.y).toFixed(1)},${toY(pt.mu).toFixed(1)}`).join(' ')
    : null;

  const xTicks = [0, 20, 40, 50, 60, 80, 100].filter((v) => v >= min && v <= max);
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <figure className="w-full">
      {title && (
        <figcaption
          className={`mb-1.5 text-xs font-semibold uppercase tracking-wider ${
            dark ? 'text-white/80' : 'text-ink-secondary'
          }`}
        >
          {title}
        </figcaption>
      )}
      <svg
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full h-auto select-none"
        role="img"
        aria-label={`Aggregated fuzzy output for ${name}`}
      >
        <defs>
          <pattern
            id={patternId}
            width="7"
            height="7"
            patternTransform="rotate(45 0 0)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="7" stroke="#2A7F82" strokeWidth="1.8" strokeOpacity="0.35" />
          </pattern>
        </defs>

        {yTicks.map((yt) => (
          <g key={yt}>
            <line x1={PAD_L} y1={toY(yt)} x2={VB_W - PAD_R} y2={toY(yt)} stroke={gridColor} strokeWidth={1} />
            <text
              x={PAD_L - 6}
              y={toY(yt) + 3.5}
              textAnchor="end"
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
              fill={axisText}
            >
              {yt}
            </text>
          </g>
        ))}

        {xTicks.map((xt) => (
          <g key={xt}>
            <line x1={toX(xt)} y1={PAD_T} x2={toX(xt)} y2={VB_H - PAD_B} stroke={gridColor} strokeWidth={1} />
            <text
              x={toX(xt)}
              y={VB_H - PAD_B + 14}
              textAnchor="middle"
              fontSize={10}
              fontFamily="JetBrains Mono, monospace"
              fill={axisText}
            >
              {xt}
            </text>
          </g>
        ))}

        {/* Faint base output sets */}
        {sets.map((s, idx) => {
          const style = getSetStyle(s, idx);
          const pts: string[] = [];
          for (let i = 0; i <= 100; i++) {
            const y = min + (span * i) / 100;
            pts.push(`${toX(y).toFixed(1)},${toY(evaluateMF(y, s.mf).value).toFixed(1)}`);
          }
          return (
            <polyline
              key={s.id}
              fill="none"
              stroke={dark && style.color === '#14213D' ? '#94A3B8' : style.color}
              strokeOpacity={0.28}
              strokeWidth={1.2}
              strokeDasharray="3 3"
              points={pts.join(' ')}
            />
          );
        })}

        {/* Optional comparison ("Before") curve */}
        {compareLinePts && (
          <polyline
            fill="none"
            stroke="#4A5468"
            strokeWidth={1.8}
            strokeDasharray="5 4"
            points={compareLinePts}
          />
        )}

        {/* Aggregated envelope */}
        <polygon
          fill={`url(#${patternId})`}
          stroke="#2A7F82"
          strokeWidth={2.4}
          points={areaPts.join(' ')}
        />

        {/* Axes */}
        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={VB_H - PAD_B} stroke={axisText} strokeWidth={1.2} />
        <line x1={PAD_L} y1={VB_H - PAD_B} x2={VB_W - PAD_R} y2={VB_H - PAD_B} stroke={axisText} strokeWidth={1.2} />

        {/* Defuzzification markers */}
        {markers.map((m, i) => {
          const x = toX(Math.max(min, Math.min(max, m.value)));
          const yOffset = PAD_T + 10 + (i % 2) * 14;
          return (
            <g key={m.label}>
              <line
                x1={x}
                y1={PAD_T}
                x2={x}
                y2={VB_H - PAD_B}
                stroke={m.color}
                strokeWidth={2}
                strokeDasharray={m.dash}
              />
              <circle cx={x} cy={VB_H - PAD_B} r={3.5} fill={m.color} />
              <text
                x={x}
                y={yOffset - 14}
                textAnchor={m.value > max * 0.8 ? 'end' : m.value < max * 0.2 ? 'start' : 'middle'}
                fontSize={10}
                fontWeight={600}
                fontFamily="JetBrains Mono, monospace"
                fill={m.color}
              >
                {m.label}: {m.value.toFixed(2)}
              </text>
            </g>
          );
        })}

        <text x={PAD_L + PLOT_W / 2} y={VB_H - 4} textAnchor="middle" fontSize={10} fill={axisText}>
          {name} ({unit})
        </text>
      </svg>
    </figure>
  );
}

