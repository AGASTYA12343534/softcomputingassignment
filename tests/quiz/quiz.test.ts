import { describe, expect, it } from 'vitest';
import {
  evaluateMF,
  FAN_SPEED_VAR,
  HUMIDITY_VAR,
  ROOM_FAN_SYSTEM,
  runInference,
  TEMPERATURE_VAR,
} from '@/engine';
import { QUIZ_BANK } from '@/quiz/bank';
import { drawFinalAssessment, gradeQuestion } from '@/quiz/grading';

describe('Quiz Bank & Grading', () => {
  it('contains at least 30 questions covering all 9 modules', () => {
    expect(QUIZ_BANK.length).toBeGreaterThanOrEqual(30);
    for (let m = 1; m <= 9; m++) {
      expect(QUIZ_BANK.some((q) => q.moduleNumber === m)).toBe(true);
    }
  });

  it('verifies every calculation question answer key against the real engine', () => {
    const engineQuestions = QUIZ_BANK.filter((q) => q.engineSpec);
    expect(engineQuestions.length).toBeGreaterThanOrEqual(8);

    for (const q of engineQuestions) {
      const spec = q.engineSpec!;
      let computed = 0;

      if (spec.kind === 'mf') {
        const variable =
          spec.variableId === 'temperature'
            ? TEMPERATURE_VAR
            : spec.variableId === 'humidity'
              ? HUMIDITY_VAR
              : FAN_SPEED_VAR;
        const set = variable.sets.find((s) => s.id === spec.setId)!;
        computed = evaluateMF(spec.x, set.mf).value;
      } else if (spec.kind === 'ruleStrength') {
        const tr = runInference(
          ROOM_FAN_SYSTEM,
          { temperature: spec.temp, humidity: spec.hum },
          { andOperator: spec.andOp ?? 'min' },
          { computeAnalytic: false }
        );
        computed = tr.ruleEvaluations.find((r) => r.rule.id === spec.ruleId)!.firingStrength;
      } else if (spec.kind === 'controllerCentroid') {
        const tr = runInference(
          ROOM_FAN_SYSTEM,
          { temperature: spec.temp, humidity: spec.hum },
          {},
          { computeAnalytic: false }
        );
        expect(tr.defuzzification.centroid.ok).toBe(true);
        computed = tr.defuzzification.centroid.ok ? tr.defuzzification.centroid.value : -1;
      } else if (spec.kind === 'controllerMom') {
        const tr = runInference(
          ROOM_FAN_SYSTEM,
          { temperature: spec.temp, humidity: spec.hum },
          {},
          { computeAnalytic: false }
        );
        expect(tr.defuzzification.mom.result.ok).toBe(true);
        computed = tr.defuzzification.mom.result.ok ? tr.defuzzification.mom.result.value : -1;
      }

      expect(Math.abs(computed - (q.correctNumber ?? 0))).toBeLessThanOrEqual(q.tolerance ?? 0.02);
    }
  });

  it('grades numeric answers within tolerance and draws 20-question final assessments', () => {
    const refQ = QUIZ_BANK.find((q) => q.id === 'q28')!;
    expect(gradeQuestion(refQ, '44.57')).toBe(true);
    expect(gradeQuestion(refQ, '44.59')).toBe(true);
    expect(gradeQuestion(refQ, '45.50')).toBe(false);

    const exam = drawFinalAssessment(QUIZ_BANK, 20);
    expect(exam).toHaveLength(20);
    const modulesCovered = new Set(exam.map((q) => q.moduleNumber));
    expect(modulesCovered.size).toBe(9);
  });
});

