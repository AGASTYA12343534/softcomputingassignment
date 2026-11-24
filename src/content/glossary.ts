export interface GlossaryEntry {
  term: string;
  shortDef: string;
  explanation: string;
  example: string;
  moduleNumber: number;
}

export const GLOSSARY_ENTRIES: GlossaryEntry[] = [
  {
    term: 'Aggregation',
    shortDef: 'Combining all clipped rule outputs into one fuzzy envelope.',
    explanation:
      'After implication clips each active rule’s consequent set, aggregation merges them across the output universe—usually via pointwise maximum—so defuzzification can summarize a single shape.',
    example: 'In the reference case, Low clipped at 0.2 and Medium clipped at 0.8 merge via max(μ_Low, μ_Medium).',
    moduleNumber: 7,
  },
  {
    term: 'Antecedent',
    shortDef: 'The IF condition(s) of a fuzzy rule.',
    explanation:
      'Every fuzzy IF–THEN rule evaluates one or more input fuzzy sets in its antecedent to determine how strongly the rule applies.',
    example: 'In "IF Temperature is Warm AND Humidity is Normal THEN Fan is Medium," the antecedent is "Temperature is Warm AND Humidity is Normal."',
    moduleNumber: 5,
  },
  {
    term: 'Bisector of Area (BoA)',
    shortDef: 'Defuzzification method that splits the aggregated area into two equal halves.',
    explanation:
      'Finds the output coordinate y* where the cumulative area to the left equals the cumulative area to the right.',
    example: 'For a symmetric shape centered at 50, Bisector equals 50.',
    moduleNumber: 8,
  },
  {
    term: 'Centroid of Area (CoA)',
    shortDef: 'Defuzzification method computing the center of gravity of the aggregated curve.',
    explanation:
      'Calculates the moment-weighted average Σ y·μ(y) / Σ μ(y). It is the most widely used method for smooth, proportional control.',
    example: 'For 24 °C / 45 %, the discrete 101-point centroid is 1493.1667 / 33.5 ≈ 44.57%.',
    moduleNumber: 8,
  },
  {
    term: 'Consequent',
    shortDef: 'The THEN output clause of a fuzzy rule.',
    explanation:
      'Specifies which output fuzzy set is activated and shaped by the rule’s firing strength.',
    example: 'In R4 (Warm + Dry -> Low), the consequent is "Fan Speed is Low."',
    moduleNumber: 5,
  },
  {
    term: 'Defuzzification',
    shortDef: 'Converting a combined fuzzy output set into a single crisp number.',
    explanation:
      'Physical actuators require an exact numerical command (like 44.57% fan speed) rather than a fuzzy shape.',
    example: 'Centroid, Bisector, and Mean of Maxima are three standard defuzzification methods.',
    moduleNumber: 8,
  },
  {
    term: 'Firing Strength (w_i)',
    shortDef: 'The combined activation degree of a rule’s antecedent in [0, 1].',
    explanation:
      'Computed by applying the rule’s AND (min or product) or OR (max or probabilistic sum) operator to its antecedent membership degrees.',
    example: 'At 24 °C (Warm=1.0) and 45 % (Dry=0.2), R4 has w_4 = min(1.0, 0.2) = 0.2.',
    moduleNumber: 6,
  },
  {
    term: 'Fuzzification',
    shortDef: 'Mapping crisp sensor readings to membership degrees in [0, 1].',
    explanation:
      'Evaluates each input measurement against all membership functions of its linguistic variable.',
    example: 'Humidity = 45 % fuzzifies to Dry = 0.2, Normal = 0.8, Humid = 0.',
    moduleNumber: 4,
  },
  {
    term: 'Gaussian Membership Function',
    shortDef: 'A smooth bell-shaped curve parameterized by center m and spread σ.',
    explanation:
      'Defined by exp(−(x − m)² / (2σ²)). It never quite reaches 0, giving smooth transitions everywhere.',
    example: 'Centered at m = 24 °C with σ = 5 °C, μ(24) = 1.0.',
    moduleNumber: 3,
  },
  {
    term: 'Implication',
    shortDef: 'Shaping a rule’s consequent set using its firing strength.',
    explanation:
      'In Mamdani systems, minimum implication clips the consequent set horizontally at height w_i; product implication scales it by w_i.',
    example: 'R4 clips Low at height 0.2.',
    moduleNumber: 6,
  },
  {
    term: 'Linguistic Variable',
    shortDef: 'A variable described by words (fuzzy sets) rather than just numbers.',
    explanation:
      'Pairs a numerical universe of discourse (e.g., [0, 40] °C) with named fuzzy sets (Cool, Warm, Hot).',
    example: 'Temperature, Humidity, and Fan Speed are the three linguistic variables in our controller.',
    moduleNumber: 3,
  },
  {
    term: 'Mean of Maxima (MoM)',
    shortDef: 'Defuzzification method averaging all output points that attain the highest membership.',
    explanation:
      'Ignores lower skirts and averages the peak plateau. Useful in decision-making when you want the most plausible value.',
    example: 'In the reference case, the plateau [44, 56] at height 0.8 averages to 50.0%.',
    moduleNumber: 8,
  },
  {
    term: 'Membership Degree (μ)',
    shortDef: 'A number in [0, 1] measuring how strongly x belongs to a fuzzy set.',
    explanation:
      '0 means no membership, 1 means full membership, and intermediate values express partial fit.',
    example: 'μ_Dry(45) = 0.2.',
    moduleNumber: 1,
  },
  {
    term: 'Shoulder (Left / Right)',
    shortDef: 'A trapezoidal membership function with a flat 1.0 plateau extending to the universe boundary.',
    explanation:
      'Left shoulders have a = b; right shoulders have c = d. Explicit plateau checks prevent dividing by zero.',
    example: 'Cool = (0, 0, 12, 24) is a left shoulder returning 1.0 at x = 0.',
    moduleNumber: 3,
  },
  {
    term: 'Universe of Discourse',
    shortDef: 'The full range of permissible numerical values for a variable.',
    explanation:
      'Defines the minimum and maximum bounds over which fuzzy sets are specified.',
    example: 'Temperature has universe [0, 40] °C.',
    moduleNumber: 3,
  },
];

