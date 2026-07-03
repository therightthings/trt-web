export type CanvasImageFormat = 'image/jpeg' | 'image/webp';

export const canvasQualityByFormat: {
  [key in CanvasImageFormat]: number;
} = {
  'image/jpeg': 0.8,
  'image/webp': 0.85,
};
