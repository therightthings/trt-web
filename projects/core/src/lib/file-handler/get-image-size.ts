import { requireBrowserEnv } from '../utils';
import { loadImage } from './load-image';

export async function getImageSize(
  blob: File | string,
  options?: {
    revokeObjectUrl?: boolean;
  },
): Promise<{ width: number; height: number }> {
  requireBrowserEnv();

  if (!blob) {
    return { width: 0, height: 0 };
  }

  let url = '';
  let shouldRevokeObjectUrl = false;

  if (blob instanceof File) {
    if (!blob.type.startsWith('image/')) {
      return { width: 0, height: 0 };
    }

    url = URL.createObjectURL(blob);
    shouldRevokeObjectUrl = options?.revokeObjectUrl ?? true;
  } else {
    url = blob;
  }

  try {
    const imgEl = await loadImage(url);

    return {
      width: imgEl.naturalWidth || imgEl.width,
      height: imgEl.naturalHeight || imgEl.height,
    };
  } finally {
    if (shouldRevokeObjectUrl) {
      URL.revokeObjectURL(url);
    }
  }
}
