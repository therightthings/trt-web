import { requireBrowserEnv } from '@trt-web/core';

import type {
  BrowserWindowInstance,
  BrowserWindowOpenConfig,
  BrowserWindowViewportInfo,
  BrowserWindowZoomInfo,
} from './browser-window-manager.type';

/**
 * Child window creation and lifecycle monitoring helpers.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/open
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Window/resize_event
 */
export class BrowserWindowManager {
  static open(config?: BrowserWindowOpenConfig): BrowserWindowInstance | null {
    requireBrowserEnv();

    const {
      url = '',
      target = '_blank',
      features = 'width=400,height=200',
      title = 'Opening...',
      pollInterval = 250,
    } = config ?? {};
    const child = window.open(String(url), target, features);

    if (!child) {
      return null;
    }

    if (title) {
      try {
        child.document.title = title;
      } catch {
        // Cross-origin windows do not expose their document to the opener.
      }
    }

    const instance: BrowserWindowInstance = {
      window: child,
      close: () => child.close(),
    };

    this.monitor(instance, pollInterval);
    return instance;
  }

  private static monitor(instance: BrowserWindowInstance, pollInterval: number): void {
    const child = instance.window;
    const interval = Math.max(pollInterval, 50);
    let previous = this.getViewportInfo(child);
    let timer: number | undefined;
    let closed = false;
    let onClose: (() => void) | undefined;
    let onFocus: (() => void) | undefined;
    let onBlur: (() => void) | undefined;
    let onResize: ((info: BrowserWindowViewportInfo) => void) | undefined;
    let onZoomChange: ((info: BrowserWindowZoomInfo) => void) | undefined;
    let resizeListening = false;
    let focusListening = false;
    let blurListening = false;

    const handleFocus = (): void => onFocus?.();
    const handleBlur = (): void => onBlur?.();
    const check = (): void => {
      if (child.closed) {
        if (timer) window.clearInterval(timer);
        closed = true;
        cleanup();
        onClose?.();
        return;
      }

      const current = this.getViewportInfo(child);
      if (!current) return;

      if (current.width !== previous?.width || current.height !== previous?.height) {
        onResize?.(current);
      }
      if (current.devicePixelRatio !== previous?.devicePixelRatio) {
        onZoomChange?.({
          ...current,
          direction: current.devicePixelRatio > (previous?.devicePixelRatio ?? 0) ? 'in' : 'out',
        });
      }
      previous = current;
    };
    const cleanup = (): void => {
      if (timer) window.clearInterval(timer);
      timer = undefined;
      try {
        if (resizeListening) child.removeEventListener('resize', check);
        if (focusListening) child.removeEventListener('focus', handleFocus);
        if (blurListening) child.removeEventListener('blur', handleBlur);
      } catch {
        // Cross-origin windows may not allow event listener access.
      }
    };
    const ensurePolling = (): void => {
      if (!timer) timer = window.setInterval(check, interval);
    };
    const listen = (type: 'resize' | 'focus' | 'blur'): void => {
      try {
        if (type === 'resize' && !resizeListening) {
          child.addEventListener('resize', check);
          resizeListening = true;
        }
        if (type === 'focus' && !focusListening) {
          child.addEventListener('focus', handleFocus);
          focusListening = true;
        }
        if (type === 'blur' && !blurListening) {
          child.addEventListener('blur', handleBlur);
          blurListening = true;
        }
      } catch {
        // Cross-origin windows may not allow event listener access.
      }
    };
    const defineCallback = <K extends keyof BrowserWindowInstance>(
      key: K,
      setCallback: (callback: BrowserWindowInstance[K]) => void,
    ): void => {
      Object.defineProperty(instance, key, {
        configurable: true,
        enumerable: true,
        get: () => undefined,
        set: setCallback,
      });
    };

    defineCallback('onClose', (callback) => {
      onClose = callback as (() => void) | undefined;
      if (onClose) ensurePolling();
    });
    defineCallback('onFocus', (callback) => {
      onFocus = callback as (() => void) | undefined;
      if (onFocus) listen('focus');
    });
    defineCallback('onBlur', (callback) => {
      onBlur = callback as (() => void) | undefined;
      if (onBlur) listen('blur');
    });
    defineCallback('onResize', (callback) => {
      onResize = callback as ((info: BrowserWindowViewportInfo) => void) | undefined;
      if (onResize) {
        ensurePolling();
        listen('resize');
      }
    });
    defineCallback('onZoomChange', (callback) => {
      onZoomChange = callback as ((info: BrowserWindowZoomInfo) => void) | undefined;
      if (onZoomChange) ensurePolling();
    });

    const close = instance.close;
    instance.close = () => {
      if (!closed) {
        cleanup();
        close();
      }
    };
  }

  private static getViewportInfo(child: Window): BrowserWindowViewportInfo | undefined {
    try {
      return {
        width: child.innerWidth,
        height: child.innerHeight,
        devicePixelRatio: child.devicePixelRatio,
      };
    } catch {
      return undefined;
    }
  }
}
