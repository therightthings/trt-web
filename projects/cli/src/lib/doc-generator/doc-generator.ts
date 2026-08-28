import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { minifyHtml } from '../utils/minify-html.js';
import type { ParsedReadmeNode } from '../utils/parse-readme.js';
import { parseReadme } from '../utils/parse-readme.js';
import { readFile } from '../utils/read-file.js';
import type { DocGeneratorConfig } from './doc-generator.type.js';

type DocMethod = {
  signature: string;
  description: string;
};

type DocUtility = {
  id: string;
  title: string;
  description: string;
  methods: DocMethod[];
  example?: string;
  language?: string;
};

type DocGroup = {
  id: string;
  title: string;
  description: string;
  utilities: DocUtility[];
};

export class DocGenerator {
  static generate(config: DocGeneratorConfig): string {
    const readme = readFile(config.readmePath);
    const document = this.createDocument(parseReadme(readme));
    const html = minifyHtml(this.renderDocument(document, config));
    const outputFile = this.getOutputFile(config.outputPath);

    mkdirSync(path.dirname(outputFile), { recursive: true });
    writeFileSync(outputFile, html, 'utf8');

    return outputFile;
  }

  private static createDocument(nodes: ParsedReadmeNode[]): { groups: DocGroup[] } {
    const roots = nodes.filter((node) => node.level === 1);
    if (roots.length > 0) {
      return { groups: roots.map((node) => this.createGroup(node)) };
    }

    return {
      groups: nodes.filter((node) => node.level === 2).map((node) => this.createGroup(node)),
    };
  }

  private static createGroup(node: ParsedReadmeNode): DocGroup {
    const utilities = node.children
      .filter((child) => child.level === node.level + 1 && !this.isSection(child))
      .map((child) => this.createUtility(child));

    if (node.level === 2) {
      utilities.push(this.createUtility(node));
    }

    return {
      id: this.toId(node.title),
      title: node.title,
      description: node.content,
      utilities,
    };
  }

  private static createUtility(node: ParsedReadmeNode): DocUtility {
    const methodsNode = node.children.find((child) => child.title.toLowerCase() === 'methods');
    const examplesNode = node.children.find((child) => child.title.toLowerCase() === 'examples');
    const methods: DocMethod[] = [];

    if (methodsNode) {
      for (const line of methodsNode.content.split(/\r?\n/)) {
        const match = line.match(/^\s*- `([^`]+)`: (.+)$/);
        if (match) {
          methods.push({ signature: match[1], description: match[2] });
        }
      }
    }

    const example = examplesNode?.codeBlocks[0];
    return {
      id: this.toId(node.title),
      title: node.title,
      description: node.content,
      methods,
      example: example?.code,
      language: example?.language,
    };
  }

  private static renderDocument(
    document: { groups: DocGroup[] },
    config: DocGeneratorConfig,
  ): string {
    const title = config.title ?? 'Documentation';
    const groups = document.groups
      .flatMap((group) => group.utilities)
      .map((utility) => this.renderUtilityLink(utility))
      .join('');
    const utilities = document.groups
      .flatMap((group) => group.utilities)
      .map((utility) => this.renderUtility(utility))
      .join('');

    return /*html*/ `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.escapeHtml(title)}</title>
    <style>${this.styles()}</style>
  </head>
  <body>
    <header class="mobile-header">
      <button id="menu-toggle" type="button">☰</button>
      <strong>${this.escapeHtml(title)}</strong>
      <button id="theme-toggle" type="button">◐</button>
    </header>
    <aside class="sidebar">
      <div class="brand">
        <strong>${this.escapeHtml(title)}</strong>
        <button id="desktop-theme-toggle" type="button">◐</button>
      </div>
      <input id="search" type="search" placeholder="Search utilities...">
      <nav>${groups}</nav>
    </aside>
    <main class="main">
      <h1>${this.escapeHtml(title)}</h1>
      <section id="content">${utilities}</section>
    </main>
    <script>${this.scripts()}</script>
  </body>
</html>
`;
  }

  private static renderUtilityLink(utility: DocUtility): string {
    return /*html*/ `
    <button class="utility-link" data-utility="${utility.id}" type="button">
      ${this.escapeHtml(utility.title)}
    </button>`;
  }

  private static renderUtility(utility: DocUtility): string {
    let methods = '';
    for (const method of utility.methods) {
      methods += /*html*/ `
      <li>
        <code>${this.escapeHtml(method.signature)}</code>
        <p>${this.escapeHtml(method.description)}</p>
      </li>`;
    }

    let example = '';
    if (utility.example) {
      const lines = utility.example.split('\n');
      for (const line of lines) {
        example += `${this.escapeHtml(line)}\n`;
      }
    }

    return /*html*/ `
      <article class="utility" id="utility-${utility.id}" data-search="${this.escapeHtml(`${utility.title} ${utility.description} ${utility.methods.map((method) => method.signature).join(' ')}`.toLowerCase())}">
        <p class="eyebrow">Utility</p>
        <h2>${this.escapeHtml(utility.title)}</h2>
        <p>${this.escapeHtml(utility.description)}</p>
        ${example ? `<h3>Examples</h3><pre><code>${example}</code></pre>` : ''}${
          methods ? `<h3>Methods</h3><ul>${methods}</ul>` : ''
        }
      </article>`;
  }

  private static getOutputFile(outputPath: string): string {
    if (outputPath.endsWith('.html')) {
      return outputPath;
    }
    return path.join(outputPath, 'index.html');
  }

  private static isSection(node: ParsedReadmeNode): boolean {
    const title = node.title.toLowerCase();
    return title === 'methods' || title === 'examples';
  }

  private static toId(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private static escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private static styles(): string {
    return readFile(fileURLToPath(new URL('../../assets/styles.css', import.meta.url)));
  }

  private static scripts(): string {
    return readFile(fileURLToPath(new URL('../../assets/scripts.js', import.meta.url)));
  }
}
