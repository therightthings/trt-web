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
    return await new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () =>
        resolve({
          width: img.naturalWidth || img.width,
          height: img.naturalHeight || img.height,
        });
      img.onerror = () => reject(new Error('Image load failed'));

      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
