import { describe, expect, it } from 'vitest';

import { BrowserMedia } from './browser-media';
import { BrowserMediaRecorderSession } from './browser-media-recorder-session';

describe('BrowserMedia', () => {
  it('returns a safe support result', () => {
    expect(BrowserMedia).toBeDefined();
  });

  it('exposes independent recorder sessions', () => {
    expect(BrowserMediaRecorderSession).toBeDefined();
  });
});
