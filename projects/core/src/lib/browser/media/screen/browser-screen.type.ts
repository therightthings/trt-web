export type BrowserScreenStreamConstraints = DisplayMediaStreamOptions;
export type BrowserScreenScreenshotOptions = {
  type?: 'image/png' | 'image/jpeg' | 'image/webp';
  quality?: number;
};
export type BrowserScreenScreenshotConfig = {
  capture?: BrowserScreenStreamConstraints;
  image?: BrowserScreenScreenshotOptions;
};
