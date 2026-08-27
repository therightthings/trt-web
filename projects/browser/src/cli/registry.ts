import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import type { BrowserCliUtility } from './types.js';

function readBrowserReadme(): string {
  const readmePath = fileURLToPath(new URL('../../README.md', import.meta.url));
  return readFileSync(readmePath, 'utf8');
}

export function readBrowserPackageVersion(): string {
  const packagePath = fileURLToPath(new URL('../../package.json', import.meta.url));
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8')) as { version?: string };
  return packageJson.version ?? '0.0.0';
}

function parseBrowserReadme(readme: string): BrowserCliUtility[] {
  const sections = [...readme.matchAll(/^## (.+)\s*$([\s\S]*?)(?=^## |(?![\s\S]))/gm)];

  return sections.map((sectionMatch) => {
    const name = sectionMatch[1].trim();
    const content = sectionMatch[2];
    const methodsStart = content.indexOf('### Methods');
    const examplesStart = content.indexOf('### Examples');
    const descriptionEnd = methodsStart >= 0 ? methodsStart : examplesStart;
    const description = content
      .slice(0, descriptionEnd >= 0 ? descriptionEnd : content.length)
      .trim();
    const methodsSection =
      methodsStart >= 0
        ? content.slice(methodsStart, examplesStart >= 0 ? examplesStart : content.length)
        : '';
    const methods = [...methodsSection.matchAll(/^- `([^`]+)`: (.+)$/gm)].map((match) => ({
      name: match[1].replace(/\(.*$/, ''),
      signature: match[1],
      description: match[2],
    }));
    const example = content.match(/```ts\n([\s\S]*?)\n```/)?.[1];

    return { name, description, methods, example };
  });
}

const browserUtilities = parseBrowserReadme(readBrowserReadme());

export { browserUtilities };
