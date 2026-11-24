import type { FuzzySystem, LinguisticVariable, FuzzyRule } from './variables';

export const TEMPERATURE_VAR: LinguisticVariable = {
  id: 'temperature',
  name: 'Temperature',
  unit: '°C',
  min: 0,
  max: 40,
  sets: [
    { id: 'cool', name: 'Cool', mf: { type: 'trapezoidal', a: 0, b: 0, c: 12, d: 24 }, colorToken: 'teal' },
    { id: 'warm', name: 'Warm', mf: { type: 'triangular', a: 12, b: 24, c: 36 }, colorToken: 'navy' },
    { id: 'hot', name: 'Hot', mf: { type: 'trapezoidal', a: 24, b: 36, c: 40, d: 40 }, colorToken: 'orange' },
  ],
};

export const HUMIDITY_VAR: LinguisticVariable = {
  id: 'humidity',
  name: 'Humidity',
  unit: '%',
  min: 0,
  max: 100,
  sets: [
    { id: 'dry', name: 'Dry', mf: { type: 'trapezoidal', a: 0, b: 0, c: 25, d: 50 }, colorToken: 'teal' },
    { id: 'normal', name: 'Normal', mf: { type: 'triangular', a: 25, b: 50, c: 75 }, colorToken: 'navy' },
    { id: 'humid', name: 'Humid', mf: { type: 'trapezoidal', a: 50, b: 75, c: 100, d: 100 }, colorToken: 'orange' },
  ],
};

export const FAN_SPEED_VAR: LinguisticVariable = {
  id: 'fanSpeed',
  name: 'Fan Speed',
  unit: '%',
  min: 0,
  max: 100,
  sets: [
    { id: 'low', name: 'Low', mf: { type: 'trapezoidal', a: 0, b: 0, c: 20, d: 50 }, colorToken: 'teal' },
    { id: 'medium', name: 'Medium', mf: { type: 'triangular', a: 20, b: 50, c: 80 }, colorToken: 'navy' },
    { id: 'high', name: 'High', mf: { type: 'trapezoidal', a: 50, b: 80, c: 100, d: 100 }, colorToken: 'orange' },
  ],
};

export const DEFAULT_FAN_RULES: FuzzyRule[] = [
  {
    id: 'R1',
    name: 'Cool + Dry -> Low',
    antecedents: [
      { variableId: 'temperature', setId: 'cool' },
      { variableId: 'humidity', setId: 'dry' },
    ],
    operator: 'AND',
    consequent: { variableId: 'fanSpeed', setId: 'low' },
  },
  {
    id: 'R2',
    name: 'Cool + Normal -> Low',
    antecedents: [
      { variableId: 'temperature', setId: 'cool' },
      { variableId: 'humidity', setId: 'normal' },
    ],
    operator: 'AND',
    consequent: { variableId: 'fanSpeed', setId: 'low' },
  },
  {
    id: 'R3',
    name: 'Cool + Humid -> Medium',
    antecedents: [
      { variableId: 'temperature', setId: 'cool' },
      { variableId: 'humidity', setId: 'humid' },
    ],
    operator: 'AND',
    consequent: { variableId: 'fanSpeed', setId: 'medium' },
  },
  {
    id: 'R4',
    name: 'Warm + Dry -> Low',
    antecedents: [
      { variableId: 'temperature', setId: 'warm' },
      { variableId: 'humidity', setId: 'dry' },
    ],
    operator: 'AND',
    consequent: { variableId: 'fanSpeed', setId: 'low' },
  },
  {
    id: 'R5',
    name: 'Warm + Normal -> Medium',
    antecedents: [
      { variableId: 'temperature', setId: 'warm' },
      { variableId: 'humidity', setId: 'normal' },
    ],
    operator: 'AND',
    consequent: { variableId: 'fanSpeed', setId: 'medium' },
  },
  {
    id: 'R6',
    name: 'Warm + Humid -> High',
    antecedents: [
      { variableId: 'temperature', setId: 'warm' },
      { variableId: 'humidity', setId: 'humid' },
    ],
    operator: 'AND',
    consequent: { variableId: 'fanSpeed', setId: 'high' },
  },
  {
    id: 'R7',
    name: 'Hot + Dry -> Medium',
    antecedents: [
      { variableId: 'temperature', setId: 'hot' },
      { variableId: 'humidity', setId: 'dry' },
    ],
    operator: 'AND',
    consequent: { variableId: 'fanSpeed', setId: 'medium' },
  },
  {
    id: 'R8',
    name: 'Hot + Normal -> High',
    antecedents: [
      { variableId: 'temperature', setId: 'hot' },
      { variableId: 'humidity', setId: 'normal' },
    ],
    operator: 'AND',
    consequent: { variableId: 'fanSpeed', setId: 'high' },
  },
  {
    id: 'R9',
    name: 'Hot + Humid -> High',
    antecedents: [
      { variableId: 'temperature', setId: 'hot' },
      { variableId: 'humidity', setId: 'humid' },
    ],
    operator: 'AND',
    consequent: { variableId: 'fanSpeed', setId: 'high' },
  },
];

export const ROOM_FAN_SYSTEM: FuzzySystem = {
  id: 'room-fan-controller',
  name: 'Room Fan Controller',
  inputs: [TEMPERATURE_VAR, HUMIDITY_VAR],
  output: FAN_SPEED_VAR,
  rules: DEFAULT_FAN_RULES,
};

export interface ScenarioPreset {
  id: string;
  label: string;
  description: string;
  temperature: number;
  humidity: number;
}

export const CONTROLLER_PRESETS: ScenarioPreset[] = [
  {
    id: 'reference',
    label: 'Reference case (24 °C / 45 %)',
    description: 'Hand-verifiable benchmark: Warm = 1.0, Dry = 0.2, Normal = 0.8.',
    temperature: 24,
    humidity: 45,
  },
  {
    id: 'cool-dry',
    label: 'Cool dry morning (10 °C / 20 %)',
    description: 'Comfortably cool and dry; only Low fan rules fire.',
    temperature: 10,
    humidity: 20,
  },
  {
    id: 'warm-normal',
    label: 'Warm normal afternoon (24 °C / 50 %)',
    description: 'Exact center of Warm and Normal; pure Medium output at 50 %.',
    temperature: 24,
    humidity: 50,
  },
  {
    id: 'hot-humid',
    label: 'Hot humid day (35 °C / 80 %)',
    description: 'High temperature and high humidity drive High fan speed.',
    temperature: 35,
    humidity: 80,
  },
  {
    id: 'boundary-coldest',
    label: 'Boundary: coldest (0 °C / 0 %)',
    description: 'Tests left-shoulder membership saturation at universe minimum.',
    temperature: 0,
    humidity: 0,
  },
  {
    id: 'boundary-hottest',
    label: 'Boundary: hottest & humid (40 °C / 100 %)',
    description: 'Tests right-shoulder membership saturation at universe maximum.',
    temperature: 40,
    humidity: 100,
  },
];

