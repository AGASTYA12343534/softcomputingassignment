import type { LessonModule } from './types';

export const module7: LessonModule = {
  id: 'module-7',
  number: 7,
  title: 'Aggregation',
  estimatedMinutes: 8,
  goals: [
    'Combine multiple clipped rule outputs into a single fuzzy envelope.',
    'Explain why Mamdani controllers use maximum aggregation instead of addition.',
    'Trace the exact piecewise envelope for the 24 °C / 45 % reference case.',
  ],
  definition:
    'Aggregation merges all clipped consequent sets from the active rules into one combined fuzzy set μ_agg(y) over the output universe, typically by taking the pointwise maximum at every output value y.',
  intuition:
    'Imagine overlapping cardboard cutouts—one for each active rule’s clipped output. If you shine a light from behind or trace their outer silhouette, you get a single combined shape. We take the maximum rather than summing them so that membership never exceeds 1.0 and overlapping rules do not artificially double-count.',
  workedExample:
    'In the reference case (24 °C, 45 %), R4 clips Low at 0.2 and R5 clips Medium at 0.8:\n• On [0, 26], Low is ≥ 0.2 while Medium is ≤ 0.2, so μ_agg(y) = 0.2.\n• On [26, 44], Medium rises above 0.2 along (y − 20)/30.\n• On [44, 56], Medium is clipped flat at 0.8.\n• On [56, 80], Medium falls along (80 − y)/30.\n• Above 80, μ_agg(y) = 0.',
  mathLatex: '\\mu_{\\text{agg}}(y) = \\max_{i=1}^{N} \\mu_{\\text{clipped}, i}(y)',
  mathCaption: 'Pointwise maximum across all N rules produces the aggregated output envelope.',
  symbolKeys: ['mu_agg', 'y'],
  activityId: 'm7',
  misconceptions: [
    '"Why not add the clipped curves together?" Adding two curves of height 0.6 and 0.7 would yield 1.3, violating the [0, 1] membership bound.',
    '"Inactive rules (w_i = 0) affect the aggregate." Since max(a, 0) = a for any a ≥ 0, rules with zero strength contribute nothing.',
  ],
  knowledgeCheck: [
    {
      id: 'm7-q1',
      type: 'numeric',
      prompt: 'At y = 30 %, Rule R4 contributes 0.2 and Rule R5 contributes 0.333. What is μ_agg(30)?',
      correctNumber: 0.333,
      tolerance: 0.01,
      explanation: 'Maximum aggregation takes max(0.2, 0.333) = 0.333.',
    },
    {
      id: 'm7-q2',
      type: 'tf',
      prompt: 'True or False: In standard Mamdani aggregation, μ_agg(y) can exceed 1.0 when three rules fire.',
      options: ['True', 'False'],
      correctIndex: 1,
      optionExplanations: [
        'Because each clipped curve is in [0, 1] and we take their pointwise maximum, μ_agg(y) is always in [0, 1].',
        '',
      ],
      explanation: 'Taking the maximum of numbers in [0, 1] always stays within [0, 1].',
    },
  ],
  summary:
    'Aggregation combines all clipped rule outputs via pointwise maximum, creating a single valid fuzzy set ready for defuzzification.',
};

