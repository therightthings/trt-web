import { requireBrowserEnv } from '../../utils';
import type { BrowserKeyboardEventInfo, BrowserPointerEventInfo } from './browser-window.type';

export class BrowserWindow {
  static reload(): void {
    requireBrowserEnv();
    window.location.reload();
  }

  static goBack() {
    requireBrowserEnv();
    window.history.back();
  }

  static goForward() {
    requireBrowserEnv();
    window.history.forward();
  }

  static pushState(data: unknown, unused: string, url?: string | URL) {
    requireBrowserEnv();
    return window.history.pushState(data, unused, url);
  }

  static replaceState(data: unknown, unused: string, url?: string | URL) {
    requireBrowserEnv();
    return window.history.replaceState(data, unused, url);
  }

  static historyState() {
    requireBrowserEnv();
    return window.history.state;
  }

  static alert(message: string) {
    requireBrowserEnv();
    window.alert(message);
  }

  static confirm(message: string) {
    requireBrowserEnv();
    return window.confirm(message);
  }

  static prompt(title: string, defaultValue?: string) {
    requireBrowserEnv();
    return window.prompt(title, defaultValue);
  }

  static print() {
    requireBrowserEnv();
    window.print();
  }

  static getKeyboardEventInfo(event: KeyboardEvent): BrowserKeyboardEventInfo {
    return {
      key: event.key,
      code: event.code,
      repeat: event.repeat,
      location: event.location,
      modifiers: {
        alt: event.altKey,
        shift: event.shiftKey,
        ctrl: event.ctrlKey,
        meta: event.metaKey,
      },
    };
  }

  static getPointerEventInfo(event: PointerEvent): BrowserPointerEventInfo {
    return {
      clientX: event.clientX,
      clientY: event.clientY,
      pageX: event.pageX,
      pageY: event.pageY,
      screenX: event.screenX,
      screenY: event.screenY,
      offsetX: event.offsetX,
      offsetY: event.offsetY,
      buttons: event.buttons,
      pressure: event.pressure,
      pointerId: event.pointerId,
      pointerType: event.pointerType,
    };
  }
}
