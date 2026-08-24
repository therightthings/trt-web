import { Canvas } from '@trt-web/core';

export const createCanvasPage = (): HTMLElement => {
  const page = document.createElement('main');
  page.className = 'content';
  page.innerHTML = /* html */ `
    <section class="hero">
      <p class="eyebrow">dom-handler/canvas</p>
      <h1>Canvas</h1>
      <p>Explore every public method available on CanvasSession.</p>
    </section>
    <section class="card">
      <canvas id="canvas-demo" width="720" height="320" style="width: 100%; height: 320px; border-radius: 12px;"></canvas>
      <div class="demo-actions">
        <button id="canvas-context" type="button">Get context</button>
        <button id="canvas-size" type="button">Get size</button>
        <button id="canvas-resize" type="button">Resize</button>
        <button id="canvas-clear" type="button">Clear</button>
        <button id="canvas-line" type="button">Draw line</button>
        <button id="canvas-rectangle" type="button">Draw rectangle</button>
        <button id="canvas-circle" type="button">Draw circle</button>
        <button id="canvas-text" type="button">Draw text</button>
        <button id="canvas-image" type="button">Draw image</button>
        <button id="canvas-image-data" type="button">Get image data</button>
        <button id="canvas-put-image-data" type="button">Put image data</button>
        <button id="canvas-linear-gradient" type="button">Linear gradient</button>
        <button id="canvas-radial-gradient" type="button">Radial gradient</button>
        <button id="canvas-path" type="button">Draw path</button>
        <button id="canvas-rotate" type="button">Rotate</button>
        <button id="canvas-scale" type="button">Scale</button>
        <button id="canvas-translate" type="button">Translate</button>
        <button id="canvas-flip" type="button">Flip</button>
        <button id="canvas-reset-transform" type="button">Reset transform</button>
        <button id="canvas-blob" type="button">To Blob</button>
        <button id="canvas-data-url" type="button">To Data URL</button>
      </div>
      <pre id="canvas-result" class="demo-result">No canvas action run yet.</pre>
    </section>
  `;

  const canvas = page.querySelector<HTMLCanvasElement>('#canvas-demo')!;
  const result = page.querySelector<HTMLElement>('#canvas-result')!;
  const session = Canvas.createSession(canvas);

  const show = (value: unknown): void => {
    result.textContent = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  };

  const resize = (): { width: number; height: number } => {
    const width = Math.max(1, Math.floor(canvas.clientWidth || 720));
    const height = 320;
    session.resize({ devicePixelRatio: 1, height, width });
    return { height, width };
  };

  const drawBase = (): void => {
    const { width } = resize();
    session.clear('#172236');
    session.drawRectangle({
      fillStyle: '#1e3a5f',
      height: 120,
      strokeStyle: '#7dd3fc',
      width: 220,
      x: 32,
      y: 32,
    });
    session.drawCircle({ fillStyle: '#86efac', radius: 48, x: width / 2, y: 110 });
    session.drawText({
      fillStyle: '#e8edf5',
      font: '24px sans-serif',
      text: 'CanvasSession',
      x: 32,
      y: 220,
    });
  };

  page.querySelector('#canvas-context')?.addEventListener('click', () => {
    show({ context: Boolean(session.getContext()) });
  });

  page.querySelector('#canvas-size')?.addEventListener('click', () => {
    show(session.getSize());
  });

  page.querySelector('#canvas-resize')?.addEventListener('click', () => {
    show({ resized: resize(), size: session.getSize() });
  });

  page.querySelector('#canvas-clear')?.addEventListener('click', () => {
    session.clear('#101827');
    show('Canvas cleared.');
  });

  page.querySelector('#canvas-line')?.addEventListener('click', () => {
    resize();
    session.drawLine({
      end: [280, 220],
      lineWidth: 4,
      start: [32, 32],
      strokeStyle: '#7dd3fc',
    });
    show('drawLine completed.');
  });

  page.querySelector('#canvas-rectangle')?.addEventListener('click', () => {
    resize();
    session.drawRectangle({
      fillStyle: '#1e3a5f',
      height: 100,
      strokeStyle: '#7dd3fc',
      width: 180,
      x: 32,
      y: 32,
    });
    show('drawRectangle completed.');
  });

  page.querySelector('#canvas-circle')?.addEventListener('click', () => {
    resize();
    session.drawCircle({ fillStyle: '#86efac', radius: 60, x: 180, y: 140 });
    show('drawCircle completed.');
  });

  page.querySelector('#canvas-text')?.addEventListener('click', () => {
    resize();
    session.drawText({
      fillStyle: '#e8edf5',
      font: '28px sans-serif',
      text: 'Hello Canvas',
      x: 32,
      y: 160,
    });
    show('drawText completed.');
  });

  page.querySelector('#canvas-image')?.addEventListener('click', () => {
    const image = new Image();
    image.onload = () => {
      resize();
      session.drawImage(image, { height: 120, width: 180, x: 32, y: 32 });
      show('drawImage completed.');
    };
    image.onerror = () => show('Could not load the demo image.');
    image.src =
      'data:image/svg+xml;charset=utf-8,' +
      encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="120"><rect width="180" height="120" fill="#7dd3fc"/><circle cx="90" cy="60" r="36" fill="#172236"/></svg>',
      );
  });

  page.querySelector('#canvas-image-data')?.addEventListener('click', () => {
    resize();
    const imageData = session.getImageData({ height: 20, width: 20, x: 0, y: 0 });
    show(
      imageData
        ? { width: imageData.width, height: imageData.height, dataLength: imageData.data.length }
        : 'ImageData unavailable.',
    );
  });

  page.querySelector('#canvas-put-image-data')?.addEventListener('click', () => {
    resize();
    const imageData = new ImageData(80, 80);
    for (let index = 0; index < imageData.data.length; index += 4) {
      imageData.data[index] = 125;
      imageData.data[index + 1] = 211;
      imageData.data[index + 2] = 252;
      imageData.data[index + 3] = 255;
    }
    session.putImageData(imageData, { x: 32, y: 32 });
    show('putImageData completed.');
  });

  const drawGradient = (type: 'linear' | 'radial'): void => {
    const { width, height } = resize();
    const gradient =
      type === 'linear'
        ? session.createGradient({
            type,
            x0: 0,
            x1: width,
            y0: 0,
            y1: height,
            stops: [
              { color: '#0ea5e9', offset: 0 },
              { color: '#8b5cf6', offset: 1 },
            ],
          })
        : session.createGradient({
            type,
            x0: width / 2,
            x1: width / 2,
            y0: height / 2,
            y1: height / 2,
            radius0: 10,
            radius1: Math.max(width, height) / 2,
            stops: [
              { color: '#86efac', offset: 0 },
              { color: '#172236', offset: 1 },
            ],
          });
    session.clear('#101827');
    session.drawRectangle({ fillStyle: gradient, height, width, x: 0, y: 0 });
    show(`createGradient(${type}) completed.`);
  };

  page
    .querySelector('#canvas-linear-gradient')
    ?.addEventListener('click', () => drawGradient('linear'));
  page
    .querySelector('#canvas-radial-gradient')
    ?.addEventListener('click', () => drawGradient('radial'));

  page.querySelector('#canvas-path')?.addEventListener('click', () => {
    resize();
    const path = new Path2D();
    path.moveTo(32, 220);
    path.lineTo(140, 40);
    path.lineTo(250, 220);
    path.closePath();
    session.drawPath(path, { fillStyle: '#1e3a5f', lineWidth: 3, strokeStyle: '#7dd3fc' });
    show('drawPath completed.');
  });

  page.querySelector('#canvas-rotate')?.addEventListener('click', () => {
    resize();
    session.translate(180, 140);
    session.rotate(Math.PI / 8);
    session.translate(-180, -140);
    drawBase();
    session.resetTransform();
    show('rotate and resetTransform completed.');
  });

  page.querySelector('#canvas-scale')?.addEventListener('click', () => {
    resize();
    session.scale(1.2, 1.2);
    session.drawCircle({ fillStyle: '#86efac', radius: 50, x: 100, y: 100 });
    session.resetTransform();
    show('scale and resetTransform completed.');
  });

  page.querySelector('#canvas-translate')?.addEventListener('click', () => {
    resize();
    session.translate(160, 80);
    session.drawRectangle({ fillStyle: '#1e3a5f', height: 100, width: 180, x: 0, y: 0 });
    session.resetTransform();
    show('translate and resetTransform completed.');
  });

  page.querySelector('#canvas-flip')?.addEventListener('click', () => {
    resize();
    session.translate(260, 0);
    session.flip('horizontal');
    session.drawText({
      fillStyle: '#e8edf5',
      font: '28px sans-serif',
      text: 'Flipped',
      x: 0,
      y: 100,
    });
    session.resetTransform();
    show('flip and resetTransform completed.');
  });

  page.querySelector('#canvas-reset-transform')?.addEventListener('click', () => {
    show(session.resetTransform() ? 'resetTransform completed.' : 'Canvas context unavailable.');
  });

  page.querySelector('#canvas-blob')?.addEventListener('click', async () => {
    const blob = await session.toBlob({ type: 'image/png' });
    show(blob ? { type: blob.type, size: blob.size } : 'Could not create Blob.');
  });

  page.querySelector('#canvas-data-url')?.addEventListener('click', () => {
    const dataUrl = session.toDataUrl('image/png');
    show({ prefix: dataUrl.slice(0, 30), length: dataUrl.length });
  });

  drawBase();
  return page;
};
