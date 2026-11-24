import { useId } from 'react';
import { evaluateMF, type LinguisticVariable } from '@/engine';
import { getSetPeakX, getSetStyle } from './chartUtils';

export interface MembershipChartProps {
  variable: LinguisticVariable;
  currentValue?: number;
  dark?: boolean;
  height?: number;
  title?: string;
}

const VB_W = 460;
const VB_H = 200;
const PAD_L = 42;
const PAD_R = 16;
const PAD_T = 22;
const PAD_B = 34;
const PLOT_W = VB_W - PAD_L - PAD_R;
const PLOT_H = VB_H - PAD_T - PAD_B;

export function MembershipChart({
  variable,
  currentValue,
  dark = false,
  title,
}: MembershipChartProps) {
  const chartId = useId();
  const { min, max, unit, sets, name } = variable;
  const span = max - min || 1;

  const toX = (val: number) => PAD_L + ((val - min) / span) * PLOT_W;
  const toY = (mu: number) => PAD_T + (1 - mu) * PLOT_H;

  const xTicks = 5;
  const xTickValues = Array.from({ length: xTicks + 1 }, (_, i) =>
    Number((min + (span * i) / xTicks).toFixed(1))
  );
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  const sampleCount = 120;
  const gridColor = dark ? 'rgba(255,255,255,0.12)' : '#E8E2D5';
  const axisText = dark ? 'rgba(255,255,255,0.72)' : '#4A5468';

  const clampedVal =
    typeof currentValue === 'number'
      ? Math.max(min, Math.min(max, currentValue))
      : undefined;

  return (
    <figure className="w-full" aria-labelledby={title ? `${chartId}-title` : undefined}>
      {title && (
        <figcaption
          id={`${chartId}-title`}
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
        aria-label={`${name} membership functions over ${min} to ${max} ${unit}`}
      >
        {/* Gridlines */}
        {yTicks.map((yt) => (
          <g key={yt}>
            <line
              x1={PAD_L}
              y1={toY(yt)}
              x2={VB_W - PAD_R}
              y2={toY(yt)}
              stroke={gridColor}
              strokeWidth={1}
            />
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

        {xTickValues.map((xt) => (
          <g key={xt}>
            <line
              x1={toX(xt)}
              y1={PAD_T}
              x2={toX(xt)}
              y2={VB_H - PAD_B}
              stroke={gridColor}
              strokeWidth={1}
            />
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

        {/* Axes */}
        <line
          x1={PAD_L}
          y1={PAD_T}
          x2={PAD_L}
          y2={VB_H - PAD_B}
          stroke={axisText}
          strokeWidth={1.2}
        />
        <line
          x1={PAD_L}
          y1={VB_H - PAD_B}
          x2={VB_W - PAD_R}
          y2={VB_H - PAD_B}
          stroke={axisText}
          strokeWidth={1.2}
        />

        {/* Axis Labels */}
        <text
          x={12}
          y={PAD_T + PLOT_H / 2}
          textAnchor="middle"
          fontSize={10}
          fill={axisText}
          transform={`rotate(-90 12 ${PAD_T + PLOT_H / 2})`}
        >
          μ
        </text>
        <text
          x={PAD_L + PLOT_W / 2}
          y={VB_H - 4}
          textAnchor="middle"
          fontSize={10}
          fill={axisText}
        >
          {name} ({unit})
        </text>

        {/* Fuzzy Set Curves */}
        {sets.map((set, idx) => {
          const style = getSetStyle(set, idx);
          const strokeColor = dark && style.color === '#14213D' ? '#E2E8F0' : style.color;
          const pts: string[] = [];
          for (let i = 0; i <= sampleCount; i++) {
            const x = min + (span * i) / sampleCount;
            const mu = evaluateMF(x, set.mf).value;
            pts.push(`${toX(x).toFixed(1)},${toY(mu).toFixed(1)}`);
          }

          const peakX = getSetPeakX(set, min, max);
          const labelX = Math.max(PAD_L + 22, Math.min(VB_W - PAD_R - 22, toX(peakX)));

          return (
            <g key={set.id}>
              <polyline
                fill="none"
                stroke={strokeColor}
                strokeWidth={2.2}
                strokeDasharray={style.dash}
                points={pts.join(' ')}
              />
              <text
                x={labelX}
                y={PAD_T - 6}
                textAnchor="middle"
                fontSize={11}
                fontWeight={600}
                fill={strokeColor}
              >
                {set.name}
              </text>
            </g>
          );
        })}

        {/* Current Input Marker */}
        {typeof clampedVal === 'number' && (
          <g>
            <line
              x1={toX(clampedVal)}
              y1={PAD_T}
              x2={toX(clampedVal)}
              y2={VB_H - PAD_B}
              stroke="#D9772B"
              strokeWidth={1.6}
              strokeDasharray="3 3"
            />
            {sets.map((set, idx) => {
              const mu = evaluateMF(clampedVal, set.mf).value;
              if (mu <= 0) return null;
              const style = getSetStyle(set, idx);
              const strokeColor = dark && style.color === '#14213D' ? '#E2E8F0' : style.color;
              const cx = toX(clampedVal);
              const cy = toY(mu);
              const placeLeft = clampedVal > min + span * 0.72;
              return (
                <g key={`dot-${set.id}`}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill="#D9772B"
                    stroke="#FFFFFF"
                    strokeWidth={1.5}
                  />
                  <text
                    x={placeLeft ? cx - 7 : cx + 7}
                    y={cy + 3.5}
                    textAnchor={placeLeft ? 'end' : 'start'}
                    fontSize={10}
                    fontWeight={600}
                    fontFamily="JetBrains Mono, monospace"
                    fill={strokeColor}
                  >
                    {mu.toFixed(2)}
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </svg>

      {/* Screen-reader accessible data summary */}
      <table className="sr-only">
        <caption>{name} membership degrees</caption>
        <thead>
          <tr>
            <th>Set</th>
            <th>Membership</th>
          </tr>
        </thead>
        <tbody>
          {sets.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>
                {typeof clampedVal === 'number'
                  ? evaluateMF(clampedVal, s.mf).value.toFixed(3)
                  : 'N/A'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

