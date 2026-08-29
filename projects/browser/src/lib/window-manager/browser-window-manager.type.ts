export type BrowserWindowOpenConfig = {
  url?: string | URL;
  target?: string;
  features?: string;
  title?: string;
  pollInterval?: number;
};

export type BrowserWindowViewportInfo = {
  width: number;
  height: number;
  devicePixelRatio: number;
};

export type BrowserWindowZoomInfo = BrowserWindowViewportInfo & {
  direction: 'in' | 'out';
};

export type BrowserWindowInstance = {
  window: Window;
  onClose?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onResize?: (info: BrowserWindowViewportInfo) => void;
  onZoomChange?: (info: BrowserWindowZoomInfo) => void;
  close(): void;
};
