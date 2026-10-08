import { describe, expect, it } from 'vitest';
import type { PlayerScore } from '../types/types';
import {
  claimUsername,
  fetchProfile,
  fetchRemoteScores,
  getSupabaseClient,
  mergeScores,
  mergeScoresDetailed,
  pushRemoteScore,
  resetSupabaseClientCache,
  submitOnlineScore,
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

  it('pushRemoteScore without user is a no-op (online requires login)', async () => {
    resetSupabaseClientCache();
    await expect(pushRemoteScore('ana', 5, undefined)).resolves.toBeUndefined();
  });

  it('fetchProfile resolves null offline', async () => {
    resetSupabaseClientCache();
    await expect(fetchProfile('some-user-id')).resolves.toBeNull();
  });

  it('claimUsername fails offline without touching the network', async () => {
    resetSupabaseClientCache();
    const result = await claimUsername('Ana');
    expect(result.ok).toBe(false);
  });

  it('submitOnlineScore is a no-op offline', async () => {
    resetSupabaseClientCache();
    await expect(submitOnlineScore(5)).resolves.toBeUndefined();
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

describe('mergeScoresDetailed', () => {
  it('keeps local and remote side by side plus the best', () => {
    expect(
      mergeScoresDetailed(
        [
          { username: 'Ana', score: 3 },
          { username: 'Bob', score: 5 },
        ],
        [
          { username: 'ana', score: 7 },
          { username: 'Zoe', score: 4 },
        ],
      ),
    ).toEqual([
      { username: 'Ana', localScore: 3, remoteScore: 7, best: 7 },
      { username: 'Bob', localScore: 5, remoteScore: null, best: 5 },
      { username: 'Zoe', localScore: null, remoteScore: 4, best: 4 },
    ]);
  });

  it('handles empty inputs', () => {
    expect(mergeScoresDetailed([], [])).toEqual([]);
  });
});
