import { describe, expect, it } from 'vitest';
import type { User } from '@supabase/supabase-js';
import type { PlayerScore } from '../../types/types';
import { getGoogleNameSuggestion, isUsernameTakenOnline } from './Home.helpers';

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

describe('isUsernameTakenOnline', () => {
  const remote: PlayerScore[] = [
    { username: 'AnaOnline', score: 9 },
    { username: 'Zoe', score: 4 },
  ];

  it('returns false without remote names', () => {
    expect(isUsernameTakenOnline('AnaOnline', [])).toBe(false);
  });

  it('detects collisions ignoring case and surrounding spaces', () => {
    expect(isUsernameTakenOnline('anaonline', remote)).toBe(true);
    expect(isUsernameTakenOnline('  ANAONLINE  ', remote)).toBe(true);
    expect(isUsernameTakenOnline('zoe', remote)).toBe(true);
  });

  it('allows names nobody uses online', () => {
    expect(isUsernameTakenOnline('Kike', remote)).toBe(false);
  });

  it('exempts the owner playing with their own claimed name', () => {
    expect(isUsernameTakenOnline('anaonline', remote, 'AnaOnline')).toBe(false);
    expect(isUsernameTakenOnline('AnaOnline', remote, 'anaonline')).toBe(false);
    expect(isUsernameTakenOnline('Zoe', remote, 'AnaOnline')).toBe(true);
  });

  it('returns false for empty candidates', () => {
    expect(isUsernameTakenOnline('   ', remote)).toBe(false);
  });
});
