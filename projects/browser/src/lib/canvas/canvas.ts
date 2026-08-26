import { trt } from '@trt-web/core';

import { CanvasSession } from './canvas-session';

/**
 * Creates isolated sessions for the HTML Canvas 2D API.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API
 * @see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D
 */
export class Canvas {
  static isSupported(): boolean {
    trt.utils.requireBrowserEnv();
    return typeof HTMLCanvasElement !== 'undefined';
  }

  static createSession(canvas?: HTMLCanvasElement): CanvasSession {
    trt.utils.requireBrowserEnv();
    return new CanvasSession(canvas ?? document.createElement('canvas'));
  }
}
