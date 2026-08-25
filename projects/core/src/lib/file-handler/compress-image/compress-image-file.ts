import type { CanvasImageFormat } from '../../dom-handler';
import { Canvas, canvasQualityByFormat } from '../../dom-handler';
import { requireBrowserEnv } from '../../utils';
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

  let { width, height } = img;
  if (width > maxWidth) {
    const scale = maxWidth / width;
    width = maxWidth;
    height = height * scale;
  }

  const session = Canvas.createSession();
  session.resize({
    devicePixelRatio: 1,
    height,
    width,
  });

  if (!session.drawImage(img, { height, width })) {
    throw new Error('Canvas not supported');
  }

  const blob = await session.toBlob({ type: outputFormat, quality });
  if (!blob) {
    throw new Error('Compression failed');
  }

  return new File([blob], file.name, {
    type: outputFormat,
  });
}
