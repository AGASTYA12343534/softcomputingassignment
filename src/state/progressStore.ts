import { create } from 'zustand';

export type AppMode = 'learn' | 'experiment';

export interface QuizAttemptRecord {
  questionId: string;
  correct: boolean;
  attempts: number;
  lastAttemptAt: string;
}

export interface ProgressState {
  version: number;
  mode: AppMode;
  lastVisitedRoute: string;
  completedModules: string[];
  moduleQuizScores: Record<string, number>;
  practiceAnswers: Record<string, QuizAttemptRecord>;
  bestFinalScore: { score: number; total: number; percentage: number; date: string } | null;
  storageError: string | null;

  setMode: (mode: AppMode) => void;
  setLastVisitedRoute: (route: string) => void;
  markModuleComplete: (moduleId: string, score?: number) => void;
  recordPracticeAnswer: (questionId: string, correct: boolean) => void;
  recordFinalScore: (score: number, total: number) => void;
  resetProgress: () => void;
}

const STORAGE_KEY = 'fuzzylab_progress_v1';

interface PersistedProgress {
  version: number;
  mode: AppMode;
  lastVisitedRoute: string;
  completedModules: string[];
  moduleQuizScores: Record<string, number>;
  practiceAnswers: Record<string, QuizAttemptRecord>;
  bestFinalScore: { score: number; total: number; percentage: number; date: string } | null;
}

const DEFAULT_PERSISTED: PersistedProgress = {
  version: 1,
  mode: 'learn',
  lastVisitedRoute: '/learn/module-1',
  completedModules: [],
  moduleQuizScores: {},
  practiceAnswers: {},
  bestFinalScore: null,
};

function loadProgress(): { data: PersistedProgress; error: string | null } {
  if (typeof window === 'undefined') return { data: DEFAULT_PERSISTED, error: null };
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { data: DEFAULT_PERSISTED, error: null };
    const parsed = JSON.parse(raw) as Partial<PersistedProgress>;
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      parsed.version !== 1 ||
      !Array.isArray(parsed.completedModules)
    ) {
      return {
        data: DEFAULT_PERSISTED,
        error: 'Saved progress data had an unrecognized format and was safely reset.',
      };
    }
    return {
      data: {
        version: 1,
        mode: parsed.mode === 'experiment' ? 'experiment' : 'learn',
        lastVisitedRoute:
          typeof parsed.lastVisitedRoute === 'string'
            ? parsed.lastVisitedRoute
            : '/learn/module-1',
        completedModules: parsed.completedModules.filter((x): x is string => typeof x === 'string'),
        moduleQuizScores:
          parsed.moduleQuizScores && typeof parsed.moduleQuizScores === 'object'
            ? parsed.moduleQuizScores
            : {},
        practiceAnswers:
          parsed.practiceAnswers && typeof parsed.practiceAnswers === 'object'
            ? parsed.practiceAnswers
            : {},
        bestFinalScore: parsed.bestFinalScore ?? null,
      },
      error: null,
    };
  } catch {
    return {
      data: DEFAULT_PERSISTED,
      error: 'Local storage was unavailable or corrupted. Progress is running in memory.',
    };
  }
}

function saveProgress(state: PersistedProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore storage quota or private browsing errors gracefully
  }
}

const initial = loadProgress();

export const useProgressStore = create<ProgressState>((set, get) => ({
  ...initial.data,
  storageError: initial.error,

  setMode: (mode) => {
    set({ mode });
    const s = get();
    saveProgress({
      version: s.version,
      mode,
      lastVisitedRoute: s.lastVisitedRoute,
      completedModules: s.completedModules,
      moduleQuizScores: s.moduleQuizScores,
      practiceAnswers: s.practiceAnswers,
      bestFinalScore: s.bestFinalScore,
    });
  },

  setLastVisitedRoute: (route) => {
    set({ lastVisitedRoute: route });
    const s = get();
    saveProgress({
      version: s.version,
      mode: s.mode,
      lastVisitedRoute: route,
      completedModules: s.completedModules,
      moduleQuizScores: s.moduleQuizScores,
      practiceAnswers: s.practiceAnswers,
      bestFinalScore: s.bestFinalScore,
    });
  },

  markModuleComplete: (moduleId, score) => {
    const s = get();
    const completedModules = s.completedModules.includes(moduleId)
      ? s.completedModules
      : [...s.completedModules, moduleId];
    const moduleQuizScores =
      typeof score === 'number'
        ? {
            ...s.moduleQuizScores,
            [moduleId]: Math.max(s.moduleQuizScores[moduleId] ?? 0, score),
          }
        : s.moduleQuizScores;

    set({ completedModules, moduleQuizScores });
    saveProgress({
      version: s.version,
      mode: s.mode,
      lastVisitedRoute: s.lastVisitedRoute,
      completedModules,
      moduleQuizScores,
      practiceAnswers: s.practiceAnswers,
      bestFinalScore: s.bestFinalScore,
    });
  },

  recordPracticeAnswer: (questionId, correct) => {
    const s = get();
    const prev = s.practiceAnswers[questionId];
    const practiceAnswers: Record<string, QuizAttemptRecord> = {
      ...s.practiceAnswers,
      [questionId]: {
        questionId,
        correct: prev?.correct || correct,
        attempts: (prev?.attempts ?? 0) + 1,
        lastAttemptAt: new Date().toISOString(),
      },
    };
    set({ practiceAnswers });
    saveProgress({
      version: s.version,
      mode: s.mode,
      lastVisitedRoute: s.lastVisitedRoute,
      completedModules: s.completedModules,
      moduleQuizScores: s.moduleQuizScores,
      practiceAnswers,
      bestFinalScore: s.bestFinalScore,
    });
  },

  recordFinalScore: (score, total) => {
    const s = get();
    const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
    const prev = s.bestFinalScore;
    const bestFinalScore =
      !prev || percentage >= prev.percentage
        ? { score, total, percentage, date: new Date().toISOString() }
        : prev;
    set({ bestFinalScore });
    saveProgress({
      version: s.version,
      mode: s.mode,
      lastVisitedRoute: s.lastVisitedRoute,
      completedModules: s.completedModules,
      moduleQuizScores: s.moduleQuizScores,
      practiceAnswers: s.practiceAnswers,
      bestFinalScore,
    });
  },

  resetProgress: () => {
    set({ ...DEFAULT_PERSISTED, storageError: null });
    saveProgress(DEFAULT_PERSISTED);
  },
}));

