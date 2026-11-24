import type {
  AndOperator,
  FuzzyRule,
  FuzzySet,
  FuzzySystem,
  ImplicationOperator,
  OrOperator,
} from './variables';
import { evaluateMF, type MembershipEvaluation } from './membership';

export interface FuzzifiedSet {
  setId: string;
  setName: string;
  degree: number;
  branch: string;
  arithmetic: string;
}

export interface FuzzifiedVariable {
  variableId: string;
  variableName: string;
  unit: string;
  rawInput: number;
  clampedInput: number;
  wasClamped: boolean;
  memberships: FuzzifiedSet[];
}

export interface RuleAntecedentEval {
  variableId: string;
  variableName: string;
  setId: string;
  setName: string;
  degree: number;
}

export interface RuleEvaluation {
  rule: FuzzyRule;
  antecedentEvals: RuleAntecedentEval[];
  operatorUsed: AndOperator | OrOperator;
  firingStrength: number;
  activated: boolean;
  consequentSetName: string;
  clippedSamples: SamplePoint[];
}

export interface SamplePoint {
  y: number;
  mu: number;
}

export function clampToUniverse(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

export function generateSampleGrid(min: number, max: number, resolution: number): number[] {
  const step = resolution > 0 ? resolution : 1;
  const count = Math.round((max - min) / step);
  const grid: number[] = [];
  for (let i = 0; i <= count; i++) {
    const y = Number((min + i * step).toFixed(6));
    if (y <= max + 1e-9) {
      grid.push(Math.min(y, max));
    }
  }
  return grid;
}

export function fuzzifySystem(
  system: FuzzySystem,
  inputs: Record<string, number>
): FuzzifiedVariable[] {
  return system.inputs.map((variable) => {
    const raw = inputs[variable.id] ?? variable.min;
    const clamped = clampToUniverse(raw, variable.min, variable.max);
    const wasClamped = clamped !== raw;

    const memberships: FuzzifiedSet[] = variable.sets.map((set) => {
      const res: MembershipEvaluation = evaluateMF(clamped, set.mf);
      return {
        setId: set.id,
        setName: set.name,
        degree: res.value,
        branch: res.branch,
        arithmetic: res.arithmetic,
      };
    });

    return {
      variableId: variable.id,
      variableName: variable.name,
      unit: variable.unit,
      rawInput: raw,
      clampedInput: clamped,
      wasClamped,
      memberships,
    };
  });
}

export function combineDegrees(
  degrees: number[],
  ruleOp: 'AND' | 'OR',
  andOp: AndOperator,
  orOp: OrOperator
): number {
  if (degrees.length === 0) return 0;
  if (degrees.length === 1) return degrees[0];

  if (ruleOp === 'AND') {
    if (andOp === 'min') {
      return Math.min(...degrees);
    }
    return degrees.reduce((acc, d) => acc * d, 1);
  }

  // OR
  if (orOp === 'max') {
    return Math.max(...degrees);
  }
  // Probabilistic sum: a + b - a*b folded across all terms
  return degrees.reduce((acc, d) => acc + d - acc * d, 0);
}

export function implyValue(
  firingStrength: number,
  consequentDegree: number,
  implication: ImplicationOperator
): number {
  if (implication === 'min') {
    return Math.min(firingStrength, consequentDegree);
  }
  return firingStrength * consequentDegree;
}

export function evaluateRules(
  system: FuzzySystem,
  fuzzified: FuzzifiedVariable[],
  grid: number[],
  andOp: AndOperator,
  orOp: OrOperator,
  implication: ImplicationOperator
): RuleEvaluation[] {
  const fuzzMap = new Map<string, FuzzifiedVariable>();
  for (const fv of fuzzified) {
    fuzzMap.set(fv.variableId, fv);
  }

  const outputSets = new Map<string, FuzzySet>();
  for (const s of system.output.sets) {
    outputSets.set(s.id, s);
  }

  return system.rules.map((rule) => {
    const antecedentEvals: RuleAntecedentEval[] = rule.antecedents.map((ant) => {
      const fv = fuzzMap.get(ant.variableId);
      const mem = fv?.memberships.find((m) => m.setId === ant.setId);
      return {
        variableId: ant.variableId,
        variableName: fv?.variableName ?? ant.variableId,
        setId: ant.setId,
        setName: mem?.setName ?? ant.setId,
        degree: mem?.degree ?? 0,
      };
    });

    const firingStrength = combineDegrees(
      antecedentEvals.map((a) => a.degree),
      rule.operator,
      andOp,
      orOp
    );

    const consequentSet = outputSets.get(rule.consequent.setId);
    const clippedSamples: SamplePoint[] = grid.map((y) => {
      if (!consequentSet || firingStrength <= 0) {
        return { y, mu: 0 };
      }
      const cDeg = evaluateMF(y, consequentSet.mf).value;
      return { y, mu: implyValue(firingStrength, cDeg, implication) };
    });

    return {
      rule,
      antecedentEvals,
      operatorUsed: rule.operator === 'AND' ? andOp : orOp,
      firingStrength,
      activated: firingStrength > 0,
      consequentSetName: consequentSet?.name ?? rule.consequent.setId,
      clippedSamples,
    };
  });
}

export function aggregateRules(
  grid: number[],
  ruleEvaluations: RuleEvaluation[]
): SamplePoint[] {
  return grid.map((y, idx) => {
    let maxMu = 0;
    for (const re of ruleEvaluations) {
      const mu = re.clippedSamples[idx]?.mu ?? 0;
      if (mu > maxMu) maxMu = mu;
    }
    return { y, mu: maxMu };
  });
}

