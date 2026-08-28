import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { minifyHtml } from '../utils/minify-html.js';
import type { ParsedReadmeNode } from '../utils/parse-readme.js';
import { parseReadme } from '../utils/parse-readme.js';
import { readFile } from '../utils/read-file.js';
import type { DocGeneratorConfig } from './doc-generator.type.js';
import { Icons } from './icons.js';

type DocMethod = {
  signature: string;
  description: string;
};

type DocUtility = {
  id: string;
  title: string;
  description: string;
  methods: DocMethod[];
  examples: Array<{ title?: string; code: string; language?: string }>;
  codeBlocks: Array<{ code: string; language?: string }>;
  sections: ParsedReadmeNode[];
  hasExamplesSection: boolean;
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
      .filter(
        (child) =>
          child.level === node.level + 1 && !this.isSection(child) && this.isUtility(child),
      )
      .map((child) => this.createUtility(child));

    if (this.isUtility(node) && utilities.length === 0) {
      utilities.push(this.createUtility(node));
    }

    return {
      id: this.toId(node.title),
      title: node.title,
      description: node.content,
      utilities,
      showTitle: node.level !== 1 && !this.isUtility(node),
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

    const exampleTitles =
      examplesNode?.content
        .split(/\r?\n/)
        .map((line) => line.match(/^\s*-\s+(.+?)\s*$/)?.[1])
        .filter((title): title is string => Boolean(title)) ?? [];
    const examples =
      examplesNode?.codeBlocks.map((codeBlock, index) => ({
        title: exampleTitles[index],
        code: codeBlock.code,
        language: codeBlock.language,
      })) ?? [];
    const codeBlocks = node.codeBlocks.map((codeBlock) => ({
      code: codeBlock.code,
      language: codeBlock.language,
    }));
    return {
      id: this.toId(node.title),
      title: node.title,
      description: node.content,
      methods,
      examples,
      codeBlocks,
      sections: node.children.filter((child) => !this.isSection(child)),
      hasExamplesSection: Boolean(examplesNode),
    };
  }

  private static renderDocument(
    document: { groups: DocGroup[] },
    config: DocGeneratorConfig,
  ): string {
    const title = config.title ?? 'Documentation';
    const favicon = `data:image/svg+xml;base64,${Buffer.from(Icons.brandIcon).toString('base64')}`;
    let groups = '';
    for (const group of document.groups) {
      const links = group.utilities.map((utility) => this.renderUtilityLink(utility)).join('');
      if (group.showTitle) {
        groups += /*html*/ `
        <section class="group" data-group="${this.toId(group.title)}">
          <div class="group-header">
            <button class="group-title" type="button">${this.escapeHtml(group.title)}</button>
            <span class="group-count">${group.utilities.length}</span>
            <button class="group-toggle" type="button" aria-label="Toggle ${this.escapeHtml(group.title)}" aria-expanded="false">
              <span aria-hidden="true">+</span>
            </button>
          </div>
          <div class="group-utilities hidden">${links}</div>
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
    <link rel="icon" type="image/svg+xml" href="${favicon}">
    <title>${this.escapeHtml(title)}</title>
    <style>${this.styles()}</style>
  </head>
  <body>
    <header class="mobile-header">
      <button id="menu-toggle" type="button" aria-label="Open menu">${Icons.menuIcon}</button>
      <strong>${this.escapeHtml(title)}</strong>
      <button id="theme-toggle" type="button" aria-label="Toggle theme"><span class="theme-moon">${Icons.themeIcon}</span><span class="theme-sun">${Icons.sunIcon}</span></button>
    </header>
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-header">
          <span class="brand-icon">${Icons.brandIcon}</span>
          <strong>${this.escapeHtml(title)}</strong>
          <button id="desktop-theme-toggle" type="button" aria-label="Toggle theme"><span class="theme-moon">${Icons.themeIcon}</span><span class="theme-sun">${Icons.sunIcon}</span></button>
        </div>
        <div class="search-box">
          <span class="search-icon">${Icons.searchIcon}</span>
          <input id="search" placeholder="Search utilities..." autocomplete="off">
          <button id="search-clear" type="button" aria-label="Clear search" hidden>${Icons.clearIcon}</button>
        </div>
      </div>
      <button id="toggle-all" class="toggle-all" type="button">Expand all</button>
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

    let examples = '';
    for (const codeBlock of utility.codeBlocks) {
      examples += this.renderCodeBlock(codeBlock.code);
    }
    for (const example of utility.examples) {
      if (example.title) {
        examples += `<h4>${this.escapeHtml(example.title)}</h4>`;
      }
      examples += this.renderCodeBlock(example.code);
    }

    let sections = '';
    for (const section of utility.sections) {
      sections += this.renderSection(section);
    }

    return /*html*/ `
      <article class="utility" id="utility-${utility.id}" data-search="${this.escapeHtml(`${utility.title} ${utility.description} ${utility.methods.map((method) => method.signature).join(' ')}`.toLowerCase())}">
        <h2>${this.escapeHtml(utility.title)}</h2>
        <p>${this.escapeHtml(utility.description)}</p>
        ${examples ? `${utility.hasExamplesSection ? '<h3>Examples</h3>' : ''}${examples}` : ''}${sections}${
          methods ? `<h3>Methods</h3><ul>${methods}</ul>` : ''
        }
      </article>`;
  }

  private static renderCodeBlock(code: string): string {
    let output = '';
    for (const line of code.split('\n')) {
      output += `${this.escapeHtml(line)}\n`;
    }

    return `<pre><code>${output}</code></pre>`;
  }

  private static renderSection(node: ParsedReadmeNode): string {
    let content = node.content ? `<p>${this.escapeHtml(node.content)}</p>` : '';
    for (const codeBlock of node.codeBlocks) {
      content += this.renderCodeBlock(codeBlock.code);
    }
    for (const child of node.children) {
      content += this.renderSection(child);
    }

    return `<section><h3>${this.escapeHtml(node.title)}</h3>${content}</section>`;
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
    if (node.codeBlocks.length > 0) {
      return true;
    }

    if (node.children.length === 0 && node.content.length > 0) {
      return true;
    }

    return node.children.some((child) => this.isSection(child));
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
