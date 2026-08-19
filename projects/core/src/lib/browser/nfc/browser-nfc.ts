import { isType, requireBrowserEnv, toError } from '../../utils';
import { AbstractBrowserUtils } from '../abstract-browser';
import type {
  BrowserNfcReaderConstructor,
  BrowserNfcReaderInstance,
  BrowserNfcScanHandlers,
  BrowserNfcScanOptions,
  BrowserNfcWindow,
  BrowserNfcWriteMessage,
  BrowserNfcWriteOptions,
} from './browser-nfc.type';

/**
 * Web NFC scanning and writing helpers.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_NFC_API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/NDEFReader
 */
export class BrowserNfc extends AbstractBrowserUtils {
  private static reader?: BrowserNfcReaderInstance;
  private static controller?: AbortController;

  static override isSupported(): boolean {
    requireBrowserEnv();
    if (!window.isSecureContext) {
      return false;
    }

    return isType('function', window, 'NDEFReader');
  }

  private static get nfcReader(): BrowserNfcReaderConstructor | undefined {
    if (!this.isSupported()) {
      return undefined;
    }

    return (window as BrowserNfcWindow).NDEFReader;
  }

  static isScanning(): boolean {
    return Boolean(this.reader);
  }

  static async startScan(
    handlers?: BrowserNfcScanHandlers,
    options?: BrowserNfcScanOptions,
  ): Promise<boolean> {
    const Reader = this.nfcReader;
    const reader = Reader ? new Reader() : undefined;
    if (!reader) {
      return false;
    }

    this.stopScan();

    const { signal } = options ?? {};
    const controller = signal ? undefined : new AbortController();
    this.reader = reader;
    this.controller = controller;

    reader.onreading = handlers?.onReading ?? null;
    reader.onreadingerror = handlers?.onReadingError ?? null;

    try {
      await reader.scan({ signal: signal ?? controller?.signal });
      return true;
    } catch (error) {
      console.error(toError(error, 'Could not start NFC scan.'));
      this.stopScan();
      return false;
    }
  }

  static stopScan(): void {
    if (this.controller) {
      this.controller.abort();
      this.controller = undefined;
    }

    this.reader = undefined;
  }

  static async write(
    message: BrowserNfcWriteMessage,
    options?: BrowserNfcWriteOptions,
  ): Promise<boolean> {
    const Reader = this.nfcReader;
    const reader = Reader ? new Reader() : undefined;
    if (!reader) {
      return false;
    }

    try {
      await reader.write(message, options);
      return true;
    } catch (error) {
      console.error(toError(error, 'Could not write NFC message.'));
      return false;
    }
  }
}
