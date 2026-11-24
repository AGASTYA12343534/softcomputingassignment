import type { LessonModule } from './types';

export const module6: LessonModule = {
  id: 'module-6',
  number: 6,
  title: 'Inference Engine',
  estimatedMinutes: 10,
  goals: [
    'Compute rule firing strengths using Minimum AND and Product AND.',
    'Compare Maximum OR with Minimum AND.',
    'Apply Mamdani minimum implication to clip each consequent fuzzy set.',
  ],
  definition:
    'The inference engine evaluates every rule in two steps: first it combines the antecedent membership degrees into a single firing strength w_i, and then it applies implication to shape (clip or scale) the rule’s consequent fuzzy set.',
  intuition:
    'Think of firing strength w_i as a volume knob for each rule. If a rule’s conditions are only 20% satisfied (w_4 = 0.2), it should not shout at 100% volume—Mamdani implication slices off the top of its output triangle or trapezoid at height 0.2.',
  workedExample:
    'At 18 °C (μ_Cool = 0.5, μ_Warm = 0.5) and 40 % humidity (μ_Dry = 0.4, μ_Normal = 0.6), look at Rule R1 (Cool AND Dry → Low):\n• Minimum AND: w_1 = min(0.5, 0.4) = 0.4.\n• Product AND: w_1 = 0.5 × 0.4 = 0.2.\nWith Mamdani minimum implication at w_1 = 0.4, the Low fan set (0, 0, 20, 50) is clipped flat at height 0.4 across [0, 38] and tapers down to 0 at 50.',
  mathLatex:
    'w_i = \\min(\\mu_A, \\mu_B) \\quad\\text{or}\\quad \\mu_A \\cdot \\mu_B, \\qquad \\mu_{\\text{clipped}, i}(y) = \\min\\big(w_i, \\mu_{C_i}(y)\\big)',
  mathCaption: 'Rule firing strength (min or product) followed by Mamdani minimum clipping.',
  symbolKeys: ['w_i', 'mu', 'y'],
  activityId: 'm6',
  misconceptions: [
    '"Minimum and Product AND always give the same answer." They agree when one input is 0 or 1, but when both inputs are partial (like 0.5 and 0.4), Product gives a smaller strength (0.2 vs 0.4).',
    '"Clipping changes the horizontal span of the consequent." Clipping only caps the vertical height at w_i; the base [a, d] remains intact.',
  ],
  knowledgeCheck: [
    {
      id: 'm6-q1',
      type: 'numeric',
      prompt: 'If μ_A = 0.5 and μ_B = 0.4, what is the firing strength under Product AND?',
      correctNumber: 0.2,
      tolerance: 0.01,
      explanation: 'Product AND multiplies the two antecedent degrees: 0.5 × 0.4 = 0.2.',
    },
    {
      id: 'm6-q2',
      type: 'mc',
      prompt: 'Under Mamdani minimum implication, what happens to an output set when w_i = 0?',
      options: [
        'It stays at its full height 1.0.',
        'It is clipped down to 0 everywhere (inactive).',
        'It shifts to the right.',
      ],
      correctIndex: 1,
      optionExplanations: [
        'min(0, μ_C(y)) = 0 for all y, so it does not stay at 1.0.',
        '',
        'Implication modifies vertical height, never horizontal position.',
      ],
      explanation: 'Since μ_C(y) ≥ 0, min(0, μ_C(y)) = 0 across the entire output universe.',
    },
  ],
  summary:
    'The inference engine turns antecedent degrees into firing strengths and clips each active rule’s consequent set at its strength.',
};

