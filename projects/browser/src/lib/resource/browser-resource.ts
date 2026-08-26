import type { FileSizeConfig } from '@trt-web/core';
import { trt } from '@trt-web/core';
import { requireBrowserEnv } from '@trt-web/core';

type BrowserResourceDownloadConfig = {
  name?: string;
  ext?: string;
} & (
  | {
      target?: '_blank';
    }
  | {
      target: '_self';
      maxBlobSize?: FileSizeConfig;
    }
);

type BrowserResourceType = 'image' | 'script' | 'style' | 'font' | 'media' | 'document';

/**
 * Browser resource loading, caching and download helpers.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static
 */
export class BrowserResource {
  private static readonly scriptLoadPromises = new Map<string, Promise<void>>();
  private static readonly linkLoadPromises = new Map<string, Promise<void>>();

  static assetUrl(path: string) {
    requireBrowserEnv();

    return new URL(path, document.baseURI).toString();
  }

  static async isCached(
    src: string,
    config?: {
      type?: BrowserResourceType;
    },
  ): Promise<boolean> {
    requireBrowserEnv();
    const { type = 'document' } = config ?? {};

    if (type === 'image') {
      const resource = performance
        .getEntriesByName(src)
        .find((entry): entry is PerformanceResourceTiming => {
          return entry.entryType === 'resource';
        });

      return resource?.transferSize === 0 && resource.decodedBodySize > 0;
    }

    const absoluteUrl = new URL(src, document.baseURI).href;

    if ('caches' in window) {
      const cacheNames = await caches.keys();
      const responses = await Promise.all(
        cacheNames.map(async (cacheName) => {
          const cache = await caches.open(cacheName);
          return cache.match(absoluteUrl);
        }),
      );

      if (responses.some(Boolean)) {
        return true;
      }
    }

    const resource = performance
      .getEntriesByName(absoluteUrl)
      .find((entry): entry is PerformanceResourceTiming => {
        return entry.entryType === 'resource';
      });

    return resource?.transferSize === 0;
  }

  static async loadScript(src: string) {
    requireBrowserEnv();

    const existing = this.scriptLoadPromises.get(src);
    if (existing) {
      return existing;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        script.remove();
        resolve();
      };

      script.onerror = () => {
        script.remove();
        reject(new Error(`Could not load ${src}`));
      };

      document.head.appendChild(script);
    }).catch((error) => {
      this.scriptLoadPromises.delete(src);
      throw error;
    });

    this.scriptLoadPromises.set(src, promise);
    return promise;
  }

  static async loadLink(href: string) {
    requireBrowserEnv();

    const existing = this.linkLoadPromises.get(href);
    if (existing) {
      return existing;
    }

    const promise = new Promise<void>((resolve, reject) => {
      const link = document.createElement('link');

      link.rel = 'stylesheet';
      link.href = href;
      link.onload = () => {
        resolve();
      };
      link.onerror = () => {
        link.remove();
        reject(new Error(`Could not load ${href}`));
      };

      document.head.appendChild(link);
    }).catch((error) => {
      this.linkLoadPromises.delete(href);
      throw error;
    });

    this.linkLoadPromises.set(href, promise);
    return promise;
  }

  static async download(src: string | Blob | File, config?: BrowserResourceDownloadConfig) {
    requireBrowserEnv();

    let url: string = '';
    let shouldRevoke = false;
    const { name = `file-${Date.now()}`, ext, target = '_blank' } = config ?? {};
    const defaultMaxBlobSize: FileSizeConfig = {
      value: 50,
      unit: 'Mb',
    };
    let maxBlobSize = 0;
    let shouldOpenInNewTab = target === '_blank';

    if (target === '_blank') {
      if (src instanceof File || src instanceof Blob) {
        url = trt.file.fileToObjectUrl(src);
        shouldRevoke = true;
      } else {
        url = src;
      }

      window.open(url, '_blank', 'noopener,noreferrer');

      if (shouldRevoke) {
        setTimeout(() => URL.revokeObjectURL(url), 0);
      }

      return;
    }

    if (config?.target === '_self') {
      const { value, unit } = config.maxBlobSize ?? defaultMaxBlobSize;
      maxBlobSize = trt.file.convertFileSize(value, `${unit}:byte`);
    }

    if (src instanceof File || src instanceof Blob) {
      url = trt.file.fileToObjectUrl(src);
      shouldRevoke = true;
    } else if (target === '_self') {
      let response: Response | undefined;
      let size: number | undefined;

      try {
        const headResponse = await fetch(src, { method: 'HEAD' });
        const contentLength = headResponse.headers.get('content-length');

        if (headResponse.ok && contentLength) {
          const parsedSize = Number(contentLength);

          if (Number.isFinite(parsedSize) && parsedSize >= 0) {
            size = parsedSize;
          }
        }

        if (size !== undefined && size <= maxBlobSize) {
          response = await fetch(src);
        }
      } catch {
        response = undefined;
      }

      if (!response?.ok) {
        shouldOpenInNewTab = true;
        url = src;
      } else {
        url = trt.file.fileToObjectUrl(await response.blob());
        shouldRevoke = true;
      }
    } else {
      url = src;
    }

    if (shouldOpenInNewTab) {
      window.open(url, '_blank', 'noopener,noreferrer');

      if (shouldRevoke) {
        setTimeout(() => URL.revokeObjectURL(url), 0);
      }

      return;
    }

    const a = document.createElement('a');
    a.href = url;
    a.download = ext ? `${name}.${ext}` : name;
    a.target = target;
    a.rel = 'noopener noreferrer';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (shouldRevoke) {
      setTimeout(() => URL.revokeObjectURL(url), 0);
    }
  }
}
