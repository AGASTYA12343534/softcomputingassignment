import type { LessonModule } from './types';

export const module8: LessonModule = {
  id: 'module-8',
  number: 8,
  title: 'Defuzzification',
  estimatedMinutes: 12,
  goals: [
    'Explain why a fuzzy envelope must be converted into a crisp number.',
    'Compute Centroid of Area, Bisector of Area, and Mean of Maxima.',
    'Choose the right defuzzification method for a given engineering task.',
  ],
  definition:
    'Defuzzification is the final stage of inference: it summarizes the aggregated fuzzy envelope μ_agg(y) into a single crisp output value y* that can drive a physical actuator.',
  intuition:
    'Imagine cutting the shaded aggregated shape out of uniform cardboard:\n• Centroid (Center of Area) is the exact horizontal balance point where the cardboard balances on a knife-edge.\n• Bisector is the vertical cut that splits the total area into two equal halves (50% left, 50% right).\n• Mean of Maxima (MoM) ignores the lower skirts and simply averages the tallest plateau.',
  workedExample:
    'For the reference case (24 °C, 45 %) on the 101-point integer grid y = 0, 1, …, 100:\n• Centroid: Σ μ_agg(y) = 33.5 and Σ y·μ_agg(y) ≈ 1493.1667, so y* = 1493.1667 / 33.5 ≈ 44.57 %.\n• Mean of Maxima: the tallest plateau has height 0.8 across integers 44..56, whose mean is (44 + 56)/2 = 50.00 %.\nNotice that Centroid pulls left toward 44.57 % because of the Low (0.2) tail on [0, 26], whereas MoM stays at 50 %.',
  mathLatex:
    'y^*_{\\text{CoA}} = \\frac{\\sum y \\cdot \\mu_{\\text{agg}}(y)}{\\sum \\mu_{\\text{agg}}(y)}, \\qquad y^*_{\\text{MoM}} = \\frac{1}{|M|}\\sum_{y \\in M} y',
  mathCaption: 'Discrete Centroid of Area and Mean of Maxima (where M is the set of points attaining max μ_agg).',
  symbolKeys: ['y_star', 'y', 'mu_agg'],
  activityId: 'm8',
  misconceptions: [
    '"Centroid, Bisector, and MoM always give the same number." Only when the aggregated shape is perfectly symmetric around a single peak! Asymmetric shapes separate them.',
    '"If no rule fires, Centroid returns 0." With zero area, the denominator Σ μ_agg(y) is 0—dividing by zero would produce NaN, so a safe engine reports an empty-area state instead.',
  ],
  knowledgeCheck: [
    {
      id: 'm8-q1',
      type: 'mc',
      prompt: 'Which defuzzification method acts like the physical center of gravity (balance point) of the shaded area?',
      options: ['Centroid of Area', 'Bisector of Area', 'Mean of Maxima'],
      correctIndex: 0,
      optionExplanations: [
        '',
        'Bisector splits the area in half, which equals the balance point only for symmetric shapes.',
        'Mean of Maxima only averages the tallest points and ignores the rest of the area.',
      ],
      explanation: 'Centroid computes the moment-weighted average Σ(y·μ)/Σμ, the exact center of gravity.',
    },
    {
      id: 'm8-q2',
      type: 'numeric',
      prompt: 'In the reference case (24 °C, 45 %), the tallest plateau spans [44, 56] at height 0.8. What is Mean of Maxima (MoM)?',
      correctNumber: 50,
      tolerance: 0.1,
      explanation: 'The plateau [44, 56] is symmetric around 50, so the mean of integers 44..56 is 50.',
    },
  ],
  summary:
    'Defuzzification extracts a single crisp actuator command from the aggregated fuzzy set using Centroid (smooth balance), Bisector (equal area), or Mean of Maxima (peak average).',
};

