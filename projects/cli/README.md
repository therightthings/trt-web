# @trt-web/cli

README-driven CLI and static documentation tools for TypeScript libraries.

## Installation

```bash
npm install @trt-web/cli
```

---

## TrtCommand

Creates an interactive CLI from a package README and package metadata. The README is the source of truth for utility groups, methods, descriptions, and examples.

### Methods

- `startCli(config: CliConfig): Promise<void>`: start an interactive CLI for a package.

### Example

```ts
import { TrtCommand } from '@trt-web/cli';

await TrtCommand.startCli({
  readmePath: '../README.md',
  packageJsonPath: '../package.json',
  name: 'trt-browser',
  codeTheme: 'vs-code-dark-modern',
  docs: {
    outputPath: './dist/docs/browser',
    title: '@trt-web/browser',
  },
});
```

The generated CLI supports:

- `list`: browse utility groups and inspect utility details.
- `info <utility>`: show one utility's methods and README examples.
- `docs`: generate a static HTML documentation site when `docs` is configured.
- `--version`: show the package version and utility count.
- `--help`: show available options and commands.

---

## DocGenerator

Generates a static HTML documentation site from a package README.

### Methods

- `generate(config: DocGeneratorConfig): void`: parse a README and write the generated `index.html`.

### Example

```ts
import { DocGenerator } from '@trt-web/cli';

DocGenerator.generate({
  readmePath: './README.md',
  outputPath: './dist/docs',
  title: '@trt-web/core',
  codeTheme: 'vs-code-dark-modern',
});
```

---

## README structure

Each documented utility should use a heading, description, methods, and examples:

````md
## LocalStorage

Typed browser storage helpers.

### Methods

- `set<T>(key: string, value: T): void`: store typed data.

### Examples

```ts
LocalStorage.set('profile', { id: 1, name: 'Alice' });
```
````

Code examples may use `ts`, `js`, `html`, `css`, `scss`, or `bash` fences. Multiple examples under one utility are preserved in their original order.

---

## Supported code highlighting languages

`Highlighter` currently supports syntax highlighting for:

- `ts`: TypeScript.
- `js`: JavaScript.
- `html`: HTML.
- `css`: CSS.
- `scss`: SCSS.
- `bash`: Bash and common package or shell commands.

Highlighting is available for both terminal ANSI output and generated HTML documentation. Use `theme: 'none'` to keep the source unchanged.
