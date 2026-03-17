// Input sanitizer utility for cleaning and validating user text input

// ─── Abbreviation / Short Form Expansion Maps ──────────────────────────────

// English abbreviations → full forms
const ENGLISH_ABBREVIATIONS: Record<string, string> = {
    'dr': 'doctor',
    'dr.': 'doctor',
    'prof': 'professor',
    'prof.': 'professor',
    'adv': 'advocate',
    'adv.': 'advocate',
    'eng': 'engineer',
    'eng.': 'engineer',
    'engg': 'engineering',
    'engg.': 'engineering',
    'dept': 'department',
    'dept.': 'department',
    'hod': 'head of department',
    'govt': 'government',
    'govt.': 'government',
    'univ': 'university',
    'univ.': 'university',
    'mgmt': 'management',
    'sem': 'semester',
    'yr': 'year',
    'sr': 'senior',
    'jr': 'junior',
    'mr': 'mister',
    'mr.': 'mister',
    'mrs': 'missus',
    'mrs.': 'missus',
    'ms': 'miss',
    'ms.': 'miss',
    'no': 'number',
    'no.': 'number',
    'st': 'saint',
    'st.': 'saint',
};

// Malayalam abbreviations → full forms
const MALAYALAM_ABBREVIATIONS: Record<string, string> = {
    'ഡോ': 'ഡോക്ടർ',
    'ഡോ.': 'ഡോക്ടർ',
    'പ്രൊ': 'പ്രൊഫസർ',
    'പ്രൊ.': 'പ്രൊഫസർ',
    'അഡ്വ': 'അഡ്വക്കേറ്റ്',
    'അഡ്വ.': 'അഡ്വക്കേറ്റ്',
    'ഇം': 'എഞ്ചിനീയർ',
    'ഇം.': 'എഞ്ചിനീയർ',
    'എഞ്ചി': 'എഞ്ചിനീയർ',
    'എഞ്ചി.': 'എഞ്ചിനീയർ',
    'ശ്രീ': 'ശ്രീമാൻ',
    'ശ്രീമതി': 'ശ്രീമതി',
    'കു': 'കുമാരി',
    'കു.': 'കുമാരി',
};

// Manglish abbreviations → full forms
const MANGLISH_ABBREVIATIONS: Record<string, string> = {
    'dr': 'doctor',
    'dr.': 'doctor',
    'prof': 'professor',
    'prof.': 'professor',
    'adv': 'advocate',
    'adv.': 'advocate',
    'hod': 'head of department',
    'dept': 'department',
    'dept.': 'department',
    'engg': 'engineering',
    'engg.': 'engineering',
};

/**
 * Expands known abbreviations/short forms in the input text.
 * Handles English, Malayalam, and Manglish abbreviations.
 */
export function expandAbbreviations(text: string): string {
    if (!text || typeof text !== 'string') return '';

    let result = text;

    // Check if text has Malayalam characters
    const hasMalayalam = /[\u0D00-\u0D7F]/.test(text);

    if (hasMalayalam) {
        // Expand Malayalam abbreviations
        for (const [abbr, full] of Object.entries(MALAYALAM_ABBREVIATIONS)) {
            // Match the abbreviation followed by a space or end of string
            const regex = new RegExp(`(^|\\s)${escapeRegexChars(abbr)}(?=\\s|$)`, 'g');
            result = result.replace(regex, `$1${full}`);
        }
    } else {
        // Expand English/Manglish abbreviations (case insensitive)
        const abbrMap = { ...ENGLISH_ABBREVIATIONS, ...MANGLISH_ABBREVIATIONS };
        for (const [abbr, full] of Object.entries(abbrMap)) {
            const regex = new RegExp(`\\b${escapeRegexChars(abbr)}\\b`, 'gi');
            result = result.replace(regex, full);
        }
    }

    return result;
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegexChars(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Sanitizes user input: trims whitespace, removes control characters,
 * normalizes spaces, and expands abbreviations.
 */
export function sanitizeInput(text: string): string {
    if (!text || typeof text !== 'string') return '';
    const cleaned = text
        .trim()
        .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
        .replace(/\s+/g, ' ')            // Normalize whitespace
        .trim();

    // Expand abbreviations after basic cleanup
    return expandAbbreviations(cleaned);
}

/**
 * Checks if the input is empty or only whitespace.
 */
export function isEmptyInput(text: string): boolean {
    if (!text || typeof text !== 'string') return true;
    return text.trim().length === 0;
}
