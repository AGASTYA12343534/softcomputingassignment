import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import {
  evaluateMF,
  validateParams,
  type MembershipFunctionSpec,
} from '@/engine';
import { Card, SegmentedControl, Slider } from '@/components/ui';

export interface MFPlaygroundProps {
  min?: number;
  max?: number;
  unit?: string;
  initialMF?: MembershipFunctionSpec;
  onMFChange?: (mf: MembershipFunctionSpec) => void;
  title?: string;
}

const VB_W = 480;
const VB_H = 220;
const PAD_L = 42;
const PAD_R = 18;
const PAD_T = 22;
const PAD_B = 34;
const PLOT_W = VB_W - PAD_L - PAD_R;
const PLOT_H = VB_H - PAD_T - PAD_B;

type DragHandleKey = 'a' | 'b' | 'c' | 'd' | 'm' | 'sigma';

export function MFPlayground({
  min = 0,
  max = 40,
  unit = '°C',
  initialMF = { type: 'triangular', a: 12, b: 24, c: 36 },
  onMFChange,
  title = 'Membership Function Playground',
}: MFPlaygroundProps) {
  const [mf, setMf] = useState<MembershipFunctionSpec>(initialMF);
  const [probeX, setProbeX] = useState<number>(Math.round((min + max) / 2));
  const [activeHandle, setActiveHandle] = useState<DragHandleKey | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const span = max - min || 1;
  const toX = (val: number) => PAD_L + ((val - min) / span) * PLOT_W;
  const toY = (mu: number) => PAD_T + (1 - mu) * PLOT_H;
  const fromSvgX = (clientX: number): number => {
    const svg = svgRef.current;
    if (!svg) return min;
    const rect = svg.getBoundingClientRect();
    const relX = ((clientX - rect.left) / rect.width) * VB_W;
    const raw = min + ((relX - PAD_L) / PLOT_W) * span;
    const step = span <= 50 ? 0.5 : 1;
    const snapped = Math.round(raw / step) * step;
    return Math.max(min, Math.min(max, Number(snapped.toFixed(2))));
  };

  const tryUpdate = (candidate: MembershipFunctionSpec) => {
    const res = validateParams(candidate);
    if (!res.valid) {
      setErrorMsg(res.errors[0]);
      return;
    }
    setErrorMsg(null);
    setMf(candidate);
    onMFChange?.(candidate);
  };

  const handleTypeChange = (type: 'triangular' | 'trapezoidal' | 'gaussian') => {
    const mid = (min + max) / 2;
    const q = span / 4;
    let next: MembershipFunctionSpec;
    if (type === 'triangular') {
      next = { type: 'triangular', a: min + q, b: mid, c: max - q };
    } else if (type === 'trapezoidal') {
      next = { type: 'trapezoidal', a: min + q * 0.5, b: min + q * 1.5, c: max - q * 1.5, d: max - q * 0.5 };
    } else {
      next = { type: 'gaussian', m: mid, sigma: Number((span / 6).toFixed(1)) };
    }
    setErrorMsg(null);
    setMf(next);
    onMFChange?.(next);
  };

  const updateHandleValue = (key: DragHandleKey, val: number) => {
    if (mf.type === 'triangular' && (key === 'a' || key === 'b' || key === 'c')) {
      tryUpdate({ ...mf, [key]: val });
    } else if (mf.type === 'trapezoidal' && (key === 'a' || key === 'b' || key === 'c' || key === 'd')) {
      tryUpdate({ ...mf, [key]: val });
    } else if (mf.type === 'gaussian') {
      if (key === 'm') tryUpdate({ ...mf, m: val });
      if (key === 'sigma') {
        const nextSigma = Math.max(0.5, Number(Math.abs(val - mf.m).toFixed(1)));
        tryUpdate({ ...mf, sigma: nextSigma });
      }
    }
  };

  const handlePointerMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!activeHandle) return;
    updateHandleValue(activeHandle, fromSvgX(e.clientX));
  };

  const handleKeyDown = (key: DragHandleKey, e: KeyboardEvent<SVGCircleElement>) => {
    const step = span <= 50 ? 1 : 2;
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    const delta = e.key === 'ArrowRight' ? step : -step;

    if (mf.type === 'triangular' && (key === 'a' || key === 'b' || key === 'c')) {
      tryUpdate({ ...mf, [key]: Math.max(min, Math.min(max, mf[key] + delta)) });
    } else if (mf.type === 'trapezoidal' && (key === 'a' || key === 'b' || key === 'c' || key === 'd')) {
      tryUpdate({ ...mf, [key]: Math.max(min, Math.min(max, mf[key] + delta)) });
    } else if (mf.type === 'gaussian') {
      if (key === 'm') {
        tryUpdate({ ...mf, m: Math.max(min, Math.min(max, mf.m + delta)) });
      } else if (key === 'sigma') {
        tryUpdate({ ...mf, sigma: Math.max(0.5, Number((mf.sigma + delta * 0.5).toFixed(1))) });
      }
    }
  };

  const handles: Array<{ key: DragHandleKey; x: number; y: number; label: string }> =
    mf.type === 'triangular'
      ? [
          { key: 'a', x: mf.a, y: 0, label: `a=${mf.a}` },
          { key: 'b', x: mf.b, y: 1, label: `b=${mf.b}` },
          { key: 'c', x: mf.c, y: 0, label: `c=${mf.c}` },
        ]
      : mf.type === 'trapezoidal'
        ? [
            { key: 'a', x: mf.a, y: 0, label: `a=${mf.a}` },
            { key: 'b', x: mf.b, y: 1, label: `b=${mf.b}` },
            { key: 'c', x: mf.c, y: 1, label: `c=${mf.c}` },
            { key: 'd', x: mf.d, y: 0, label: `d=${mf.d}` },
          ]
        : [
            { key: 'm', x: mf.m, y: 1, label: `m=${mf.m}` },
            { key: 'sigma', x: Math.min(max, mf.m + mf.sigma), y: Math.exp(-0.5), label: `σ=${mf.sigma}` },
          ];

  const samplePts: string[] = [];
  for (let i = 0; i <= 120; i++) {
    const x = min + (span * i) / 120;
    const mu = evaluateMF(x, mf).value;
    samplePts.push(`${toX(x).toFixed(1)},${toY(mu).toFixed(1)}`);
  }

  const probeEval = evaluateMF(probeX, mf);

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-serif text-lg font-semibold text-ink">{title}</h3>
          <p className="text-xs text-ink-secondary">
            Drag control points on the graph (or focus a handle and use Left/Right arrow keys, step{' '}
            {span <= 50 ? '1' : '2'} {unit}).
          </p>
        </div>
        <SegmentedControl
          ariaLabel="Membership function shape"
          size="sm"
          value={mf.type}
          onChange={handleTypeChange}
          options={[
            { value: 'triangular', label: 'Triangular' },
            { value: 'trapezoidal', label: 'Trapezoidal' },
            { value: 'gaussian', label: 'Gaussian' },
          ]}
        />
      </div>

      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full h-auto touch-none select-none"
        onPointerMove={handlePointerMove}
        onPointerUp={() => setActiveHandle(null)}
        onPointerLeave={() => setActiveHandle(null)}
        role="img"
        aria-label="Interactive membership function graph"
      >
        {[0, 0.5, 1].map((yt) => (
          <g key={yt}>
            <line x1={PAD_L} y1={toY(yt)} x2={VB_W - PAD_R} y2={toY(yt)} stroke="#E8E2D5" strokeWidth={1} />
            <text x={PAD_L - 6} y={toY(yt) + 3.5} textAnchor="end" fontSize={10} fontFamily="JetBrains Mono" fill="#4A5468">
              {yt}
            </text>
          </g>
        ))}

        <line x1={PAD_L} y1={PAD_T} x2={PAD_L} y2={VB_H - PAD_B} stroke="#4A5468" strokeWidth={1.2} />
        <line x1={PAD_L} y1={VB_H - PAD_B} x2={VB_W - PAD_R} y2={VB_H - PAD_B} stroke="#4A5468" strokeWidth={1.2} />

        {/* Curve */}
        <polyline fill="none" stroke="#2A7F82" strokeWidth={2.5} points={samplePts.join(' ')} />

        {/* Probe line */}
        <line
          x1={toX(probeX)}
          y1={PAD_T}
          x2={toX(probeX)}
          y2={VB_H - PAD_B}
          stroke="#D9772B"
          strokeWidth={1.6}
          strokeDasharray="3 3"
        />
        <circle cx={toX(probeX)} cy={toY(probeEval.value)} r={4.5} fill="#D9772B" stroke="#fff" strokeWidth={1.5} />

        {/* Draggable control points (44px invisible hit target via r=18) */}
        {handles.map((h) => (
          <g key={h.key}>
            <circle
              cx={toX(h.x)}
              cy={toY(h.y)}
              r={18}
              fill="transparent"
              className="cursor-ew-resize"
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                setActiveHandle(h.key);
              }}
              tabIndex={0}
              role="slider"
              aria-label={`Control point ${h.key}`}
              aria-valuemin={min}
              aria-valuemax={max}
              aria-valuenow={h.x}
              onKeyDown={(e) => handleKeyDown(h.key, e)}
            />
            <circle
              cx={toX(h.x)}
              cy={toY(h.y)}
              r={6}
              fill={activeHandle === h.key ? '#D9772B' : '#14213D'}
              stroke="#FFFFFF"
              strokeWidth={2}
              pointerEvents="none"
            />
            <text
              x={toX(h.x)}
              y={h.y > 0.5 ? toY(h.y) - 10 : toY(h.y) + 18}
              textAnchor="middle"
              fontSize={10}
              fontFamily="JetBrains Mono"
              fontWeight={600}
              fill="#14213D"
              pointerEvents="none"
            >
              {h.label}
            </text>
          </g>
        ))}
      </svg>

      {errorMsg && (
        <div role="alert" className="rounded border border-error/40 bg-error/10 px-3 py-2 text-xs text-error">
          Invalid parameter prevented: {errorMsg}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 items-center border-t border-border pt-3">
        <Slider
          label={`Probe x`}
          value={probeX}
          min={min}
          max={max}
          step={span <= 50 ? 0.5 : 1}
          unit={unit}
          onChange={setProbeX}
        />
        <div className="rounded border border-border bg-subtle p-3 text-xs font-mono">
          <div className="text-ink-secondary">
            μ({probeX} {unit}) = <strong className="text-base text-teal">{probeEval.value.toFixed(3)}</strong>
          </div>
          <div className="mt-1 text-[11px] text-ink-secondary">{probeEval.arithmetic}</div>
        </div>
      </div>
    </Card>
  );
}

