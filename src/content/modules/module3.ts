import type { LessonModule } from './types';

export const module3: LessonModule = {
  id: 'module-3',
  number: 3,
  title: 'Fuzzy Sets and Membership Functions',
  estimatedMinutes: 12,
  goals: [
    'Define universe of discourse, linguistic variable, and membership function.',
    'Write and evaluate triangular, trapezoidal, and Gaussian membership formulas.',
    'Handle left and right shoulder trapezoids without dividing by zero.',
  ],
  definition:
    'A linguistic variable (such as Temperature) spans a numerical range called the universe of discourse (for example, [0, 40] °C) and is divided into named fuzzy sets (Cool, Warm, Hot). Each fuzzy set is defined by a membership function μ(x) that maps every x in the universe to [0, 1].',
  intuition:
    'Think of a membership function as the shape of a category. A triangle has one exact ideal peak (b) and slopes linearly down to zero on both sides (a and c). A trapezoid widens that peak into a flat plateau [b, c]—ideal for edge categories like Cool [0, 12] °C or Hot [36, 40] °C where everything beyond a point is 100% Cool or 100% Hot. A Gaussian bell curve gives smooth, infinitely differentiable transitions.',
  workedExample:
    'For Cool = trapezoid(0, 0, 12, 24), notice a = b = 0 (a left shoulder). At x = 0 °C, x lies in [b, c] = [0, 12], so the plateau branch returns μ = 1 directly without computing (x − a)/(b − a) = 0/0. At x = 18 °C, 12 < 18 ≤ 24, so μ = (24 − 18)/(24 − 12) = 0.5.',
  mathLatex:
    '\\mu_{\\text{tri}}(x; a,b,c) = \\begin{cases} 0 & x \\le a \\text{ or } x \\ge c \\\\ \\frac{x-a}{b-a} & a < x \\le b \\\\ \\frac{c-x}{c-b} & b < x < c \\end{cases} \\qquad \\mu_{\\text{gauss}}(x; m,\\sigma) = \\exp\\!\\left(-\\frac{(x-m)^2}{2\\sigma^2}\\right)',
  mathCaption: 'Triangular (with a ≤ b ≤ c, a < c) and Gaussian (σ > 0) membership functions.',
  symbolKeys: ['mu', 'x', 'a', 'b', 'c', 'd', 'm', 'sigma'],
  activityId: 'm3',
  misconceptions: [
    '"Trapezoids with a = b are invalid because b − a = 0." Left shoulders (a = b) and right shoulders (c = d) are essential in controllers; we simply evaluate the plateau branch b ≤ x ≤ c first so division by zero never occurs.',
    '"Gaussian curves are always better than triangles." Triangles and trapezoids are piecewise linear, faster to compute, and easier to tune by hand.',
  ],
  knowledgeCheck: [
    {
      id: 'm3-q1',
      type: 'numeric',
      prompt: 'Given Triangular MF (12, 24, 36), what is μ(18)? (Enter a decimal like 0.5)',
      correctNumber: 0.5,
      tolerance: 0.01,
      explanation: 'Since 12 < 18 ≤ 24, use the rising branch: (18 − 12) / (24 − 12) = 6 / 12 = 0.5.',
    },
    {
      id: 'm3-q2',
      type: 'mc',
      prompt: 'For a trapezoidal set (0, 0, 12, 24), what is μ(0)?',
      options: ['0', '0.5', '1', 'Undefined (division by zero)'],
      correctIndex: 2,
      optionExplanations: [
        'At x = 0, x is on the left shoulder plateau [0, 12], so membership is 1, not 0.',
        '0.5 occurs halfway down the falling slope at x = 18.',
        '',
        'Explicit shoulder handling checks b ≤ x ≤ c first, returning 1 safely without dividing by (b − a).',
      ],
      explanation: 'Left-shoulder trapezoids equal 1 across [a, c] = [0, 12], including x = 0.',
    },
  ],
  summary:
    'Membership functions—triangular, trapezoidal (with shoulders), and Gaussian—turn linguistic labels into exact mathematical curves over a universe of discourse.',
};

