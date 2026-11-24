import type { LessonModule } from './types';

export const module4: LessonModule = {
  id: 'module-4',
  number: 4,
  title: 'Fuzzification',
  estimatedMinutes: 8,
  goals: [
    'Convert crisp numerical sensor inputs into fuzzy membership degrees.',
    'Identify which piecewise branch of a membership function applies for a given input.',
    'Interpret fuzzified vectors across multiple input variables simultaneously.',
  ],
  definition:
    'Fuzzification is the first stage of a fuzzy inference pipeline: it takes each crisp numerical input (such as 24 °C and 45 %) and evaluates its membership degree μ(x) in every fuzzy set of that input variable.',
  intuition:
    'Think of fuzzification as translating raw sensor numbers into human-readable adjectives with confidence weights. A thermometer reads "24 °C"; fuzzification translates that into "0% Cool, 100% Warm, 0% Hot." A hygrometer reads "45 %"; fuzzification translates that into "20% Dry, 80% Normal, 0% Humid."',
  workedExample:
    'Let Temperature = 24 °C and Humidity = 45 %.\n• Cool (0, 0, 12, 24): x = 24 is at d = 24 (or falling edge (24−24)/12 = 0), so μ_Cool = 0.\n• Warm (12, 24, 36): x = 24 is the peak b = 24, so μ_Warm = 1.0.\n• Hot (24, 36, 40, 40): x = 24 is at a = 24, so μ_Hot = 0.\n• Dry (0, 0, 25, 50): 25 < 45 ≤ 50 (falling branch), so μ_Dry = (50 − 45)/(50 − 25) = 0.2.\n• Normal (25, 50, 75): 25 < 45 ≤ 50 (rising branch), so μ_Normal = (45 − 25)/(50 − 25) = 0.8.\n• Humid (50, 75, 100, 100): 45 < 50, so μ_Humid = 0.',
  mathLatex: '\\mathbf{x} = (x_1, x_2) \\;\\longmapsto\\; \\{\\mu_{A_j}(x_1)\\}, \\{\\mu_{B_k}(x_2)\\}',
  mathCaption: 'Fuzzification evaluates every fuzzy set for each input variable.',
  symbolKeys: ['x', 'mu'],
  activityId: 'm4',
  misconceptions: [
    '"Fuzzification changes the input value itself." No—the crisp measurement stays 24 °C; we simply compute how much it belongs to each fuzzy set.',
    '"Only the highest membership set matters." Keeping all nonzero degrees (like Dry = 0.2 AND Normal = 0.8) is what makes smooth blending possible.',
  ],
  knowledgeCheck: [
    {
      id: 'm4-q1',
      type: 'numeric',
      prompt: 'For Humidity = 35 % with Dry = trapezoid(0, 0, 25, 50), compute μ_Dry(35).',
      correctNumber: 0.6,
      tolerance: 0.01,
      explanation: '35 lies on the falling slope (25, 50], so μ_Dry(35) = (50 − 35) / (50 − 25) = 15 / 25 = 0.6.',
    },
    {
      id: 'm4-q2',
      type: 'mc',
      prompt: 'Which sets have nonzero membership at Temperature = 24 °C in our controller?',
      options: [
        'Cool and Warm',
        'Only Warm (μ = 1.0)',
        'Warm and Hot',
      ],
      correctIndex: 1,
      optionExplanations: [
        'Cool ends at d = 24, where its membership reaches 0.',
        '',
        'Hot begins at a = 24, where its membership is still 0.',
      ],
      explanation: 'At 24 °C, Warm peaks at 1.0 while Cool and Hot are both 0.',
    },
  ],
  summary:
    'Fuzzification turns raw sensor readings into membership degrees across all input sets, preserving partial overlap for downstream rules.',
};

