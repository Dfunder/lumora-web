import { describe, expect, it } from 'vitest';

import { getAdjacentIndex, validateEmail } from '../testimonialsUtils';

describe('validateEmail', () => {
  it('accepts a standard email address', () => {
    expect(validateEmail('support@example.com')).toBe(true);
  });

  it('rejects empty and malformed values', () => {
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('name@')).toBe(false);
  });
});

describe('getAdjacentIndex', () => {
  it('wraps around to the beginning when moving past the last item', () => {
    expect(getAdjacentIndex(3, 4, 1)).toBe(0);
  });

  it('wraps around to the end when moving before the first item', () => {
    expect(getAdjacentIndex(0, 4, -1)).toBe(3);
  });
});
