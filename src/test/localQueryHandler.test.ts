import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { normalizeQuery } from '@/lib/queryNormalizer';
import {
  getCachedResponse,
  setCachedResponse,
  clearResponseCache,
  getResponseCacheSize,
} from '@/lib/responseCache';
import { tryLocalResponse, cacheAIResponse } from '@/lib/localQueryHandler';

// ─── queryNormalizer ───────────────────────────────────────────────────────

describe('normalizeQuery', () => {
  it('should lowercase and trim', () => {
    const result = normalizeQuery('  Hello WORLD  ');
    expect(result.normalized).toBe('hello world');
    expect(result.original).toBe('  Hello WORLD  ');
  });

  it('should remove punctuation', () => {
    const result = normalizeQuery('What is the fee?');
    expect(result.normalized).not.toContain('?');
  });

  it('should map Manglish synonyms: "hostel undo" → "hostel available"', () => {
    const result = normalizeQuery('hostel undo');
    expect(result.normalized).toContain('hostel');
    expect(result.normalized).toContain('available');
  });

  it('should map "bus samayam" → "bus timing"', () => {
    const result = normalizeQuery('bus samayam');
    expect(result.normalized).toContain('bus');
    expect(result.normalized).toContain('timing');
  });

  it('should map "fee ethra" → "fee how much"', () => {
    const result = normalizeQuery('fee ethra');
    expect(result.normalized).toContain('fee');
    expect(result.normalized).toContain('how much');
  });

  it('should handle empty input', () => {
    expect(normalizeQuery('').normalized).toBe('');
    expect(normalizeQuery('   ').normalized).toBe('');
  });

  it('should preserve Malayalam Unicode characters', () => {
    const result = normalizeQuery('ഹോസ്റ്റൽ ഉണ്ടോ');
    expect(result.normalized).toContain('ഹോസ്റ്റൽ');
  });
});

// ─── responseCache ─────────────────────────────────────────────────────────

describe('responseCache', () => {
  beforeEach(() => {
    clearResponseCache();
  });

  it('should store and retrieve a response', () => {
    setCachedResponse('test query', 'test response');
    expect(getCachedResponse('test query')).toBe('test response');
  });

  it('should return null for unknown queries', () => {
    expect(getCachedResponse('unknown')).toBeNull();
  });

  it('should be case-insensitive', () => {
    setCachedResponse('Test Query', 'response');
    expect(getCachedResponse('test query')).toBe('response');
  });

  it('should track cache size', () => {
    setCachedResponse('q1', 'r1');
    setCachedResponse('q2', 'r2');
    expect(getResponseCacheSize()).toBe(2);
  });

  it('should clear all entries', () => {
    setCachedResponse('q1', 'r1');
    clearResponseCache();
    expect(getResponseCacheSize()).toBe(0);
    expect(getCachedResponse('q1')).toBeNull();
  });
});

// ─── tryLocalResponse (end-to-end) ─────────────────────────────────────────

describe('tryLocalResponse', () => {
  const noGPS = null;

  it('should handle bus intent locally', () => {
    const result = tryLocalResponse('college bus timing', noGPS);
    expect(result.handled).toBe(true);
    expect(result.matchType).toBe('bus');
    expect(result.response).toBeTruthy();
  });

  it('should handle cached responses', () => {
    // Use a unique query that won't match any intent
    const uniqueQuery = 'zyxwvu obscure notkeyword foobarbaz uniquetest99';
    cacheAIResponse(uniqueQuery, 'Cached AI answer');
    const result = tryLocalResponse(uniqueQuery, noGPS);
    expect(result.handled).toBe(true);
    expect(result.matchType).toBe('cache');
    expect(result.response).toBe('Cached AI answer');
    clearResponseCache();
  });

  it('should NOT handle unknown queries — fall through to LLM', () => {
    const result = tryLocalResponse('explain the theory of relativity in detail', noGPS);
    expect(result.handled).toBe(false);
  });

  it('should handle empty input gracefully', () => {
    const result = tryLocalResponse('', noGPS);
    expect(result.handled).toBe(false);
  });
});
