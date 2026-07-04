// Run: npx vitest run projects/core/src/lib/number-handler/haversine-distance/calc-haversine-distance.spec.ts
import { describe, expect, it } from 'vitest';

import { calcHaversineDistance } from './calc-haversine-distance';

describe('calcHaversineDistance', () => {
  it('returns 0 for the same point', () => {
    expect(
      calcHaversineDistance(
        { latitude: 10.123, longitude: 106.456 },
        { latitude: 10.123, longitude: 106.456 },
      ),
    ).toBe(0);
  });

  it('calculates the known distance in kilometers', () => {
    expect(
      calcHaversineDistance(
        { latitude: 36.12, longitude: -86.67 },
        { latitude: 33.94, longitude: -118.4 },
      ),
    ).toBeCloseTo(2886.444, 3);
  });

  it('supports meters output', () => {
    expect(
      calcHaversineDistance(
        { latitude: 36.12, longitude: -86.67 },
        { latitude: 33.94, longitude: -118.4 },
        { unit: 'm' },
      ),
    ).toBeCloseTo(2886444.443, 3);
  });

  it('stays finite near antipodal points', () => {
    expect(
      Number.isFinite(
        calcHaversineDistance(
          { latitude: 0, longitude: 0 },
          { latitude: 0.000001, longitude: 179.999999 },
        ),
      ),
    ).toBe(true);
  });
});
