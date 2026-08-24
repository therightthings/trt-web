// Run: npx vitest run projects/core/src/lib/dom-handler/canvas/canvas.spec.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Canvas } from './canvas';

function createCanvas(): {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
} {
  const context = {
    arc: vi.fn(),
    beginPath: vi.fn(),
    clearRect: vi.fn(),
    closePath: vi.fn(),
    drawImage: vi.fn(),
    fill: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    lineTo: vi.fn(),
    moveTo: vi.fn(),
    restore: vi.fn(),
    save: vi.fn(),
    stroke: vi.fn(),
    strokeRect: vi.fn(),
  } as unknown as CanvasRenderingContext2D;

  const canvas = {
    getContext: vi.fn(() => context),
    height: 100,
    toDataURL: vi.fn(() => 'data:image/png;base64,canvas'),
    toBlob: vi.fn((callback: BlobCallback) => callback(new Blob(['canvas']))),
    width: 200,
  } as unknown as HTMLCanvasElement;

  return { canvas, context };
}

describe('Canvas', () => {
  beforeEach(() => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('document', {});
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reports browser canvas support', () => {
    vi.stubGlobal('window', {});
    vi.stubGlobal('document', {});
    vi.stubGlobal('HTMLCanvasElement', class HTMLCanvasElement {});

    expect(Canvas.isSupported()).toBe(true);
  });

  it('gets a 2D context and canvas size', () => {
    const { canvas, context } = createCanvas();
    const session = Canvas.createSession(canvas);

    expect(session.getContext()).toBe(context);
    expect(session.getSize()).toEqual({ width: 200, height: 100 });
  });

  it('creates a canvas element when no canvas is provided', () => {
    const { canvas } = createCanvas();
    const createElement = vi.fn(() => canvas);

    vi.stubGlobal('window', {});
    vi.stubGlobal('document', { createElement });

    expect(Canvas.createSession()).toBeDefined();
    expect(createElement).toHaveBeenCalledWith('canvas');
  });

  it('draws common 2D primitives with the configured options', () => {
    const { canvas, context } = createCanvas();
    const session = Canvas.createSession(canvas);

    expect(
      session.drawLine({
        end: [20, 20],
        lineWidth: 2,
        start: [0, 0],
        strokeStyle: '#fff',
      }),
    ).toBe(true);
    expect(session.drawRectangle({ fillStyle: '#000', height: 10, width: 20, x: 1, y: 2 })).toBe(
      true,
    );
    expect(session.drawCircle({ radius: 5, x: 10, y: 10 })).toBe(true);
    expect(session.drawText({ text: 'Canvas', x: 0, y: 12 })).toBe(true);

    expect(context.stroke).toHaveBeenCalled();
    expect(context.fillRect).toHaveBeenCalled();
    expect(context.arc).toHaveBeenCalled();
    expect(context.fillText).toHaveBeenCalledWith('Canvas', 0, 12);
  });

  it('clears and exports canvas content', async () => {
    const { canvas, context } = createCanvas();
    const session = Canvas.createSession(canvas);

    session.clear('#000');

    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 200, 100);
    expect(context.fillRect).toHaveBeenCalledWith(0, 0, 200, 100);
    expect(session.toDataUrl()).toBe('data:image/png;base64,canvas');
    expect(await session.toBlob()).toBeInstanceOf(Blob);
  });
});
