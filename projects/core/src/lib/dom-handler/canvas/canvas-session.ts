import type {
  CanvasBlobOptions,
  CanvasCircleOptions,
  CanvasContextOptions,
  CanvasGradientOptions,
  CanvasImageDataArea,
  CanvasImageOptions,
  CanvasLineOptions,
  CanvasPathOptions,
  CanvasPutImageDataOptions,
  CanvasRectangleOptions,
  CanvasResizeOptions,
  CanvasTextOptions,
} from './canvas.type';

export class CanvasSession {
  constructor(private readonly canvas: HTMLCanvasElement) {}

  getContext(options?: CanvasContextOptions): CanvasRenderingContext2D | undefined {
    return this.canvas.getContext('2d', options) ?? undefined;
  }

  getSize(): { width: number; height: number } {
    return { width: this.canvas.width, height: this.canvas.height };
  }

  resize(options?: CanvasResizeOptions): void {
    const {
      devicePixelRatio = window.devicePixelRatio ?? 1,
      fit,
      height: configuredHeight,
      width: configuredWidth,
    } = options ?? {};
    const dpr = devicePixelRatio;
    const element = fit === 'parent' ? this.canvas.parentElement : this.canvas;
    const width = configuredWidth ?? element?.getBoundingClientRect().width ?? this.canvas.width;
    const height =
      configuredHeight ?? element?.getBoundingClientRect().height ?? this.canvas.height;

    this.canvas.width = Math.max(1, Math.round(width * dpr));
    this.canvas.height = Math.max(1, Math.round(height * dpr));
    this.canvas.style.width = `${Math.max(1, Math.round(width))}px`;
    this.canvas.style.height = `${Math.max(1, Math.round(height))}px`;
  }

  clear(color?: string): void {
    const context = this.getContext();
    if (!context) {
      return;
    }

    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (color) {
      context.fillStyle = color;
      context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  drawLine(options: CanvasLineOptions): boolean {
    const { end, lineCap, lineJoin, lineWidth, start, strokeStyle } = options;
    const context = this.getContext();
    if (!context) {
      return false;
    }

    context.save();
    if (strokeStyle) context.strokeStyle = strokeStyle;
    if (lineWidth !== undefined) context.lineWidth = lineWidth;
    if (lineCap) context.lineCap = lineCap;
    if (lineJoin) context.lineJoin = lineJoin;
    context.beginPath();
    context.moveTo(...start);
    context.lineTo(...end);
    context.stroke();
    context.restore();
    return true;
  }

  drawRectangle(options: CanvasRectangleOptions): boolean {
    const { fillStyle, height, lineWidth, strokeStyle, width, x, y } = options;
    const context = this.getContext();
    if (!context) return false;

    context.save();
    if (fillStyle) {
      context.fillStyle = fillStyle;
      context.fillRect(x, y, width, height);
    }
    if (strokeStyle) {
      context.strokeStyle = strokeStyle;
      if (lineWidth !== undefined) context.lineWidth = lineWidth;
      context.strokeRect(x, y, width, height);
    }
    context.restore();
    return true;
  }

  drawCircle(options: CanvasCircleOptions): boolean {
    const { fillStyle, lineWidth, radius, strokeStyle, x, y } = options;
    const context = this.getContext();
    if (!context) return false;

    context.save();
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    if (fillStyle) {
      context.fillStyle = fillStyle;
      context.fill();
    }
    if (strokeStyle) {
      context.strokeStyle = strokeStyle;
      if (lineWidth !== undefined) context.lineWidth = lineWidth;
      context.stroke();
    }
    context.restore();
    return true;
  }

  drawText(options: CanvasTextOptions): boolean {
    const { fillStyle, font, maxWidth, text, textAlign, textBaseline, x, y } = options;
    const context = this.getContext();
    if (!context) return false;

    context.save();
    if (fillStyle) context.fillStyle = fillStyle;
    if (font) context.font = font;
    if (textAlign) context.textAlign = textAlign;
    if (textBaseline) context.textBaseline = textBaseline;
    if (maxWidth === undefined) {
      context.fillText(text, x, y);
    } else {
      context.fillText(text, x, y, maxWidth);
    }
    context.restore();
    return true;
  }

  drawImage(image: CanvasImageSource, options?: CanvasImageOptions): boolean {
    const { height, width, x = 0, y = 0 } = options ?? {};
    const context = this.getContext();
    if (!context) return false;

    context.save();
    if (width === undefined || height === undefined) {
      context.drawImage(image, x, y);
    } else {
      context.drawImage(image, x, y, width, height);
    }
    context.restore();
    return true;
  }

  getImageData(area: CanvasImageDataArea): ImageData | undefined {
    const { height, width, x, y } = area;
    const context = this.getContext();
    if (!context) {
      return undefined;
    }

    return context.getImageData(x, y, width, height);
  }

  putImageData(imageData: ImageData, options?: CanvasPutImageDataOptions): boolean {
    const { dirty, x = 0, y = 0 } = options ?? {};
    const context = this.getContext();
    if (!context) {
      return false;
    }

    if (dirty) {
      context.putImageData(imageData, x, y, dirty.x, dirty.y, dirty.width, dirty.height);
    } else {
      context.putImageData(imageData, x, y);
    }

    return true;
  }

  createGradient(options: CanvasGradientOptions): CanvasGradient | undefined {
    const { type, stops } = options;
    const context = this.getContext();
    if (!context) {
      return undefined;
    }

    let gradient: CanvasGradient;
    if (type === 'linear') {
      const { x0, y0, x1, y1 } = options;
      gradient = context.createLinearGradient(x0, y0, x1, y1);
    } else {
      const { radius0, radius1, x0, y0, x1, y1 } = options;
      gradient = context.createRadialGradient(x0, y0, radius0, x1, y1, radius1);
    }

    for (const stop of stops) {
      gradient.addColorStop(stop.offset, stop.color);
    }

    return gradient;
  }

  drawPath(path: Path2D, options?: CanvasPathOptions): boolean {
    const { fillRule, fillStyle, lineWidth, strokeStyle } = options ?? {};
    const context = this.getContext();
    if (!context) {
      return false;
    }

    context.save();
    if (fillStyle) {
      context.fillStyle = fillStyle;
      context.fill(path, fillRule);
    }
    if (strokeStyle) {
      context.strokeStyle = strokeStyle;
      if (lineWidth !== undefined) {
        context.lineWidth = lineWidth;
      }
      context.stroke(path);
    }
    context.restore();
    return true;
  }

  rotate(angle: number): boolean {
    const context = this.getContext();
    if (!context) return false;
    context.rotate(angle);
    return true;
  }

  scale(x: number, y: number): boolean {
    const context = this.getContext();
    if (!context) return false;
    context.scale(x, y);
    return true;
  }

  translate(x: number, y: number): boolean {
    const context = this.getContext();
    if (!context) return false;
    context.translate(x, y);
    return true;
  }

  flip(axis: 'horizontal' | 'vertical'): boolean {
    return axis === 'horizontal' ? this.scale(-1, 1) : this.scale(1, -1);
  }

  resetTransform(): boolean {
    const context = this.getContext();
    if (!context) return false;
    context.resetTransform();
    return true;
  }

  async toBlob(options?: CanvasBlobOptions): Promise<Blob | undefined> {
    const { quality, type } = options ?? {};
    return await new Promise<Blob | undefined>((resolve) => {
      this.canvas.toBlob((blob) => resolve(blob ?? undefined), type, quality);
    });
  }

  toDataUrl(type?: string, quality?: number): string {
    return this.canvas.toDataURL(type, quality);
  }
}
