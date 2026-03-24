import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// Valid speakers for bulbul:v3 model
const VALID_SPEAKERS = ['aditya', 'ritu', 'ashutosh', 'priya', 'neha', 'rahul', 'pooja', 'rohan', 'simran', 'kavya', 'amit', 'dev', 'ishita', 'shreya', 'ratan', 'varun', 'manan', 'sumit', 'roopa', 'kabir', 'aayan', 'shubh', 'advait', 'amelia', 'sophia', 'anand', 'tanya', 'tarun', 'sunny', 'mani', 'gokul', 'vijay', 'shruti', 'suhani', 'mohit', 'kavitha', 'rehan', 'soham', 'rupali'] as const;

const TTSInputSchema = z.object({
  text: z.string().min(1, 'Text is required').max(500, 'Text too long (max 500 characters)'),
  speaker: z.enum(VALID_SPEAKERS).default('shubh'),
  pace: z.number().min(0.5).max(2.0).default(1.1)
});

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Input validation
    const rawBody = await req.json();
    const parseResult = TTSInputSchema.safeParse(rawBody);
    
    if (!parseResult.success) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid input', 
          details: parseResult.error.errors.map(e => e.message) 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { text, speaker, pace } = parseResult.data;

    const SARVAM_API_KEY = Deno.env.get('SARVAM_API_KEY');
    if (!SARVAM_API_KEY) {
      console.error('SARVAM_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Sarvam AI not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Streaming TTS:', text.slice(0, 50) + '...');

    // Call Sarvam streaming endpoint
    const response = await fetch('https://api.sarvam.ai/text-to-speech/stream', {
      method: 'POST',
      headers: {
        'api-subscription-key': SARVAM_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: text,
        target_language_code: 'ml-IN',
        speaker: speaker,
        model: 'bulbul:v3',
        pace: pace,
        speech_sample_rate: 22050,
        temperature: 0.6,
        output_audio_codec: 'mp3',
        enable_preprocessing: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Sarvam API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ success: false, error: 'TTS service error', details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!response.body) {
      return new Response(
        JSON.stringify({ success: false, error: 'No response body from Sarvam' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Stream the MP3 audio directly through to the client
    // The edge function acts as a secure proxy — API key stays server-side
    console.log('Proxying MP3 stream to client...');

    return new Response(response.body, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('TTS error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
