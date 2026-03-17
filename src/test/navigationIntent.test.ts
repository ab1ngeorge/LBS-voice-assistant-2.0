import { describe, it, expect } from 'vitest';
import {
    isNavigationIntent,
    resolveDestination,
    buildGoogleMapsUrl,
    getNavigationResponse,
} from '../lib/navigationIntent';
import { CampusLocation } from '../lib/campusLocations';

// ─── Intent Detection ───────────────────────────────────────────────────────

describe('isNavigationIntent', () => {
    it('detects English navigation intents', () => {
        expect(isNavigationIntent('How do I reach the canteen?')).toBe(true);
        expect(isNavigationIntent('Navigate to library')).toBe(true);
        expect(isNavigationIntent('Route to CSE department')).toBe(true);
        expect(isNavigationIntent('Where is the ATM?')).toBe(true);
        expect(isNavigationIntent('Take me to the auditorium')).toBe(true);
        expect(isNavigationIntent('Show me the way to hostel')).toBe(true);
        expect(isNavigationIntent('Directions to the ground')).toBe(true);
        expect(isNavigationIntent('Location of the workshop')).toBe(true);
        expect(isNavigationIntent('Go to the canteen')).toBe(true);
    });

    it('detects Malayalam navigation intents', () => {
        expect(isNavigationIntent('കാന്റീൻ എവിടെ?')).toBe(true);
        expect(isNavigationIntent('ലൈബ്രറിയിലേക്ക് എങ്ങനെ പോകും?')).toBe(true);
        expect(isNavigationIntent('ATM ലേക്ക് വഴി?')).toBe(true);
    });

    it('detects Manglish navigation intents', () => {
        expect(isNavigationIntent('canteen evide?')).toBe(true);
        expect(isNavigationIntent('library engane ponum?')).toBe(true);
        expect(isNavigationIntent('ATM vazhi evide?')).toBe(true);
    });

    it('rejects non-navigation queries', () => {
        expect(isNavigationIntent('Who is the principal?')).toBe(false);
        expect(isNavigationIntent('What are the bus timings?')).toBe(false);
        expect(isNavigationIntent('Tell me about placement stats')).toBe(false);
        expect(isNavigationIntent('')).toBe(false);
    });
});

// ─── Destination Resolution ─────────────────────────────────────────────────

describe('resolveDestination', () => {
    it('resolves exact location names', () => {
        const result = resolveDestination('How do I reach the canteen?');
        expect(result).not.toBeNull();
        expect(result!.id).toBe('canteen');
    });

    it('resolves alias matches', () => {
        const result = resolveDestination('Take me to the boys hostel');
        expect(result).not.toBeNull();
        expect(result!.id).toBe('mens_hostel');
    });

    it('resolves department abbreviations', () => {
        const result = resolveDestination('Where is CSE?');
        expect(result).not.toBeNull();
        expect(result!.id).toBe('cse_dept');
    });

    it('resolves LBS College as main entrance', () => {
        const result = resolveDestination('Route to LBS College');
        expect(result).not.toBeNull();
        expect(result!.id).toBe('main_entrance');
        expect(result!.travelMode).toBe('driving');
    });

    it('returns null for unrecognized locations', () => {
        const result = resolveDestination('Take me to a random shop');
        expect(result).toBeNull();
    });

    it('returns null for empty text', () => {
        const result = resolveDestination('');
        expect(result).toBeNull();
    });
});

// ─── Google Maps URL Builder ────────────────────────────────────────────────

describe('buildGoogleMapsUrl', () => {
    const origin = { lat: 12.5001, lng: 75.0070 };

    it('builds a walking mode URL for internal locations', () => {
        const destination: CampusLocation = {
            id: 'canteen',
            name: 'College Canteen',
            aliases: ['canteen'],
            mapsLink: 'https://maps.app.goo.gl/rCmEM7mRmDZ5aGzx8',
            travelMode: 'walking',
        };

        const url = buildGoogleMapsUrl(origin, destination);
        expect(url).toContain('travelmode=walking');
        expect(url).toContain('origin=12.5001%2C75.007');
        expect(url).toContain('College+Canteen');
        expect(url).toContain('https://www.google.com/maps/dir/');
    });

    it('builds a driving mode URL for main entrance', () => {
        const destination: CampusLocation = {
            id: 'main_entrance',
            name: 'LBS College of Engineering (Main Entrance)',
            aliases: ['lbs college'],
            mapsLink: 'https://maps.app.goo.gl/MgJURkMksGx7neiZ8',
            travelMode: 'driving',
        };

        const url = buildGoogleMapsUrl(origin, destination);
        expect(url).toContain('travelmode=driving');
    });
});

// ─── Full Navigation Flow ───────────────────────────────────────────────────

describe('getNavigationResponse', () => {
    it('returns error when GPS is unavailable', () => {
        const result = getNavigationResponse('How to reach the canteen?', null);
        expect(result.success).toBe(false);
        expect(result.message).toContain('location');
    });

    it('returns error for unknown destinations', () => {
        const result = getNavigationResponse(
            'Take me to a random place outside',
            { lat: 12.5001, lng: 75.0070 }
        );
        expect(result.success).toBe(false);
        expect(result.message).toContain("couldn't find");
    });

    it('returns success with URL for valid navigation', () => {
        const result = getNavigationResponse(
            'How do I reach the canteen?',
            { lat: 12.5001, lng: 75.0070 }
        );
        expect(result.success).toBe(true);
        expect(result.url).toBeDefined();
        expect(result.url).toContain('travelmode=walking');
        expect(result.destination).toBeDefined();
        expect(result.destination!.id).toBe('canteen');
    });

    it('uses driving mode for LBS College main entrance', () => {
        const result = getNavigationResponse(
            'Route to LBS College',
            { lat: 12.5001, lng: 75.0070 }
        );
        expect(result.success).toBe(true);
        expect(result.url).toContain('travelmode=driving');
    });
});
