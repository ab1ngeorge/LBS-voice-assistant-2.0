import { describe, it, expect } from 'vitest';
import { isWebsiteIntent, getWebsiteResponse } from '../lib/websiteIntent';

describe('isWebsiteIntent', () => {
    it('detects English website intents', () => {
        expect(isWebsiteIntent('open the college website')).toBe(true);
        expect(isWebsiteIntent('visit the alumni page')).toBe(true);
        expect(isWebsiteIntent('show me the admission website')).toBe(true);
        expect(isWebsiteIntent('what is the link for fee structure')).toBe(true);
        expect(isWebsiteIntent('give me the grievance cell link')).toBe(true);
        expect(isWebsiteIntent('open cse department page')).toBe(true);
    });

    it('detects Malayalam website intents', () => {
        expect(isWebsiteIntent('വെബ്സൈറ്റ് തുറക്കൂ')).toBe(true);
        expect(isWebsiteIntent('ലിങ്ക് തരൂ')).toBe(true);
    });

    it('detects Manglish website intents', () => {
        expect(isWebsiteIntent('website thura')).toBe(true);
        expect(isWebsiteIntent('link thaa admission')).toBe(true);
        expect(isWebsiteIntent('open alumni page')).toBe(true);
    });

    it('rejects non-website queries', () => {
        expect(isWebsiteIntent('Who is the principal?')).toBe(false);
        expect(isWebsiteIntent('How do I reach the canteen?')).toBe(false);
        expect(isWebsiteIntent('What are the bus timings?')).toBe(false);
        expect(isWebsiteIntent('')).toBe(false);
    });
});

describe('getWebsiteResponse', () => {
    it('returns correct URL for specific pages', () => {
        const result = getWebsiteResponse('open the grievance cell page');
        expect(result.success).toBe(true);
        expect(result.url).toBe('https://lbscek.ac.in/grievance-cell/');
    });

    it('returns correct URL for department pages', () => {
        const result = getWebsiteResponse('show cse department website');
        expect(result.success).toBe(true);
        expect(result.url).toBe('https://lbscek.ac.in/computer-science-engineering-2/');
    });

    it('returns correct URL for admission page', () => {
        const result = getWebsiteResponse('visit admission process page');
        expect(result.success).toBe(true);
        expect(result.url).toBe('https://lbscek.ac.in/admission-procedure/');
    });

    it('returns correct URL for alumni page', () => {
        const result = getWebsiteResponse('open alumni association link');
        expect(result.success).toBe(true);
        expect(result.url).toBe('https://lbscek.ac.in/alumni-association/');
    });

    it('falls back to homepage for generic website queries', () => {
        const result = getWebsiteResponse('open website');
        expect(result.success).toBe(true);
        expect(result.url).toBe('https://lbscek.ac.in/');
    });

    it('handles empty input', () => {
        const result = getWebsiteResponse('');
        expect(result.success).toBe(false);
    });
});
