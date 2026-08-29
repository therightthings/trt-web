import { isType, requireBrowserEnv } from '@trt-web/core';

import { AbstractBrowserUtils } from '../browser.type';
import type {
  BrowserFileSystemCreateWritableOptions,
  BrowserFileSystemDirectoryHandle,
  BrowserFileSystemDirectoryPickerOptions,
  BrowserFileSystemEntry,
  BrowserFileSystemFileHandle,
  BrowserFileSystemOpenPickerOptions,
  BrowserFileSystemPermissionHandle,
  BrowserFileSystemPermissionMode,
  BrowserFileSystemPermissionState,
  BrowserFileSystemReadFileResult,
  BrowserFileSystemSavePickerOptions,
  BrowserFileSystemWindow,
} from './browser-file-system.type';

/**
 * File picker, directory and private storage helpers.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/File_System_API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API
 */
export class BrowserFileSystem extends AbstractBrowserUtils {
  private static get browserFileSystem(): BrowserFileSystemWindow | undefined {
    if (!this.isSupported()) {
      return undefined;
    }

    return window as BrowserFileSystemWindow;
  }

  private static get storage(): StorageManager | undefined {
    if (!this.isSupported()) {
      return undefined;
    }

    return navigator.storage;
  }

  static override isSupported(): boolean {
    requireBrowserEnv();

    const fileWindow = window as BrowserFileSystemWindow;
    const hasOpenPicker = isType('function', fileWindow.showOpenFilePicker);
    const hasSavePicker = isType('function', fileWindow.showSaveFilePicker);
    const hasDirectoryPicker = isType('function', fileWindow.showDirectoryPicker);
    const hasOpfs =
      isType('object', navigator.storage) && isType('function', navigator.storage.getDirectory);

    return hasOpenPicker || hasSavePicker || hasDirectoryPicker || hasOpfs;
  }

  static async readFile(
    options?: BrowserFileSystemOpenPickerOptions,
  ): Promise<BrowserFileSystemReadFileResult | undefined> {
    const handle = await this.openFile(options);
    if (!handle || Array.isArray(handle)) {
      return undefined;
    }

    return this.readFileHandle(handle);
  }

  static async readFiles(
    options?: BrowserFileSystemOpenPickerOptions,
  ): Promise<BrowserFileSystemReadFileResult[]> {
    const handles = await this.openFile({ ...options, multiple: true });
    const results: BrowserFileSystemReadFileResult[] = [];

    if (!handles) {
      return results;
    }

    for (const handle of Array.isArray(handles) ? handles : [handles]) {
      const fileResult = await this.readFileHandle(handle);
      if (fileResult) {
        results.push(fileResult);
      }
    }

    return results;
  }

  static async openFile(
    options?: BrowserFileSystemOpenPickerOptions,
  ): Promise<BrowserFileSystemFileHandle | BrowserFileSystemFileHandle[] | undefined> {
    const picker = this.browserFileSystem?.showOpenFilePicker;
    if (!picker) {
      return undefined;
    }

    try {
      const handles = await picker(options);
      return options?.multiple ? handles : handles[0];
    } catch {
      return undefined;
    }
  }

  static async saveFile(
    data: BlobPart | Blob,
    options?: BrowserFileSystemSavePickerOptions,
  ): Promise<BrowserFileSystemFileHandle | undefined> {
    const picker = this.browserFileSystem?.showSaveFilePicker;
    if (!picker) {
      return undefined;
    }

    try {
      const handle = await picker(options);
      const writable = await handle.createWritable();
      await writable.write(data);
      await writable.close();
      return handle;
    } catch {
      return undefined;
    }
  }

  static async openDirectory(
    options?: BrowserFileSystemDirectoryPickerOptions,
  ): Promise<BrowserFileSystemDirectoryHandle | undefined> {
    const picker = this.browserFileSystem?.showDirectoryPicker;
    if (!picker) {
      return undefined;
    }

    try {
      return await picker(options);
    } catch {
      return undefined;
    }
  }

  static async listDirectory(
    handle?: BrowserFileSystemDirectoryHandle,
  ): Promise<BrowserFileSystemEntry[]> {
    const directory = handle ?? (await this.openDirectory());
    if (!directory) {
      return [];
    }

    const entries: BrowserFileSystemEntry[] = [];

    for await (const [name, entryHandle] of directory) {
      const item: BrowserFileSystemEntry = {
        name,
        kind: entryHandle.kind,
        handle: entryHandle,
      };

      if (this.isFileHandle(entryHandle)) {
        item.file = await entryHandle.getFile();
      }

      entries.push(item);
    }

    return entries;
  }

  static async getOpfsRoot(): Promise<FileSystemDirectoryHandle | undefined> {
    const storage = this.storage;
    const getDirectory = storage?.getDirectory;
    if (!getDirectory) {
      return undefined;
    }

    try {
      return await getDirectory.call(storage);
    } catch {
      return undefined;
    }
  }

  private static async readFileHandle(
    handle: BrowserFileSystemFileHandle,
  ): Promise<BrowserFileSystemReadFileResult | undefined> {
    try {
      const file = await handle.getFile();
      const text = await file.text();
      return { file, text };
    } catch {
      return undefined;
    }
  }

  static async readText(handle: BrowserFileSystemFileHandle): Promise<string | undefined> {
    const file = await this.readFileHandle(handle);
    return file?.text;
  }

  static async readArrayBuffer(
    handle: BrowserFileSystemFileHandle,
  ): Promise<ArrayBuffer | undefined> {
    try {
      const file = await handle.getFile();
      return await file.arrayBuffer();
    } catch {
      return undefined;
    }
  }

  static async writeText(
    handle: BrowserFileSystemFileHandle,
    text: string,
    options?: BrowserFileSystemCreateWritableOptions,
  ): Promise<boolean> {
    try {
      const writable = await handle.createWritable(options);
      await writable.write(text);
      await writable.close();
      return true;
    } catch {
      return false;
    }
  }

  static async appendText(handle: BrowserFileSystemFileHandle, text: string): Promise<boolean> {
    try {
      const file = await handle.getFile();
      const writable = await handle.createWritable({ keepExistingData: true });
      await writable.seek(file.size);
      await writable.write(text);
      await writable.close();
      return true;
    } catch {
      return false;
    }
  }

  static async removeEntry(
    directory: BrowserFileSystemDirectoryHandle,
    name: string,
    recursive = false,
  ): Promise<boolean> {
    try {
      await directory.removeEntry(name, { recursive });
      return true;
    } catch {
      return false;
    }
  }

  static async requestPermission(
    handle: BrowserFileSystemPermissionHandle,
    mode: BrowserFileSystemPermissionMode = 'read',
  ): Promise<BrowserFileSystemPermissionState> {
    try {
      const state = await handle.queryPermission({ mode });
      if (state === 'granted') {
        return state;
      }

      return await handle.requestPermission({ mode });
    } catch {
      return 'denied';
    }
  }

  private static isFileHandle(handle: FileSystemHandle): handle is BrowserFileSystemFileHandle {
    return handle.kind === 'file';
  }
}
