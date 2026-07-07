import { requireBrowserEnv } from '../utils';

export function varCSS(name: string, value?: string): string {
  requireBrowserEnv();

  const varName = name.startsWith('--') ? name : `--${name}`;

  if (value) {
    document.documentElement.style.setProperty(varName, value);
  }

  return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
}
