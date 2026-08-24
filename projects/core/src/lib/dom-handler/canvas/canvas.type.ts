export type CanvasContextOptions = CanvasRenderingContext2DSettings;

export type CanvasResizeOptions = {
  width?: number;
  height?: number;
  fit?: 'element' | 'parent';
  devicePixelRatio?: number;
};

export type CanvasLineOptions = {
  start: [number, number];
  end: [number, number];
  strokeStyle?: string | CanvasGradient | CanvasPattern;
  lineWidth?: number;
  lineCap?: CanvasLineCap;
  lineJoin?: CanvasLineJoin;
};

export type CanvasRectangleOptions = {
  x: number;
  y: number;
  width: number;
  height: number;
  fillStyle?: string | CanvasGradient | CanvasPattern;
  strokeStyle?: string | CanvasGradient | CanvasPattern;
  lineWidth?: number;
};

export type CanvasCircleOptions = {
  x: number;
  y: number;
  radius: number;
  fillStyle?: string | CanvasGradient | CanvasPattern;
  strokeStyle?: string | CanvasGradient | CanvasPattern;
  lineWidth?: number;
};

export type CanvasTextOptions = {
  text: string;
  x: number;
  y: number;
  fillStyle?: string | CanvasGradient | CanvasPattern;
  font?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  maxWidth?: number;
};

export type CanvasImageOptions = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

export type CanvasBlobOptions = {
  type?: string;
  quality?: number;
};

export type CanvasImageDataArea = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CanvasPutImageDataOptions = {
  x?: number;
  y?: number;
  dirty?: CanvasImageDataArea;
};

export type CanvasLinearGradientOptions = {
  type: 'linear';
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  stops: Array<{ offset: number; color: string }>;
};

export type CanvasRadialGradientOptions = {
  type: 'radial';
  x0: number;
  y0: number;
  radius0: number;
  x1: number;
  y1: number;
  radius1: number;
  stops: Array<{ offset: number; color: string }>;
};

export type CanvasGradientOptions = CanvasLinearGradientOptions | CanvasRadialGradientOptions;

export type CanvasPathOptions = {
  fillStyle?: string | CanvasGradient | CanvasPattern;
  strokeStyle?: string | CanvasGradient | CanvasPattern;
  lineWidth?: number;
  fillRule?: CanvasFillRule;
};

export type CanvasImageFormat = 'image/jpeg' | 'image/webp';

export const canvasQualityByFormat: {
  [key in CanvasImageFormat]: number;
} = {
  'image/jpeg': 0.8,
  'image/webp': 0.85,
};
