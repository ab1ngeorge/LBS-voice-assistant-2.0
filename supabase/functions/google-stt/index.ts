import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { decode as base64Decode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Map voice language mode to Sarvam language code
const LANGUAGE_MAP: Record<string, string> = {
    'ml-IN': 'ml-IN',
    'en-IN-manglish': 'ml-IN',  // Use Malayalam — Sarvam handles code-mixing automatically
    'en-IN': 'en-IN',
};

const STTInputSchema = z.object({
    audioBase64: z.string().min(1, 'Audio data is required'),
    language: z.string().default('ml-IN'),
});

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const rawBody = await req.json();
        const parseResult = STTInputSchema.safeParse(rawBody);

        if (!parseResult.success) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: 'Invalid input',
                    details: parseResult.error.errors.map(e => e.message),
                }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const { audioBase64, language } = parseResult.data;

        const SARVAM_API_KEY = Deno.env.get('SARVAM_API_KEY');
        if (!SARVAM_API_KEY) {
            console.error('SARVAM_API_KEY not configured');
            return new Response(
                JSON.stringify({ success: false, error: 'Sarvam AI not configured' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const langCode = LANGUAGE_MAP[language] || 'ml-IN';
        console.log(`STT request: language mode=${language}, sarvam lang=${langCode}`);

        // Decode base64 audio to binary
        const audioBytes = base64Decode(audioBase64);

        // Build multipart/form-data request for Sarvam STT
        const formData = new FormData();
        const audioBlob = new Blob([audioBytes], { type: 'audio/webm' });
        formData.append('file', audioBlob, 'audio.webm');
        formData.append('model', 'saaras:v3');
        formData.append('language_code', langCode);

        const response = await fetch('https://api.sarvam.ai/speech-to-text', {
            method: 'POST',
            headers: {
                'api-subscription-key': SARVAM_API_KEY,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Sarvam STT API error:', response.status, errorText);
            return new Response(
                JSON.stringify({ success: false, error: 'STT service error', details: errorText }),
                { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const result = await response.json();

        const transcript = result.transcript || '';
        const languageCode = result.language_code || langCode;

        console.log(`STT result: "${transcript}" (lang: ${languageCode})`);

        return new Response(
            JSON.stringify({
                success: true,
                transcript,
                detectedLanguage: languageCode,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        console.error('STT error:', error);
        return new Response(
            JSON.stringify({ success: false, error: 'An error occurred processing your request' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
