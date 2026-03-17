// College bus route data: stops, times, fares for Nileshwaram and Kasaragod sides
// All buses arrive at college at 9:15 AM

export interface BusStop {
    name: string;
    aliases: string[];   // Lowercase variants, Malayalam, Manglish
    time: string;        // Pickup time (e.g. "8:00 AM")
    fare: number;        // Student fare in ₹
}

export interface BusRoute {
    id: string;
    side: string;        // "Nileshwaram" or "Kasaragod"
    busNumbers: number[];
    stops: BusStop[];
}

export const COLLEGE_ARRIVAL_TIME = '9:15 AM';

// ─── Bus Number → Route Mapping ─────────────────────────────────────────────

export const busNumberRoutes: Record<number, string> = {
    1: 'Melparamba',
    2: 'Kanhangad',
    3: 'Kasaragod',
    4: 'Periya',
    5: 'Pallikkara',
    6: 'Nileshwaram',
};

// ─── Nileshwaram Side (Bus No. 6) ───────────────────────────────────────────

const nileshwaramStops: BusStop[] = [
    {
        name: 'Nileshwaram',
        aliases: [
            // English
            'nileshwaram', 'nileshwar', 'neeleshwaram', 'nileshwaram junction',
            // Malayalam
            'നിലേശ്വരം', 'നിലേശ്വർ',
            // Manglish
            'nileshwaram', 'neeleshwaram', 'nileshwar',
        ],
        time: '8:00 AM',
        fare: 20120,
    },
    {
        name: 'Padannakkad',
        aliases: [
            'padannakkad', 'padannakad', 'padanakkad',
            'പടന്നക്കാട്', 'പടന്നക്കാട',
            'padannakkad', 'padanakkad',
        ],
        time: '8:05 AM',
        fare: 17910,
    },
    {
        name: 'Kanhangad South',
        aliases: [
            'kanhangad south', 'kanhangad south junction',
            'കണ്ണങ്ങാട് സൗത്ത്', 'കണ്ണങ്ങാട് തെക്ക്',
            'kanhangad south', 'kannangad south',
        ],
        time: '8:10 AM',
        fare: 16890,
    },
    {
        name: 'Kanhangad New Bus Stand',
        aliases: [
            'kanhangad new bus stand', 'new bus stand', 'kanhangad new stand',
            'കണ്ണങ്ങാട് ന്യൂ ബസ് സ്റ്റാൻഡ്', 'പുതിയ ബസ് സ്റ്റാൻഡ്',
            'kanhangad new bus stand', 'new bus stand kanhangad',
        ],
        time: '8:12 AM',
        fare: 16240,
    },
    {
        name: 'Kanhangad Bus Stand',
        aliases: [
            'kanhangad bus stand', 'kanhangad stand', 'kanhangad',
            'കണ്ണങ്ങാട്', 'കണ്ണങ്ങാട് ബസ് സ്റ്റാൻഡ്',
            'kanhangad', 'kannangad', 'kanhangad bus stand',
        ],
        time: '8:15 AM',
        fare: 15690,
    },
    {
        name: 'Mavungal',
        aliases: [
            'mavungal', 'mavunkal',
            'മാവുങ്ങൽ', 'മാവുങ്കൽ',
            'mavungal', 'mavunkal',
        ],
        time: '8:25 AM',
        fare: 15230,
    },
    {
        name: 'Pullur',
        aliases: [
            'pullur', 'pulloor', 'pulur',
            'പുല്ലൂർ',
            'pullur', 'pulloor',
        ],
        time: '8:30 AM',
        fare: 14030,
    },
    {
        name: 'Chalingal',
        aliases: [
            'chalingal', 'challingal', 'chalingal junction',
            'ചാലിങ്ങൽ', 'ചാലിംഗൽ',
            'chalingal', 'challingal',
        ],
        time: '8:35 AM',
        fare: 12100,
    },
    {
        name: 'Periya',
        aliases: [
            'periya', 'periye', 'periya junction',
            'പെരിയ',
            'periya', 'periye',
        ],
        time: '8:40 AM',
        fare: 10060,
    },
    {
        name: 'Periyattadukkam',
        aliases: [
            'periyattadukkam', 'periyattadukkam junction', 'periyattadukam',
            'പെരിയട്ടടുക്കം',
            'periyattadukkam', 'periyatadukam',
        ],
        time: '8:45 AM',
        fare: 8960,
    },
    {
        name: 'Mylatty',
        aliases: [
            'mylatty', 'mylatti', 'mylatty junction', 'mylatti junction',
            'മൈലാട്ടി',
            'mylatty', 'mylatti', 'mylatty junction',
        ],
        time: '8:48 AM',
        fare: 7670,
    },
    {
        name: 'Poinachi',
        aliases: [
            'poinachi', 'poinacci', 'poinachi junction',
            'പൊയ്നാച്ചി',
            'poinachi', 'poinacci',
        ],
        time: '8:51 AM',
        fare: 7020,
    },
    {
        name: 'Chattanchal',
        aliases: [
            'chattanchal', 'chattanchaal', 'chatanchal',
            'ചട്ടഞ്ചാൽ',
            'chattanchal', 'chatanchal',
        ],
        time: '8:55 AM',
        fare: 6540,
    },
    {
        name: 'Bevinja',
        aliases: [
            'bevinja', 'bevinji', 'bevinja junction',
            'ബേവിഞ്ച', 'ബേവിഞ്ചാ',
            'bevinja', 'bevinji',
        ],
        time: '9:00 AM',
        fare: 5000,
    },
    {
        name: 'Cherkala',
        aliases: [
            'cherkala', 'cherkkala', 'cherkala junction',
            'ചെർക്കള', 'ചെര്‍ക്കള',
            'cherkala', 'cherkkala',
        ],
        time: '9:05 AM',
        fare: 3420,
    },
];

// ─── Kasaragod Side (Bus No. 3) ─────────────────────────────────────────────

const kasaragodStops: BusStop[] = [
    {
        name: 'Pallikkara',
        aliases: [
            'pallikkara', 'pallikara', 'pallikkere', 'pallikkara junction',
            'പള്ളിക്കര', 'പള്ളിക്കാര',
            'pallikkara', 'pallikara', 'pallikere',
        ],
        time: '8:10 AM',
        fare: 11910,
    },
    {
        name: 'Bekal',
        aliases: [
            'bekal', 'bekal fort', 'bekal junction',
            'ബേക്കൽ', 'ബേക്കൽ കോട്ട',
            'bekal', 'bekkal',
        ],
        time: '8:15 AM',
        fare: 11180,
    },
    {
        name: 'Palakkunnu',
        aliases: [
            'palakkunnu', 'palakunnu', 'palakkunnu junction',
            'പാലക്കുന്ന്', 'പാലക്കുന്ന്',
            'palakkunnu', 'palakunnu',
        ],
        time: '8:20 AM',
        fare: 10530,
    },
    {
        name: 'Uduma',
        aliases: [
            'uduma', 'udhuma', 'uduma junction',
            'ഉദുമ', 'ഉധുമ',
            'uduma', 'udhuma',
        ],
        time: '8:25 AM',
        fare: 10060,
    },
    {
        name: 'Kalanadu',
        aliases: [
            'kalanadu', 'kalanad', 'kalanadu junction',
            'കാളനാട്', 'കളനാട്',
            'kalanadu', 'kalanad', 'kalanadu',
        ],
        time: '8:30 AM',
        fare: 9420,
    },
    {
        name: 'Melparamba',
        aliases: [
            'melparamba', 'mel paramba', 'melparamba junction',
            'മേൽപറമ്പ', 'മേല്‍പറമ്പ',
            'melparamba', 'mel paramba',
        ],
        time: '8:35 AM',
        fare: 8960,
    },
    {
        name: 'Chaliyangode',
        aliases: [
            'chaliyangode', 'chaliangode', 'chaliyangode junction',
            'ചാലിയംകോട്', 'ചാലിയങ്കോട്',
            'chaliyangode', 'chaliangode',
        ],
        time: '8:40 AM',
        fare: 8580,
    },
    {
        name: 'Chemnad',
        aliases: [
            'chemnad', 'chemmad', 'chemmanad', 'chemnad junction',
            'ചെമ്മനാട്', 'ചെമ്മാട്',
            'chemnad', 'chemmad', 'chemmanad',
        ],
        time: '8:45 AM',
        fare: 8500,
    },
    {
        name: 'Kasaragod',
        aliases: [
            'kasaragod', 'kasarkod', 'kasaragode', 'kasaragod town',
            'കാസർകോട്', 'കാസർഗോഡ്', 'കാസറഗോഡ്',
            'kasaragod', 'kasarkod', 'kasargod',
        ],
        time: '8:50 AM',
        fare: 8400,
    },
    {
        name: 'Vidya Nagar',
        aliases: [
            'vidya nagar', 'vidyanagar', 'vidya nagar junction',
            'വിദ്യാനഗർ', 'വിദ്യാ നഗർ',
            'vidyanagar', 'vidya nagar',
        ],
        time: '8:55 AM',
        fare: 5630,
    },
    {
        name: 'Nalam Mile',
        aliases: [
            'nalam mile', 'nalammile', '4th mile', 'fourth mile', 'nalam mail',
            'നാലാം മൈൽ', 'നാലാം മൈല്‍',
            'nalam mile', 'nalaam mile', '4th mile',
        ],
        time: '9:00 AM',
        fare: 4530,
    },
    {
        name: 'Cherkala',
        aliases: [
            'cherkala', 'cherkkala', 'cherkala junction',
            'ചെർക്കള', 'ചെര്‍ക്കള',
            'cherkala', 'cherkkala',
        ],
        time: '9:05 AM',
        fare: 3420,
    },
];

// ─── Route Objects ──────────────────────────────────────────────────────────

export const busRoutes: BusRoute[] = [
    {
        id: 'nileshwaram',
        side: 'Nileshwaram',
        busNumbers: [6, 2, 4],
        stops: nileshwaramStops,
    },
    {
        id: 'kasaragod',
        side: 'Kasaragod',
        busNumbers: [3, 1, 5],
        stops: kasaragodStops,
    },
];

// ─── Lookup Helpers ─────────────────────────────────────────────────────────

/**
 * Normalize text for matching: lowercase, trim, collapse whitespace
 */
function normalize(text: string): string {
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Find a bus stop by place name (checks aliases across all routes).
 * Returns the stop + route info, or null if not found.
 */
export function findStop(place: string): { stop: BusStop; route: BusRoute } | null {
    const normalizedPlace = normalize(place);

    // Try each route, longest alias first for accuracy
    for (const route of busRoutes) {
        for (const stop of route.stops) {
            for (const alias of [normalize(stop.name), ...stop.aliases.map(normalize)]) {
                if (normalizedPlace.includes(alias) || alias.includes(normalizedPlace)) {
                    return { stop, route };
                }
            }
        }
    }

    return null;
}

/**
 * Get all valid stop names for display purposes
 */
export function getAllStopNames(): { nileshwaram: string[]; kasaragod: string[] } {
    return {
        nileshwaram: nileshwaramStops.map((s) => s.name),
        kasaragod: kasaragodStops.map((s) => s.name),
    };
}

/**
 * Format fare as Indian Rupees string
 */
export function formatFare(fare: number): string {
    return `₹${fare.toLocaleString('en-IN')}`;
}

/**
 * Get all bus routes summary (bus number → route name)
 */
export function getBusRouteSummary(): string {
    return Object.entries(busNumberRoutes)
        .map(([num, route]) => `Bus No. ${num} → ${route}`)
        .join('\n');
}
