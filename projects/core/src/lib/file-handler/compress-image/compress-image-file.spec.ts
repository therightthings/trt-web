// Run: npx vitest run projects/core/src/lib/file-handler/compress-image/compress-image-file.spec.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { compressImageFile } from './compress-image-file';

function createFileReaderMock(result: string, fail = false) {
  return class FileReaderMock {
    result: string | ArrayBuffer | null = null;
    error: Error | null = null;
    onload: null | ((this: FileReader, ev: ProgressEvent<FileReader>) => any) = null;
    onerror: null | ((this: FileReader, ev: ProgressEvent<FileReader>) => any) = null;

    readAsDataURL() {
      if (fail) {
        this.error = new Error('File read failed');
        this.onerror?.call(
          this as unknown as FileReader,
          {
            target: this,
          } as unknown as ProgressEvent<FileReader>,
        );
        return;
      }

      this.result = result;
      this.onload?.call(
        this as unknown as FileReader,
        {
          target: this,
        } as unknown as ProgressEvent<FileReader>,
      );
    }
  };
}

describe('compressImageFile', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('resizes and compresses an image file', async () => {
    const toBlob = vi.fn((callback: BlobCallback) => {
      callback(new Blob(['compressed'], { type: 'image/jpeg' }));
    });
    const drawImage = vi.fn();
    const getContext = vi.fn(() => ({ drawImage, restore: vi.fn(), save: vi.fn() }));
    const createElement = vi.fn(() => ({
      getContext,
      width: 0,
      height: 0,
      style: { height: '', width: '' },
      toBlob,
    }));

    vi.stubGlobal('FileReader', createFileReaderMock('data:image/png;base64,abc'));
    vi.stubGlobal(
      'Image',
      class {
        onload: null | (() => void) = null;
        onerror: null | (() => void) = null;
        width = 2000;
        height = 1000;
        set src(_value: string) {
          this.onload?.();
        }
      },
    );
    vi.stubGlobal('document', { createElement });

    const file = new File(['image-bytes'], 'photo.png', { type: 'image/png' });
    const result = await compressImageFile(file, {
      maxWidth: 1000,
      quality: 0.8,
    });

    expect(createElement).toHaveBeenCalledWith('canvas');
    expect(drawImage).toHaveBeenCalledWith(expect.any(Object), 0, 0, 1000, 500);
    expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/jpeg', 0.8);
    expect(result).toBeInstanceOf(File);
    expect(result.name).toBe('photo.png');
    expect(result.type).toBe('image/jpeg');
  });

  it('uses the provided outputFormat', async () => {
    const toBlob = vi.fn((callback: BlobCallback) => {
      callback(new Blob(['compressed'], { type: 'image/webp' }));
    });
    const drawImage = vi.fn();
    const getContext = vi.fn(() => ({ drawImage, restore: vi.fn(), save: vi.fn() }));
    const createElement = vi.fn(() => ({
      getContext,
      width: 0,
      height: 0,
      style: { height: '', width: '' },
      toBlob,
    }));

    vi.stubGlobal('FileReader', createFileReaderMock('data:image/png;base64,abc'));
    vi.stubGlobal(
      'Image',
      class {
        onload: null | (() => void) = null;
        onerror: null | (() => void) = null;
        width = 1200;
        height = 600;
        set src(_value: string) {
          this.onload?.();
        }
      },
    );
    vi.stubGlobal('document', { createElement });

    const file = new File(['image-bytes'], 'photo.png', { type: 'image/png' });
    const result = await compressImageFile(file, {
      outputFormat: 'image/webp',
      quality: 0.6,
    });

    expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/webp', 0.6);
    expect(result.type).toBe('image/webp');
  });

  it('uses a better default quality for webp when quality is omitted', async () => {
    const toBlob = vi.fn((callback: BlobCallback) => {
      callback(new Blob(['compressed'], { type: 'image/webp' }));
    });
    const drawImage = vi.fn();
    const getContext = vi.fn(() => ({ drawImage, restore: vi.fn(), save: vi.fn() }));
    const createElement = vi.fn(() => ({
      getContext,
      width: 0,
      height: 0,
      style: { height: '', width: '' },
      toBlob,
    }));

    vi.stubGlobal('FileReader', createFileReaderMock('data:image/png;base64,abc'));
    vi.stubGlobal(
      'Image',
      class {
        onload: null | (() => void) = null;
        onerror: null | (() => void) = null;
        width = 1200;
        height = 600;
        set src(_value: string) {
          this.onload?.();
        }
      },
    );
    vi.stubGlobal('document', { createElement });

    const file = new File(['image-bytes'], 'photo.png', { type: 'image/png' });
    const result = await compressImageFile(file, {
      outputFormat: 'image/webp',
    });

    expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/webp', 0.85);
    expect(result.type).toBe('image/webp');
  });

  it('respects an explicit quality even when it matches the old default', async () => {
    const toBlob = vi.fn((callback: BlobCallback) => {
      callback(new Blob(['compressed'], { type: 'image/webp' }));
    });
    const drawImage = vi.fn();
    const getContext = vi.fn(() => ({ drawImage, restore: vi.fn(), save: vi.fn() }));
    const createElement = vi.fn(() => ({
      getContext,
      width: 0,
      height: 0,
      style: { height: '', width: '' },
      toBlob,
    }));

    vi.stubGlobal('FileReader', createFileReaderMock('data:image/png;base64,abc'));
    vi.stubGlobal(
      'Image',
      class {
        onload: null | (() => void) = null;
        onerror: null | (() => void) = null;
        width = 1200;
        height = 600;
        set src(_value: string) {
          this.onload?.();
        }
      },
    );
    vi.stubGlobal('document', { createElement });

    const file = new File(['image-bytes'], 'photo.png', { type: 'image/png' });
    const result = await compressImageFile(file, {
      outputFormat: 'image/webp',
      quality: 0.7,
    });

    expect(toBlob).toHaveBeenCalledWith(expect.any(Function), 'image/webp', 0.7);
    expect(result.type).toBe('image/webp');
  });

  it('throws when image loading fails', async () => {
    vi.stubGlobal('FileReader', createFileReaderMock('data:image/png;base64,abc'));
    vi.stubGlobal(
      'Image',
      class {
        onload: null | (() => void) = null;
        onerror: null | (() => void) = null;
        set src(_value: string) {
          this.onerror?.();
        }
      },
    );
    vi.stubGlobal('document', {
      createElement: vi.fn(() => ({
        getContext: vi.fn(() => ({ drawImage: vi.fn() })),
        toBlob: vi.fn(),
      })),
    });

    const file = new File(['image-bytes'], 'photo.png', { type: 'image/png' });

    await expect(compressImageFile(file)).rejects.toThrow('Image load failed');
  });

  it('throws when canvas is not supported', async () => {
    vi.stubGlobal('FileReader', createFileReaderMock('data:image/png;base64,abc'));
    vi.stubGlobal(
      'Image',
      class {
        onload: null | (() => void) = null;
        onerror: null | (() => void) = null;
        width = 100;
        height = 100;
        set src(_value: string) {
          this.onload?.();
        }
      },
    );
    vi.stubGlobal('document', {
      createElement: vi.fn(() => ({
        getContext: vi.fn(() => null),
        height: 0,
        style: { height: '', width: '' },
        width: 0,
      })),
    });

    const file = new File(['image-bytes'], 'photo.png', { type: 'image/png' });

    await expect(compressImageFile(file)).rejects.toThrow('Canvas not supported');
  });
});
