export type BrowserNfcRecordData = string | ArrayBuffer | ArrayBufferView | DataView;
export type BrowserNfcRecord = {
  recordType: string;
  data?: BrowserNfcRecordData | BrowserNfcRecord[];
  id?: string;
  lang?: string;
  mediaType?: string;
};
export type BrowserNfcWriteMessage =
  | string
  | BrowserNfcRecord[]
  | ArrayBuffer
  | ArrayBufferView
  | DataView;
export type BrowserNfcScanOptions = { signal?: AbortSignal };
export type BrowserNfcWriteOptions = {
  overwrite?: boolean;
  signal?: AbortSignal;
};
export type BrowserNfcReadingEvent = Event & {
  serialNumber?: string;
  message: {
    records: {
      recordType: string;
      data?: unknown;
      id?: string;
      lang?: string;
      mediaType?: string;
    }[];
  };
};
export type BrowserNfcScanHandlers = {
  onReading?: (event: BrowserNfcReadingEvent) => void;
  onReadingError?: (event: Event) => void;
};
export type BrowserNfcReaderInstance = {
  onreading: ((event: BrowserNfcReadingEvent) => void) | null;
  onreadingerror: ((event: Event) => void) | null;
  scan(options?: BrowserNfcScanOptions): Promise<void>;
  write(message: BrowserNfcWriteMessage, options?: BrowserNfcWriteOptions): Promise<void>;
} & EventTarget;
export type BrowserNfcReaderConstructor = new () => BrowserNfcReaderInstance;
export type BrowserNfcWindow = Window & {
  NDEFReader?: BrowserNfcReaderConstructor;
};
