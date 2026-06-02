import { describe, expect, it } from 'vitest';
import { SpeedMeter } from '../src/core/speed';

describe('SpeedMeter', () => {
  it('returns 0 speed on first update', () => {
    const m = new SpeedMeter(1000);
    const { speed, eta } = m.update(0);
    expect(speed).toBe(0);
    expect(eta).toBe(Infinity);
  });

  it('handles regressing byte counts gracefully', () => {
    const m = new SpeedMeter(1000);
    m.update(500);
    const result = m.update(200);
    expect(Number.isFinite(result.speed)).toBe(true);
  });
});
