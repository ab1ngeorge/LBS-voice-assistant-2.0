// ─── Query Normalizer ──────────────────────────────────────────────────────
// Normalizes user input before intent detection and FAQ matching.
// Handles lowercasing, punctuation removal, and Manglish → English synonym mapping.

import { sanitizeInput } from './inputSanitizer';

// ─── Manglish → English Synonym Map ────────────────────────────────────────
// Maps common Manglish phrases to their English equivalents so that
// downstream intent detectors and FAQ matchers can work on normalised text.

const MANGLISH_SYNONYMS: [RegExp, string][] = [
  // Availability
  [/\bundo\b/gi, 'available'],
  [/\bundu\b/gi, 'available'],
  [/\bundoo\b/gi, 'available'],
  [/\bund\b/gi, 'available'],
  [/\blabhyam\b/gi, 'available'],
  [/\blabhyamano\b/gi, 'is available'],
  [/\bille\b/gi, 'not available'],
  [/\billa\b/gi, 'not available'],

  // Timing / When
  [/\bsamayam\b/gi, 'timing'],
  [/\beppol\b/gi, 'when'],
  [/\beppo\b/gi, 'when'],
  [/\beppazha\b/gi, 'when'],
  [/\benna\b/gi, 'when'],

  // Cost / Fee
  [/\bethra\b/gi, 'how much'],
  [/\bvila\b/gi, 'price'],
  [/\bvilayethra\b/gi, 'how much price'],
  [/\bcharge\b/gi, 'fee'],

  // Location / Direction
  [/\bevide\b/gi, 'where'],
  [/\bevidaya\b/gi, 'where is'],
  [/\bevideyanu\b/gi, 'where is'],
  [/\bevidaanu\b/gi, 'where is'],
  [/\bevida\b/gi, 'where'],
  [/\bengane\b/gi, 'how'],
  [/\bsthalam\b/gi, 'place'],

  // What / Tell me
  [/\bentha\b/gi, 'what'],
  [/\benthanu\b/gi, 'what is'],
  [/\benthaanu\b/gi, 'what is'],
  [/\benth\b/gi, 'what'],
  [/\bparayoo\b/gi, 'tell me'],
  [/\bparayu\b/gi, 'tell'],
  [/\bariyumo\b/gi, 'do you know'],
  [/\bariyaamoo\b/gi, 'do you know'],
  [/\bariyamo\b/gi, 'do you know'],

  // Transport
  [/\bbus samayam\b/gi, 'bus timing'],
  [/\bbus undo\b/gi, 'bus available'],
  [/\bbus kittum\b/gi, 'bus available'],
  [/\bbus varumo\b/gi, 'bus coming'],

  // Campus
  [/\bhostel undo\b/gi, 'hostel available'],
  [/\bhostel undu\b/gi, 'hostel available'],
  [/\bthamasam\b/gi, 'accommodation'],
  [/\bcanteen menu\b/gi, 'canteen menu'],
  [/\bcanteen entha\b/gi, 'canteen what'],
  [/\bbhakshanam\b/gi, 'food'],
  [/\boonu\b/gi, 'meals'],
  [/\bchaya\b/gi, 'tea'],

  // Academics
  [/\bfee ethra\b/gi, 'fee how much'],
  [/\bfees ethra\b/gi, 'fees how much'],
  [/\bpanam\b/gi, 'money'],
  [/\bpareeksha\b/gi, 'exam'],
  [/\bvibhagam\b/gi, 'department'],
  [/\bpraveshanam\b/gi, 'admission'],
  [/\bjoli\b/gi, 'job'],
  [/\bshambalam\b/gi, 'salary'],
  [/\bplacement entha\b/gi, 'placement what'],
  [/\bscholarship undo\b/gi, 'scholarship available'],
  [/\bfee ilavu\b/gi, 'fee concession'],
  [/\bclub entha\b/gi, 'club what'],

  // Polite / Question particles
  [/\btharoo\b/gi, 'please give'],
  [/\btharamo\b/gi, 'can you give'],
  [/\bnokkoo\b/gi, 'check'],
  [/\bnokkumo\b/gi, 'can you check'],
];

// ─── Types ─────────────────────────────────────────────────────────────────

export interface NormalizedQuery {
  /** The fully normalized query (lowercased, cleaned, synonyms applied) */
  normalized: string;
  /** The original user input, untouched */
  original: string;
}

// ─── Normalize Function ────────────────────────────────────────────────────

/**
 * Normalizes user input for deterministic matching:
 * 1. Sanitizes (trim, control chars, abbreviation expansion) via inputSanitizer
 * 2. Lowercases
 * 3. Removes punctuation (preserving Malayalam Unicode)
 * 4. Applies Manglish → English synonym mapping
 * 5. Collapses whitespace
 */
export function normalizeQuery(text: string): NormalizedQuery {
  if (!text || !text.trim()) {
    return { normalized: '', original: text || '' };
  }

  const original = text;

  // Step 1: Sanitize (trim, remove control chars, expand abbreviations)
  let result = sanitizeInput(text);

  // Step 2: Lowercase
  result = result.toLowerCase();

  // Step 3: Remove punctuation but keep Malayalam Unicode (U+0D00–U+0D7F), letters, digits, spaces
  result = result.replace(/[^\w\s\u0D00-\u0D7F]/g, ' ');

  // Step 4: Apply Manglish synonym mapping (longer phrases first — they're already ordered)
  for (const [pattern, replacement] of MANGLISH_SYNONYMS) {
    result = result.replace(pattern, replacement);
  }

  // Step 5: Collapse whitespace
  result = result.replace(/\s+/g, ' ').trim();

  return { normalized: result, original };
}
