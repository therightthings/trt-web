import { loadImage } from './load-image';

export async function getImageSize(
  blob: File | string,
): Promise<{ width: number; height: number }> {
  if (!blob) {
    return { width: 0, height: 0 };
  }

  let url = '';

  if (blob instanceof File) {
    if (!blob.type.startsWith('image/')) {
      return { width: 0, height: 0 };
    }

    url = URL.createObjectURL(blob);
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
    URL.revokeObjectURL(url);
  }
}
