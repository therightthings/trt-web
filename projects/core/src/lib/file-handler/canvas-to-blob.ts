import { requireBrowserEnv } from '../utils';
import { CanvasImageFormat } from './canvas.type';

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  outputFormat: CanvasImageFormat,
  quality: number,
): Promise<Blob> {
  requireBrowserEnv();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Compression failed'));
          return;
        }

        resolve(blob);
      },
      outputFormat,
      quality,
    );
  });
}
