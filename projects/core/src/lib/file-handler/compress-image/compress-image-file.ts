import { requireBrowserEnv } from '../../utils';
import { CanvasImageFormat, canvasQualityByFormat } from '../canvas.type';
import { canvasToBlob } from '../canvas-to-blob';
import { fileToDataUrl } from '../file-to-data-url';
import { loadImage } from '../load-image';

export async function compressImageFile(
  file: File,
  config?: {
    maxWidth?: number;
    outputFormat?: CanvasImageFormat;
    quality?: number;
  },
): Promise<File> {
  requireBrowserEnv();

  const { maxWidth = 1024, outputFormat = 'image/jpeg' } = config ?? {};
  const quality = config?.quality ?? canvasQualityByFormat[outputFormat];

  const dataUrl = await fileToDataUrl(file);
  const img = await loadImage(dataUrl);

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas not supported');
  }

  let { width, height } = img;
  if (width > maxWidth) {
    const scale = maxWidth / width;
    width = maxWidth;
    height = height * scale;
  }

  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(img, 0, 0, width, height);

  const blob = await canvasToBlob(canvas, outputFormat, quality);

  return new File([blob], file.name, {
    type: outputFormat,
  });
}
