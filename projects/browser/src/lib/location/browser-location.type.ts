export type GeoSpeed = 'accurate' | 'fast';
export type BrowserLocationOptions = PositionOptions & {
  speed?: GeoSpeed;
};
