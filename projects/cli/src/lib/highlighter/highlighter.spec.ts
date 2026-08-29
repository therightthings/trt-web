import { describe, expect, it } from 'vitest';

import { Highlighter } from './highlighter.js';

describe('Highlighter', () => {
  it('checks supported languages', () => {
    expect(Highlighter.isLanguageSupported('ts')).toBe(true);
    expect(Highlighter.isLanguageSupported('bash')).toBe(true);
    expect(Highlighter.isLanguageSupported('python')).toBe(false);
  });

  it('highlights TypeScript and Bash source as HTML', () => {
    const typescript = Highlighter.highlight(
      { content: 'BrowserCamera.turnOn();', language: 'ts' },
      { output: 'html', utilityNames: ['BrowserCamera'] },
    );
    const bash = Highlighter.highlight(
      { content: 'npm install @trt-web/browser --save', language: 'bash' },
      { output: 'html' },
    );

    expect(typescript).toContain('token-utility');
    expect(typescript).toContain('token-method');
    expect(bash).toContain('token-method');
    expect(bash).toContain('token-operator');
    expect(bash).not.toContain('token-operator">-web');
  });
});
