// Run: npx vitest run projects/core/src/lib/number-handler/bayesian-rating/calc-bayesian-rating.spec.ts
import { describe, expect, it } from 'vitest';

import { calcBayesianRating, calcSimpleBayesianRating } from './calc-bayesian-rating';

describe('calcSimpleBayesianRating', () => {
  it('returns 0 when there are no votes', () => {
    expect(
      calcSimpleBayesianRating({
        ratingAvg: 4.8,
        ratingCount: 0,
      }),
    ).toBe(0);
  });

  it('weights the average by the vote count and threshold', () => {
    expect(
      calcSimpleBayesianRating({
        ratingAvg: 4.8,
        ratingCount: 12,
        minimumVotesThreshold: 8,
      }),
    ).toBe(2.88);
  });
});

describe('calcBayesianRating', () => {
  it('returns the global average when there are no votes', () => {
    expect(
      calcBayesianRating({
        ratingAvg: 4.8,
        ratingCount: 0,
        globalAvg: 3.6,
      }),
    ).toBe(3.6);
  });

  it('blends the item average with the global average', () => {
    expect(
      calcBayesianRating({
        ratingAvg: 5,
        ratingCount: 1,
        globalAvg: 3,
      }),
    ).toBe(3.182);
  });

  it('supports a custom smoothing threshold', () => {
    expect(
      calcBayesianRating({
        ratingAvg: 4.5,
        ratingCount: 6,
        globalAvg: 3.5,
        minimumVotesThreshold: 2,
      }),
    ).toBe(4.25);
  });
});
