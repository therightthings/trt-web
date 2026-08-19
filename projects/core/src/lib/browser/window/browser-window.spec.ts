import { describe, expect, it } from 'vitest';

import { BrowserWindow } from './browser-window';

describe('BrowserWindow', () => {
  it('requires a browser environment for window APIs', () => {
    expect(() => BrowserWindow.historyState()).toThrow(
      'This function can only be used in a browser environment.',
    );
  });

  it('extracts keyboard event information', () => {
    const event = {
      key: 'A',
      code: 'KeyA',
      altKey: true,
      shiftKey: false,
      ctrlKey: false,
      metaKey: false,
      repeat: true,
      location: 0,
    } as KeyboardEvent;

    expect(BrowserWindow.getKeyboardEventInfo(event)).toMatchObject({
      key: 'A',
      code: 'KeyA',
      repeat: true,
      modifiers: {
        alt: true,
        shift: false,
        ctrl: false,
        meta: false,
      },
    });
  });

  it('extracts pointer event information', () => {
    const event = Object.assign(new Event('pointermove'), {
      clientX: 10,
      clientY: 20,
      pageX: 30,
      pageY: 40,
      screenX: 50,
      screenY: 60,
      offsetX: 5,
      offsetY: 6,
      buttons: 1,
      pressure: 0.5,
      pointerId: 7,
      pointerType: 'mouse',
    }) as PointerEvent;

    expect(BrowserWindow.getPointerEventInfo(event)).toEqual({
      clientX: 10,
      clientY: 20,
      pageX: 30,
      pageY: 40,
      screenX: 50,
      screenY: 60,
      offsetX: 5,
      offsetY: 6,
      buttons: 1,
      pressure: 0.5,
      pointerId: 7,
      pointerType: 'mouse',
    });
  });
});
