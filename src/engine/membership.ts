import type { MembershipFunctionSpec } from './variables';

export interface MembershipEvaluation {
  value: number;
  branch: string;
  arithmetic: string;
}

export interface ParamValidationResult {
  valid: boolean;
  errors: string[];
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (value <= 0) return 0;
  if (value >= 1) return 1;
  return value;
}

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : Number(n.toFixed(4)).toString();
}

export function validateParams(mf: MembershipFunctionSpec): ParamValidationResult {
  const errors: string[] = [];

  if (mf.type === 'triangular') {
    const { a, b, c } = mf;
    if (![a, b, c].every(Number.isFinite)) {
      errors.push('All triangular parameters (a, b, c) must be finite numbers.');
    } else {
      if (a > b) errors.push(`Left foot a (${fmt(a)}) must be <= peak b (${fmt(b)}).`);
      if (b > c) errors.push(`Peak b (${fmt(b)}) must be <= right foot c (${fmt(c)}).`);
      if (a >= c) errors.push(`Left foot a (${fmt(a)}) must be strictly less than right foot c (${fmt(c)}).`);
    }
  } else if (mf.type === 'trapezoidal') {
    const { a, b, c, d } = mf;
    if (![a, b, c, d].every(Number.isFinite)) {
      errors.push('All trapezoidal parameters (a, b, c, d) must be finite numbers.');
    } else {
      if (a > b) errors.push(`Left foot a (${fmt(a)}) must be <= left shoulder b (${fmt(b)}).`);
      if (b > c) errors.push(`Left shoulder b (${fmt(b)}) must be <= right shoulder c (${fmt(c)}).`);
      if (c > d) errors.push(`Right shoulder c (${fmt(c)}) must be <= right foot d (${fmt(d)}).`);
      if (a >= d) errors.push(`Left foot a (${fmt(a)}) must be strictly less than right foot d (${fmt(d)}).`);
    }
  } else if (mf.type === 'gaussian') {
    const { m, sigma } = mf;
    if (![m, sigma].every(Number.isFinite)) {
      errors.push('Gaussian parameters (m, sigma) must be finite numbers.');
    } else if (sigma <= 0) {
      errors.push(`Standard deviation sigma (${fmt(sigma)}) must be > 0.`);
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Evaluates a triangular membership function mu(x; a, b, c) with explicit
 * shoulder handling so a === b or b === c never divides by zero.
 */
export function evaluateTriangular(x: number, a: number, b: number, c: number): MembershipEvaluation {
  if (x < a || x > c) {
    return {
      value: 0,
      branch: x < a ? 'x < a' : 'x > c',
      arithmetic: `${fmt(x)} is outside [${fmt(a)}, ${fmt(c)}], so mu = 0`,
    };
  }
  if (x === b) {
    return {
      value: 1,
      branch: 'x = b (peak)',
      arithmetic: `x = ${fmt(b)} is the peak (b), so mu = 1`,
    };
  }
  if (x === a || x === c) {
    return {
      value: 0,
      branch: x === a ? 'x = a (left foot)' : 'x = c (right foot)',
      arithmetic: `x = ${fmt(x)} is at the foot, so mu = 0`,
    };
  }
  if (x < b) {
    const raw = (x - a) / (b - a);
    const val = clamp01(raw);
    return {
      value: val,
      branch: 'a < x < b (rising)',
      arithmetic: `(${fmt(x)} - ${fmt(a)}) / (${fmt(b)} - ${fmt(a)}) = ${fmt(val)}`,
    };
  }
  const raw = (c - x) / (c - b);
  const val = clamp01(raw);
  return {
    value: val,
    branch: 'b < x < c (falling)',
    arithmetic: `(${fmt(c)} - ${fmt(x)}) / (${fmt(c)} - ${fmt(b)}) = ${fmt(val)}`,
  };
}

/**
 * Evaluates a trapezoidal membership function mu(x; a, b, c, d) with explicit
 * left-shoulder (a === b) and right-shoulder (c === d) branches to prevent 0/0.
 */
export function evaluateTrapezoidal(
  x: number,
  a: number,
  b: number,
  c: number,
  d: number
): MembershipEvaluation {
  if (x < a || x > d) {
    return {
      value: 0,
      branch: x < a ? 'x < a' : 'x > d',
      arithmetic: `${fmt(x)} is outside [${fmt(a)}, ${fmt(d)}], so mu = 0`,
    };
  }
  if (x >= b && x <= c) {
    return {
      value: 1,
      branch: 'b <= x <= c (plateau)',
      arithmetic: `${fmt(x)} is in [${fmt(b)}, ${fmt(c)}], so mu = 1`,
    };
  }
  if (x < b) {
    // Guaranteed b > a because x >= a and x < b
    const raw = (x - a) / (b - a);
    const val = clamp01(raw);
    return {
      value: val,
      branch: 'a <= x < b (rising)',
      arithmetic: `(${fmt(x)} - ${fmt(a)}) / (${fmt(b)} - ${fmt(a)}) = ${fmt(val)}`,
    };
  }
  // Guaranteed d > c because x > c and x <= d
  const raw = (d - x) / (d - c);
  const val = clamp01(raw);
  return {
    value: val,
    branch: 'c < x <= d (falling)',
    arithmetic: `(${fmt(d)} - ${fmt(x)}) / (${fmt(d)} - ${fmt(c)}) = ${fmt(val)}`,
  };
}

export function evaluateGaussian(x: number, m: number, sigma: number): MembershipEvaluation {
  if (sigma <= 0 || !Number.isFinite(sigma)) {
    return { value: 0, branch: 'invalid sigma', arithmetic: 'sigma <= 0, so mu = 0' };
  }
  const diff = x - m;
  const val = clamp01(Math.exp(-(diff * diff) / (2 * sigma * sigma)));
  return {
    value: val,
    branch: 'gaussian',
    arithmetic: `exp(-(${fmt(x)} - ${fmt(m)})^2 / (2 * ${fmt(sigma)}^2)) = ${fmt(val)}`,
  };
}

export function evaluateMF(x: number, mf: MembershipFunctionSpec): MembershipEvaluation {
  if (mf.type === 'triangular') {
    return evaluateTriangular(x, mf.a, mf.b, mf.c);
  }
  if (mf.type === 'trapezoidal') {
    return evaluateTrapezoidal(x, mf.a, mf.b, mf.c, mf.d);
  }
  return evaluateGaussian(x, mf.m, mf.sigma);
}

