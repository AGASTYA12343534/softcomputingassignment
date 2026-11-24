import type { LessonModule } from './types';

export const module5: LessonModule = {
  id: 'module-5',
  number: 5,
  title: 'Fuzzy Rule Base',
  estimatedMinutes: 8,
  goals: [
    'Read and write fuzzy IF–THEN rules with antecedents and consequents.',
    'Combine multiple conditions using fuzzy AND and OR operators.',
    'Explain why a 2-input × 3-set controller typically has 3 × 3 = 9 rules.',
  ],
  definition:
    'A fuzzy rule base is a collection of linguistic IF–THEN rules written by domain experts. The IF part is the antecedent (conditions on inputs) and the THEN part is the consequent (a fuzzy set for the output).',
  intuition:
    'Think of the rule base as a compact playbook written in plain English: "IF the room is Hot AND the air is Humid, THEN run the fan High." Instead of writing thousands of numerical lookup entries, nine readable rules cover every combination of Cool/Warm/Hot and Dry/Normal/Humid.',
  workedExample:
    'Consider Rule R4: IF Temperature is Warm AND Humidity is Dry THEN Fan Speed is Low. At 24 °C and 45 % humidity, μ_Warm(24) = 1.0 and μ_Dry(45) = 0.2. Using Minimum AND, the rule firing strength is w_4 = min(1.0, 0.2) = 0.2. Meanwhile, R5 (Warm AND Normal → Medium) has w_5 = min(1.0, 0.8) = 0.8.',
  mathLatex: '\\text{IF } (x_1 \\text{ is } A) \\text{ AND } (x_2 \\text{ is } B) \\text{ THEN } (y \\text{ is } C)',
  mathCaption: 'Standard Mamdani IF–THEN rule structure.',
  symbolKeys: ['x', 'y', 'w_i'],
  activityId: 'm5',
  misconceptions: [
    '"Only one rule can fire at a time." In fuzzy logic, multiple rules fire in parallel whenever inputs overlap multiple fuzzy sets.',
    '"Rules must be ordered by priority." All rules in a Mamdani system are evaluated simultaneously; order does not change the result.',
  ],
  knowledgeCheck: [
    {
      id: 'm5-q1',
      type: 'mc',
      prompt: 'In the rule "IF Temperature is Hot AND Humidity is Dry THEN Fan Speed is Medium", what is the consequent?',
      options: [
        'Temperature is Hot',
        'Humidity is Dry',
        'Fan Speed is Medium',
      ],
      correctIndex: 2,
      optionExplanations: [
        'Temperature is Hot is part of the IF (antecedent) clause.',
        'Humidity is Dry is part of the IF (antecedent) clause.',
        '',
      ],
      explanation: 'The consequent is the THEN clause specifying the output fuzzy set.',
    },
    {
      id: 'm5-q2',
      type: 'mc',
      prompt: 'How many rules are needed to cover every pair of 3 Temperature sets and 3 Humidity sets?',
      options: ['3', '6', '9'],
      correctIndex: 2,
      optionExplanations: [
        '3 rules would leave most combinations uncovered.',
        '3 + 3 = 6 counts sets, not pairs.',
        '',
      ],
      explanation: 'Each of the 3 Temperature sets pairs with each of the 3 Humidity sets: 3 × 3 = 9 rules.',
    },
  ],
  summary:
    'A fuzzy rule base encodes expert control knowledge as parallel IF–THEN statements linking input fuzzy sets to output fuzzy sets.',
};

