import type { LessonModule } from './types';

export const module9: LessonModule = {
  id: 'module-9',
  number: 9,
  title: 'Complete Fuzzy Logic Controller',
  estimatedMinutes: 15,
  goals: [
    'Assemble all five Mamdani stages into the complete Room Fan Controller.',
    'Verify the 24 °C / 45 % reference case completely by hand.',
    'Explain why the discrete 1%-grid centroid (44.57 %) differs slightly from the continuous centroid (44.71 %).',
  ],
  definition:
    'A complete Mamdani Fuzzy Logic Controller connects four components in sequence: (1) Fuzzifier, (2) Knowledge Base (sets + rules), (3) Inference Engine (firing + implication + aggregation), and (4) Defuzzifier.',
  intuition:
    'You now have every piece of the puzzle. Step 1 defines Temperature [0, 40] °C, Humidity [0, 100] %, and Fan Speed [0, 100] %. Step 2 shapes three fuzzy sets per variable. Step 3 writes the nine IF–THEN rules. Step 4 runs inference, and Step 5 reads the crisp fan percentage.',
  workedExample:
    'Reference Case (Temperature = 24 °C, Humidity = 45 %):\n1. Fuzzification: Warm = 1.0 (Cool = 0, Hot = 0); Dry = (50−45)/25 = 0.2, Normal = (45−25)/25 = 0.8 (Humid = 0).\n2. Rule Firing (min AND): R4 (Warm & Dry → Low) = min(1.0, 0.2) = 0.2; R5 (Warm & Normal → Medium) = min(1.0, 0.8) = 0.8. All other 7 rules = 0.\n3. Aggregation: μ_agg(y) is 0.2 on [0, 26], rises (y−20)/30 on [26, 44], flat 0.8 on [44, 56], falls (80−y)/30 on [56, 80].\n4. Defuzzification:\n   • Discrete 101-point grid (y = 0..100): Σμ = 33.5, Σyμ ≈ 1493.1667 → y* = 44.57 %.\n   • Exact continuous integral: area = 33.4, moment = 1493.2 → y* = 44.708 % (~44.71 %).\nWhy the 0.14% difference? Discrete sampling treats each integer point as a 1%-wide bar, whereas continuous integration integrates the exact diagonal slopes.',
  mathLatex:
    'y^*_{\\text{discrete}} = \\frac{1493.1667}{33.5} \\approx 44.57\\%, \\qquad y^*_{\\text{continuous}} = \\frac{1493.2}{33.4} \\approx 44.71\\%',
  mathCaption: 'Hand-verified reference case results on the discrete integer grid vs. continuous integration.',
  symbolKeys: ['y_star', 'mu_agg', 'w_i'],
  activityId: 'm9',
  misconceptions: [
    '"44.57 % and 44.71 % means one implementation has a bug." Both are exact for their respective quadrature rules (101-point Riemann sum vs. continuous integral).',
    '"A fuzzy controller needs machine learning to work." Classic Mamdani controllers run purely on transparent, human-authored rules.',
  ],
  knowledgeCheck: [
    {
      id: 'm9-q1',
      type: 'mc',
      prompt: 'In the reference case (24 °C, 45 %), which rules are active?',
      options: ['R1 and R2', 'R4 and R5', 'R5 and R8', 'All 9 rules'],
      correctIndex: 1,
      optionExplanations: [
        'Cool is 0 at 24 °C, so R1 and R2 have firing strength 0.',
        '',
        'Hot is 0 at 24 °C, so R8 has firing strength 0.',
        'Only rules involving Warm AND (Dry or Normal) are nonzero.',
      ],
      explanation: 'At 24 °C (Warm = 1) and 45 % (Dry = 0.2, Normal = 0.8), only R4 and R5 fire.',
    },
    {
      id: 'm9-q2',
      type: 'numeric',
      prompt: 'What is the discrete 101-point centroid fan speed (%) for the reference case (24 °C, 45 %)?',
      correctNumber: 44.57,
      tolerance: 0.05,
      explanation: '1493.1667 / 33.5 = 44.5721%, which rounds to 44.57%.',
    },
  ],
  summary:
    'Congratulations! You have built and verified a complete Mamdani Fuzzy Logic Controller from scratch. Explore the Experiment Lab or take the Final Assessment next.',
};

