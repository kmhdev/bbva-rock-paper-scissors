import { describe, expect, it } from 'vitest';
import type { PlayerScore } from '../types/types';
import {
  fetchRemoteScores,
  getSupabaseClient,
  mergeScores,
  pushRemoteScore,
  resetSupabaseClientCache,
} from './supabaseScoreStorage';

describe('supabaseScoreStorage without configuration', () => {
  it('returns no client when env vars are missing', () => {
    resetSupabaseClientCache();
    expect(getSupabaseClient()).toBeNull();
  });

  it('fetchRemoteScores resolves empty offline', async () => {
    resetSupabaseClientCache();
    await expect(fetchRemoteScores()).resolves.toEqual([]);
  });

  it('pushRemoteScore is a no-op offline', async () => {
    resetSupabaseClientCache();
    await expect(pushRemoteScore('ana', 5)).resolves.toBeUndefined();
  });
});

describe('mergeScores', () => {
  const local: PlayerScore[] = [
    { username: 'Ana', score: 3 },
    { username: 'Bob', score: 5 },
  ];
  const remote: PlayerScore[] = [
    { username: 'ana', score: 7 },
    { username: 'Zoe', score: 4 },
  ];

  it('keeps the best score per player across local and remote', () => {
    expect(mergeScores(local, remote)).toEqual([
      { username: 'ana', score: 7 },
      { username: 'Bob', score: 5 },
      { username: 'Zoe', score: 4 },
    ]);
  });

  it('handles empty inputs', () => {
    expect(mergeScores([], [])).toEqual([]);
    expect(mergeScores(local, [])).toEqual([
      { username: 'Bob', score: 5 },
      { username: 'Ana', score: 3 },
    ]);
  });
});
