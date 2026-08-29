import { requireBrowserEnv } from '../../utils';
import { fileToDataUrl } from '../file-to-data-url';
import { loadImage } from '../load-image';

type CanvasImageFormat = 'image/jpeg' | 'image/webp';

const canvasQualityByFormat: Record<CanvasImageFormat, number> = {
  'image/jpeg': 0.8,
  'image/webp': 0.85,
};

function resizeCanvas(
  canvas: HTMLCanvasElement,
  options: { devicePixelRatio?: number; height?: number; width?: number },
): void {
  const { devicePixelRatio = 1, height = canvas.height, width = canvas.width } = options;
  canvas.width = Math.max(1, Math.round(width * devicePixelRatio));
  canvas.height = Math.max(1, Math.round(height * devicePixelRatio));
  canvas.style.width = `${Math.max(1, Math.round(width))}px`;
  canvas.style.height = `${Math.max(1, Math.round(height))}px`;
}

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

  let { width, height } = img;
  if (width > maxWidth) {
    const scale = maxWidth / width;
    width = maxWidth;
    height = height * scale;
  }

  const canvas = document.createElement('canvas');
  resizeCanvas(canvas, {
    devicePixelRatio: 1,
    height,
    width,
  });

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Canvas not supported');
  }
  context.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, outputFormat, quality);
  });
  if (!blob) {
    throw new Error('Compression failed');
  }

  return new File([blob], file.name, {
    type: outputFormat,
  });
}
