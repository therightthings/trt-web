import { fileToObjectUrl } from '../../file-handler';
import { requireBrowserEnv } from '../../utils';

export class BrowserResource {
  private static readonly scriptLoadPromises = new Map<string, Promise<void>>();
  private static readonly linkLoadPromises = new Map<string, Promise<void>>();

  static assetUrl(path: string) {
    requireBrowserEnv();

    return new URL(path, document.baseURI).toString();
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

  static download(
    src: string | Blob | File,
    config?: {
      name?: string;
      ext?: string;
    },
  ) {
    requireBrowserEnv();

    let url: string = '';
    let shouldRevoke: boolean = false;

    if (src instanceof File || src instanceof Blob) {
      url = fileToObjectUrl(src);
      shouldRevoke = true;
    } else {
      url = src;
    }

    const { name = `file-${Date.now()}`, ext } = config ?? {};

    const a = document.createElement('a');
    a.href = url;
    a.download = ext ? `${name}.${ext}` : name;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';

    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    if (shouldRevoke) {
      setTimeout(() => URL.revokeObjectURL(url), 0);
    }
  }
}
