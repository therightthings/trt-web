export type CodeTheme = 'vs-code-dark-modern';

export type CodeLanguage = 'ts' | 'js' | 'html' | 'css' | 'scss' | 'bash';

export type CodeColor = readonly [red: number, green: number, blue: number];

export type CodeThemeDetail = {
  utility: CodeColor;
  keyword: CodeColor;
  method: CodeColor;
  string: CodeColor;
  type: CodeColor;
  number: CodeColor;
  operator: CodeColor;
  variable: CodeColor;
  comment: CodeColor;
};

export type CodeHighlightSource = {
  content: string;
  language?: CodeLanguage;
};

export type CodeHighlightOptions = {
  utilityNames?: readonly string[];
  theme?: CodeTheme | CodeThemeDetail | 'none';
  output?: 'terminal' | 'html';
};
