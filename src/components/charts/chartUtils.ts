import type { FuzzySet, SetColorToken } from '@/engine';

export const SET_COLORS: Record<SetColorToken, string> = {
  teal: '#2A7F82',
  navy: '#14213D',
  orange: '#D9772B',
};

export const SET_DASH: Record<SetColorToken, string | undefined> = {
  teal: undefined,
  navy: '6 4',
  orange: undefined,
};

export function getSetStyle(set: FuzzySet, index: number): { color: string; dash?: string } {
  const token: SetColorToken =
    set.colorToken ?? (index === 0 ? 'teal' : index === 1 ? 'navy' : 'orange');
  return {
    color: SET_COLORS[token],
    dash: SET_DASH[token],
  };
}

export function getSetPeakX(set: FuzzySet, min: number, max: number): number {
  const mf = set.mf;
  if (mf.type === 'triangular') return mf.b;
  if (mf.type === 'trapezoidal') {
    if (mf.a === mf.b) return (mf.b + mf.c) / 2;
    if (mf.c === mf.d) return (mf.b + mf.c) / 2;
    return (mf.b + mf.c) / 2;
  }
  return Math.max(min, Math.min(max, mf.m));
}

