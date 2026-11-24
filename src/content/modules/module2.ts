import type { LessonModule } from './types';

export const module2: LessonModule = {
  id: 'module-2',
  number: 2,
  title: 'Boolean Logic vs Fuzzy Logic',
  estimatedMinutes: 8,
  goals: [
    'Contrast binary truth values {0, 1} with continuous membership degrees [0, 1].',
    'Distinguish fuzzy membership degree from statistical probability.',
    'Recognize how a single crisp measurement can belong to two neighboring sets simultaneously.',
  ],
  definition:
    'Boolean logic assigns every proposition a truth value from the two-element set {0, 1}. Fuzzy logic generalizes this to a membership degree μ(x) ∈ [0, 1], measuring how well an observed value x fits a vague linguistic label.',
  intuition:
    'Imagine two glasses on a table. Glass A has a 50% chance of containing poison (probability): once you test it, it is either 100% poisoned or 100% safe—the uncertainty is about which crisp outcome occurred. Glass B is filled halfway with water (fuzzy membership): there is nothing random at all, yet it fits the label "full glass" to degree 0.5 and "empty glass" to degree 0.5. Probability models randomness; fuzzy logic models vagueness.',
  workedExample:
    'Take Humidity = 45 %. Under Boolean sets (Dry < 50 %, Normal ≥ 50 %), 45 % is 100% Dry and 0% Normal. Under our fuzzy sets Dry (0, 0, 25, 50) and Normal (25, 50, 75), 45 % is Dry to degree (50 − 45)/(50 − 25) = 0.20 AND Normal to degree (45 − 25)/(50 − 25) = 0.80. Notice both degrees are nonzero and sum to 1.0.',
  mathLatex: '\\text{Boolean: } \\mu_A(x) \\in \\{0, 1\\} \\quad\\text{vs}\\quad \\text{Fuzzy: } \\mu_A(x) \\in [0, 1]',
  mathCaption: 'Boolean membership is binary; fuzzy membership is continuous across [0, 1].',
  symbolKeys: ['mu', 'x'],
  activityId: 'm2',
  misconceptions: [
    '"A membership degree of 0.8 means an 80% probability." False: probability is about the likelihood of a future or unknown crisp event, whereas membership degree describes partial fit to a known measurement.',
    '"Membership degrees across all sets must always sum to 1." While well-designed partitions often sum to 1, fuzzy logic does not strictly require it—unlike probabilities of mutually exclusive outcomes.',
  ],
  knowledgeCheck: [
    {
      id: 'm2-q1',
      type: 'mc',
      prompt: 'A weather forecast says "40% chance of rain tomorrow." Is 40% a probability or a fuzzy membership degree?',
      options: [
        'Fuzzy membership degree, because rain is vague.',
        'Probability, because it measures the likelihood of a future event occurring.',
        'Both mean the exact same thing.',
      ],
      correctIndex: 1,
      optionExplanations: [
        'Tomorrow it will either rain or not rain; 40% expresses uncertainty over which outcome occurs.',
        '',
        'Probability and fuzzy membership measure fundamentally different concepts: randomness vs. vagueness.',
      ],
      explanation: 'Forecasting an uncertain future event is statistical probability.',
    },
    {
      id: 'm2-q2',
      type: 'mc',
      prompt: 'At 45 % humidity in our controller, μ_Dry = 0.2 and μ_Normal = 0.8. What does this tell us?',
      options: [
        'There is a 20% chance the sensor is broken.',
        '45 % humidity partially belongs to Dry (0.2) and strongly belongs to Normal (0.8).',
        'The humidity is fluctuating between Dry and Normal.',
      ],
      correctIndex: 1,
      optionExplanations: [
        'Membership degrees do not measure sensor error.',
        '',
        'The reading is fixed at 45 %; it simply overlaps both linguistic categories.',
      ],
      explanation: 'Fuzzy sets overlap so transitions between categories are smooth.',
    },
  ],
  summary:
    'Boolean logic forces yes/no boundaries; fuzzy logic allows partial, overlapping membership in [0, 1] and models vagueness rather than randomness.',
};

