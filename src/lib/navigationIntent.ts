// Navigation intent detection, destination resolution, and Google Maps link builder
// Supports English, Malayalam, and Manglish voice/text queries

import { campusLocations, CampusLocation, getAllLocationNames } from './campusLocations';
import { sanitizeInput, isEmptyInput } from './inputSanitizer';

// ─── Intent Detection Patterns ─────────────────────────────────────────────

const NAVIGATION_PATTERNS_EN = [
    /\b(?:how\s+(?:to|do\s+i)\s+(?:reach|get\s+to|go\s+to))\b/i,
    /\b(?:navigate|navigation)\s+(?:to|me)\b/i,
    /\b(?:route|directions?)\s+(?:to|for)\b/i,
    /\b(?:where\s+is|where's)\b/i,
    /\b(?:take\s+me\s+to)\b/i,
    /\b(?:go\s+to)\b/i,
    /\b(?:location\s+of)\b/i,
    /\b(?:way\s+to)\b/i,
    /\b(?:find\s+the|find)\s+(?:way|route|path)\b/i,
    /\b(?:show\s+(?:me\s+)?(?:the\s+)?(?:way|route|directions?|path))\b/i,
    /\b(?:i\s+want\s+to\s+(?:go|reach|get)\s+to)\b/i,
];

const NAVIGATION_PATTERNS_ML = [
    /എവിടെ/,           // "where"
    /എങ്ങനെ\s*പോകും/,   // "how to go"
    /എങ്ങനെ\s*എത്തും/,  // "how to reach"
    /വഴി/,              // "way/route"
    /പോകണം/,            // "want to go"
    /എത്താൻ/,           // "to reach"
    /എവിടെയാണ്/,        // "where is"
    /സ്ഥലം/,            // "place/location"
    /എവിടെയാണ്\s*സ്ഥിതി/, // "where is the location"
    /എങ്ങനെ\s*പോകണം/, // "how to go"
    /കാണിക്കൂ/,         // "show me"
    /തുറക്കൂ/,           // "open"
    /മാപ്പ്/,             // "map"
    // Additional colloquial/spoken patterns
    /എവിടാ/,             // "where" (casual)
    /എവിടെയാ/,           // "where is it" (casual)
    /എവിടാണ്/,           // "where is" (casual)
    /എവിടെയുണ്ട്/,       // "where is there"
    /എങ്ങനെ\s*പോണം/,  // "how to go" (variant)
    /എങ്ങനെ\s*പോവും/,  // "how to go" (variant)
    /എങ്ങനെ\s*എത്താം/,  // "how to reach" (variant)
    /എങ്ങനെയാ\s*പോകുന്നത്/, // "how do you go"
    /എങ്ങനെയാ\s*എത്തുന്നത്/, // "how do you reach"
    /അങ്ങോട്ട്/,          // "there" (direction)
    /അവിടേക്ക്/,          // "to there"
    /കൊണ്ടുപോ/,           // "take me"
    /കൊണ്ടുപോകൂ/,       // "please take me"
    /പോണം/,              // "want to go" (variant)
    /പോവണം/,             // "should go" (variant)
    /എത്തണം/,            // "want to reach"
    /ദിശ/,               // "direction"
    /ഭാഗത്ത്/,           // "side/area"
    /ലൊക്കേഷൻ/,          // "location"
    /റൂട്ട്/,             // "route"
    /നാവിഗേറ്റ്/,       // "navigate"
    /പറയൂ/,              // "tell me" (polite)
    /പറഞ്ഞു\s*തരൂ/,     // "please tell me"
    /തരൂ/,               // "give/please" (request)
    /തരാമോ/,             // "can you give"
    /ഏത്\s*ഭാഗത്ത്/,    // "which side"
    /ഏതു\s*ഭാഗത്താ/,   // "which side" (casual)
    /ഏത്\s*ദിക്കിലാ/,   // "which direction"
    /ഏത്\s*സൈഡിലാ/,     // "which side"
    /ഏത്\s*നിലയിലാ/,   // "which floor"
    /ഏത്\s*ബ്ലോക്കിലാ/, // "which block"
    /ഏത്\s*കെട്ടിടത്തിലാ/, // "which building"
    /എനിക്ക്\s*പോകണം/, // "I want to go"
    /എനിക്ക്\s*എത്തണം/, // "I want to reach"
    /ഞാൻ\s*പോകണം/,      // "I want to go"
    /കിടക്കുന്നത്/,     // "is located at"
    /ഉള്ളത്/,             // "is there / exists"
    /ഉള്ളതാ/,            // "is there" (casual)
    // Additional colloquial & polite Malayalam patterns
    /ഏടാ/,               // "where" (very casual)
    /ഏട/,                // "where" (casual variant)
    /ഏടെ/,               // "where" (casual variant)
    /പറയാമോ/,            // "can you tell"
    /പറഞ്ഞുതരാമോ/,      // "can you please tell"
    /നോക്കൂ/,            // "look / check"
    /നോക്ക്/,            // "look" (informal)
    /എടുക്ക്/,           // "take / get"
    /പോയിക്കോ/,          // "go ahead" (permission)
    /എത്തിക്ക്/,         // "make reach / deliver"
    /എത്തിക്കൂ/,        // "please make reach"
    /ഇരിക്കുന്നത്/,     // "is sitting / is at"
    /കാണും/,             // "will see / can find"
    /ഡയറക്ഷൻ/,          // "direction" (transliterated)
    /റോഡ്/,              // "road" (transliterated)
];

const NAVIGATION_PATTERNS_MANGLISH = [
    /\b(?:evide|evidaya|evideyanu|evidaanu|evidanu|evida)\b/i,
    /\b(?:engane\s*(?:ponum|pokum|ethum|ethan|ponam|pokano|pokanam|povum|ethaam))\b/i,
    /\b(?:vazhi|vazi)\b/i,
    /\b(?:pokanam|pokano|ponam|povaanam)\b/i,
    /\b(?:ethra\s*door|ethra\s*duram)\b/i,
    /\b(?:ethan|ethanam|ethanum|ethanulla)\b/i,
    /\b(?:location\s*evide)\b/i,
    /\b(?:reach\s*cheyyaan|reach\s*cheyan|reach\s*cheyyanam)\b/i,
    /\b(?:kaanikku|kaanikkoo|kanikku)\b/i,     // "show me"
    /\b(?:thurakku|thurannu|thurakk)\b/i,       // "open"
    /\b(?:mappu|mappil)\b/i,                    // "map"
    /\b(?:sthanam|sthalam)\b/i,                 // "place"
    /\b(?:etha|ethayya|ethada)\b/i,             // "which one"
    /\b(?:enta|enthaanu|enthanu)\s+(?:vazhi|vazi|way)\b/i, // "what is the way"
    /\b(?:enikku|enikk)\s+(?:pokanam|ponam|ethanam)\b/i, // "I want to go/reach"
    // Additional Manglish patterns
    /\b(?:enganeya|enganeyaa)\s+(?:pokunnath|ethunnath)\b/i, // "how do you go/reach"
    /\b(?:angottu|angott)\b/i,                 // "to there"
    /\b(?:avidekku|avidettu|avide)\b/i,         // "to there"
    /\b(?:kondupo|kondupokoo)\b/i,              // "take me"
    /\b(?:navigate\s*cheyyu|navigate\s*cheyy)\b/i, // "navigate"
    /\b(?:disha|direction)\s*(?:kanikku|parayoo)\b/i, // "show/tell direction"
    /\b(?:vazhi\s*parayoo|vazhi\s*paranju\s*tharoo)\b/i, // "tell the way"
    /\b(?:route\s*parayoo|route\s*kanikku)\b/i, // "tell/show route"
    /\b(?:ethu\s*(?:vazhi|vazhiya|vazhikk|bhagath|bhagathaa|sidila|dikkila|blockila|nilayila))\b/i, // "which way/side/floor"
    /\b(?:njan\s*pokanam)\b/i,                  // "I want to go"
    /\b(?:ithu|athu)\s+evide\b/i,               // "this/that where"
    /\b(?:kidakkunnathu|ullathu|ullath)\b/i,     // "located/exists"
    /\b(?:tharoo|tharamo)\b/i,                  // "please give"
    // Additional Manglish patterns
    /\b(?:eda|ede)\b/i,                          // "where" (very casual)
    /\b(?:parayaamo|paranjutharamo)\b/i,          // "can you tell"
    /\b(?:nokkoo|nokk)\b/i,                      // "look/check"
    /\b(?:poyikko|poyikkolloo)\b/i,              // "go ahead"
    /\b(?:ethikku|ethikkoo|ethikk)\b/i,           // "make reach"
    /\b(?:kondupokoo|kondupokanum)\b/i,           // "take me" (variants)
    /\b(?:povaam|povaaam)\b/i,                    // "let's go"
    /\b(?:irikkunnath|irikkunnathu)\b/i,          // "is located at"
    /\b(?:kaanum|kaanumoo)\b/i,                   // "can find"
    /\b(?:direction\s*(?:kanikku|parayoo|thaa))\b/i, // "direction show/tell/give"
];

// ─── Result Types ───────────────────────────────────────────────────────────

export interface NavigationResult {
    success: boolean;
    url?: string;
    message: string;
    destination?: CampusLocation;
}

// ─── Intent Detection ───────────────────────────────────────────────────────

/**
 * Detects if the user input is a navigation/directions request
 */
export function isNavigationIntent(text: string): boolean {
    if (isEmptyInput(text)) return false;

    const cleaned = sanitizeInput(text);
    if (!cleaned) return false;

    const allPatterns = [
        ...NAVIGATION_PATTERNS_EN,
        ...NAVIGATION_PATTERNS_ML,
        ...NAVIGATION_PATTERNS_MANGLISH,
    ];

    return allPatterns.some((pattern) => pattern.test(cleaned));
}

// ─── Destination Resolution ─────────────────────────────────────────────────

/**
 * Normalizes text for comparison: lowercase, remove punctuation, trim
 */
function normalize(text: string): string {
    return text
        .toLowerCase()
        .replace(/[''`]/g, '')
        .replace(/[^\w\s\u0D00-\u0D7F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Escapes special regex characters in a string
 */
function escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Detects if the text contains Malayalam characters
 */
function hasMalayalam(text: string): boolean {
    return /[\u0D00-\u0D7F]/.test(text);
}

/**
 * Detects if the text looks like Manglish (romanized Malayalam)
 */
function isManglish(text: string): boolean {
    if (hasMalayalam(text)) return false;
    const manglishWords = /\b(?:evide|engane|ponum|pokum|ethan|ethanam|vazhi|pokanam|evidaya|evideyanu|evidaanu|sthalam|kaanikku|thurakku|angottu|avidekku|kondupo|ponam|povaanam|ethanam|parayoo|tharoo|tharamo|disha|bhagath|sidila|blockila|nilayila|kidakkunnathu|ullathu|kanikku|evida)\b/i;
    return manglishWords.test(text);
}

/**
 * Resolves the destination from user text by matching against campus location aliases.
 * Returns null if no match is found.
 */
export function resolveDestination(text: string): CampusLocation | null {
    try {
        if (isEmptyInput(text)) return null;

        const normalizedText = normalize(sanitizeInput(text));

        // First pass: exact alias match (longest alias first to avoid partial matches)
        const allAliases: { alias: string; location: CampusLocation }[] = [];
        for (const location of campusLocations) {
            for (const alias of location.aliases) {
                allAliases.push({ alias: normalize(alias), location });
            }
            // Also add the location name itself
            allAliases.push({ alias: normalize(location.name), location });
        }

        // Sort by alias length descending (prefer longer / more specific matches)
        allAliases.sort((a, b) => b.alias.length - a.alias.length);

        // Collect ALL matches (not just the first one)
        const matches: { alias: string; location: CampusLocation }[] = [];

        for (const { alias, location } of allAliases) {
            // Use word-boundary matching to avoid false positives
            // e.g., alias "me" should not match inside "take me to"
            const hasMalayalam = /[\u0D00-\u0D7F]/.test(alias);
            const pattern = hasMalayalam
                ? new RegExp(escapeRegex(alias))
                : new RegExp(`\\b${escapeRegex(alias)}\\b`);
            if (pattern.test(normalizedText)) {
                matches.push({ alias, location });
            }
        }

        if (matches.length === 0) {
            console.debug('[Nav] No destination match for:', text);
            return null;
        }

        // If only one match, return it
        if (matches.length === 1) {
            return matches[0].location;
        }

        // Multiple matches found — prefer specific locations over main_entrance
        // This prevents "college canteen evide" from resolving to main_entrance
        const specificMatches = matches.filter(m => m.location.id !== 'main_entrance');
        if (specificMatches.length > 0) {
            // Return the most specific match (longest alias = most specific)
            return specificMatches[0].location;
        }

        // Only main_entrance matched
        return matches[0].location;
    } catch (error) {
        console.error('[Nav] resolveDestination error:', error);
        return null;
    }
}

// ─── Google Maps URL Construction ───────────────────────────────────────────

/**
 * Builds a canonical Google Maps navigation URL.
 * Uses the place name (with campus context) as destination for accurate geocoding.
 */
export function buildGoogleMapsUrl(
    origin: { lat: number; lng: number },
    destination: CampusLocation
): string {
    const params = new URLSearchParams({
        api: '1',
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.name}, LBS College of Engineering, Kasaragod`,
        travelmode: destination.travelMode,
    });

    return `https://www.google.com/maps/dir/?${params.toString()}`;
}

// ─── Full Navigation Flow ───────────────────────────────────────────────────

/**
 * Orchestrates the full navigation flow:
 * 1. Check GPS availability
 * 2. Resolve destination
 * 3. Build and return Google Maps URL
 */
export function getNavigationResponse(
    text: string,
    userLocation: { lat: number; lng: number } | null
): NavigationResult {
    try {
        // 1. Check GPS
        if (!userLocation) {
            return {
                success: false,
                message:
                    '📍 I need your live location to start navigation, but location access is unavailable. Please enable GPS/location services in your browser and try again.',
            };
        }

        // 2. Resolve destination
        const destination = resolveDestination(text);

        if (!destination) {
            const locationNames = getAllLocationNames();
            const isMalayalamQuery = hasMalayalam(text);
            const isManglishQuery = isManglish(text);

            let errorMsg: string;
            if (isMalayalamQuery) {
                errorMsg = `❌ ആ സ്ഥലം LBS കോളേജ് ക്യാമ്പസില്‍ കണ്ടെത്തിയില്ല. ദയവായി ഈ സ്ഥലങ്ങളില്‍ ഒന്ന് ചോദിക്കൂ:\n\n${locationNames.map((n) => `• ${n}`).join('\n')}\n\nഉദാ: "കാന്റീൻ എവിടെ?" അല്ലെങ്കില്‍ "canteen evide?"`;
            } else if (isManglishQuery) {
                errorMsg = `❌ Aa location LBS campus-il kandethiyilla. Dayavayi ee sthalangalil onnu chodhikkoo:\n\n${locationNames.map((n) => `• ${n}`).join('\n')}\n\nUdaharanam: "canteen evide?" or "library engane ponum?"`;
            } else {
                errorMsg = `❌ I couldn't find that location on the LBS College campus. Please ask for one of these places:\n\n${locationNames.map((n) => `• ${n}`).join('\n')}\n\nExample: "How do I reach the canteen?"`;
            }

            return {
                success: false,
                message: errorMsg,
            };
        }

        // 3. Build URL
        const url = buildGoogleMapsUrl(userLocation, destination);
        const modeLabel = destination.travelMode === 'driving' ? '🚗 Driving' : '🚶 Walking';
        const isMalayalamQuery = hasMalayalam(text);
        const isManglishQuery = isManglish(text);

        let successMsg: string;
        if (isMalayalamQuery) {
            successMsg = `🗺️ ${modeLabel} നാവിഗേഷൻ **${destination.name}** -ലേക്ക് തുറക്കുന്നു...`;
        } else if (isManglishQuery) {
            successMsg = `🗺️ ${modeLabel} navigation **${destination.name}** -ilekk thurakkunnu...`;
        } else {
            successMsg = `🗺️ Opening ${modeLabel} navigation to **${destination.name}**...`;
        }

        return {
            success: true,
            url,
            destination,
            message: successMsg,
        };
    } catch (error) {
        console.error('[Nav] getNavigationResponse error:', error);
        return {
            success: false,
            message: '⚠️ Something went wrong while processing your navigation request. Please try again.',
        };
    }
}
