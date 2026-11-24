export type QuizQuestionType = 'mc' | 'tf' | 'numeric';
export type QuizDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface QuizQuestion {
  id: string;
  type: QuizQuestionType;
  topic: string;
  moduleNumber: number;
  difficulty: QuizDifficulty;
  prompt: string;
  options?: string[];
  correctIndex?: number;
  correctNumber?: number;
  tolerance?: number;
  optionExplanations?: string[];
  workedReasoning: string;
  /** Optional hook used by automated tests to verify numeric keys against src/engine */
  engineSpec?:
    | { kind: 'mf'; variableId: 'temperature' | 'humidity' | 'fanSpeed'; setId: string; x: number }
    | { kind: 'ruleStrength'; temp: number; hum: number; ruleId: string; andOp?: 'min' | 'product' }
    | { kind: 'controllerCentroid'; temp: number; hum: number }
    | { kind: 'controllerMom'; temp: number; hum: number };
}

