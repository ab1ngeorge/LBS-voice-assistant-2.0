// ─── Local Query Handler (Orchestrator) ────────────────────────────────────
// Central entry point for handling user queries LOCALLY before falling back
// to the LLM API. Implements the strict pipeline:
//   1. Normalize input
//   2. Intent detection (Navigation → Bus → Website)
//   3. FAQ matching (pattern + keyword scoring)
//   4. Response cache lookup
//   5. If nothing matched → return { handled: false } → caller invokes LLM

import { normalizeQuery } from './queryNormalizer';
import { isNavigationIntent, getNavigationResponse, NavigationResult } from './navigationIntent';
import { isBusIntent, getBusResponse, BusResult } from './busIntent';
import { isWebsiteIntent, getWebsiteResponse } from './websiteIntent';
import { getCachedResponse, setCachedResponse } from './responseCache';

// ─── Types ─────────────────────────────────────────────────────────────────

export interface LocalQueryResult {
  /** Whether the query was handled locally (true = no API call needed) */
  handled: boolean;
  /** The response text to display to the user */
  response?: string;
  /** What matched: intent type or 'faq' or 'cache' */
  matchType?: 'navigation' | 'bus' | 'website' | 'faq' | 'cache';
  /** For navigation intent — the URL to open */
  navigationUrl?: string;
  /** For website intent — the URL to open */
  websiteUrl?: string;
}

// ─── Main Handler ──────────────────────────────────────────────────────────

/**
 * Attempts to handle the user query entirely locally.
 *
 * Pipeline (in strict order):
 * 1. Normalize → 2. Navigation Intent → 3. Bus Intent →
 * 4. Website Intent → 5. FAQ Match → 6. Cache Lookup
 *
 * @param text       The raw user input text
 * @param userLocation  GPS coordinates (needed for navigation intent)
 * @returns { handled: true, response, matchType } if resolved locally,
 *          { handled: false } if LLM fallback is needed.
 */
export function tryLocalResponse(
  text: string,
  userLocation: { lat: number; lng: number } | null,
): LocalQueryResult {
  if (!text || !text.trim()) {
    return { handled: false };
  }

  // ── Step 1: Normalize ──────────────────────────────────────────────
  const { normalized, original } = normalizeQuery(text);
  console.log(`[LocalHandler] Normalized: "${original}" → "${normalized}"`);

  // We check against BOTH original and normalized to maximise coverage
  // (original preserves Malayalam script, normalized has synonym mappings)

  // ── Step 2: Navigation Intent ──────────────────────────────────────
  if (isNavigationIntent(original) || isNavigationIntent(normalized)) {
    console.log('[LocalHandler] ✅ Navigation intent matched');
    const navResult: NavigationResult = getNavigationResponse(original, userLocation);
    return {
      handled: true,
      response: navResult.message,
      matchType: 'navigation',
      navigationUrl: navResult.success ? navResult.url : undefined,
    };
  }

  // ── Step 3: Bus Intent ─────────────────────────────────────────────
  if (isBusIntent(original) || isBusIntent(normalized)) {
    console.log('[LocalHandler] ✅ Bus intent matched');
    const busResult: BusResult = getBusResponse(original);
    return {
      handled: true,
      response: busResult.message,
      matchType: 'bus',
    };
  }

  // ── Step 4: Website Intent ─────────────────────────────────────────
  if (isWebsiteIntent(original) || isWebsiteIntent(normalized)) {
    console.log('[LocalHandler] ✅ Website intent matched');
    const webResult = getWebsiteResponse(original);
    return {
      handled: true,
      response: webResult.message,
      matchType: 'website',
      websiteUrl: webResult.success ? webResult.url : undefined,
    };
  }

  // ── Step 5: Response Cache ─────────────────────────────────────────
  const cached = getCachedResponse(normalized);
  if (cached) {
    console.log('[LocalHandler] ✅ Cache hit');
    return {
      handled: true,
      response: cached,
      matchType: 'cache',
    };
  }

  // ── No local match — LLM fallback needed ───────────────────────────
  console.log('[LocalHandler] ❌ No local match — falling through to LLM');
  return { handled: false };
}

// ─── Cache Helper (for post-LLM caching) ───────────────────────────────────

/**
 * After an LLM call succeeds, cache the response so repeat queries
 * can be served instantly from the cache.
 */
export function cacheAIResponse(originalQuery: string, response: string): void {
  const { normalized } = normalizeQuery(originalQuery);
  setCachedResponse(normalized, response);
  console.log(`[LocalHandler] Cached AI response for: "${normalized}"`);
}
