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
  showTitle: boolean;
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
      const groups: DocGroup[] = [];
      for (const root of roots) {
        const hasDirectUtilities = root.children.some((child) => this.isUtility(child));
        if (hasDirectUtilities) {
          groups.push(this.createGroup(root));
          continue;
        }

        for (const child of root.children) {
          if (child.level === root.level + 1 && !this.isSection(child)) {
            groups.push(this.createGroup(child));
          }
        }
      }
      return { groups };
    }

    return {
      groups: nodes.filter((node) => node.level === 2).map((node) => this.createGroup(node)),
    };
  }

  private static createGroup(node: ParsedReadmeNode): DocGroup {
    const utilities = node.children
      .filter((child) => child.level === node.level + 1 && this.isUtility(child))
      .map((child) => this.createUtility(child));

    if (node.level === 2) {
      utilities.push(this.createUtility(node));
    }

    return {
      id: this.toId(node.title),
      title: node.title,
      description: node.content,
      utilities,
      showTitle: node.level !== 1,
    };
  }

  private static createUtility(node: ParsedReadmeNode): DocUtility {
    const methodsNode = this.findSection(node, 'methods');
    const examplesNode = this.findSection(node, 'examples');
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
    let groups = '';
    for (const group of document.groups) {
      const links = group.utilities.map((utility) => this.renderUtilityLink(utility)).join('');
      if (group.showTitle) {
        groups += /*html*/ `
        <section class="group">
          <button class="group-title" type="button">
            <span>${this.escapeHtml(group.title)}</span>
            <span>${group.utilities.length}</span>
          </button>
          <div class="group-utilities">${links}</div>
        </section>`;
      } else {
        groups += links;
      }
    }
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
        <div class="brand-header">
          <strong>${this.escapeHtml(title)}</strong>
          <button id="desktop-theme-toggle" type="button">◐</button>
        </div>
        <input id="search" type="search" placeholder="Search utilities...">
      </div>
      <nav>${groups}</nav>
    </aside>
    <main class="main">
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

  private static isUtility(node: ParsedReadmeNode): boolean {
    return node.children.some((child) => {
      return this.isSection(child);
    });
  }

  private static findSection(
    node: ParsedReadmeNode,
    title: 'methods' | 'examples',
  ): ParsedReadmeNode | undefined {
    return node.children.find((child) => child.title.toLowerCase() === title);
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
