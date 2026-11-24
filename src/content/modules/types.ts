import type { CheckQuestion } from '@/components/lesson/KnowledgeCheck';

export interface LessonModule {
  id: string;
  number: number;
  title: string;
  estimatedMinutes: number;
  goals: string[];
  definition: string;
  intuition: string;
  workedExample: string;
  mathLatex: string;
  mathCaption: string;
  symbolKeys: string[];
  activityId: string;
  misconceptions: string[];
  knowledgeCheck: CheckQuestion[];
  summary: string;
}

