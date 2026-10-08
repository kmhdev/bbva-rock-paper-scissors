import { describe, expect, it } from 'vitest';
import type { User } from '@supabase/supabase-js';
import { getGoogleNameSuggestion } from './Home.helpers';

function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: 'user-1',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'ana.garcia@example.com',
    user_metadata: {},
    app_metadata: {},
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  } as User;
}

describe('getGoogleNameSuggestion', () => {
  it('returns empty without user', () => {
    expect(getGoogleNameSuggestion(null)).toBe('');
  });

  it('prefers the Google full name', () => {
    const user = makeUser({ user_metadata: { full_name: 'Ana García' } });
    expect(getGoogleNameSuggestion(user)).toBe('Ana García');
  });

  it('falls back to the email prefix', () => {
    expect(getGoogleNameSuggestion(makeUser())).toBe('ana.garcia');
  });

  it('returns empty when nothing usable exists', () => {
    const user = makeUser({ email: 'a@x.com', user_metadata: {} });
    expect(getGoogleNameSuggestion(user)).toBe('');
  });

  it('caps the suggestion at 20 chars', () => {
    const user = makeUser({ user_metadata: { full_name: 'a'.repeat(40) } });
    expect(getGoogleNameSuggestion(user)).toBe('a'.repeat(20));
  });
});
