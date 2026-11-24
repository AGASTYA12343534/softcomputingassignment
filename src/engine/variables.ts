export type MembershipFunctionSpec =
  | { type: 'triangular'; a: number; b: number; c: number }
  | { type: 'trapezoidal'; a: number; b: number; c: number; d: number }
  | { type: 'gaussian'; m: number; sigma: number };

export type SetColorToken = 'teal' | 'navy' | 'orange';

export interface FuzzySet {
  id: string;
  name: string;
  mf: MembershipFunctionSpec;
  colorToken?: SetColorToken;
}

export interface LinguisticVariable {
  id: string;
  name: string;
  unit: string;
  min: number;
  max: number;
  sets: FuzzySet[];
}

export interface RuleAntecedent {
  variableId: string;
  setId: string;
}

export interface FuzzyRule {
  id: string;
  name: string;
  antecedents: RuleAntecedent[];
  operator: 'AND' | 'OR';
  consequent: {
    variableId: string;
    setId: string;
  };
}

export type AndOperator = 'min' | 'product';
export type OrOperator = 'max' | 'probSum';
export type ImplicationOperator = 'min' | 'product';
export type DefuzzMethod = 'centroid' | 'bisector' | 'mom';

export interface EngineConfig {
  andOperator: AndOperator;
  orOperator: OrOperator;
  implication: ImplicationOperator;
  resolution: number;
  defuzzMethod: DefuzzMethod;
}

export interface FuzzySystem {
  id: string;
  name: string;
  inputs: LinguisticVariable[];
  output: LinguisticVariable;
  rules: FuzzyRule[];
}

export const DEFAULT_ENGINE_CONFIG: EngineConfig = {
  andOperator: 'min',
  orOperator: 'max',
  implication: 'min',
  resolution: 1,
  defuzzMethod: 'centroid',
};

