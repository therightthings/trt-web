type CalcSimpleBayesianRatingParams = {
  ratingAvg: number;
  ratingCount: number;
  minimumVotesThreshold?: number;
};

type CalcBayesianRatingParams = CalcSimpleBayesianRatingParams & {
  globalAvg: number;
};

/**
 * Bayesian average: https://en.wikipedia.org/wiki/Bayesian_average
 */
export function calcSimpleBayesianRating({
  ratingAvg,
  ratingCount: votes,
  minimumVotesThreshold,
}: CalcSimpleBayesianRatingParams): number {
  if (votes <= 0) return 0;

  const m = minimumVotesThreshold ?? 10;
  const score = (votes / (votes + m)) * ratingAvg;

  return Number(score.toFixed(3));
}

/**
 * Bayesian average: https://en.wikipedia.org/wiki/Bayesian_average
 */
export function calcBayesianRating({
  ratingAvg,
  ratingCount: votes,
  globalAvg,
  minimumVotesThreshold,
}: CalcBayesianRatingParams): number {
  const m = minimumVotesThreshold ?? 10;
  const denominator = votes + m;

  if (denominator <= 0) {
    return Number(globalAvg.toFixed(3));
  }

  const score = (votes / denominator) * ratingAvg + (m / denominator) * globalAvg;

  return Number(score.toFixed(3));
}
