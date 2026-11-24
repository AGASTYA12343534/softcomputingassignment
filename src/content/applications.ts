import type { FuzzySystem } from '@/engine';

export interface ApplicationCase {
  id: string;
  title: string;
  problem: string;
  whyCrispStruggles: string;
  benefit: string;
  defaultInputs: Record<string, number>;
  system: FuzzySystem;
}

export const APPLICATION_CASES: ApplicationCase[] = [
  {
    id: 'room-temp',
    title: '1. Automatic Room Temperature Control',
    problem: 'Maintain comfortable indoor temperature by adjusting a fan or damper smoothly.',
    whyCrispStruggles:
      'A binary thermostat clicks on and off around a single setpoint, wasting energy and causing temperature swings.',
    benefit:
      'Fuzzy control scales airflow proportionally across overlapping Cool, Warm, and Hot zones.',
    defaultInputs: { temperature: 24, humidity: 45 },
    system: {
      id: 'app-room-temp',
      name: 'Room Temperature Controller',
      inputs: [
        {
          id: 'temperature',
          name: 'Temperature',
          unit: '°C',
          min: 10,
          max: 35,
          sets: [
            { id: 'cool', name: 'Cool', mf: { type: 'trapezoidal', a: 10, b: 10, c: 16, d: 22 }, colorToken: 'teal' },
            { id: 'warm', name: 'Warm', mf: { type: 'triangular', a: 16, b: 22, c: 28 }, colorToken: 'navy' },
            { id: 'hot', name: 'Hot', mf: { type: 'trapezoidal', a: 22, b: 28, c: 35, d: 35 }, colorToken: 'orange' },
          ],
        },
        {
          id: 'humidity',
          name: 'Humidity',
          unit: '%',
          min: 0,
          max: 100,
          sets: [
            { id: 'dry', name: 'Dry', mf: { type: 'trapezoidal', a: 0, b: 0, c: 30, d: 55 }, colorToken: 'teal' },
            { id: 'humid', name: 'Humid', mf: { type: 'trapezoidal', a: 45, b: 70, c: 100, d: 100 }, colorToken: 'orange' },
          ],
        },
      ],
      output: {
        id: 'airflow',
        name: 'Airflow',
        unit: '%',
        min: 0,
        max: 100,
        sets: [
          { id: 'low', name: 'Low', mf: { type: 'trapezoidal', a: 0, b: 0, c: 20, d: 50 }, colorToken: 'teal' },
          { id: 'med', name: 'Medium', mf: { type: 'triangular', a: 20, b: 50, c: 80 }, colorToken: 'navy' },
          { id: 'high', name: 'High', mf: { type: 'trapezoidal', a: 50, b: 80, c: 100, d: 100 }, colorToken: 'orange' },
        ],
      },
      rules: [
        { id: 'A1', name: 'Cool & Dry -> Low', antecedents: [{ variableId: 'temperature', setId: 'cool' }, { variableId: 'humidity', setId: 'dry' }], operator: 'AND', consequent: { variableId: 'airflow', setId: 'low' } },
        { id: 'A2', name: 'Warm & Dry -> Low', antecedents: [{ variableId: 'temperature', setId: 'warm' }, { variableId: 'humidity', setId: 'dry' }], operator: 'AND', consequent: { variableId: 'airflow', setId: 'low' } },
        { id: 'A3', name: 'Warm & Humid -> Medium', antecedents: [{ variableId: 'temperature', setId: 'warm' }, { variableId: 'humidity', setId: 'humid' }], operator: 'AND', consequent: { variableId: 'airflow', setId: 'med' } },
        { id: 'A4', name: 'Hot & Humid -> High', antecedents: [{ variableId: 'temperature', setId: 'hot' }, { variableId: 'humidity', setId: 'humid' }], operator: 'AND', consequent: { variableId: 'airflow', setId: 'high' } },
        { id: 'A5', name: 'Hot & Dry -> Medium', antecedents: [{ variableId: 'temperature', setId: 'hot' }, { variableId: 'humidity', setId: 'dry' }], operator: 'AND', consequent: { variableId: 'airflow', setId: 'med' } },
        { id: 'A6', name: 'Cool & Humid -> Medium', antecedents: [{ variableId: 'temperature', setId: 'cool' }, { variableId: 'humidity', setId: 'humid' }], operator: 'AND', consequent: { variableId: 'airflow', setId: 'med' } },
      ],
    },
  },
  {
    id: 'washing-machine',
    title: '2. Washing Machines',
    problem: 'Select an appropriate wash cycle duration from laundry load weight and dirtiness.',
    whyCrispStruggles:
      'Fixed "Delicate / Normal / Heavy" buttons force users to guess; a small but muddy load wastes water under a generic Heavy setting.',
    benefit:
      'Sensors feed load size and turbidity (dirtiness) into linguistic rules to tailor wash minutes.',
    defaultInputs: { load: 5, dirt: 60 },
    system: {
      id: 'app-washer',
      name: 'Fuzzy Washing Machine',
      inputs: [
        {
          id: 'load',
          name: 'Load Size',
          unit: 'kg',
          min: 1,
          max: 10,
          sets: [
            { id: 'small', name: 'Small', mf: { type: 'trapezoidal', a: 1, b: 1, c: 3, d: 6 }, colorToken: 'teal' },
            { id: 'large', name: 'Large', mf: { type: 'trapezoidal', a: 4, b: 7, c: 10, d: 10 }, colorToken: 'orange' },
          ],
        },
        {
          id: 'dirt',
          name: 'Dirtiness',
          unit: '%',
          min: 0,
          max: 100,
          sets: [
            { id: 'light', name: 'Light', mf: { type: 'trapezoidal', a: 0, b: 0, c: 25, d: 55 }, colorToken: 'teal' },
            { id: 'heavy', name: 'Heavy', mf: { type: 'trapezoidal', a: 45, b: 75, c: 100, d: 100 }, colorToken: 'orange' },
          ],
        },
      ],
      output: {
        id: 'time',
        name: 'Wash Time',
        unit: 'min',
        min: 10,
        max: 60,
        sets: [
          { id: 'short', name: 'Short', mf: { type: 'trapezoidal', a: 10, b: 10, c: 20, d: 35 }, colorToken: 'teal' },
          { id: 'med', name: 'Medium', mf: { type: 'triangular', a: 20, b: 35, c: 50 }, colorToken: 'navy' },
          { id: 'long', name: 'Long', mf: { type: 'trapezoidal', a: 35, b: 50, c: 60, d: 60 }, colorToken: 'orange' },
        ],
      },
      rules: [
        { id: 'W1', name: 'Small & Light -> Short', antecedents: [{ variableId: 'load', setId: 'small' }, { variableId: 'dirt', setId: 'light' }], operator: 'AND', consequent: { variableId: 'time', setId: 'short' } },
        { id: 'W2', name: 'Small & Heavy -> Medium', antecedents: [{ variableId: 'load', setId: 'small' }, { variableId: 'dirt', setId: 'heavy' }], operator: 'AND', consequent: { variableId: 'time', setId: 'med' } },
        { id: 'W3', name: 'Large & Light -> Medium', antecedents: [{ variableId: 'load', setId: 'large' }, { variableId: 'dirt', setId: 'light' }], operator: 'AND', consequent: { variableId: 'time', setId: 'med' } },
        { id: 'W4', name: 'Large & Heavy -> Long', antecedents: [{ variableId: 'load', setId: 'large' }, { variableId: 'dirt', setId: 'heavy' }], operator: 'AND', consequent: { variableId: 'time', setId: 'long' } },
      ],
    },
  },
  {
    id: 'air-conditioning',
    title: '3. Inverter Air Conditioning',
    problem: 'Modulate compressor power from temperature error and how fast the room is warming or cooling.',
    whyCrispStruggles:
      'Ignoring rate-of-change causes overshoot: the compressor keeps blasting even when the room is already cooling rapidly.',
    benefit:
      'Combining error with rate-of-change damps oscillations and reduces compressor cycling.',
    defaultInputs: { error: 4, rate: 0.5 },
    system: {
      id: 'app-ac',
      name: 'Inverter AC',
      inputs: [
        {
          id: 'error',
          name: 'Temp Error (T − Target)',
          unit: '°C',
          min: 0,
          max: 10,
          sets: [
            { id: 'small', name: 'Small', mf: { type: 'trapezoidal', a: 0, b: 0, c: 2, d: 5 }, colorToken: 'teal' },
            { id: 'large', name: 'Large', mf: { type: 'trapezoidal', a: 3, b: 6, c: 10, d: 10 }, colorToken: 'orange' },
          ],
        },
        {
          id: 'rate',
          name: 'Warming Rate',
          unit: '°C/h',
          min: -2,
          max: 2,
          sets: [
            { id: 'cooling', name: 'Cooling', mf: { type: 'trapezoidal', a: -2, b: -2, c: -0.5, d: 0.5 }, colorToken: 'teal' },
            { id: 'heating', name: 'Warming', mf: { type: 'trapezoidal', a: -0.5, b: 0.5, c: 2, d: 2 }, colorToken: 'orange' },
          ],
        },
      ],
      output: {
        id: 'power',
        name: 'Compressor Power',
        unit: '%',
        min: 0,
        max: 100,
        sets: [
          { id: 'eco', name: 'Eco', mf: { type: 'trapezoidal', a: 0, b: 0, c: 25, d: 50 }, colorToken: 'teal' },
          { id: 'std', name: 'Standard', mf: { type: 'triangular', a: 25, b: 50, c: 75 }, colorToken: 'navy' },
          { id: 'boost', name: 'Boost', mf: { type: 'trapezoidal', a: 50, b: 75, c: 100, d: 100 }, colorToken: 'orange' },
        ],
      },
      rules: [
        { id: 'AC1', name: 'Small & Cooling -> Eco', antecedents: [{ variableId: 'error', setId: 'small' }, { variableId: 'rate', setId: 'cooling' }], operator: 'AND', consequent: { variableId: 'power', setId: 'eco' } },
        { id: 'AC2', name: 'Small & Warming -> Standard', antecedents: [{ variableId: 'error', setId: 'small' }, { variableId: 'rate', setId: 'heating' }], operator: 'AND', consequent: { variableId: 'power', setId: 'std' } },
        { id: 'AC3', name: 'Large & Cooling -> Standard', antecedents: [{ variableId: 'error', setId: 'large' }, { variableId: 'rate', setId: 'cooling' }], operator: 'AND', consequent: { variableId: 'power', setId: 'std' } },
        { id: 'AC4', name: 'Large & Warming -> Boost', antecedents: [{ variableId: 'error', setId: 'large' }, { variableId: 'rate', setId: 'heating' }], operator: 'AND', consequent: { variableId: 'power', setId: 'boost' } },
      ],
    },
  },
  {
    id: 'automotive-abs',
    title: '4. Automotive Braking Control',
    problem: 'Modulate brake pressure during emergency stops based on vehicle speed and wheel slip.',
    whyCrispStruggles:
      'Locking wheels lose steering traction; crisp on/off valves shudder instead of holding optimal slip.',
    benefit:
      'Fuzzy slip rules ease pressure smoothly when wheel slip rises, keeping tires near peak grip.',
    defaultInputs: { speed: 60, slip: 25 },
    system: {
      id: 'app-abs',
      name: 'Fuzzy Brake Modulator',
      inputs: [
        {
          id: 'speed',
          name: 'Vehicle Speed',
          unit: 'km/h',
          min: 0,
          max: 120,
          sets: [
            { id: 'slow', name: 'Slow', mf: { type: 'trapezoidal', a: 0, b: 0, c: 30, d: 70 }, colorToken: 'teal' },
            { id: 'fast', name: 'Fast', mf: { type: 'trapezoidal', a: 50, b: 85, c: 120, d: 120 }, colorToken: 'orange' },
          ],
        },
        {
          id: 'slip',
          name: 'Wheel Slip',
          unit: '%',
          min: 0,
          max: 100,
          sets: [
            { id: 'low', name: 'Low Slip', mf: { type: 'trapezoidal', a: 0, b: 0, c: 15, d: 35 }, colorToken: 'teal' },
            { id: 'high', name: 'High Slip', mf: { type: 'trapezoidal', a: 25, b: 50, c: 100, d: 100 }, colorToken: 'orange' },
          ],
        },
      ],
      output: {
        id: 'pressure',
        name: 'Brake Pressure',
        unit: '%',
        min: 0,
        max: 100,
        sets: [
          { id: 'release', name: 'Release', mf: { type: 'trapezoidal', a: 0, b: 0, c: 20, d: 45 }, colorToken: 'teal' },
          { id: 'hold', name: 'Hold', mf: { type: 'triangular', a: 25, b: 50, c: 75 }, colorToken: 'navy' },
          { id: 'apply', name: 'Apply', mf: { type: 'trapezoidal', a: 55, b: 80, c: 100, d: 100 }, colorToken: 'orange' },
        ],
      },
      rules: [
        { id: 'B1', name: 'Fast & Low Slip -> Apply', antecedents: [{ variableId: 'speed', setId: 'fast' }, { variableId: 'slip', setId: 'low' }], operator: 'AND', consequent: { variableId: 'pressure', setId: 'apply' } },
        { id: 'B2', name: 'Fast & High Slip -> Release', antecedents: [{ variableId: 'speed', setId: 'fast' }, { variableId: 'slip', setId: 'high' }], operator: 'AND', consequent: { variableId: 'pressure', setId: 'release' } },
        { id: 'B3', name: 'Slow & Low Slip -> Hold', antecedents: [{ variableId: 'speed', setId: 'slow' }, { variableId: 'slip', setId: 'low' }], operator: 'AND', consequent: { variableId: 'pressure', setId: 'hold' } },
        { id: 'B4', name: 'Slow & High Slip -> Release', antecedents: [{ variableId: 'speed', setId: 'slow' }, { variableId: 'slip', setId: 'high' }], operator: 'AND', consequent: { variableId: 'pressure', setId: 'release' } },
      ],
    },
  },
  {
    id: 'decision-support',
    title: '5. Decision Support (Loan Risk)',
    problem: 'Evaluate borrower risk score from credit score and debt-to-income ratio.',
    whyCrispStruggles:
      'Hard cutoffs (e.g., reject if credit < 650) treat 649 and 450 identically while giving no smooth risk gradient.',
    benefit:
      'Transparent linguistic rules produce a continuous risk score that analysts can audit.',
    defaultInputs: { credit: 680, dti: 35 },
    system: {
      id: 'app-loan',
      name: 'Loan Risk Evaluator',
      inputs: [
        {
          id: 'credit',
          name: 'Credit Score',
          unit: 'pts',
          min: 300,
          max: 850,
          sets: [
            { id: 'poor', name: 'Low', mf: { type: 'trapezoidal', a: 300, b: 300, c: 550, d: 680 }, colorToken: 'orange' },
            { id: 'good', name: 'Strong', mf: { type: 'trapezoidal', a: 600, b: 720, c: 850, d: 850 }, colorToken: 'teal' },
          ],
        },
        {
          id: 'dti',
          name: 'Debt-to-Income',
          unit: '%',
          min: 0,
          max: 80,
          sets: [
            { id: 'low', name: 'Manageable', mf: { type: 'trapezoidal', a: 0, b: 0, c: 25, d: 45 }, colorToken: 'teal' },
            { id: 'high', name: 'Stretched', mf: { type: 'trapezoidal', a: 35, b: 55, c: 80, d: 80 }, colorToken: 'orange' },
          ],
        },
      ],
      output: {
        id: 'risk',
        name: 'Risk Score',
        unit: 'pts',
        min: 0,
        max: 100,
        sets: [
          { id: 'low', name: 'Low Risk', mf: { type: 'trapezoidal', a: 0, b: 0, c: 20, d: 45 }, colorToken: 'teal' },
          { id: 'mod', name: 'Moderate', mf: { type: 'triangular', a: 25, b: 50, c: 75 }, colorToken: 'navy' },
          { id: 'high', name: 'High Risk', mf: { type: 'trapezoidal', a: 55, b: 80, c: 100, d: 100 }, colorToken: 'orange' },
        ],
      },
      rules: [
        { id: 'L1', name: 'Strong Credit & Manageable DTI -> Low Risk', antecedents: [{ variableId: 'credit', setId: 'good' }, { variableId: 'dti', setId: 'low' }], operator: 'AND', consequent: { variableId: 'risk', setId: 'low' } },
        { id: 'L2', name: 'Strong Credit & Stretched DTI -> Moderate', antecedents: [{ variableId: 'credit', setId: 'good' }, { variableId: 'dti', setId: 'high' }], operator: 'AND', consequent: { variableId: 'risk', setId: 'mod' } },
        { id: 'L3', name: 'Low Credit & Manageable DTI -> Moderate', antecedents: [{ variableId: 'credit', setId: 'poor' }, { variableId: 'dti', setId: 'low' }], operator: 'AND', consequent: { variableId: 'risk', setId: 'mod' } },
        { id: 'L4', name: 'Low Credit & Stretched DTI -> High Risk', antecedents: [{ variableId: 'credit', setId: 'poor' }, { variableId: 'dti', setId: 'high' }], operator: 'AND', consequent: { variableId: 'risk', setId: 'high' } },
      ],
    },
  },
  {
    id: 'industrial-boiler',
    title: '6. Industrial Furnace / Boiler Control',
    problem: 'Regulate heater power from boiler temperature and internal steam pressure.',
    whyCrispStruggles:
      'Nonlinear thermal dynamics make exact differential equations brittle under varying fuel quality.',
    benefit:
      'Operator heuristics ("if pressure is high, back off heater") translate directly into safe fuzzy rules.',
    defaultInputs: { temp: 320, pressure: 60 },
    system: {
      id: 'app-boiler',
      name: 'Boiler Heater Controller',
      inputs: [
        {
          id: 'temp',
          name: 'Furnace Temp',
          unit: '°C',
          min: 100,
          max: 500,
          sets: [
            { id: 'low', name: 'Below Target', mf: { type: 'trapezoidal', a: 100, b: 100, c: 220, d: 340 }, colorToken: 'teal' },
            { id: 'high', name: 'At/Above Target', mf: { type: 'trapezoidal', a: 280, b: 380, c: 500, d: 500 }, colorToken: 'orange' },
          ],
        },
        {
          id: 'pressure',
          name: 'Steam Pressure',
          unit: 'bar',
          min: 0,
          max: 100,
          sets: [
            { id: 'safe', name: 'Normal', mf: { type: 'trapezoidal', a: 0, b: 0, c: 40, d: 70 }, colorToken: 'teal' },
            { id: 'elevated', name: 'Elevated', mf: { type: 'trapezoidal', a: 55, b: 80, c: 100, d: 100 }, colorToken: 'orange' },
          ],
        },
      ],
      output: {
        id: 'heater',
        name: 'Heater Power',
        unit: '%',
        min: 0,
        max: 100,
        sets: [
          { id: 'min', name: 'Minimum', mf: { type: 'trapezoidal', a: 0, b: 0, c: 15, d: 40 }, colorToken: 'teal' },
          { id: 'med', name: 'Steady', mf: { type: 'triangular', a: 25, b: 50, c: 75 }, colorToken: 'navy' },
          { id: 'max', name: 'Full', mf: { type: 'trapezoidal', a: 60, b: 85, c: 100, d: 100 }, colorToken: 'orange' },
        ],
      },
      rules: [
        { id: 'F1', name: 'Below Target & Normal -> Full', antecedents: [{ variableId: 'temp', setId: 'low' }, { variableId: 'pressure', setId: 'safe' }], operator: 'AND', consequent: { variableId: 'heater', setId: 'max' } },
        { id: 'F2', name: 'Below Target & Elevated -> Steady', antecedents: [{ variableId: 'temp', setId: 'low' }, { variableId: 'pressure', setId: 'elevated' }], operator: 'AND', consequent: { variableId: 'heater', setId: 'med' } },
        { id: 'F3', name: 'Above Target & Normal -> Steady', antecedents: [{ variableId: 'temp', setId: 'high' }, { variableId: 'pressure', setId: 'safe' }], operator: 'AND', consequent: { variableId: 'heater', setId: 'med' } },
        { id: 'F4', name: 'Above Target & Elevated -> Minimum', antecedents: [{ variableId: 'temp', setId: 'high' }, { variableId: 'pressure', setId: 'elevated' }], operator: 'AND', consequent: { variableId: 'heater', setId: 'min' } },
      ],
    },
  },
];

