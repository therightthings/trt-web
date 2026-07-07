import { requireBrowserEnv } from '../utils';

export function fileToDataUrl(file: File): Promise<string> {
  requireBrowserEnv();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);

    reader.readAsDataURL(file);
  });
}
