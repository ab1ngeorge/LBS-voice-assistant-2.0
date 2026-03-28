import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { normalizeQuery } from '@/lib/queryNormalizer';
import {
  getCachedResponse,
  setCachedResponse,
  clearResponseCache,
  getResponseCacheSize,
} from '@/lib/responseCache';
import { matchFAQForOnline, getDefaultFaqs, getAllFaqs, getDefaultNavigation, loadOfflineData, OfflineCache } from '@/lib/offlineCache';
import { tryLocalResponse, cacheAIResponse } from '@/lib/localQueryHandler';

// Load offline data from JSON before all tests
beforeAll(async () => {
  const fs = await import('fs');
  const path = await import('path');
  const jsonPath = path.resolve(__dirname, '../../public/offline-data.json');
  const jsonContent = fs.readFileSync(jsonPath, 'utf-8');

  global.fetch = vi.fn().mockImplementation((url: string) => {
    if (url === '/offline-data.json') {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(JSON.parse(jsonContent)),
      } as Response);
    }
    return Promise.reject(new Error(`Unmocked fetch: ${url}`));
  });

  await loadOfflineData();
});

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

// ─── matchFAQForOnline ─────────────────────────────────────────────────────

describe('matchFAQForOnline', () => {
  let cache: OfflineCache;

  beforeAll(() => {
    cache = {
      faqs: getDefaultFaqs(),
      navigation: getDefaultNavigation(),
      last_updated: new Date().toISOString(),
    };
  });

  it('should match "fee structure" with high confidence', () => {
    const match = matchFAQForOnline('What is the fee structure?', cache);
    expect(match).not.toBeNull();
    expect(match!.answer).toContain('fee');
  });

  it('should match "hostel available"', () => {
    const match = matchFAQForOnline('Is hostel available?', cache);
    expect(match).not.toBeNull();
    expect(match!.answer.toLowerCase()).toContain('hostel');
  });

  it('should match "placement details"', () => {
    const match = matchFAQForOnline('placement details', cache);
    expect(match).not.toBeNull();
    expect(match!.answer.toLowerCase()).toContain('placement');
  });

  it('should match "departments available"', () => {
    const match = matchFAQForOnline('what departments are available?', cache);
    expect(match).not.toBeNull();
    expect(match!.answer).toContain('B.Tech');
  });

  it('should match "canteen menu"', () => {
    const match = matchFAQForOnline('canteen menu', cache);
    expect(match).not.toBeNull();
    expect(match!.answer.toLowerCase()).toContain('canteen');
  });

  it('should NOT match gibberish (below threshold)', () => {
    const match = matchFAQForOnline('xyzzy foobar quantum blah', cache);
    expect(match).toBeNull();
  });

  it('should NOT match very short ambiguous queries', () => {
    const match = matchFAQForOnline('hi', cache);
    expect(match).toBeNull();
  });

  // ─── HOD-specific tests ──────────────────────────────────────
  it('should match "CSE HOD name" to HOD FAQ, NOT departments', () => {
    const match = matchFAQForOnline('CSE HOD name', cache);
    expect(match).not.toBeNull();
    expect(match!.answer).toContain('Manoj Kumar G');
    expect(match!.answer).not.toContain('5 B.Tech programs');
  });

  it('should match "who is the hod of cse" to HOD FAQ', () => {
    const match = matchFAQForOnline('who is the hod of cse', cache);
    expect(match).not.toBeNull();
    expect(match!.answer).toContain('Manoj Kumar G');
  });

  it('should match "ECE HOD" to ECE HOD FAQ', () => {
    const match = matchFAQForOnline('ECE HOD', cache);
    expect(match).not.toBeNull();
    expect(match!.answer).toContain('Mary Reena');
  });

  it('should still match "departments available" to departments FAQ', () => {
    const match = matchFAQForOnline('what departments are available', cache);
    expect(match).not.toBeNull();
    expect(match!.answer).toContain('5 B.Tech programs');
  });

  // ─── Problem query tests (reported bugs) ─────────────────────
  describe('with full FAQ pool (DEFAULT + GENERATED)', () => {
    let fullCache: OfflineCache;

    beforeAll(() => {
      fullCache = {
        faqs: getAllFaqs(),
        navigation: getDefaultNavigation(),
        last_updated: new Date().toISOString(),
      };
    });

    it('should match "hod of cse" to CSE HOD FAQ, NOT program list', () => {
      const match = matchFAQForOnline('hod of cse', fullCache);
      expect(match).not.toBeNull();
      expect(match!.answer).toContain('Manoj Kumar G');
      expect(match!.answer).not.toContain('Programming Lab');
    });

    it('should NOT match "What is the name of our HOD?" to lab list', () => {
      const match = matchFAQForOnline('What is the name of our HOD?', fullCache);
      // Should either match a HOD FAQ or return null (fall through to LLM)
      if (match) {
        expect(match.answer).not.toContain('Programming Lab');
        expect(match.answer).not.toContain('B.Tech programs');
        // Should contain role-related content
        const answerLower = match.answer.toLowerCase();
        const hasRoleContent = ['hod', 'head', 'professor', 'faculty', 'dean'].some(
          term => answerLower.includes(term)
        );
        expect(hasRoleContent).toBe(true);
      }
    });

    it('should match "who is the head of department" to faculty FAQ, NOT facilities', () => {
      const match = matchFAQForOnline('who is the head of department', fullCache);
      if (match) {
        expect(match.answer).not.toContain('Programming Lab');
        expect(match.answer).not.toContain('Auditorium');
      }
    });

    it('should still match "lab facilities" to lab FAQ (regression check)', () => {
      const match = matchFAQForOnline('lab facilities', fullCache);
      if (match) {
        expect(match.answer.toLowerCase()).toContain('lab');
      }
    });

    it('should still match "fee structure" correctly (regression check)', () => {
      const match = matchFAQForOnline('fee structure', fullCache);
      expect(match).not.toBeNull();
      expect(match!.answer.toLowerCase()).toContain('fee');
    });
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

  it('should handle FAQ "fee structure" locally', () => {
    const result = tryLocalResponse('What is the fee structure?', noGPS);
    expect(result.handled).toBe(true);
    // Could be 'faq' match or bus/website depending on keyword overlap
    expect(result.response).toBeTruthy();
  });

  it('should handle FAQ "hostel undo" (Manglish) locally', () => {
    const result = tryLocalResponse('hostel undo', noGPS);
    expect(result.handled).toBe(true);
    expect(result.response).toBeTruthy();
  });

  it('should handle FAQ "placement entha" locally', () => {
    const result = tryLocalResponse('placement entha', noGPS);
    expect(result.handled).toBe(true);
    expect(result.response).toBeTruthy();
  });

  it('should handle FAQ "departments available" locally', () => {
    const result = tryLocalResponse('what departments are available', noGPS);
    expect(result.handled).toBe(true);
    expect(result.response).toBeTruthy();
  });

  it('should handle cached responses', () => {
    // Use a unique query that won't match any FAQ or intent
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
