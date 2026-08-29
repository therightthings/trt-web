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
    quadraticCurveTo: vi.fn(),
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

  it('draws a rounded rectangle when a radius is configured', () => {
    const { canvas, context } = createCanvas();
    const session = Canvas.createSession(canvas);

    expect(
      session.drawRectangle({
        fillStyle: '#000',
        height: 40,
        radius: 12,
        strokeStyle: '#fff',
        width: 80,
        x: 10,
        y: 20,
      }),
    ).toBe(true);

    expect(context.beginPath).toHaveBeenCalled();
    expect(context.quadraticCurveTo).toHaveBeenCalled();
    expect(context.fill).toHaveBeenCalled();
    expect(context.stroke).toHaveBeenCalled();
    expect(context.fillRect).not.toHaveBeenCalled();
    expect(context.strokeRect).not.toHaveBeenCalled();
  });

  it('draws a path with fill and stroke options', () => {
    const { canvas, context } = createCanvas();
    const session = Canvas.createSession(canvas);
    const path = {} as Path2D;

    expect(
      session.drawPath(path, {
        fillRule: 'evenodd',
        fillStyle: '#000',
        lineCap: 'round',
        lineJoin: 'round',
        lineWidth: 3,
        miterLimit: 4,
        strokeStyle: '#fff',
      }),
    ).toBe(true);

    expect(context.fill).toHaveBeenCalledWith(path, 'evenodd');
    expect(context.stroke).toHaveBeenCalledWith(path);
  });

  it('draws a path with only fill or only stroke', () => {
    const { canvas, context } = createCanvas();
    const session = Canvas.createSession(canvas);
    const path = {} as Path2D;

    expect(session.drawPath(path, { fillStyle: '#000' })).toBe(true);
    expect(session.drawPath(path, { strokeStyle: '#fff' })).toBe(true);

    expect(context.fill).toHaveBeenCalledTimes(1);
    expect(context.stroke).toHaveBeenCalledTimes(1);
  });

  it('draws an open polyline without mutating its points', () => {
    const { canvas, context } = createCanvas();
    const session = Canvas.createSession(canvas);
    const points: Array<[number, number]> = [
      [10, 10],
      [20, 24],
      [35, 18],
    ];
    const originalPoints = points.map((point) => [...point] as [number, number]);

    expect(
      session.drawPolyline({
        lineCap: 'round',
        lineJoin: 'round',
        lineWidth: 4,
        points,
        strokeStyle: '#000',
      }),
    ).toBe(true);

    expect(context.moveTo).toHaveBeenCalledWith(10, 10);
    expect(context.lineTo).toHaveBeenNthCalledWith(1, 20, 24);
    expect(context.lineTo).toHaveBeenNthCalledWith(2, 35, 18);
    expect(context.closePath).not.toHaveBeenCalled();
    expect(points).toEqual(originalPoints);
  });

  it('closes a polyline when requested', () => {
    const { canvas, context } = createCanvas();
    const session = Canvas.createSession(canvas);

    expect(
      session.drawPolyline({
        closePath: true,
        points: [
          [0, 0],
          [10, 0],
        ],
      }),
    ).toBe(true);

    expect(context.closePath).toHaveBeenCalled();
  });

  it('rejects polylines with fewer than two points', () => {
    const { canvas, context } = createCanvas();
    const session = Canvas.createSession(canvas);

    expect(session.drawPolyline({ points: [] })).toBe(false);
    expect(session.drawPolyline({ points: [[1, 1]] })).toBe(false);
    expect(context.beginPath).not.toHaveBeenCalled();
  });

  it('returns false when the 2D context is unavailable', () => {
    const canvas = {
      getContext: vi.fn(() => null),
    } as unknown as HTMLCanvasElement;
    const session = Canvas.createSession(canvas);

    expect(session.drawPath({} as Path2D)).toBe(false);
    expect(
      session.drawPolyline({
        points: [
          [0, 0],
          [1, 1],
        ],
      }),
    ).toBe(false);
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
