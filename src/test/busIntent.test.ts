import { describe, it, expect } from 'vitest';
import { isBusIntent, extractPlace, getBusResponse } from '../lib/busIntent';

// ─── Intent Detection ───────────────────────────────────────────────────────

describe('isBusIntent', () => {
    it('detects English bus intents', () => {
        expect(isBusIntent('college bus')).toBe(true);
        expect(isBusIntent('bus route')).toBe(true);
        expect(isBusIntent('bus timing')).toBe(true);
        expect(isBusIntent('bus fare')).toBe(true);
        expect(isBusIntent('bus from Mylatty')).toBe(true);
        expect(isBusIntent('which bus goes to college')).toBe(true);
        expect(isBusIntent('bus available from Periya?')).toBe(true);
    });

    it('detects Malayalam bus intents', () => {
        expect(isBusIntent('കോളേജ് ബസ്')).toBe(true);
        expect(isBusIntent('ബസ് സമയം')).toBe(true);
        expect(isBusIntent('ബസ് ചാർജ്')).toBe(true);
    });

    it('detects Manglish bus intents', () => {
        expect(isBusIntent('college bus evide')).toBe(true);
        expect(isBusIntent('bus time eppol')).toBe(true);
        expect(isBusIntent('bus charge ethra')).toBe(true);
    });

    it('rejects non-bus queries', () => {
        expect(isBusIntent('Who is the principal?')).toBe(false);
        expect(isBusIntent('How do I reach the canteen?')).toBe(false);
        expect(isBusIntent('Tell me about placement stats')).toBe(false);
        expect(isBusIntent('')).toBe(false);
    });
});

// ─── Place Extraction ───────────────────────────────────────────────────────

describe('extractPlace', () => {
    it('extracts place from bus queries', () => {
        expect(extractPlace('bus from Mylatty')).toBe('mylatty');
        expect(extractPlace('bus fare from Periya')).toBe('periya');
    });

    it('returns null for generic bus queries without place', () => {
        expect(extractPlace('college bus')).toBeNull();
        expect(extractPlace('bus route')).toBeNull();
    });
});

// ─── Response Generation ────────────────────────────────────────────────────

describe('getBusResponse', () => {
    it('asks for place when no place is mentioned', () => {
        const result = getBusResponse('college bus');
        expect(result.needsPlace).toBe(true);
        expect(result.message).toContain('Which place');
    });

    it('returns bus info for a valid Nileshwaram side stop', () => {
        const result = getBusResponse('bus from Mylatty');
        expect(result.success).toBe(true);
        expect(result.needsPlace).toBe(false);
        expect(result.message).toContain('Mylatty');
        expect(result.message).toContain('Nileshwaram');
        expect(result.message).toContain('8:48 AM');
        expect(result.message).toContain('7,670');
        expect(result.message).toContain('9:15 AM');
    });

    it('returns bus info for a valid Kasaragod side stop', () => {
        const result = getBusResponse('bus from Kasaragod');
        expect(result.success).toBe(true);
        expect(result.message).toContain('Kasaragod');
        expect(result.message).toContain('8:50 AM');
        expect(result.message).toContain('8,400');
    });

    it('returns bus info for Cherkala (common junction)', () => {
        const result = getBusResponse('bus from Cherkala');
        expect(result.success).toBe(true);
        expect(result.message).toContain('Cherkala');
        expect(result.message).toContain('9:05 AM');
        expect(result.message).toContain('3,420');
    });

    it('returns error for unknown places', () => {
        const result = getBusResponse('bus from Mangalore');
        expect(result.success).toBe(false);
        expect(result.message).toContain('not available');
        expect(result.message).toContain('Nileshwaram side');
        expect(result.message).toContain('Kasaragod side');
    });

    it('returns bus info for Periya', () => {
        const result = getBusResponse('bus from Periya');
        expect(result.success).toBe(true);
        expect(result.message).toContain('Periya');
        expect(result.message).toContain('Nileshwaram');
        expect(result.message).toContain('8:40 AM');
        expect(result.message).toContain('10,060');
    });
});
