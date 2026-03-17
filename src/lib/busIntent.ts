// College bus intent detection, place extraction, and response generation
// Supports English, Malayalam, and Manglish queries

import { findStop, getAllStopNames, formatFare, COLLEGE_ARRIVAL_TIME, getBusRouteSummary } from './busRoutes';

// ─── Intent Detection Patterns ──────────────────────────────────────────────

const BUS_PATTERNS_EN = [
    /\b(?:college\s+bus)\b/i,
    /\b(?:bus\s+(?:route|timing|time|fare|fee|available|number|stop|schedule))\b/i,
    /\b(?:bus\s+from)\b/i,
    /\b(?:college\s+transportation)\b/i,
    /\b(?:bus\s+to\s+college)\b/i,
    /\b(?:which\s+bus)\b/i,
    /\b(?:bus\s+no)\b/i,
    /\b(?:bus\s+detail)\b/i,
];

const BUS_PATTERNS_ML = [
    /ബസ്/,                    // "bus"
    /ബസ്സ്/,                  // "bus" variant
    /കോളേജ്\s*ബസ്/,          // "college bus"
    /ബസ്\s*സമയം/,            // "bus time"
    /ബസ്\s*ചാർജ്/,           // "bus charge"
    /ബസ്\s*റൂട്ട്/,           // "bus route"
    /ബസ്\s*ടൈം/,             // "bus time" (transliterated)
    /ബസ്\s*ഉണ്ടോ/,           // "bus available?"
    /ബസ്\s*എപ്പോൾ/,          // "bus when?"
    /ബസ്\s*എവിടെ/,           // "bus where?"
    /ബസ്\s*ഫെയർ/,            // "bus fare"
    /ബസ്\s*കിട്ടുമോ/,         // "will bus be available?"
    // Additional Malayalam bus patterns
    /ബസ്\s*എത്ര/,            // "bus how much"
    /ബസ്\s*എന്ത്\s*സമയം/,  // "bus what time"
    /ബസ്\s*എന്ത്\s*സമയത്ത്/, // "bus at what time"
    /ബസ്\s*എന്ത്\s*ടൈമിന്/, // "bus at what time" (transliterated)
    /ബസ്\s*വരുമോ/,           // "will bus come?"
    /ബസ്\s*പോകുമോ/,          // "will bus go?"
    /ബസ്\s*ഉണ്ടോ/,           // "is there bus?"
    /ബസ്\s*ലഭ്യമാണോ/,       // "is bus available?"
    /ബസ്\s*എന്താ/,           // "what about bus"
    /ബസ്\s*വിവരം/,           // "bus details"
    /ബസ്\s*വില/,             // "bus price"
    /ബസ്\s*ചാർജ്\s*എത്ര/,   // "bus charge how much"
    /ബസ്\s*നമ്പർ/,           // "bus number"
    /ബസ്\s*ഷെഡ്യൂൾ/,        // "bus schedule"
    /ബസ്\s*സ്ടോപ്പ്/,        // "bus stop"
    /ബസ്\s*നിന്ന്/,          // "from bus" (bus ninnu)
    /ബസ്\s*നിന്നും/,        // "from bus" (bus ninnum)
    /ഏത്\s*ബസ്/,             // "which bus"
    /ഏതു\s*ബസ്/,            // "which bus" (variant)
    /കോളേജ്\s*ബസ്\s*ഉണ്ടോ/, // "is college bus available?"
    /കോളേജ്\s*ബസ്\s*സമയം/, // "college bus time"
    /കോളേജ്\s*ബസ്\s*റൂട്ട്/, // "college bus route"
    // Additional casual Malayalam bus patterns
    /ബസ്\s*പോവുമോ/,          // "will bus go?" (variant)
    /ബസ്\s*വരുന്നുണ്ടോ/,    // "is bus coming?"
    /ബസ്\s*എവിടെ\s*കിട്ടും/, // "where to get bus?"
    /ബസ്\s*കയറാം/,           // "can board bus"
    /ബസ്\s*കയറണം/,          // "need to board bus"
    /ബസ്\s*എന്നാ/,           // "when is bus" (casual)
    /ബസ്\s*എപ്പഴാ/,          // "when is bus" (very casual)
    /ബസ്\s*ഇല്ലേ/,           // "isn't there a bus?"
    /ബസ്\s*ടിക്കറ്റ്/,       // "bus ticket"
    /ബസ്\s*പുറപ്പെടുന്ന\s*സമയം/, // "bus departure time"
];

const BUS_PATTERNS_MANGLISH = [
    /\b(?:college\s+bus)\b/i,
    /\b(?:bus\s+(?:evide|time|samayam|charge|route|undo|und|undu|eppol|eppo|detail|details))\b/i,
    /\b(?:bus\s+ethra)\b/i,
    /\b(?:bus\s+kittum)\b/i,
    /\b(?:bus\s+(?:undoo|undo|undu))\b/i,
    /\b(?:(?:evide|eppol|eppo)\s+bus)\b/i,
    /\b(?:bus\s+(?:vilayethra|vila|charge\s+ethra))\b/i,
    /\b(?:bus\s+(?:ninn|ninnu|il\s+ninnu))\b/i,
    // Additional Manglish bus patterns
    /\b(?:bus\s+(?:varumo|pokumo|pokuno|varunno))\b/i, // "will bus come/go?"
    /\b(?:bus\s+(?:labhyamano|labham|und))\b/i,         // "is bus available?"
    /\b(?:bus\s+(?:enth|entha|enthaanu))\b/i,           // "what about bus"
    /\b(?:bus\s+(?:vivaram|number|nambar|stop|schedule|shedyool))\b/i,
    /\b(?:college\s+bus\s+(?:undo|und|samayam|route|time|charge|fare))\b/i,
    /\b(?:ethu\s+bus)\b/i,                               // "which bus"
    /\b(?:bus\s+enth\s+samayam)\b/i,                     // "bus what time"
    /\b(?:bus\s+enth\s+time)\b/i,                        // "bus what time"
    // Additional Manglish bus patterns
    /\b(?:bus\s+povumo)\b/i,                              // "will bus go?" (variant)
    /\b(?:bus\s+varunnundo)\b/i,                          // "is bus coming?"
    /\b(?:bus\s+evide\s+kittum)\b/i,                     // "where to get bus?"
    /\b(?:bus\s+(?:kayaraam|kayaranam|kayaranaam))\b/i,   // "can board bus"
    /\b(?:bus\s+(?:enna|eppazha|eppala))\b/i,             // "when is bus" (casual)
    /\b(?:bus\s+ille)\b/i,                                // "isn't there bus?"
    /\b(?:bus\s+ticket)\b/i,                              // "bus ticket"
    /\b(?:bus\s+(?:purappedum|purappedum\s+samayam))\b/i, // "bus departure"
];

// ─── Result Types ───────────────────────────────────────────────────────────

export interface BusResult {
    success: boolean;
    needsPlace: boolean;  // True when we need to ask which place
    message: string;
}

// ─── Intent Detection ───────────────────────────────────────────────────────

/**
 * Detects if the user input is a bus-related query
 */
export function isBusIntent(text: string): boolean {
    if (!text || !text.trim()) return false;

    const allPatterns = [
        ...BUS_PATTERNS_EN,
        ...BUS_PATTERNS_ML,
        ...BUS_PATTERNS_MANGLISH,
    ];

    return allPatterns.some((pattern) => pattern.test(text));
}

// ─── Place Extraction ───────────────────────────────────────────────────────

/**
 * Strips common bus-related keywords from text to isolate the place name.
 * Handles English, Malayalam, and Manglish keywords.
 */
function stripBusKeywords(text: string): string {
    let cleaned = text.toLowerCase();

    // Strip English bus keywords
    cleaned = cleaned.replace(/\b(?:college|bus|route|timing|time|fare|fee|from|to|available|stop|schedule|number|no|detail|details|what|is|the|does|go|via|about|tell|me|show|how|much|charge|which|any|get|can|i|at|for)\b/gi, '');

    // Strip Manglish bus keywords
    cleaned = cleaned.replace(/\b(?:evide|eppol|eppo|samayam|ethra|undo|und|undu|undoo|kittum|kittumo|ninnu|ninn|pokum|pokuo|pokunna|vila|vilayethra|engane|enthanu|enth)\b/gi, '');

    // Strip Malayalam bus keywords
    cleaned = cleaned.replace(/(?:ബസ്സ്|ബസ്|കോളേജ്|സമയം|ചാർജ്|റൂട്ട്|ഉണ്ടോ|എവിടെ|എപ്പോൾ|എത്ര|എങ്ങനെ|നിന്ന്|നിന്നും|ലേക്ക്|ടൈം|ഫെയർ|കിട്ടുമോ|എന്താണ്|പോകും|പോകുന്ന)/g, '');

    // Clean up
    cleaned = cleaned
        .replace(/[?.,!:;'"]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    return cleaned;
}

/**
 * Attempts to extract a place name from the user query.
 * Returns the place string or null if no meaningful place found.
 */
export function extractPlace(text: string): string | null {
    const stripped = stripBusKeywords(text);
    if (!stripped || stripped.length < 2) return null;
    return stripped;
}

// ─── Response Generation ────────────────────────────────────────────────────

/**
 * Detects if the query text contains Malayalam script
 */
function hasMalayalam(text: string): boolean {
    return /[\u0D00-\u0D7F]/.test(text);
}

/**
 * Main bus query handler. Follows the strict rules:
 * 1. No place mentioned → ask for place
 * 2. Valid place → return route, time, fare, arrival
 * 3. Invalid place → say not available, show all stops
 */
export function getBusResponse(text: string): BusResult {
    const isMalayalamQuery = hasMalayalam(text);

    // Try to extract a place from the query
    const place = extractPlace(text);

    // If no place mentioned, ask for it
    if (!place) {
        const askMessage = isMalayalamQuery
            ? '🚌 നിങ്ങൾ ഏത് സ്ഥലത്ത് നിന്നാണ് യാത്ര ചെയ്യുന്നത്? കോളേജ് ബസ് ലഭ്യമാണോ, സമയം, ചാർജ് എന്നിവ ഞാൻ പരിശോധിക്കാം.\n\n' +
            '**ബസ് റൂട്ടുകൾ:**\n' +
            getBusRouteSummary()
            : '🚌 Which place are you traveling from? I can check whether the college bus is available, along with the pickup time and fare.\n\n' +
            '**Bus Routes:**\n' +
            getBusRouteSummary();

        return {
            success: true,
            needsPlace: true,
            message: askMessage,
        };
    }

    // Try to find the stop
    const result = findStop(place);

    if (result) {
        const { stop, route } = result;
        const successMessage = isMalayalamQuery
            ? `✅ **${stop.name}** -ൽ നിന്ന് കോളേജ് ബസ് ലഭ്യമാണ്.\n\n` +
            `🗺️ റൂട്ട്: **${route.side} സൈഡ്**\n` +
            `⏰ പിക്കപ്പ് സമയം: **${stop.time}**\n` +
            `💰 സ്റ്റുഡന്റ് ഫെയർ: **${formatFare(stop.fare)}**\n` +
            `🏫 കോളേജിൽ എത്തുന്ന സമയം: **${COLLEGE_ARRIVAL_TIME}**`
            : `✅ College bus is available from **${stop.name}**.\n\n` +
            `🗺️ Route: **${route.side} side**\n` +
            `⏰ Pickup time: **${stop.time}**\n` +
            `💰 Student fare: **${formatFare(stop.fare)}**\n` +
            `🏫 Arrival at college: **${COLLEGE_ARRIVAL_TIME}**`;

        return {
            success: true,
            needsPlace: false,
            message: successMessage,
        };
    }

    // Place not found — show all valid stops
    const allStops = getAllStopNames();
    const failMessage = isMalayalamQuery
        ? `❌ **${place}** -ൽ നിന്ന് കോളേജ് ബസ് ലഭ്യമല്ല.\n\n` +
        `**നിലേശ്വരം സൈഡ് സ്റ്റോപ്പുകൾ:**\n${allStops.nileshwaram.map((s) => `• ${s}`).join('\n')}\n\n` +
        `**കാസർഗോഡ് സൈഡ് സ്റ്റോപ്പുകൾ:**\n${allStops.kasaragod.map((s) => `• ${s}`).join('\n')}\n\n` +
        `ദയവായി ഈ സ്ഥലങ്ങളിൽ ഒന്ന് പരീക്ഷിക്കുക.`
        : `❌ College bus is not available from **${place}**.\n\n` +
        `**Nileshwaram side stops:**\n${allStops.nileshwaram.map((s) => `• ${s}`).join('\n')}\n\n` +
        `**Kasaragod side stops:**\n${allStops.kasaragod.map((s) => `• ${s}`).join('\n')}\n\n` +
        `Please try one of these places.`;

    return {
        success: false,
        needsPlace: false,
        message: failMessage,
    };
}
