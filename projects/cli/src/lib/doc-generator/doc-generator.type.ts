import type { CodeTheme, CodeThemeDetail } from '../code-highlighter/code-highlighter.type.js';

export type DocGeneratorConfig = {
  readmePath: string;
  outputPath: string;
  title?: string;
  codeTheme?: CodeTheme | CodeThemeDetail | 'none';
};
