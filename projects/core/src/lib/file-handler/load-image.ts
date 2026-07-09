import { requireBrowserEnv } from '../utils';

export function loadImage(src: string): Promise<HTMLImageElement> {
  requireBrowserEnv();

  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = src;
  });
}
