// ─── Offline Cache Module ──────────────────────────────────────────────────
// Provides offline FAQ and navigation data for the LBS Voice Assistant.
// Uses localStorage to persist data between sessions.
//
// DATA LOADING: FAQ and navigation data is loaded asynchronously from
// /offline-data.json (served from public/) to avoid bloating the JS bundle.
// This file was previously ~125KB of inline data — now ~5KB of logic.

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface OfflineFAQ {
  question: string;
  answer: string;
  keywords: string[]; // English + Malayalam + Manglish keywords for matching
  patterns?: string[]; // Full user phrases for high-confidence matching
}

export interface OfflineNavEntry {
  name: string;
  aliases: string[];
  location: string;
  description: string;
}

export interface OfflineCache {
  faqs: OfflineFAQ[];
  navigation: OfflineNavEntry[];
  last_updated: string; // ISO timestamp
}

export interface OfflineResponse {
  matched: boolean;
  matchType: 'faq' | 'navigation' | 'none';
  answer: string;
  isStale: boolean; // true if cache > 7 days old
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_KEY = 'lbs_offline_cache';
const STALE_THRESHOLD_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Real-time keywords that cannot be answered offline
const REALTIME_KEYWORDS = [
  'now', 'today', 'current', 'live', 'right now', 'at the moment', 'latest news',
  'ഇപ്പോൾ', 'ഇന്ന്', 'നിലവിൽ',
  'ippo', 'ippozhthe', 'innu', 'nilavil',
];

// ─────────────────────────────────────────────────────────────────────────────
// Lazy-Loaded Data (fetched from /offline-data.json after UI paint)
// ─────────────────────────────────────────────────────────────────────────────

// In-memory cache of the loaded data — populated by loadOfflineData()
let _defaultFaqs: OfflineFAQ[] = [];
let _generatedFaqs: OfflineFAQ[] = [];
let _defaultNavigation: OfflineNavEntry[] = [];
let _allFaqs: OfflineFAQ[] = [];
let _dataLoaded = false;
let _dataLoadPromise: Promise<void> | null = null;

/** Backwards-compatible exports — populated after loadOfflineData() resolves */
export function getDefaultFaqs(): OfflineFAQ[] { return _defaultFaqs; }
export function getDefaultNavigation(): OfflineNavEntry[] { return _defaultNavigation; }
export function getAllFaqs(): OfflineFAQ[] { return _allFaqs; }

// Keep named exports for test compatibility (will be empty until data loads)
export { _defaultFaqs as DEFAULT_FAQS, _defaultNavigation as DEFAULT_NAVIGATION, _allFaqs as ALL_FAQS };

/**
 * Fetch the offline data JSON from the public directory.
 * Called once on app startup. Subsequent calls return the cached promise.
 * Safe to call multiple times — deduplicates automatically.
 */
export function loadOfflineData(): Promise<void> {
  if (_dataLoaded) return Promise.resolve();
  if (_dataLoadPromise) return _dataLoadPromise;

  _dataLoadPromise = (async () => {
    try {
      const response = await fetch('/offline-data.json');
      if (!response.ok) {
        console.warn('[Offline] Failed to fetch offline-data.json:', response.status);
        return;
      }

      const data: {
        defaultFaqs: OfflineFAQ[];
        generatedFaqs: OfflineFAQ[];
        navigation: OfflineNavEntry[];
      } = await response.json();

      _defaultFaqs = data.defaultFaqs || [];
      _generatedFaqs = data.generatedFaqs || [];
      _defaultNavigation = data.navigation || [];
      _allFaqs = [..._defaultFaqs, ..._generatedFaqs];
      _dataLoaded = true;

      console.log(`[Offline] Data loaded: ${_defaultFaqs.length} core FAQs + ${_generatedFaqs.length} generated FAQs + ${_defaultNavigation.length} nav entries`);
    } catch (err) {
      console.error('[Offline] Failed to load offline data:', err);
    }
  })();

  return _dataLoadPromise;
}

/** Check if offline data has been loaded */
export function isDataLoaded(): boolean {
  return _dataLoaded;
}

// ─────────────────────────────────────────────────────────────────────────────
// Cache Management
// ─────────────────────────────────────────────────────────────────────────────

/** Load cache from localStorage */
export function loadCache(): OfflineCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OfflineCache;
  } catch {
    console.warn('[Offline] Failed to load cache from localStorage');
    return null;
  }
}

/** Save cache to localStorage */
export function saveCache(cache: OfflineCache): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    console.warn('[Offline] Failed to save cache to localStorage');
  }
}

/**
 * Initialize cache: seeds defaults on first load, preserves existing cache.
 * NOTE: loadOfflineData() must be called before this for fresh installs.
 * If data hasn't loaded yet, falls back to localStorage or an empty cache.
 */
export function initializeCache(): OfflineCache {
  const existing = loadCache();
  if (existing && existing.faqs.length > 0) {
    console.log('[Offline] Cache loaded:', existing.faqs.length, 'FAQs,', existing.navigation.length, 'nav entries');
    return existing;
  }

  // If async data has loaded, seed from it
  if (_dataLoaded && _allFaqs.length > 0) {
    const fresh: OfflineCache = {
      faqs: _allFaqs,
      navigation: _defaultNavigation,
      last_updated: new Date().toISOString(),
    };
    saveCache(fresh);
    console.log('[Offline] Cache initialized with', fresh.faqs.length, 'FAQs and', fresh.navigation.length, 'nav entries');
    return fresh;
  }

  // Data not loaded yet — return minimal cache (will be populated later)
  console.log('[Offline] Data not yet loaded, returning empty cache');
  return {
    faqs: [],
    navigation: [],
    last_updated: new Date().toISOString(),
  };
}

/**
 * Initialize cache with async data loading.
 * This is the preferred entry point — ensures data is loaded before seeding.
 */
export async function initializeCacheAsync(): Promise<OfflineCache> {
  await loadOfflineData();
  return initializeCache();
}

/**
 * Fetch auto-promoted FAQs from Supabase `dynamic_faqs` table and merge
 * them into the local cache. This makes the local pipeline smarter over time.
 * Call this after initializeCache() — it runs in the background and does not block.
 */
export async function fetchAndMergeDynamicFAQs(cache: OfflineCache): Promise<void> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    if (!supabaseUrl || !supabaseKey) return;

    const response = await fetch(
      `${supabaseUrl}/rest/v1/dynamic_faqs?select=question,answer,keywords&order=hit_count.desc&limit=30`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      console.warn('[DynamicFAQ] Fetch failed:', response.status);
      return;
    }

    const dynamicFaqs: Array<{ question: string; answer: string; keywords: string[] }> = await response.json();

    if (!dynamicFaqs || dynamicFaqs.length === 0) {
      console.log('[DynamicFAQ] No dynamic FAQs available yet');
      return;
    }

    // Merge: only add FAQs whose questions don't already exist in the cache
    const existingQuestions = new Set(cache.faqs.map(f => f.question.toLowerCase()));
    let added = 0;

    for (const dfaq of dynamicFaqs) {
      if (!existingQuestions.has(dfaq.question.toLowerCase())) {
        cache.faqs.push({
          question: dfaq.question,
          answer: dfaq.answer,
          keywords: dfaq.keywords || [],
          patterns: [dfaq.question.toLowerCase()],
        });
        existingQuestions.add(dfaq.question.toLowerCase());
        added++;
      }
    }

    if (added > 0) {
      saveCache(cache);
      console.log(`[DynamicFAQ] Merged ${added} auto-promoted FAQs into local cache (total: ${cache.faqs.length})`);
    } else {
      console.log('[DynamicFAQ] All dynamic FAQs already in cache');
    }
  } catch (error) {
    console.warn('[DynamicFAQ] Failed to fetch dynamic FAQs:', error);
  }
}

/** Check if cache is stale (older than 7 days) */
export function isCacheStale(cache: OfflineCache): boolean {
  const lastUpdated = new Date(cache.last_updated).getTime();
  return Date.now() - lastUpdated > STALE_THRESHOLD_MS;
}

/** Update cache with fresh data from backend knowledge base sections */
export function updateCacheFromSections(sections: Array<{ question: string; answer: string; keywords?: string[] }>): void {
  const cache = loadCache() || initializeCache();

  // Merge: add new FAQs, update existing by question match
  for (const section of sections) {
    const existingIdx = cache.faqs.findIndex(
      (f) => f.question.toLowerCase() === section.question.toLowerCase(),
    );
    const entry: OfflineFAQ = {
      question: section.question,
      answer: section.answer,
      keywords: section.keywords || extractKeywords(section.question + ' ' + section.answer),
    };
    if (existingIdx >= 0) {
      cache.faqs[existingIdx] = entry;
    } else {
      cache.faqs.push(entry);
    }
  }

  cache.last_updated = new Date().toISOString();
  saveCache(cache);
  console.log('[Offline] Cache updated with', sections.length, 'sections from backend');
}

// ─────────────────────────────────────────────────────────────────────────────
// Local Query Matching
// ─────────────────────────────────────────────────────────────────────────────

/** Extract simple keywords from text for matching */
function extractKeywords(text: string): string[] {
  const stopWords = new Set(['the', 'is', 'a', 'an', 'of', 'to', 'in', 'for', 'and', 'or', 'on', 'at', 'by', 'it', 'i', 'me', 'my', 'we', 'do', 'can', 'how', 'what', 'which', 'are', 'was', 'were', 'be', 'been', 'have', 'has']);
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\u0D00-\u0D7F]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));
}

/**
 * Match a query against cached FAQs using keyword + pattern scoring.
 * Returns the best match or null if no decent match is found.
 */
export function matchOfflineFAQ(query: string, cache: OfflineCache): OfflineFAQ | null {
  if (!query || query.trim().length === 0) return null;

  const queryLower = query.toLowerCase();
  const queryKeywords = extractKeywords(query);

  let bestMatch: OfflineFAQ | null = null;
  let bestScore = 0;

  for (const faq of cache.faqs) {
    let score = 0;

    // Pattern matching (highest priority — full-phrase matches)
    if (faq.patterns) {
      for (const pattern of faq.patterns) {
        const patternLower = pattern.toLowerCase();
        if (queryLower.includes(patternLower)) {
          // Full phrase match gets 3× the pattern length
          score += patternLower.length * 3;
        }
      }
    }

    // Keyword matching (secondary scorer)
    for (const kw of faq.keywords) {
      if (/[\u0D00-\u0D7F]/.test(kw)) {
        // Malayalam keyword — substring match on original query
        if (query.includes(kw)) score += kw.length * 2;
      } else {
        // English/Manglish — case-insensitive
        if (queryLower.includes(kw.toLowerCase())) score += kw.length;
      }
    }

    // Bonus: direct words from query appearing in FAQ keywords
    for (const qkw of queryKeywords) {
      if (faq.keywords.some((k) => k.toLowerCase() === qkw)) {
        score += 3;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  // Minimum threshold to avoid garbage matches (offline — lenient)
  return bestScore >= 4 ? bestMatch : null;
}

/**
 * Match a query against cached FAQs for ONLINE use.
 * Uses a HIGHER threshold than offline to ensure only strong matches
 * bypass the LLM. Weak / ambiguous queries fall through to the AI.
 */
// Keywords that signal the user is asking about a specific person/role, not a general list
const SPECIFIC_ROLE_KEYWORDS = ['hod', 'head', 'head of department', 'faculty', 'teacher', 'professor', 'staff', 'who is', 'name of',
  'മേധാവി', 'തലവൻ', 'എച്ച്ഒഡി', 'എച്ച് ഒ ഡി', 'അധ്യാപകൻ', 'അധ്യാപിക', 'ഫാക്കൽറ്റി'];

// Generic FAQ questions that should NOT match when the user asks about specific roles
const GENERIC_FAQ_QUESTIONS: string[] = [
  'what departments are available?',
  'what are the department working hours?',
  'tell me about departments & faculty (detailed)',
  'tell me about academic programs',
  'what facilities does the campus have?',
  'tell me about laboratory facilities (detailed by department)',
  'tell me about facilities & infrastructure',
  'tell me about specific facility details',
  'tell me about campus facilities: advanced details',
  'tell me about general information',
  'tell me about leadership & administration',
  'tell me about student clubs (iedc & technical)',
  'tell me about campus landmarks & directions',
  'tell me about campus navigation: landmarks',
  'tell me about cultural activities: detailed clubs',
  'tell me about technical clubs & societies',
];

export function matchFAQForOnline(query: string, cache?: OfflineCache): OfflineFAQ | null {
  const resolvedCache = cache || loadCache() || initializeCache();
  if (!query || query.trim().length === 0) return null;

  const queryLower = query.toLowerCase();
  const queryKeywords = extractKeywords(query);

  // Detect if the user is asking about a specific role (HOD, faculty, etc.)
  const isRoleQuery = SPECIFIC_ROLE_KEYWORDS.some(kw =>
    /[\u0D00-\u0D7F]/.test(kw) ? query.includes(kw) : queryLower.includes(kw)
  );

  let bestMatch: OfflineFAQ | null = null;
  let bestScore = 0;

  for (const faq of resolvedCache.faqs) {
    let score = 0;

    // Pattern matching (highest priority)
    if (faq.patterns) {
      for (const pattern of faq.patterns) {
        const patternLower = pattern.toLowerCase();
        if (queryLower.includes(patternLower)) {
          score += patternLower.length * 3;
        }
      }
    }

    // Keyword matching
    for (const kw of faq.keywords) {
      if (/[\u0D00-\u0D7F]/.test(kw)) {
        if (query.includes(kw)) score += kw.length * 2;
      } else {
        if (queryLower.includes(kw.toLowerCase())) score += kw.length;
      }
    }

    // Bonus: direct keyword matches
    for (const qkw of queryKeywords) {
      if (faq.keywords.some((k) => k.toLowerCase() === qkw)) {
        score += 3;
      }
    }

    // Intent disambiguation: penalize generic FAQs when user asks about specific roles
    if (isRoleQuery && GENERIC_FAQ_QUESTIONS.includes(faq.question.toLowerCase())) {
      score = Math.floor(score * 0.3); // Heavy penalty — let specific FAQs win
    }

    // Stronger filter: for role queries, ONLY allow FAQs whose question/answer
    // mentions a role-related term. This prevents lab/program/facility FAQs from winning.
    if (isRoleQuery && score > 0) {
      const roleTerms = ['hod', 'head of department', 'faculty', 'professor', 'staff', 'dean', 'contact', 'principal'];
      const faqText = (faq.question + ' ' + faq.answer).toLowerCase();
      const hasRoleTerm = roleTerms.some(rt => faqText.includes(rt));
      if (!hasRoleTerm) {
        score = 0; // Complete suppression — this FAQ is irrelevant for a role query
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  // HIGHER threshold for online — only confident matches bypass the LLM
  return bestScore >= 8 ? bestMatch : null;
}

/**
 * Match a query against cached navigation entries.
 * Returns the match or null.
 */
export function matchOfflineNavigation(query: string, cache: OfflineCache): OfflineNavEntry | null {
  if (!query || query.trim().length === 0) return null;

  const queryLower = query.toLowerCase();

  let bestMatch: OfflineNavEntry | null = null;
  let bestScore = 0;

  for (const nav of cache.navigation) {
    let score = 0;

    // Match against name
    if (queryLower.includes(nav.name.toLowerCase())) {
      score += nav.name.length * 2;
    }

    // Match against aliases
    for (const alias of nav.aliases) {
      if (queryLower.includes(alias.toLowerCase())) {
        score += alias.length;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = nav;
    }
  }

  return bestScore >= 3 ? bestMatch : null;
}

/**
 * Check if a query asks for real-time data that can't be served offline.
 */
function isRealtimeQuery(query: string): boolean {
  const queryLower = query.toLowerCase();
  for (const kw of REALTIME_KEYWORDS) {
    if (/[\u0D00-\u0D7F]/.test(kw)) {
      if (query.includes(kw)) return true;
    } else {
      if (queryLower.includes(kw)) return true;
    }
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Offline Query Handler
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Handle a user query using only offline cached data.
 * Tries: real-time check → FAQ match → navigation match → fallback.
 */
export function handleOfflineQuery(query: string, cache?: OfflineCache): OfflineResponse {
  const resolvedCache = cache || loadCache() || initializeCache();
  const stale = isCacheStale(resolvedCache);

  // 1. Check for real-time data requests
  if (isRealtimeQuery(query)) {
    return {
      matched: false,
      matchType: 'none',
      answer: '📴 Real-time information is not available offline. Please connect to the internet for live data.',
      isStale: stale,
    };
  }

  // 2. Try FAQ match
  const faqMatch = matchOfflineFAQ(query, resolvedCache);
  if (faqMatch) {
    let answer = `📴 **Offline Mode**\n\n${faqMatch.answer}`;
    if (stale) {
      answer += '\n\n⚠️ *This data may not be up to date. Connect to the internet for the latest information.*';
    }
    return {
      matched: true,
      matchType: 'faq',
      answer,
      isStale: stale,
    };
  }

  // 3. Try navigation match
  const navMatch = matchOfflineNavigation(query, resolvedCache);
  if (navMatch) {
    let answer = `📴 **Offline Mode**\n\n📍 **${navMatch.name}**\n📌 Location: ${navMatch.location}\nℹ️ ${navMatch.description}`;
    if (stale) {
      answer += '\n\n⚠️ *Data may not be up to date.*';
    }
    answer += '\n\n*For live GPS navigation, please connect to the internet.*';
    return {
      matched: true,
      matchType: 'navigation',
      answer,
      isStale: stale,
    };
  }

  // 4. No match — fallback
  return {
    matched: false,
    matchType: 'none',
    answer: '📴 This information is not available offline. Please connect to the internet to get help from LBS Bot. 🙏',
    isStale: stale,
  };
}
