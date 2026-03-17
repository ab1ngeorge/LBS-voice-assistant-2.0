// ─── Conversational Memory Module ──────────────────────────────────────────
// Provides short-term memory for the LBS Voice Assistant, enabling
// context-aware pronoun resolution and query rewriting.

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ConversationMemory {
  last_intent: string | null;
  last_entity: string | null;
  last_location: string | null;
}

export type MemoryIntent =
  | 'navigation'
  | 'bus'
  | 'website'
  | 'info'
  | 'general';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

/** Pronouns / ambiguous references that signal context-dependency */
const PRONOUNS_EN = [
  'it', 'there', 'that', 'they', 'this', 'its', 'them',
  'the place', 'that place', 'the same', 'that one',
];
const PRONOUNS_ML = [
  'അത്', 'അവിടെ', 'ഇത്', 'അവ', 'അവർ', 'അതിന്റെ',
  'ആ സ്ഥലം', 'അവിടേക്ക്', 'അതിലേക്ക്',
];
const PRONOUNS_MANGLISH = [
  'athu', 'avide', 'ithu', 'avar', 'athinte',
  'aa sthalam', 'avidekk', 'athilekk',
];

const ALL_PRONOUNS = [...PRONOUNS_EN, ...PRONOUNS_ML, ...PRONOUNS_MANGLISH];

// Pronoun regex — matches whole words in English, substrings for Malayalam script
const PRONOUN_REGEX_EN = new RegExp(
  `\\b(${PRONOUNS_EN.map(escapeRegex).join('|')})\\b`,
  'i',
);
const PRONOUN_REGEX_ML = new RegExp(
  `(${PRONOUNS_ML.map(escapeRegex).join('|')})`,
  'u',
);
const PRONOUN_REGEX_MANGLISH = new RegExp(
  `\\b(${PRONOUNS_MANGLISH.map(escapeRegex).join('|')})\\b`,
  'i',
);

// ─────────────────────────────────────────────────────────────────────────────
// Entity Database — canonical campus entities for extraction
// ─────────────────────────────────────────────────────────────────────────────

interface EntityEntry {
  entity: string;     // Canonical entity name
  location: string;   // Associated campus location / area
  keywords: string[]; // Matching keywords (English, Malayalam, Manglish)
}

const ENTITY_DATABASE: EntityEntry[] = [
  // Departments
  { entity: 'CSE Department', location: 'CSE Block', keywords: ['cse', 'computer science', 'computer', 'സിഎസ്ഇ', 'കമ്പ്യൂട്ടർ'] },
  { entity: 'ECE Department', location: 'ECE Block', keywords: ['ece', 'electronics', 'electronics and communication', 'ഇസിഇ', 'ഇലക്ട്രോണിക്സ്'] },
  { entity: 'EEE Department', location: 'EEE Block', keywords: ['eee', 'electrical', 'ഇഇഇ', 'ഇലക്ട്രിക്കൽ'] },
  { entity: 'Mechanical Department', location: 'Mechanical Block', keywords: ['mechanical', 'mech', 'me dept', 'മെക്കാനിക്കൽ'] },
  { entity: 'Civil Department', location: 'Civil Block', keywords: ['civil', 'ce dept', 'സിവിൽ'] },

  // Facilities
  { entity: 'Library', location: 'Central Library', keywords: ['library', 'central library', 'reading room', 'ലൈബ്രറി', 'വായനശാല', 'പുസ്തകശാല'] },
  { entity: 'Canteen', location: 'College Canteen', keywords: ['canteen', 'mess', 'food', 'cafeteria', 'കാന്റീൻ', 'മെസ്സ്', 'ഭക്ഷണം', 'bhakshanam', 'oonu'] },
  { entity: 'Hostel', location: "Men's Hostel", keywords: ['hostel', 'accommodation', 'ഹോസ്റ്റൽ', 'താമസം', 'thamasam'] },
  { entity: "Girls Hostel", location: "Shahanas Hostel", keywords: ['girls hostel', 'ladies hostel', 'womens hostel', 'shahanas', 'ഗേൾസ് ഹോസ്റ്റൽ', 'പെൺ ഹോസ്റ്റൽ'] },
  { entity: 'ATM', location: 'SBI ATM', keywords: ['atm', 'sbi', 'bank', 'എടിഎം', 'ബാങ്ക്'] },
  { entity: 'Auditorium', location: 'College Auditorium', keywords: ['auditorium', 'audi', 'hall', 'ഓഡിറ്റോറിയം', 'ഹാൾ'] },
  { entity: 'Sports Area', location: 'Sports Complex', keywords: ['sports', 'playground', 'ground', 'football', 'സ്പോർട്സ്', 'ഗ്രൗണ്ട്', 'കളിക്കളം'] },
  { entity: 'Bus Stop', location: 'Bus Garage', keywords: ['bus stop', 'bus stand', 'bus garage', 'transport', 'ബസ് സ്റ്റോപ്പ്', 'ബസ് ഗാരേജ്'] },
  { entity: 'Fab Lab', location: 'Campus Fab Lab', keywords: ['fab lab', 'fablab', 'fabrication', 'ഫാബ് ലാബ്'] },
  { entity: 'Xerox', location: 'Reprographic Centre', keywords: ['xerox', 'photocopy', 'print', 'സെറോക്സ്', 'ഫോട്ടോകോപ്പി'] },
  { entity: 'Co-operative Society', location: 'Student Co-Operative', keywords: ['cooperative', 'coop', 'society', 'stationary', 'സൊസൈറ്റി', 'സഹകരണ'] },

  // Admin & Academic
  { entity: 'Principal Office', location: 'Admin Block', keywords: ['principal', 'director', 'പ്രിൻസിപ്പൽ'] },
  { entity: 'Main Entrance', location: 'Main Gate', keywords: ['main entrance', 'main gate', 'college gate', 'മെയിൻ ഗേറ്റ്', 'പ്രധാന കവാടം'] },
  { entity: 'Admission', location: 'Admin Block', keywords: ['admission', 'apply', 'അഡ്മിഷൻ', 'പ്രവേശനം'] },
  { entity: 'Placement Cell', location: 'Placement Office', keywords: ['placement', 'job', 'recruit', 'package', 'salary', 'പ്ലേസ്‌മെന്റ്', 'ജോലി'] },
  { entity: 'Fee Structure', location: 'Admin Block', keywords: ['fee', 'tuition', 'fees', 'ഫീസ്'] },

  // Clubs
  { entity: 'IEDC', location: 'IEDC Room', keywords: ['iedc', 'innovation', 'entrepreneurship', 'ഐഇഡിസി'] },
  { entity: 'IEEE', location: 'IEEE Room', keywords: ['ieee'] },
  { entity: 'NSS', location: 'NSS Room', keywords: ['nss', 'national service', 'എൻഎസ്എസ്'] },
];

// ─────────────────────────────────────────────────────────────────────────────
// Intent Classification Keywords
// ─────────────────────────────────────────────────────────────────────────────

const INTENT_KEYWORDS: Record<MemoryIntent, string[]> = {
  navigation: [
    'where', 'direction', 'navigate', 'how to go', 'how to reach', 'route', 'map', 'find', 'locate', 'way to',
    'എവിടെ', 'ദിശ', 'വഴി', 'എങ്ങനെ പോകും', 'കണ്ടെത്തുക',
    'evide', 'engane ponum', 'engane ethum', 'vazhi', 'ethan',
  ],
  bus: [
    'bus', 'transport', 'bus time', 'bus route', 'bus fee', 'boarding',
    'ബസ്', 'ബസ്സ്', 'ട്രാൻസ്പോർട്ട്',
    'bus samayam', 'bus time', 'bus route',
  ],
  website: [
    'website', 'link', 'url', 'page', 'portal', 'open site', 'visit site',
    'വെബ്സൈറ്റ്', 'ലിങ്ക്', 'പേജ്',
    'website link', 'site link',
  ],
  info: [
    'tell me about', 'what is', 'who is', 'how many', 'details', 'information', 'about',
    'hod', 'faculty', 'teacher', 'professor', 'fee', 'admission', 'placement', 'hostel', 'canteen',
    'menu', 'timing', 'open', 'close', 'rules', 'club',
    'എന്താണ്', 'ആരാണ്', 'എത്ര', 'വിവരം',
    'entha', 'aaru', 'ethra', 'vivaram',
  ],
  general: [],
};

// ─────────────────────────────────────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────────────────────────────────────

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/** Create a fresh, empty memory object */
export function createEmptyMemory(): ConversationMemory {
  return {
    last_intent: null,
    last_entity: null,
    last_location: null,
  };
}

/**
 * Check if a query contains pronouns or ambiguous references
 * that require context from memory to resolve.
 */
export function containsPronouns(query: string): boolean {
  if (!query || query.trim().length === 0) return false;

  // Malayalam script detection
  const hasMalayalam = /[\u0D00-\u0D7F]/.test(query);

  if (hasMalayalam) {
    return PRONOUN_REGEX_ML.test(query);
  }

  // Check English pronouns (word boundaries)
  if (PRONOUN_REGEX_EN.test(query)) return true;

  // Check Manglish pronouns
  if (PRONOUN_REGEX_MANGLISH.test(query)) return true;

  return false;
}

/**
 * Extract the most prominent campus entity from a query.
 * Returns { entity, location } or null if no entity found.
 */
export function extractEntity(query: string): { entity: string; location: string } | null {
  if (!query || query.trim().length === 0) return null;

  const queryLower = query.toLowerCase();

  // Score each entity entry by how many of its keywords match
  let bestMatch: EntityEntry | null = null;
  let bestScore = 0;

  for (const entry of ENTITY_DATABASE) {
    let score = 0;
    for (const kw of entry.keywords) {
      // For Malayalam keywords (contains Unicode), do substring match
      if (/[\u0D00-\u0D7F]/.test(kw)) {
        if (query.includes(kw)) score += kw.length; // longer match = higher score
      } else {
        // For English/Manglish, do case-insensitive substring match
        if (queryLower.includes(kw.toLowerCase())) score += kw.length;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = entry;
    }
  }

  if (bestMatch && bestScore > 0) {
    return { entity: bestMatch.entity, location: bestMatch.location };
  }

  return null;
}

/**
 * Classify the intent of a query into a high-level category.
 */
export function classifyIntent(query: string): MemoryIntent {
  if (!query || query.trim().length === 0) return 'general';

  const queryLower = query.toLowerCase();

  // Check each intent category, prioritized by specificity
  const intentOrder: MemoryIntent[] = ['navigation', 'bus', 'website', 'info', 'general'];

  for (const intent of intentOrder) {
    const keywords = INTENT_KEYWORDS[intent];
    for (const kw of keywords) {
      if (/[\u0D00-\u0D7F]/.test(kw)) {
        if (query.includes(kw)) return intent;
      } else {
        if (queryLower.includes(kw.toLowerCase())) return intent;
      }
    }
  }

  return 'general';
}

/**
 * Rewrite a query by resolving pronouns using conversation memory.
 *
 * - If the query contains pronouns AND memory has a relevant entity → replaces them.
 * - If no pronouns are detected or memory is empty → returns the original query unchanged.
 *
 * Returns: { rewritten: string; wasRewritten: boolean }
 */
export function rewriteQuery(
  query: string,
  memory: ConversationMemory,
): { rewritten: string; wasRewritten: boolean } {
  if (!query || query.trim().length === 0) {
    return { rewritten: query, wasRewritten: false };
  }

  // If no pronouns → no rewriting needed
  if (!containsPronouns(query)) {
    return { rewritten: query, wasRewritten: false };
  }

  // If memory has no context → can't resolve, return as-is
  const referenceEntity = memory.last_entity || memory.last_location;
  if (!referenceEntity) {
    return { rewritten: query, wasRewritten: false };
  }

  let rewritten = query;

  // Malayalam script query
  const hasMalayalam = /[\u0D00-\u0D7F]/.test(query);

  if (hasMalayalam) {
    // Replace Malayalam pronouns with the entity
    for (const pronoun of PRONOUNS_ML) {
      if (rewritten.includes(pronoun)) {
        rewritten = rewritten.replace(pronoun, referenceEntity);
      }
    }
  } else {
    // Replace English pronouns (word-boundary aware)
    for (const pronoun of PRONOUNS_EN) {
      const regex = new RegExp(`\\b${escapeRegex(pronoun)}\\b`, 'gi');
      rewritten = rewritten.replace(regex, referenceEntity);
    }

    // Replace Manglish pronouns
    for (const pronoun of PRONOUNS_MANGLISH) {
      const regex = new RegExp(`\\b${escapeRegex(pronoun)}\\b`, 'gi');
      rewritten = rewritten.replace(regex, referenceEntity);
    }
  }

  const wasRewritten = rewritten !== query;
  return { rewritten, wasRewritten };
}

/**
 * Update the conversation memory based on the current query.
 *
 * - Extracts entity and intent from the query.
 * - If a new entity is found → updates memory (implicit topic change reset).
 * - If no entity is found → keeps the existing memory.
 *
 * Returns the updated memory (mutates in-place AND returns).
 */
export function updateMemory(
  query: string,
  memory: ConversationMemory,
): ConversationMemory {
  const extracted = extractEntity(query);
  const intent = classifyIntent(query);

  // Always update intent
  if (intent !== 'general') {
    memory.last_intent = intent;
  }

  // Update entity and location only if a new one is detected
  // This naturally handles "topic change" — new entity replaces old
  if (extracted) {
    memory.last_entity = extracted.entity;
    memory.last_location = extracted.location;
  }

  return memory;
}

/**
 * Check if memory has usable context for resolving references.
 */
export function hasMemoryContext(memory: ConversationMemory): boolean {
  return !!(memory.last_entity || memory.last_location);
}
