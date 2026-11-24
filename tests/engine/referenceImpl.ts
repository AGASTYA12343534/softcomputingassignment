/**
 * Independent brute-force reference implementation for cross-checking src/engine.
 * Uses a completely separate code path without importing inference.ts or defuzzify.ts.
 */

export function refTrap(x: number, a: number, b: number, c: number, d: number): number {
  if (x < a || x > d) return 0;
  if (x >= b && x <= c) return 1;
  if (x < b) return (x - a) / (b - a);
  return (d - x) / (d - c);
}

export function refTri(x: number, a: number, b: number, c: number): number {
  if (x <= a || x >= c) {
    if (x === b) return 1;
    return 0;
  }
  if (x === b) return 1;
  if (x < b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

export function refFanInference(
  tempInput: number,
  humInput: number,
  andMode: 'min' | 'product' = 'min'
): {
  centroidDiscrete: number;
  centroidFine: number;
  bisectorDiscrete: number;
  momDiscrete: number;
} {
  const t = Math.max(0, Math.min(40, tempInput));
  const h = Math.max(0, Math.min(100, humInput));

  const cool = refTrap(t, 0, 0, 12, 24);
  const warm = refTri(t, 12, 24, 36);
  const hot = refTrap(t, 24, 36, 40, 40);

  const dry = refTrap(h, 0, 0, 25, 50);
  const normal = refTri(h, 25, 50, 75);
  const humid = refTrap(h, 50, 75, 100, 100);

  const combine = (a: number, b: number) => (andMode === 'min' ? Math.min(a, b) : a * b);

  // R1 Cool+Dry->Low, R2 Cool+Normal->Low, R4 Warm+Dry->Low
  const wLow = Math.max(combine(cool, dry), combine(cool, normal), combine(warm, dry));
  // R3 Cool+Humid->Med, R5 Warm+Normal->Med, R7 Hot+Dry->Med
  const wMed = Math.max(combine(cool, humid), combine(warm, normal), combine(hot, dry));
  // R6 Warm+Humid->High, R8 Hot+Normal->High, R9 Hot+Humid->High
  const wHigh = Math.max(combine(warm, humid), combine(hot, normal), combine(hot, humid));

  const evalAgg = (y: number): number => {
    const low = Math.min(wLow, refTrap(y, 0, 0, 20, 50));
    const med = Math.min(wMed, refTri(y, 20, 50, 80));
    const high = Math.min(wHigh, refTrap(y, 50, 80, 100, 100));
    return Math.max(low, med, high);
  };

  // Discrete 0..100
  let sumMu = 0;
  let sumYMu = 0;
  const ys: number[] = [];
  const mus: number[] = [];
  for (let y = 0; y <= 100; y++) {
    const mu = evalAgg(y);
    ys.push(y);
    mus.push(mu);
    sumMu += mu;
    sumYMu += y * mu;
  }

  const centroidDiscrete = sumYMu / sumMu;

  // Bisector
  const half = sumMu / 2;
  let cum = 0;
  let bisectorDiscrete = 0;
  for (let i = 0; i < mus.length; i++) {
    const prevCum = cum;
    cum += mus[i];
    if (cum >= half) {
      if (Math.abs(cum - half) <= 1e-12 || i === 0) {
        bisectorDiscrete = ys[i];
      } else {
        const frac = (half - prevCum) / (cum - prevCum);
        bisectorDiscrete = ys[i - 1] + frac * (ys[i] - ys[i - 1]);
      }
      break;
    }
  }

  // MoM
  const maxMu = Math.max(...mus);
  const maxPts = ys.filter((_, i) => Math.abs(mus[i] - maxMu) <= 1e-9);
  const momDiscrete = maxPts.reduce((a, b) => a + b, 0) / maxPts.length;

  // Fine trapezoid 50,000 samples
  const N = 50_000;
  const step = 100 / N;
  let area = 0;
  let moment = 0;
  let prev = evalAgg(0);
  let prevY = 0;
  for (let i = 1; i <= N; i++) {
    const y = i * step;
    const mu = evalAgg(y);
    area += 0.5 * (prev + mu) * step;
    moment += 0.5 * (prevY + y * mu) * step;
    prev = mu;
    prevY = y * mu;
  }
  const centroidFine = moment / area;

  return { centroidDiscrete, centroidFine, bisectorDiscrete, momDiscrete };
}

