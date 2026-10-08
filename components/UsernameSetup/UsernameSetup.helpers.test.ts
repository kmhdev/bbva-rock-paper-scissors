import { describe, expect, it } from 'vitest';
import { validateUsername } from './UsernameSetup.helpers';

describe('validateUsername', () => {
  it('accepts names between 2 and 20 chars', () => {
    expect(validateUsername('Ana')).toBe('');
    expect(validateUsername('ab')).toBe('');
    expect(validateUsername('a'.repeat(20))).toBe('');
  });

  it('trims before measuring', () => {
    expect(validateUsername('  Ana  ')).toBe('');
  });

  it('rejects too short or too long names', () => {
    expect(validateUsername('')).not.toBe('');
    expect(validateUsername('a')).not.toBe('');
    expect(validateUsername('   ')).not.toBe('');
    expect(validateUsername('a'.repeat(21))).not.toBe('');
  });
});
