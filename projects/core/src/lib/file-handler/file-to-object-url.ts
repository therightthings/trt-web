interface FileToObjectUrlOptions {
  type?: string;
}

function dataUrlToBlob(dataUrl: string, type?: string): Blob {
  const [header, base64] = dataUrl.split(',');

  if (!header?.startsWith('data:') || !base64) {
    throw new Error('Invalid data URL');
  }

  const mimeType = type ?? header.match(/^data:([^;]+);base64$/)?.[1] ?? 'image/png';
  const byteString = atob(base64);
  const bytes = new Uint8Array(byteString.length);

  for (let index = 0; index < byteString.length; index++) {
    bytes[index] = byteString.charCodeAt(index);
  }

  return new Blob([bytes], { type: mimeType });
}

export function fileToObjectUrl(source: File | string, options?: FileToObjectUrlOptions): string {
  if (source instanceof File) {
    return URL.createObjectURL(source);
  }

  return URL.createObjectURL(dataUrlToBlob(source, options?.type));
}
