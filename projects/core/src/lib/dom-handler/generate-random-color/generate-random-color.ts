export type GenerateColorFormat = 'hex' | 'rgb';

export interface GenerateColorConfig {
  format?: GenerateColorFormat;
  opacity?: number;
}

function randomChannel(): number {
  return Math.floor(Math.random() * 256);
}

function clampOpacity(opacity: number): number {
  if (!Number.isFinite(opacity)) {
    return 1;
  }

  return Math.min(1, Math.max(0, opacity));
}

function toHex(value: number): string {
  return value.toString(16).padStart(2, '0');
}

export function generateRandomColor(config: GenerateColorConfig = {}): string {
  const { format = 'hex', opacity = 1 } = config;
  const red = randomChannel();
  const green = randomChannel();
  const blue = randomChannel();
  const alpha = clampOpacity(opacity);

  if (format === 'rgb') {
    if (alpha === 1) {
      return `rgb(${red}, ${green}, ${blue})`;
    }

    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  const hex = `#${toHex(red)}${toHex(green)}${toHex(blue)}`;

  if (alpha === 1) {
    return hex;
  }

  return `${hex}${toHex(Math.round(alpha * 255))}`;
}
