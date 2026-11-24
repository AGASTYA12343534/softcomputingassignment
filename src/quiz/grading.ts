import type { QuizQuestion } from './types';

export function seededRandom(seed: number): () => number {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function seededShuffle<T>(items: T[], seed: number): T[] {
  const arr = [...items];
  const rand = seededRandom(seed);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function gradeQuestion(
  q: QuizQuestion,
  answer: number | string | undefined
): boolean {
  if (answer === undefined || answer === '') return false;
  if (q.type === 'numeric') {
    const val = typeof answer === 'number' ? answer : Number(answer);
    if (!Number.isFinite(val) || typeof q.correctNumber !== 'number') return false;
    return Math.abs(val - q.correctNumber) <= (q.tolerance ?? 0.02);
  }
  return answer === q.correctIndex;
}

export function drawFinalAssessment(
  bank: QuizQuestion[],
  count = 20,
  seed = 20261124
): QuizQuestion[] {
  // Ensure coverage across all 9 modules first, then fill remaining slots
  const picked: QuizQuestion[] = [];
  const usedIds = new Set<string>();

  for (let mod = 1; mod <= 9; mod++) {
    const candidates = seededShuffle(
      bank.filter((q) => q.moduleNumber === mod),
      seed + mod * 31
    );
    if (candidates[0]) {
      picked.push(candidates[0]);
      usedIds.add(candidates[0].id);
    }
  }

  const remaining = seededShuffle(
    bank.filter((q) => !usedIds.has(q.id)),
    seed + 999
  );
  for (const q of remaining) {
    if (picked.length >= count) break;
    picked.push(q);
  }

  return seededShuffle(picked, seed + 7);
}

