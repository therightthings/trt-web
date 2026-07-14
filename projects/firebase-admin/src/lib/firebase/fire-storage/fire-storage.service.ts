import { TrtCore } from '@trt-web/core';
import Busboy from 'busboy';
import type { Request } from 'express';
import { getStorage } from 'firebase-admin/storage';

export interface ServerFile {
  buffer: Buffer;
  fileName: string;
  fileExtension: string;
  mimeType: string;
  fileSize: number;
}

export class FireStorageService {
  private readonly bucket = getStorage().bucket();

  async deleteFile(path: string) {
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const storageFile = this.bucket.file(cleanPath);

    storageFile.delete({ ignoreNotFound: true });
  }

  async deleteFileFromStorage(path: string): Promise<boolean> {
    try {
      const cleanPath = path.startsWith('/') ? path.substring(1) : path;
      const storageFile = this.bucket.file(cleanPath);
      await storageFile.delete({ ignoreNotFound: true });
      return true;
    } catch (error) {
      console.error(`Error deleting file from storage: ${path}`, error);
      return false;
    }
  }

  async getFileMetadata(path: string): Promise<{
    contentType?: string;
    downloadToken?: string;
    size?: number;
  }> {
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const [metadata] = await this.bucket.file(cleanPath).getMetadata();
    const size = typeof metadata.size === 'string' ? Number(metadata.size) : metadata.size;
    const rawDownloadToken = metadata.metadata?.['firebaseStorageDownloadTokens'];

    return {
      contentType: metadata.contentType,
      downloadToken: typeof rawDownloadToken === 'string' ? rawDownloadToken : undefined,
      size: Number.isFinite(size) ? size : undefined,
    };
  }

  getDownloadUrl(path: string, token: string): string {
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const encodedName = encodeURIComponent(cleanPath);

    return `https://firebasestorage.googleapis.com/v0/b/${this.bucket.name}/o/${encodedName}?alt=media&token=${token}`;
  }

  getPublicDownloadUrl(path: string): string {
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    const encodedName = encodeURIComponent(cleanPath);

    return `https://firebasestorage.googleapis.com/v0/b/${this.bucket.name}/o/${encodedName}?alt=media`;
  }

  async upload(
    req: Request | (Request & { rawBody: any }),
    config?: {
      folder?: string;
      category?: 'images' | 'files' | 'videos';
      formField?: string;
      maxFileSize?: number;
    },
  ) {
    const {
      folder = 'media',
      category = 'images',
      formField = 'file',
      maxFileSize = 10 * 1024 * 1024,
    } = config ?? {};
    const { file } = await this.readFormData(req, {
      fileFieldName: formField,
    });

    if (!file) {
      throw new Error('Please upload image file!');
    }

    if (file.buffer.length > maxFileSize) {
      throw new Error('File too large');
    }

    const name = `${file.fileName}.${file.fileExtension}`;
    const byte = file.buffer.length;

    const { url, bucketPath } = await this.uploadFileToFirestoreStorage(
      {
        ...file,
        buffer: file.buffer,
      },
      { folder, category },
    );

    return { url, bucketPath, name, byte };
  }

  async uploadFileToFirestoreStorage(
    { fileName, fileExtension, buffer, mimeType }: ServerFile,
    config?: {
      folder?: string;
      extrasPath?: string;
      category?: 'images' | 'files' | 'videos' | 'attachments';
    },
  ) {
    const { folder = 'media', extrasPath, category = 'images' } = config ?? {};

    let folderPath = `${folder}`;
    if (extrasPath) {
      folderPath += `/${extrasPath}`;
    }
    folderPath += `/${category}`;

    const uniqueId = `${Date.now()}_${Math.round(Math.random() * 1e9)}`;
    const bucketPath = `${folderPath}/${TrtCore.Text.removeTones(fileName)}_${uniqueId}.${fileExtension}`;
    const fileRepo = this.bucket.file(bucketPath);
    const token = TrtCore.Text.generateId();

    await fileRepo.save(buffer, {
      contentType: mimeType,
      resumable: false,
      metadata: {
        contentType: mimeType,
        cacheControl: 'public, max-age=31536000, immutable',
        metadata: {
          firebaseStorageDownloadTokens: token,
        },
      },
    });

    const encodedName: string = encodeURIComponent(bucketPath);
    const url = `https://firebasestorage.googleapis.com/v0/b/${this.bucket.name}/o/${encodedName}?alt=media&token=${token}`;

    return { url, bucketPath };
  }

  async readFormData<T extends Record<string, unknown>>(
    req: Request | (Request & { rawBody: any }),
    config?: {
      fileFieldName: string;
    },
  ): Promise<{ file?: ServerFile; fields?: T }> {
    const { fileFieldName = 'file' } = config ?? {};

    return new Promise((resolve, reject) => {
      try {
        const contentType = req.headers['content-type'];
        if (!contentType || !contentType.includes('boundary=')) {
          return reject(new Error(`Invalid Content-Type: Missing boundary in "${contentType}"`));
        }

        const bb = Busboy({ headers: req.headers });
        const fields: Record<string, unknown> = {};
        let buffer: Buffer | undefined = undefined;
        let fileName = 'upload';
        let mimeType = 'application/octet-stream';

        bb.on('file', (field, file, info) => {
          if (field === fileFieldName) {
            fileName = info.filename ?? fileName;
            mimeType = info.mimeType ?? mimeType;
            const chunks: Buffer[] = [];

            file.on('data', (buffer: Buffer) => {
              chunks.push(buffer);
            });

            file.on('end', () => {
              if (chunks.length > 0) {
                buffer = Buffer.concat(chunks);
              }
            });
          } else {
            file.resume();
          }
        });

        bb.on('field', (key: string, value: string) => {
          fields[key] = value;
        });

        bb.on('finish', () => {
          if (buffer && buffer.length > 0) {
            const parts = fileName.split('.');
            return resolve({
              file: {
                buffer: buffer,
                fileName: parts[0],
                fileExtension: parts[1],
                mimeType,
                fileSize: buffer.length,
              },
              fields: fields as T,
            });
          }

          return resolve({
            file: undefined,
            fields: fields as T,
          });
        });

        bb.on('error', (error) => reject(error));

        if ('rawBody' in req && req.rawBody) {
          bb.end(req.rawBody);
        } else {
          req.pipe(bb);
        }
      } catch (error) {
        reject(error);
      }
    });
  }
}
