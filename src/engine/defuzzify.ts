import type { FuzzySystem, ImplicationOperator } from './variables';
import type { RuleEvaluation, SamplePoint } from './inference';
import { evaluateMF } from './membership';
import { implyValue } from './inference';

export type DefuzzResult =
  | {
      ok: true;
      value: number;
      numerator: number;
      denominator: number;
      details?: string;
    }
  | {
      ok: false;
      reason: string;
    };

export interface BisectorTrace {
  result: DefuzzResult;
  totalSum: number;
  halfSum: number;
  crossingIndex: number;
  cumulativeTable: Array<{ y: number; mu: number; cumulative: number }>;
}

export interface MomTrace {
  result: DefuzzResult;
  maxMu: number;
  maximalPoints: number[];
}

export const MOM_EPSILON = 1e-9;

export function defuzzifyCentroid(samples: SamplePoint[]): DefuzzResult {
  let numerator = 0;
  let denominator = 0;

  for (const pt of samples) {
    numerator += pt.y * pt.mu;
    denominator += pt.mu;
  }

  if (denominator <= 0) {
    return { ok: false, reason: 'No rule fired, so there is nothing to defuzzify.' };
  }

  return {
    ok: true,
    value: numerator / denominator,
    numerator,
    denominator,
  };
}

/**
 * Bisector of area on discrete samples using cumulative sums with linear
 * interpolation between the sample just below halfSum and the sample at/above halfSum.
 */
export function defuzzifyBisector(samples: SamplePoint[]): BisectorTrace {
  const cumulativeTable: Array<{ y: number; mu: number; cumulative: number }> = [];
  let running = 0;
  for (const pt of samples) {
    running += pt.mu;
    cumulativeTable.push({ y: pt.y, mu: pt.mu, cumulative: running });
  }

  if (running <= 0) {
    return {
      result: { ok: false, reason: 'No rule fired, so there is nothing to defuzzify.' },
      totalSum: 0,
      halfSum: 0,
      crossingIndex: -1,
      cumulativeTable,
    };
  }

  const halfSum = running / 2;
  let crossingIndex = cumulativeTable.findIndex((row) => row.cumulative >= halfSum);
  if (crossingIndex < 0) crossingIndex = cumulativeTable.length - 1;

  const curr = cumulativeTable[crossingIndex];
  let bisectorY = curr.y;

  if (Math.abs(curr.cumulative - halfSum) > 1e-12 && crossingIndex > 0) {
    const prev = cumulativeTable[crossingIndex - 1];
    const span = curr.cumulative - prev.cumulative;
    if (span > 0) {
      const frac = (halfSum - prev.cumulative) / span;
      bisectorY = prev.y + frac * (curr.y - prev.y);
    }
  }

  return {
    result: {
      ok: true,
      value: bisectorY,
      numerator: halfSum,
      denominator: running,
      details: `Half-area target = ${halfSum.toFixed(4)} of total ${running.toFixed(4)}`,
    },
    totalSum: running,
    halfSum,
    crossingIndex,
    cumulativeTable,
  };
}

/**
 * Mean of Maxima (MoM): mean of all y where mu_agg(y) is within 1e-9 of max(mu_agg).
 */
export function defuzzifyMoM(samples: SamplePoint[]): MomTrace {
  let maxMu = 0;
  for (const pt of samples) {
    if (pt.mu > maxMu) maxMu = pt.mu;
  }

  if (maxMu <= 0) {
    return {
      result: { ok: false, reason: 'No rule fired, so there is nothing to defuzzify.' },
      maxMu: 0,
      maximalPoints: [],
    };
  }

  const maximalPoints: number[] = [];
  for (const pt of samples) {
    if (Math.abs(pt.mu - maxMu) <= MOM_EPSILON) {
      maximalPoints.push(pt.y);
    }
  }

  const sum = maximalPoints.reduce((acc, y) => acc + y, 0);
  const mean = sum / maximalPoints.length;

  return {
    result: {
      ok: true,
      value: mean,
      numerator: sum,
      denominator: maximalPoints.length,
      details: `Max mu = ${maxMu.toFixed(4)} across ${maximalPoints.length} sample(s)`,
    },
    maxMu,
    maximalPoints,
  };
}

/**
 * High-resolution numerical integration (trapezoidal rule, default 100,000 samples)
 * for computing the continuous-area analytic centroid reference.
 */
export function computeAnalyticCentroid(
  system: FuzzySystem,
  ruleEvaluations: RuleEvaluation[],
  implication: ImplicationOperator,
  numSamples = 100_000
): DefuzzResult {
  const activeRules = ruleEvaluations.filter((r) => r.activated);
  if (activeRules.length === 0) {
    return { ok: false, reason: 'No rule fired, so there is nothing to defuzzify.' };
  }

  const outputSets = new Map(system.output.sets.map((s) => [s.id, s]));
  const { min, max } = system.output;
  const h = (max - min) / numSamples;

  const evalAgg = (y: number): number => {
    let maxMu = 0;
    for (const re of activeRules) {
      const cSet = outputSets.get(re.rule.consequent.setId);
      if (!cSet) continue;
      const cDeg = evaluateMF(y, cSet.mf).value;
      const implied = implyValue(re.firingStrength, cDeg, implication);
      if (implied > maxMu) maxMu = implied;
    }
    return maxMu;
  };

  let area = 0;
  let moment = 0;

  let prevMu = evalAgg(min);
  let prevYMu = min * prevMu;

  for (let i = 1; i <= numSamples; i++) {
    const y = min + i * h;
    const mu = evalAgg(y);
    const yMu = y * mu;
    area += 0.5 * (prevMu + mu) * h;
    moment += 0.5 * (prevYMu + yMu) * h;
    prevMu = mu;
    prevYMu = yMu;
  }

  if (area <= 0) {
    return { ok: false, reason: 'No rule fired, so there is nothing to defuzzify.' };
  }

  return {
    ok: true,
    value: moment / area,
    numerator: moment,
    denominator: area,
  };
}

