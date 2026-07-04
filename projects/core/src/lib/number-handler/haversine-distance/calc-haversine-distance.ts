interface Point {
  latitude: number;
  longitude: number;
}

interface DistanceOptions {
  unit?: 'km' | 'm';
}

/**
 * References:
 * - Wikipedia: https://en.wikipedia.org/wiki/Haversine_formula
 */
export function calcHaversineDistance(from: Point, to: Point, options?: DistanceOptions): number {
  const { unit = 'km' } = options ?? {};
  const toRadians = (value: number) => {
    return (value * Math.PI) / 180;
  };

  const earthRadiusKm = 6371;
  const deltaLat = toRadians(to.latitude - from.latitude);
  const deltaLon = toRadians(to.longitude - from.longitude);
  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const a =
    Math.sin(deltaLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;
  const clampedA = Math.min(1, Math.max(0, a));

  const distanceKm = earthRadiusKm * 2 * Math.atan2(
    Math.sqrt(clampedA),
    Math.sqrt(1 - clampedA),
  );

  if (unit === 'm') {
    return distanceKm * 1000;
  }

  return distanceKm;
}
