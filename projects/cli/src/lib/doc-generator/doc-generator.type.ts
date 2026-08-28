import type { CodeTheme, CodeThemeDetail } from '../highlighter/highlighter.type.js';

export type DocGeneratorConfig = {
  readmePath: string;
  outputPath: string;
  title?: string;
  codeTheme?: CodeTheme | CodeThemeDetail | 'none';
};
