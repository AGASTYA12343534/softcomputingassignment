export interface ModuleMeta {
  id: string;
  number: number;
  title: string;
  shortTitle: string;
  estimatedMinutes: number;
}

export const MODULE_META: ModuleMeta[] = [
  { id: 'module-1', number: 1, title: 'Introduction to Fuzzy Logic', shortTitle: 'Introduction', estimatedMinutes: 6 },
  { id: 'module-2', number: 2, title: 'Boolean Logic vs Fuzzy Logic', shortTitle: 'Boolean vs Fuzzy', estimatedMinutes: 8 },
  { id: 'module-3', number: 3, title: 'Fuzzy Sets and Membership Functions', shortTitle: 'Membership Functions', estimatedMinutes: 12 },
  { id: 'module-4', number: 4, title: 'Fuzzification', shortTitle: 'Fuzzification', estimatedMinutes: 8 },
  { id: 'module-5', number: 5, title: 'Fuzzy Rule Base', shortTitle: 'Rule Base', estimatedMinutes: 8 },
  { id: 'module-6', number: 6, title: 'Inference Engine', shortTitle: 'Inference Engine', estimatedMinutes: 10 },
  { id: 'module-7', number: 7, title: 'Aggregation', shortTitle: 'Aggregation', estimatedMinutes: 8 },
  { id: 'module-8', number: 8, title: 'Defuzzification', shortTitle: 'Defuzzification', estimatedMinutes: 12 },
  { id: 'module-9', number: 9, title: 'Complete Fuzzy Logic Controller', shortTitle: 'Full Controller', estimatedMinutes: 15 },
];

