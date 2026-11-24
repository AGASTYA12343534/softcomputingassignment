import {
  DEFAULT_ENGINE_CONFIG,
  type DefuzzMethod,
  type EngineConfig,
  type FuzzySystem,
} from './variables';
import {
  aggregateRules,
  evaluateRules,
  fuzzifySystem,
  generateSampleGrid,
  type FuzzifiedVariable,
  type RuleEvaluation,
  type SamplePoint,
} from './inference';
import {
  computeAnalyticCentroid,
  defuzzifyBisector,
  defuzzifyCentroid,
  defuzzifyMoM,
  type BisectorTrace,
  type DefuzzResult,
  type MomTrace,
} from './defuzzify';

export interface InferenceTrace {
  systemId: string;
  systemName: string;
  config: EngineConfig;
  rawInputs: Record<string, number>;
  fuzzified: FuzzifiedVariable[];
  ruleEvaluations: RuleEvaluation[];
  activeRules: RuleEvaluation[];
  aggregatedSamples: SamplePoint[];
  defuzzification: {
    centroid: DefuzzResult;
    bisector: BisectorTrace;
    mom: MomTrace;
    analyticCentroid: DefuzzResult;
    selectedMethod: DefuzzMethod;
    selectedResult: DefuzzResult;
  };
  dominantOutput: {
    setId: string;
    setName: string;
    strength: number;
  } | null;
  explanation: string;
}

function buildExplanation(
  fuzzified: FuzzifiedVariable[],
  activeRules: RuleEvaluation[],
  selectedResult: DefuzzResult,
  outputUnit: string,
  dominantOutput: { setId: string; setName: string; strength: number } | null
): string {
  if (!selectedResult.ok || activeRules.length === 0) {
    return 'No rule fired for the current inputs, so the aggregated output area is zero and no crisp output can be computed.';
  }

  const inputSummaries = fuzzified.map((fv) => {
    const activeSets = fv.memberships
      .filter((m) => m.degree > 0)
      .sort((a, b) => b.degree - a.degree)
      .map((m) => `${m.setName} (${m.degree.toFixed(2)})`);
    return `${fv.variableName} ${fv.clampedInput}${fv.unit} is ${activeSets.join(' and ')}`;
  });

  const sortedRules = [...activeRules].sort((a, b) => b.firingStrength - a.firingStrength);
  const topRule = sortedRules[0];
  const secondary = sortedRules
    .slice(1)
    .map((r) => `${r.rule.id} (${r.consequentSetName}, ${r.firingStrength.toFixed(2)})`);

  const secondaryNote =
    secondary.length > 0 ? `, with secondary influence from ${secondary.join(', ')}` : '';

  const domNote = dominantOutput
    ? ` The ${dominantOutput.setName} category dominates at strength ${dominantOutput.strength.toFixed(2)}.`
    : '';

  return `Because ${inputSummaries.join(' and ')}, rule ${topRule.rule.id} (${topRule.consequentSetName}) fired most strongly (${topRule.firingStrength.toFixed(2)})${secondaryNote}.${domNote} Defuzzification yields ${selectedResult.value.toFixed(2)}${outputUnit}.`;
}

export function runInference(
  system: FuzzySystem,
  rawInputs: Record<string, number>,
  partialConfig: Partial<EngineConfig> = {},
  options: { computeAnalytic?: boolean } = {}
): InferenceTrace {
  const config: EngineConfig = { ...DEFAULT_ENGINE_CONFIG, ...partialConfig };
  const grid = generateSampleGrid(system.output.min, system.output.max, config.resolution);

  const fuzzified = fuzzifySystem(system, rawInputs);
  const ruleEvaluations = evaluateRules(
    system,
    fuzzified,
    grid,
    config.andOperator,
    config.orOperator,
    config.implication
  );
  const activeRules = ruleEvaluations.filter((r) => r.activated);
  const aggregatedSamples = aggregateRules(grid, ruleEvaluations);

  const centroid = defuzzifyCentroid(aggregatedSamples);
  const bisector = defuzzifyBisector(aggregatedSamples);
  const mom = defuzzifyMoM(aggregatedSamples);
  const analyticCentroid =
    options.computeAnalytic !== false
      ? computeAnalyticCentroid(system, ruleEvaluations, config.implication)
      : centroid;

  let selectedResult: DefuzzResult;
  if (config.defuzzMethod === 'bisector') {
    selectedResult = bisector.result;
  } else if (config.defuzzMethod === 'mom') {
    selectedResult = mom.result;
  } else {
    selectedResult = centroid;
  }

  // Dominant output set by highest firing strength
  let dominantOutput: { setId: string; setName: string; strength: number } | null = null;
  for (const re of activeRules) {
    if (!dominantOutput || re.firingStrength > dominantOutput.strength) {
      dominantOutput = {
        setId: re.rule.consequent.setId,
        setName: re.consequentSetName,
        strength: re.firingStrength,
      };
    }
  }

  const explanation = buildExplanation(
    fuzzified,
    activeRules,
    selectedResult,
    system.output.unit,
    dominantOutput
  );

  return {
    systemId: system.id,
    systemName: system.name,
    config,
    rawInputs: { ...rawInputs },
    fuzzified,
    ruleEvaluations,
    activeRules,
    aggregatedSamples,
    defuzzification: {
      centroid,
      bisector,
      mom,
      analyticCentroid,
      selectedMethod: config.defuzzMethod,
      selectedResult,
    },
    dominantOutput,
    explanation,
  };
}

