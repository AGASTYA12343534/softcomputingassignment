import type { LessonModule } from './types';

export const module1: LessonModule = {
  id: 'module-1',
  number: 1,
  title: 'Introduction to Fuzzy Logic',
  estimatedMinutes: 6,
  goals: [
    'Understand why classical true/false logic struggles with everyday human concepts.',
    'Explain what fuzzy logic is and how partial membership works.',
    'Identify real-world engineering problems where gradual transitions outperform hard thresholds.',
  ],
  definition:
    'Fuzzy logic is a mathematical framework for reasoning with vague or gradual categories. Instead of forcing every statement to be strictly true (1) or strictly false (0), fuzzy logic allows any degree of truth in the continuous interval [0, 1].',
  intuition:
    'Ask someone in a room at 24 °C, "Is it warm?" Most people say yes. Now lower the thermostat by half a degree at a time: 23.5 °C, 23 °C, 22 °C, 21.5 °C. There is no magical cliff where the air suddenly flips from "warm" to "not warm." Classical Boolean thermostats draw an artificial line—say, 22.0 °C—so 21.9 °C is 0% warm and 22.0 °C is 100% warm. Fuzzy logic replaces that cliff with a smooth ramp.',
  workedExample:
    'Suppose a fan controller defines Warm as a triangle peaking at 24 °C and reaching 0 at 12 °C and 36 °C. At 21.5 °C, a Boolean rule (T ≥ 22 °C) says Not Warm (0). Under the fuzzy set Warm, 21.5 °C has membership μ_Warm(21.5) = (21.5 − 12) / (24 − 12) = 9.5 / 12 ≈ 0.792. At 22.0 °C, μ_Warm(22.0) = 10 / 12 ≈ 0.833—a smooth 0.041 change rather than a jarring 0-to-1 jump.',
  mathLatex: '\\mu_{\\text{Warm}}(x) \\in [0, 1]',
  mathCaption: 'Every input x maps to a membership degree between 0 (not in the set) and 1 (fully in the set).',
  symbolKeys: ['mu', 'x'],
  activityId: 'm1',
  misconceptions: [
    '"Fuzzy logic means imprecise or sloppy engineering." In reality, fuzzy logic uses exact arithmetic on precisely defined curves; only the categories themselves have soft boundaries.',
    '"Fuzzy logic replaces all classical logic." Boolean logic is actually a special case of fuzzy logic where μ(x) is restricted to {0, 1}.',
  ],
  knowledgeCheck: [
    {
      id: 'm1-q1',
      type: 'mc',
      prompt: 'Why do crisp threshold rules often cause jerky behavior in physical controllers like fans?',
      options: [
        'Because sensors cannot measure decimals.',
        'Because crossing a threshold flips the output abruptly from 0 to 1.',
        'Because fuzzy logic is slower than Boolean logic.',
      ],
      correctIndex: 1,
      optionExplanations: [
        'Digital sensors routinely measure decimals; the abruptness comes from the rule threshold, not the sensor.',
        '',
        'Speed is not the cause of jerky control; sharp step discontinuities at thresholds are.',
      ],
      explanation:
        'A hard threshold creates a step discontinuity: a tiny 0.1 °C sensor fluctuation near the cutoff can repeatedly switch an actuator fully on and off.',
    },
    {
      id: 'm1-q2',
      type: 'tf',
      prompt: 'True or False: In fuzzy logic, an object can belong to a category with degree 0.65.',
      options: ['True', 'False'],
      correctIndex: 0,
      optionExplanations: [
        '',
        'Fuzzy logic specifically extends truth values from {0, 1} to the entire interval [0, 1], so 0.65 is completely valid.',
      ],
      explanation: 'Any real number in [0, 1] is a valid fuzzy membership degree.',
    },
  ],
  summary:
    'Fuzzy logic captures gradual human concepts like "warm," "fast," or "tall" by assigning membership degrees in [0, 1], eliminating artificial threshold cliffs.',
};

