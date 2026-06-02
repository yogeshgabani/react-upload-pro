import { describe, expect, it } from 'vitest';
import { formatBytes, formatEta, formatPercent, formatSpeed } from '../src/utils/format';

describe('formatBytes', () => {
  it('handles small values', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(512)).toMatch(/B/);
  });
  it('scales to KB/MB/GB', () => {
    expect(formatBytes(1024)).toMatch(/KB/);
    expect(formatBytes(1024 * 1024)).toMatch(/MB/);
    expect(formatBytes(1024 * 1024 * 1024)).toMatch(/GB/);
  });
});

describe('formatSpeed', () => {
  it('returns em-dash when unknown', () => {
    expect(formatSpeed(0)).toBe('—');
  });
  it('formats positive speeds', () => {
    expect(formatSpeed(1024)).toMatch(/KB\/s/);
  });
});

describe('formatEta', () => {
  it('returns em-dash when unknown', () => {
    expect(formatEta(Infinity)).toBe('—');
  });
  it('formats seconds, minutes, hours', () => {
    expect(formatEta(30)).toMatch(/s$/);
    expect(formatEta(120)).toMatch(/m/);
    expect(formatEta(3700)).toMatch(/h/);
  });
});

describe('formatPercent', () => {
  it('clamps to 0..1', () => {
    expect(formatPercent(-1)).toBe('0%');
    expect(formatPercent(2)).toBe('100%');
  });
});
