import { color } from '../utils/color.js';
import { KEYWORD_MAP, THEME_MAP } from './code-highlighter.config.js';
import type {
  CodeHighlightOptions,
  CodeHighlightSource,
  CodeThemeDetail,
} from './code-highlighter.type.js';

export class CodeHighlighter {
  static isColorSupported(): boolean {
    return Boolean(process.stdout.isTTY && !process.env['NO_COLOR']);
  }

  private static escapeRegExp(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  static highlight(payload: CodeHighlightSource, options?: CodeHighlightOptions): string {
    const { content = '', language = 'ts' } = payload;
    const { utilityNames = [], theme = 'vs-code-dark-modern' } = options ?? {};

    if (theme === 'none') {
      return content;
    }

    if (!content.trim().length) {
      return content.trim();
    }

    const names = utilityNames.length ? utilityNames.map(this.escapeRegExp).join('|') : '(?!)';
    const colors: CodeThemeDetail = typeof theme === 'string' ? THEME_MAP[theme] : theme;
    const languageConfig = KEYWORD_MAP[language];
    const keywords = languageConfig.keywords.map(this.escapeRegExp).join('|');
    const builtInTypes = languageConfig.types.map(this.escapeRegExp).join('|') || '(?!)';
    const tokenPattern = new RegExp(
      `(\\/\\/.*$|"(?:\\\\.|[^"\\\\])*"|'(?:\\\\.|[^'\\\\])*'|\\x60(?:\\\\.|[^\\x60\\\\])*\\x60)|\\b(${names})\\b|\\b(${keywords})\\b|\\b(\\d+(?:\\.\\d+)?)\\b|\\b(${builtInTypes})\\b|\\b([A-Z][A-Za-z0-9_$]*)\\b|(=>)|\\b([A-Za-z_$][\\w$]*)(?=\\s*\\()|\\b([A-Za-z_$][\\w$]*)\\b`,
      'g',
    );

    return content.replace(
      tokenPattern,
      (
        token: string,
        stringLiteral?: string,
        utilityName?: string,
        keyword?: string,
        numberLiteral?: string,
        typeName?: string,
        namedType?: string,
        arrow?: string,
        identifier?: string,
        variable?: string,
      ) => {
        if (stringLiteral) {
          if (token.startsWith('//')) {
            return color(colors.comment, token);
          }
          return color(colors.string, token);
        }

        if (utilityName) {
          return color(colors.utility, token);
        }

        if (keyword) {
          return color(colors.keyword, token);
        }

        if (numberLiteral) {
          return color(colors.number, token);
        }

        if (typeName) {
          return color(colors.type, token);
        }

        if (namedType) {
          return color(colors.type, token);
        }

        if (arrow) {
          return color(colors.operator, token);
        }

        if (identifier) {
          return color(colors.method, token);
        }

        if (variable) {
          return color(colors.variable, token);
        }

        return token;
      },
    );
  }
}
