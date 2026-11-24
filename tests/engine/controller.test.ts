import { describe, expect, it } from 'vitest';
import {
  defuzzifyCentroid,
  FAN_SPEED_VAR,
  ROOM_FAN_SYSTEM,
  runInference,
  evaluateMF,
  type FuzzySystem,
} from '@/engine';
import { refFanInference } from './referenceImpl';

describe('Room Fan Controller & Inference Engine', () => {
  it('reproduces the hand-verifiable reference case (24 °C, 45 %)', () => {
    const trace = runInference(ROOM_FAN_SYSTEM, { temperature: 24, humidity: 45 });

    // Temperature memberships
    const temp = trace.fuzzified.find((f) => f.variableId === 'temperature')!;
    expect(temp.memberships.find((m) => m.setId === 'cool')!.degree).toBe(0);
    expect(temp.memberships.find((m) => m.setId === 'warm')!.degree).toBe(1);
    expect(temp.memberships.find((m) => m.setId === 'hot')!.degree).toBe(0);

    // Humidity memberships
    const hum = trace.fuzzified.find((f) => f.variableId === 'humidity')!;
    expect(hum.memberships.find((m) => m.setId === 'dry')!.degree).toBeCloseTo(0.2, 9);
    expect(hum.memberships.find((m) => m.setId === 'normal')!.degree).toBeCloseTo(0.8, 9);
    expect(hum.memberships.find((m) => m.setId === 'humid')!.degree).toBe(0);

    // Active rules: R4 (0.2) and R5 (0.8) only
    expect(trace.activeRules).toHaveLength(2);
    expect(trace.activeRules.map((r) => r.rule.id)).toEqual(['R4', 'R5']);
    expect(trace.activeRules[0].firingStrength).toBeCloseTo(0.2, 9);
    expect(trace.activeRules[1].firingStrength).toBeCloseTo(0.8, 9);

    // Discrete centroid: sum(mu) = 33.5, sum(y*mu) = 1493.1667, result ~= 44.57
    const centroid = trace.defuzzification.centroid;
    expect(centroid.ok).toBe(true);
    if (centroid.ok) {
      expect(centroid.denominator).toBeCloseTo(33.5, 4);
      expect(centroid.numerator).toBeCloseTo(1493.1667, 2);
      expect(centroid.value).toBeCloseTo(44.5721, 2);
      expect(Math.abs(centroid.value - 44.57)).toBeLessThan(0.01);
    }

    // Continuous analytic centroid: area 33.4, moment 1493.2, result ~= 44.708
    const analytic = trace.defuzzification.analyticCentroid;
    expect(analytic.ok).toBe(true);
    if (analytic.ok && centroid.ok) {
      expect(analytic.denominator).toBeCloseTo(33.4, 2);
      expect(analytic.numerator).toBeCloseTo(1493.2, 1);
      expect(Math.abs(analytic.value - 44.708)).toBeLessThan(0.01);
      expect(Math.abs(centroid.value - analytic.value)).toBeLessThan(0.2);
    }

    // Bisector and MoM against independent reference
    const ref = refFanInference(24, 45);
    expect(trace.defuzzification.bisector.result.ok).toBe(true);
    if (trace.defuzzification.bisector.result.ok) {
      expect(trace.defuzzification.bisector.result.value).toBeCloseTo(ref.bisectorDiscrete, 6);
    }

    // MoM on plateau [44, 56] has mean 50
    expect(trace.defuzzification.mom.result.ok).toBe(true);
    if (trace.defuzzification.mom.result.ok) {
      expect(trace.defuzzification.mom.result.value).toBeCloseTo(50, 9);
      expect(trace.defuzzification.mom.result.value).toBeCloseTo(ref.momDiscrete, 9);
    }
  });

  it('matches the independent reference implementation across a full grid of inputs', () => {
    for (let t = 0; t <= 40; t += 4) {
      for (let h = 0; h <= 100; h += 10) {
        const trace = runInference(
          ROOM_FAN_SYSTEM,
          { temperature: t, humidity: h },
          {},
          { computeAnalytic: false }
        );
        const ref = refFanInference(t, h);

        expect(trace.defuzzification.centroid.ok).toBe(true);
        if (trace.defuzzification.centroid.ok) {
          expect(trace.defuzzification.centroid.value).toBeGreaterThanOrEqual(0);
          expect(trace.defuzzification.centroid.value).toBeLessThanOrEqual(100);
          expect(trace.defuzzification.centroid.value).toBeCloseTo(ref.centroidDiscrete, 6);
        }

        if (trace.defuzzification.bisector.result.ok) {
          expect(trace.defuzzification.bisector.result.value).toBeCloseTo(ref.bisectorDiscrete, 6);
        }
        if (trace.defuzzification.mom.result.ok) {
          expect(trace.defuzzification.mom.result.value).toBeCloseTo(ref.momDiscrete, 6);
        }
      }
    }
  });

  it('keeps outputs within [0, 100] on the dense grid (T step 1, H step 5)', () => {
    for (let t = 0; t <= 40; t += 1) {
      for (let h = 0; h <= 100; h += 5) {
        const trace = runInference(
          ROOM_FAN_SYSTEM,
          { temperature: t, humidity: h },
          {},
          { computeAnalytic: false }
        );
        expect(trace.defuzzification.centroid.ok).toBe(true);
        if (trace.defuzzification.centroid.ok) {
          expect(trace.defuzzification.centroid.value).toBeGreaterThanOrEqual(0);
          expect(trace.defuzzification.centroid.value).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it('clamps out-of-universe inputs consistently', () => {
    const low = runInference(ROOM_FAN_SYSTEM, { temperature: -10, humidity: -5 });
    const atZero = runInference(ROOM_FAN_SYSTEM, { temperature: 0, humidity: 0 });
    expect(low.fuzzified[0].wasClamped).toBe(true);
    expect(low.fuzzified[0].clampedInput).toBe(0);
    expect(low.defuzzification.centroid).toEqual(atZero.defuzzification.centroid);

    const high = runInference(ROOM_FAN_SYSTEM, { temperature: 55, humidity: 120 });
    const atMax = runInference(ROOM_FAN_SYSTEM, { temperature: 40, humidity: 100 });
    expect(high.fuzzified[0].clampedInput).toBe(40);
    expect(high.fuzzified[1].clampedInput).toBe(100);
    expect(high.defuzzification.centroid).toEqual(atMax.defuzzification.centroid);
  });

  it('verifies mirror symmetry of Low (0,0,20,50) and High (50,80,100,100) about y = 50', () => {
    const lowSet = FAN_SPEED_VAR.sets.find((s) => s.id === 'low')!;
    const highSet = FAN_SPEED_VAR.sets.find((s) => s.id === 'high')!;

    for (let y = 0; y <= 100; y++) {
      const lowVal = evaluateMF(y, lowSet.mf).value;
      const highMirrorVal = evaluateMF(100 - y, highSet.mf).value;
      expect(lowVal).toBeCloseTo(highMirrorVal, 9);
    }

    const lowSamples = Array.from({ length: 101 }, (_, y) => ({
      y,
      mu: evaluateMF(y, lowSet.mf).value,
    }));
    const highSamples = Array.from({ length: 101 }, (_, y) => ({
      y,
      mu: evaluateMF(y, highSet.mf).value,
    }));

    const cLow = defuzzifyCentroid(lowSamples);
    const cHigh = defuzzifyCentroid(highSamples);
    expect(cLow.ok && cHigh.ok).toBe(true);
    if (cLow.ok && cHigh.ok) {
      expect(cHigh.value).toBeCloseTo(100 - cLow.value, 9);
    }
  });

  it('verifies corner cases (0,0), (40,100), (0,100), (40,0)', () => {
    const c00 = runInference(ROOM_FAN_SYSTEM, { temperature: 0, humidity: 0 });
    expect(c00.activeRules.map((r) => r.rule.id)).toEqual(['R1']);
    expect(c00.activeRules[0].firingStrength).toBe(1);
    expect(c00.defuzzification.centroid.ok && c00.defuzzification.centroid.value).toBeLessThan(25);

    const c40100 = runInference(ROOM_FAN_SYSTEM, { temperature: 40, humidity: 100 });
    expect(c40100.activeRules.map((r) => r.rule.id)).toEqual(['R9']);
    expect(c40100.activeRules[0].firingStrength).toBe(1);
    expect(
      c40100.defuzzification.centroid.ok && c40100.defuzzification.centroid.value
    ).toBeGreaterThan(75);

    const c0100 = runInference(ROOM_FAN_SYSTEM, { temperature: 0, humidity: 100 });
    expect(c0100.activeRules.map((r) => r.rule.id)).toEqual(['R3']);
    expect(c0100.activeRules[0].firingStrength).toBe(1);
    if (c0100.defuzzification.centroid.ok) {
      expect(c0100.defuzzification.centroid.value).toBeCloseTo(50, 9);
    }

    const c400 = runInference(ROOM_FAN_SYSTEM, { temperature: 40, humidity: 0 });
    expect(c400.activeRules.map((r) => r.rule.id)).toEqual(['R7']);
    expect(c400.activeRules[0].firingStrength).toBe(1);
    if (c400.defuzzification.centroid.ok) {
      expect(c400.defuzzification.centroid.value).toBeCloseTo(50, 9);
    }
  });

  it('demonstrates min vs product AND operator differences', () => {
    // At T = 18 °C (Cool = 0.5, Warm = 0.5) and H = 40 % (Dry = 0.4, Normal = 0.6):
    // R1 (Cool & Dry): min(0.5, 0.4) = 0.4 vs product 0.5 * 0.4 = 0.2
    // R2 (Cool & Normal): min(0.5, 0.6) = 0.5 vs product 0.5 * 0.6 = 0.3
    // R4 (Warm & Dry): min(0.5, 0.4) = 0.4 vs product 0.5 * 0.4 = 0.2
    // R5 (Warm & Normal): min(0.5, 0.6) = 0.5 vs product 0.5 * 0.6 = 0.3
    const minTrace = runInference(
      ROOM_FAN_SYSTEM,
      { temperature: 18, humidity: 40 },
      { andOperator: 'min' }
    );
    const prodTrace = runInference(
      ROOM_FAN_SYSTEM,
      { temperature: 18, humidity: 40 },
      { andOperator: 'product' }
    );

    expect(minTrace.ruleEvaluations.find((r) => r.rule.id === 'R1')!.firingStrength).toBeCloseTo(
      0.4,
      9
    );
    expect(prodTrace.ruleEvaluations.find((r) => r.rule.id === 'R1')!.firingStrength).toBeCloseTo(
      0.2,
      9
    );
    expect(minTrace.ruleEvaluations.find((r) => r.rule.id === 'R5')!.firingStrength).toBeCloseTo(
      0.5,
      9
    );
    expect(prodTrace.ruleEvaluations.find((r) => r.rule.id === 'R5')!.firingStrength).toBeCloseTo(
      0.3,
      9
    );
  });

  it('verifies non-decreasing monotonicity with humidity fixed at 50 %', () => {
    let prev = -1;
    for (let t = 0; t <= 40; t += 1) {
      const trace = runInference(
        ROOM_FAN_SYSTEM,
        { temperature: t, humidity: 50 },
        {},
        { computeAnalytic: false }
      );
      expect(trace.defuzzification.centroid.ok).toBe(true);
      if (trace.defuzzification.centroid.ok) {
        expect(trace.defuzzification.centroid.value).toBeGreaterThanOrEqual(prev - 1e-9);
        prev = trace.defuzzification.centroid.value;
      }
    }
  });

  it('handles zero-area edge case gracefully without NaN', () => {
    const emptySystem: FuzzySystem = {
      ...ROOM_FAN_SYSTEM,
      rules: [],
    };
    const trace = runInference(emptySystem, { temperature: 24, humidity: 45 });
    expect(trace.activeRules).toHaveLength(0);
    expect(trace.defuzzification.selectedResult.ok).toBe(false);
    if (!trace.defuzzification.selectedResult.ok) {
      expect(trace.defuzzification.selectedResult.reason).toContain('No rule fired');
    }
  });
});
