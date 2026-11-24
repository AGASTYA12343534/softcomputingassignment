export interface FormulaSymbolInfo {
  id: string;
  symbol: string;
  name: string;
  meaning: string;
  unitOrRange: string;
  example: string;
}

export const FORMULA_SYMBOLS: Record<string, FormulaSymbolInfo> = {
  mu: {
    id: 'mu',
    symbol: 'μ(x)',
    name: 'Membership Degree',
    meaning: 'Measures how strongly input x belongs to a fuzzy set.',
    unitOrRange: 'Dimensionless in [0, 1]',
    example: 'At 45 % humidity, μ_Dry(45) = 0.2 and μ_Normal(45) = 0.8.',
  },
  x: {
    id: 'x',
    symbol: 'x',
    name: 'Crisp Input Value',
    meaning: 'The measured numerical input within the universe of discourse.',
    unitOrRange: 'e.g. °C in [0, 40] or % in [0, 100]',
    example: 'Temperature sensor reading x = 24 °C.',
  },
  a: {
    id: 'a',
    symbol: 'a',
    name: 'Left Foot',
    meaning: 'The leftmost boundary where membership begins rising above 0.',
    unitOrRange: 'Same unit as input universe',
    example: 'For Warm (12, 24, 36), a = 12 °C.',
  },
  b: {
    id: 'b',
    symbol: 'b',
    name: 'Peak / Left Shoulder',
    meaning: 'The point (or start of plateau) where membership reaches 1.',
    unitOrRange: 'Same unit as input universe (a ≤ b)',
    example: 'For Warm (12, 24, 36), b = 24 °C gives μ = 1.',
  },
  c: {
    id: 'c',
    symbol: 'c',
    name: 'Right Foot / Right Shoulder',
    meaning: 'End of plateau (trapezoid) or rightmost zero-crossing (triangle).',
    unitOrRange: 'Same unit as input universe (b ≤ c)',
    example: 'For Cool (0, 0, 12, 24), c = 12 °C ends the plateau.',
  },
  d: {
    id: 'd',
    symbol: 'd',
    name: 'Right Foot (Trapezoid)',
    meaning: 'The rightmost boundary where a trapezoidal membership returns to 0.',
    unitOrRange: 'Same unit as input universe (c ≤ d)',
    example: 'For Cool (0, 0, 12, 24), d = 24 °C.',
  },
  m: {
    id: 'm',
    symbol: 'm',
    name: 'Gaussian Center',
    meaning: 'The center point where the Gaussian bell curve peaks at μ = 1.',
    unitOrRange: 'Same unit as input universe',
    example: 'm = 24 °C centers a Warm Gaussian at 24 °C.',
  },
  sigma: {
    id: 'sigma',
    symbol: 'σ',
    name: 'Gaussian Spread',
    meaning: 'Standard deviation controlling how wide the Gaussian curve is.',
    unitOrRange: 'Strictly positive (σ > 0)',
    example: 'σ = 5 °C makes μ ≈ 0.61 at 5 °C away from the center.',
  },
  w_i: {
    id: 'w_i',
    symbol: 'w_i',
    name: 'Rule Firing Strength',
    meaning: 'Activation level of rule i after combining its antecedent degrees.',
    unitOrRange: 'Dimensionless in [0, 1]',
    example: 'For R4 (Warm & Dry) at 24 °C, 45 %: w_4 = min(1.0, 0.2) = 0.2.',
  },
  y: {
    id: 'y',
    symbol: 'y',
    name: 'Output Universe Variable',
    meaning: 'Sample coordinate across the output domain (e.g. Fan Speed).',
    unitOrRange: '% in [0, 100]',
    example: 'Discrete grid evaluates y = 0, 1, 2, …, 100.',
  },
  y_star: {
    id: 'y_star',
    symbol: 'y*',
    name: 'Defuzzified Crisp Output',
    meaning: 'The single representative number sent to the actuator.',
    unitOrRange: '% in [0, 100]',
    example: 'For the reference case (24 °C, 45 %), discrete centroid y* ≈ 44.57 %.',
  },
  mu_agg: {
    id: 'mu_agg',
    symbol: 'μ_agg(y)',
    name: 'Aggregated Output Membership',
    meaning: 'Combined envelope formed by taking the maximum across all clipped rule outputs.',
    unitOrRange: 'Dimensionless in [0, 1]',
    example: 'At y = 50 %, μ_agg(50) = max(0, 0.8, 0) = 0.8.',
  },
};

