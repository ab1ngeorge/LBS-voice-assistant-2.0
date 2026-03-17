import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts'
import { encode as base64Encode } from "https://deno.land/std@0.168.0/encoding/base64.ts";

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

    console.log('Converting text to speech:', text.slice(0, 50) + '...');

    // Use streaming endpoint with bulbul:v3 model
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

    // Collect all chunks from streaming response
    const chunks: Uint8Array[] = [];
    const reader = response.body?.getReader();
    
    if (!reader) {
      return new Response(
        JSON.stringify({ success: false, error: 'No response body' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Combine chunks into single buffer
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const audioBuffer = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      audioBuffer.set(chunk, offset);
      offset += chunk.length;
    }

    // Encode to base64 for client
    const audioBase64 = base64Encode(audioBuffer.buffer);

    console.log('TTS successful, audio generated:', totalLength, 'bytes');

    return new Response(
      JSON.stringify({ 
        success: true, 
        audioBase64: audioBase64,
        format: 'mp3'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('TTS error:', error);
    return new Response(
      JSON.stringify({ success: false, error: 'An error occurred processing your request' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
