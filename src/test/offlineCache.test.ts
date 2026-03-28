import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import {
  initializeCacheAsync,
  loadOfflineData,
  loadCache,
  matchOfflineFAQ,
  matchOfflineNavigation,
  handleOfflineQuery,
  isCacheStale,
  getDefaultFaqs,
  getDefaultNavigation,
  OfflineCache,
} from '@/lib/offlineCache';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Load offline data before all tests
beforeAll(async () => {
  // Mock fetch to return the actual JSON file
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

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

// ─── initializeCacheAsync ───────────────────────────────────────────────────

describe('initializeCacheAsync', () => {
  it('should seed default FAQs on first load', async () => {
    // Re-mock fetch for this test
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

    const cache = await initializeCacheAsync();
    expect(cache.faqs.length).toBeGreaterThanOrEqual(20);
    expect(cache.navigation.length).toBeGreaterThanOrEqual(10);
    expect(cache.last_updated).toBeTruthy();
  });

  it('should preserve existing cache if present', () => {
    const custom: OfflineCache = {
      faqs: [{ question: 'Test?', answer: 'Yes', keywords: ['test'] }],
      navigation: [],
      last_updated: '2026-01-01T00:00:00Z',
    };
    localStorageMock.setItem('lbs_offline_cache', JSON.stringify(custom));

    const cache = loadCache();
    expect(cache).not.toBeNull();
    expect(cache!.faqs.length).toBe(1);
    expect(cache!.faqs[0].question).toBe('Test?');
  });
});

// ─── matchOfflineFAQ ───────────────────────────────────────────────────

describe('matchOfflineFAQ', () => {
  let cache: OfflineCache;

  beforeAll(() => {
    cache = {
      faqs: getDefaultFaqs(),
      navigation: getDefaultNavigation(),
      last_updated: new Date().toISOString(),
    };
  });

  it('should match CSE-related query', () => {
    const match = matchOfflineFAQ('What are CSE department timings?', cache);
    expect(match).not.toBeNull();
    expect(match!.answer).toContain('CSE');
  });

  it('should match fee structure query', () => {
    const match = matchOfflineFAQ('What is the fee structure?', cache);
    expect(match).not.toBeNull();
    expect(match!.answer).toContain('fee');
  });

  it('should match hostel query', () => {
    const match = matchOfflineFAQ('Is hostel available?', cache);
    expect(match).not.toBeNull();
    expect(match!.answer.toLowerCase()).toContain('hostel');
  });

  it('should match placement query', () => {
    const match = matchOfflineFAQ('Placement details please', cache);
    expect(match).not.toBeNull();
    expect(match!.answer.toLowerCase()).toContain('placement');
  });

  it('should match canteen query', () => {
    const match = matchOfflineFAQ('Tell me about canteen food', cache);
    expect(match).not.toBeNull();
    expect(match!.answer.toLowerCase()).toContain('canteen');
  });

  it('should match library query', () => {
    const match = matchOfflineFAQ('Where is the library?', cache);
    expect(match).not.toBeNull();
    expect(match!.answer.toLowerCase()).toContain('library');
  });

  it('should return null for gibberish', () => {
    const match = matchOfflineFAQ('xyzzy foobar blah', cache);
    expect(match).toBeNull();
  });

  it('should handle empty query', () => {
    expect(matchOfflineFAQ('', cache)).toBeNull();
    expect(matchOfflineFAQ('   ', cache)).toBeNull();
  });
});

// ─── matchOfflineNavigation ────────────────────────────────────────────

describe('matchOfflineNavigation', () => {
  let cache: OfflineCache;

  beforeAll(() => {
    cache = {
      faqs: getDefaultFaqs(),
      navigation: getDefaultNavigation(),
      last_updated: new Date().toISOString(),
    };
  });

  it('should match library navigation', () => {
    const match = matchOfflineNavigation('library', cache);
    expect(match).not.toBeNull();
    expect(match!.name).toBe('Central Library');
  });

  it('should match canteen navigation', () => {
    const match = matchOfflineNavigation('canteen', cache);
    expect(match).not.toBeNull();
    expect(match!.name).toBe('College Canteen');
  });

  it('should match ATM navigation', () => {
    const match = matchOfflineNavigation('atm', cache);
    expect(match).not.toBeNull();
    expect(match!.name).toBe('SBI ATM');
  });

  it('should return null for unknown location', () => {
    const match = matchOfflineNavigation('spaceship launch pad', cache);
    expect(match).toBeNull();
  });
});

// ─── handleOfflineQuery ────────────────────────────────────────────────

describe('handleOfflineQuery', () => {
  let freshCache: OfflineCache;

  beforeAll(() => {
    freshCache = {
      faqs: getDefaultFaqs(),
      navigation: getDefaultNavigation(),
      last_updated: new Date().toISOString(),
    };
  });

  it('should return FAQ match for fee query', () => {
    const result = handleOfflineQuery('fee structure', freshCache);
    expect(result.matched).toBe(true);
    expect(result.matchType).toBe('faq');
    expect(result.answer).toContain('Offline Mode');
  });

  it('should return navigation match when FAQ fails', () => {
    const result = handleOfflineQuery('xerox', freshCache);
    expect(result.matched).toBe(true);
    // Could match either faq or navigation
  });

  it('should detect real-time queries', () => {
    const result = handleOfflineQuery('What is happening right now on campus?', freshCache);
    expect(result.matched).toBe(false);
    expect(result.answer).toContain('Real-time');
  });

  it('should return fallback for unknown queries', () => {
    const result = handleOfflineQuery('quantum physics advanced topics', freshCache);
    expect(result.matched).toBe(false);
    expect(result.matchType).toBe('none');
    expect(result.answer).toContain('not available offline');
  });

  it('should flag stale cache', () => {
    const staleCache: OfflineCache = {
      faqs: getDefaultFaqs(),
      navigation: getDefaultNavigation(),
      last_updated: '2020-01-01T00:00:00Z',
    };
    const result = handleOfflineQuery('fee structure', staleCache);
    expect(result.isStale).toBe(true);
    expect(result.answer).toContain('may not be up to date');
  });
});

// ─── isCacheStale ──────────────────────────────────────────────────────

describe('isCacheStale', () => {
  it('should return false for fresh cache', () => {
    const cache: OfflineCache = {
      faqs: [],
      navigation: [],
      last_updated: new Date().toISOString(),
    };
    expect(isCacheStale(cache)).toBe(false);
  });

  it('should return true for old cache', () => {
    const cache: OfflineCache = {
      faqs: [],
      navigation: [],
      last_updated: '2020-01-01T00:00:00Z',
    };
    expect(isCacheStale(cache)).toBe(true);
  });
});
