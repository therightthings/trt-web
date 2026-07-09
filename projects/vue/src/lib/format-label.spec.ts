import { describe, expect, it } from 'vitest';

import { formatLabel } from './format-label';

describe('formatLabel', () => {
  it('turns camel case into readable text', () => {
    expect(formatLabel('userProfileName')).toBe('User Profile Name');
  });

  it('turns snake case and kebab case into readable text', () => {
    expect(formatLabel('user_profile-name')).toBe('User Profile Name');
  });

  it('returns an empty string for blank input', () => {
    expect(formatLabel('   ')).toBe('');
  });
});
