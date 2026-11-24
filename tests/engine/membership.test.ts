import { describe, expect, it } from 'vitest';
import {
  evaluateGaussian,
  evaluateMF,
  evaluateTrapezoidal,
  evaluateTriangular,
  FAN_SPEED_VAR,
  HUMIDITY_VAR,
  TEMPERATURE_VAR,
  validateParams,
} from '@/engine';

describe('Membership Functions & Validation', () => {
  it('handles trapezoidal left and right shoulders without division by zero', () => {
    // Cool = (0, 0, 12, 24)
    expect(evaluateTrapezoidal(0, 0, 0, 12, 24).value).toBe(1);
    expect(evaluateTrapezoidal(12, 0, 0, 12, 24).value).toBe(1);
    expect(evaluateTrapezoidal(18, 0, 0, 12, 24).value).toBeCloseTo(0.5, 9);
    expect(evaluateTrapezoidal(24, 0, 0, 12, 24).value).toBe(0);
    expect(evaluateTrapezoidal(-1, 0, 0, 12, 24).value).toBe(0);

    // Hot = (24, 36, 40, 40)
    expect(evaluateTrapezoidal(24, 24, 36, 40, 40).value).toBe(0);
    expect(evaluateTrapezoidal(30, 24, 36, 40, 40).value).toBeCloseTo(0.5, 9);
    expect(evaluateTrapezoidal(36, 24, 36, 40, 40).value).toBe(1);
    expect(evaluateTrapezoidal(40, 24, 36, 40, 40).value).toBe(1);
    expect(evaluateTrapezoidal(41, 24, 36, 40, 40).value).toBe(0);
  });

  it('handles triangular breakpoints and degenerate shoulders', () => {
    // Warm = (12, 24, 36)
    expect(evaluateTriangular(12, 12, 24, 36).value).toBe(0);
    expect(evaluateTriangular(18, 12, 24, 36).value).toBeCloseTo(0.5, 9);
    expect(evaluateTriangular(24, 12, 24, 36).value).toBe(1);
    expect(evaluateTriangular(30, 12, 24, 36).value).toBeCloseTo(0.5, 9);
    expect(evaluateTriangular(36, 12, 24, 36).value).toBe(0);

    // Degenerate left shoulder triangle (0, 0, 10)
    expect(evaluateTriangular(0, 0, 0, 10).value).toBe(1);
    expect(evaluateTriangular(5, 0, 0, 10).value).toBeCloseTo(0.5, 9);
    expect(evaluateTriangular(10, 0, 0, 10).value).toBe(0);

    // Degenerate right shoulder triangle (0, 10, 10)
    expect(evaluateTriangular(10, 0, 10, 10).value).toBe(1);
    expect(evaluateTriangular(5, 0, 10, 10).value).toBeCloseTo(0.5, 9);
    expect(evaluateTriangular(0, 0, 10, 10).value).toBe(0);
  });

  it('evaluates Gaussian membership accurately and clamps to [0, 1]', () => {
    expect(evaluateGaussian(20, 20, 5).value).toBe(1);
    expect(evaluateGaussian(25, 20, 5).value).toBeCloseTo(Math.exp(-0.5), 9);
    expect(evaluateGaussian(15, 20, 5).value).toBeCloseTo(Math.exp(-0.5), 9);
  });

  it('verifies universe boundary and breakpoint values for all default controller sets', () => {
    // Temperature ends
    expect(evaluateMF(0, TEMPERATURE_VAR.sets[0].mf).value).toBe(1); // Cool at 0
    expect(evaluateMF(40, TEMPERATURE_VAR.sets[2].mf).value).toBe(1); // Hot at 40
    // Humidity ends
    expect(evaluateMF(0, HUMIDITY_VAR.sets[0].mf).value).toBe(1); // Dry at 0
    expect(evaluateMF(100, HUMIDITY_VAR.sets[2].mf).value).toBe(1); // Humid at 100
    // Fan Speed ends
    expect(evaluateMF(0, FAN_SPEED_VAR.sets[0].mf).value).toBe(1); // Low at 0
    expect(evaluateMF(100, FAN_SPEED_VAR.sets[2].mf).value).toBe(1); // High at 100
  });

  it('verifies partition-of-unity property on Temperature and Humidity integer grids', () => {
    for (let t = 0; t <= 40; t++) {
      const sum = TEMPERATURE_VAR.sets.reduce((acc, s) => acc + evaluateMF(t, s.mf).value, 0);
      expect(sum).toBeCloseTo(1, 9);
    }
    for (let h = 0; h <= 100; h++) {
      const sum = HUMIDITY_VAR.sets.reduce((acc, s) => acc + evaluateMF(h, s.mf).value, 0);
      expect(sum).toBeCloseTo(1, 9);
    }
  });

  it('rejects invalid membership parameters with descriptive errors', () => {
    expect(validateParams({ type: 'triangular', a: 10, b: 20, c: 30 }).valid).toBe(true);
    expect(validateParams({ type: 'triangular', a: 25, b: 20, c: 30 }).valid).toBe(false);
    expect(validateParams({ type: 'triangular', a: 10, b: 10, c: 10 }).valid).toBe(false);

    expect(validateParams({ type: 'trapezoidal', a: 0, b: 0, c: 10, d: 20 }).valid).toBe(true);
    expect(validateParams({ type: 'trapezoidal', a: 0, b: 15, c: 10, d: 20 }).valid).toBe(false);
    expect(validateParams({ type: 'trapezoidal', a: 5, b: 5, c: 5, d: 5 }).valid).toBe(false);

    expect(validateParams({ type: 'gaussian', m: 20, sigma: 5 }).valid).toBe(true);
    expect(validateParams({ type: 'gaussian', m: 20, sigma: 0 }).valid).toBe(false);
    expect(validateParams({ type: 'gaussian', m: 20, sigma: -2 }).valid).toBe(false);
  });
});

