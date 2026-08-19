export type BrowserFileSystemPermissionMode = 'read' | 'readwrite';
export type BrowserFileSystemHandleKind = 'file' | 'directory';
export type BrowserFileSystemPickerStartIn =
  | 'desktop'
  | 'documents'
  | 'downloads'
  | 'music'
  | 'pictures'
  | 'videos';
export type BrowserFileSystemPickerType = {
  description?: string;
  accept: Record<string, string[]>;
};
export type BrowserFileSystemPickerOptions = {
  excludeAcceptAllOption?: boolean;
  id?: string;
  startIn?: BrowserFileSystemPickerStartIn | FileSystemHandle;
  types?: BrowserFileSystemPickerType[];
};
export type BrowserFileSystemOpenPickerOptions = BrowserFileSystemPickerOptions & {
  multiple?: boolean;
};
export type BrowserFileSystemSavePickerOptions = BrowserFileSystemPickerOptions & {
  suggestedName?: string;
};
export type BrowserFileSystemDirectoryPickerOptions = Pick<
  BrowserFileSystemPickerOptions,
  'id' | 'startIn'
> & {
  mode?: BrowserFileSystemPermissionMode;
};
export type BrowserFileSystemCreateWritableOptions = {
  keepExistingData?: boolean;
  mode?: 'siloed' | 'in-place';
};
export type BrowserFileSystemPermissionState = 'granted' | 'denied' | 'prompt';
export type BrowserFileSystemPermissionHandle = FileSystemHandle & {
  queryPermission(options?: {
    mode?: BrowserFileSystemPermissionMode;
  }): Promise<BrowserFileSystemPermissionState>;
  requestPermission(options?: {
    mode?: BrowserFileSystemPermissionMode;
  }): Promise<BrowserFileSystemPermissionState>;
};
export type BrowserFileSystemFileHandle = {
  queryPermission(options?: {
    mode?: BrowserFileSystemPermissionMode;
  }): Promise<BrowserFileSystemPermissionState>;
  requestPermission(options?: {
    mode?: BrowserFileSystemPermissionMode;
  }): Promise<BrowserFileSystemPermissionState>;
  createWritable(
    options?: BrowserFileSystemCreateWritableOptions,
  ): Promise<FileSystemWritableFileStream>;
} & FileSystemFileHandle;
export type BrowserFileSystemDirectoryHandle = {
  queryPermission(options?: {
    mode?: BrowserFileSystemPermissionMode;
  }): Promise<BrowserFileSystemPermissionState>;
  requestPermission(options?: {
    mode?: BrowserFileSystemPermissionMode;
  }): Promise<BrowserFileSystemPermissionState>;
} & FileSystemDirectoryHandle;
export type BrowserFileSystemWindow = Window & {
  showOpenFilePicker?: (
    options?: BrowserFileSystemOpenPickerOptions,
  ) => Promise<BrowserFileSystemFileHandle[]>;
  showSaveFilePicker?: (
    options?: BrowserFileSystemSavePickerOptions,
  ) => Promise<BrowserFileSystemFileHandle>;
  showDirectoryPicker?: (
    options?: BrowserFileSystemDirectoryPickerOptions,
  ) => Promise<BrowserFileSystemDirectoryHandle>;
};
export type BrowserFileSystemNavigator = Navigator & {
  storage?: StorageManager & { getDirectory?: () => Promise<FileSystemDirectoryHandle> };
};
export type BrowserFileSystemReadFileResult = { file: File; text: string };
export type BrowserFileSystemEntry = {
  name: string;
  kind: BrowserFileSystemHandleKind;
  handle: FileSystemHandle;
  file?: File;
};
