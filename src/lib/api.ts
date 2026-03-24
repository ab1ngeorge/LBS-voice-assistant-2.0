import { supabase } from '@/integrations/supabase/client';
import { DetectedLanguage } from './languageDetection';
import { ConversationMemory } from './conversationMemory';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AnalyticsData {
  totalQueries: number;
  avgResponseTimeMs: number;
  topLanguage: string;
  answeredRate: number;
}

export const lbsBotApi = {
  /**
   * Streaming chat — calls the edge function via raw fetch to get SSE chunks.
   * onChunk is called for each token as it arrives.
   * Returns the full completed text.
   */
  async chatStream(
    message: string,
    conversationHistory: ChatMessage[] = [],
    language?: DetectedLanguage,
    memory?: ConversationMemory,
    onChunk?: (text: string) => void,
  ): Promise<{ success: boolean; message?: string; error?: string; rateLimited?: boolean }> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/lbs-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseKey}`,
          'apikey': supabaseKey,
        },
        body: JSON.stringify({
          message,
          messages: conversationHistory,
          language: language || 'english',
          ...(memory && { memory }),
        }),
      });

      // If the response is JSON (error or rate limit), handle it
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await response.json();
        return data;
      }

      // SSE stream response
      if (!response.body) {
        return { success: false, error: 'No response body' };
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          try {
            const parsed = JSON.parse(trimmed.slice(6));

            if (parsed.type === 'chunk' && parsed.text) {
              fullText += parsed.text;
              onChunk?.(parsed.text);
            } else if (parsed.type === 'done') {
              fullText = parsed.fullText || fullText;
            } else if (parsed.type === 'error') {
              return { success: false, error: parsed.message };
            }
          } catch {
            // Skip malformed SSE lines
          }
        }
      }

      return { success: true, message: fullText };
    } catch (error) {
      console.error('Chat stream error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to LBS Bot',
      };
    }
  },

  /** Legacy non-streaming chat (kept for backward compatibility / offline fallback) */
  async chat(message: string, conversationHistory: ChatMessage[] = [], language?: DetectedLanguage, memory?: ConversationMemory): Promise<{ success: boolean; message?: string; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('lbs-chat', {
        body: {
          message,
          messages: conversationHistory,
          language: language || 'english',
          ...(memory && { memory }),
        },
      });

      if (error) {
        console.error('Chat function error:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Chat API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to connect to LBS Bot'
      };
    }
  },

  /**
   * Streaming TTS — calls edge function and returns the raw Response
   * with audio/mpeg body that can be piped to MediaSource for real-time playback.
   */
  async textToSpeechStream(text: string, speaker: string = 'shubh'): Promise<Response> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const truncatedText = text.slice(0, 500);

    const response = await fetch(`${supabaseUrl}/functions/v1/sarvam-tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey,
      },
      body: JSON.stringify({
        text: truncatedText,
        speaker,
        pace: 1.0,
      }),
    });

    if (!response.ok) {
      // Try to parse error JSON
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(errorData.error || `TTS failed: ${response.status}`);
      }
      throw new Error(`TTS failed: ${response.status}`);
    }

    return response;
  },

  /** Legacy non-streaming TTS (kept for backward compatibility) */
  async textToSpeech(text: string, speaker: string = 'shubh'): Promise<{ success: boolean; audioBase64?: string; error?: string }> {
    try {
      // Truncate text to 500 chars max for Sarvam API
      const truncatedText = text.slice(0, 500);

      const { data, error } = await supabase.functions.invoke('sarvam-tts', {
        body: {
          text: truncatedText,
          speaker,
          pace: 1.0
        },
      });

      if (error) {
        console.error('TTS function error:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('TTS API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate speech'
      };
    }
  },

  async speechToText(audioBase64: string, language: string = 'ml-IN'): Promise<{ success: boolean; transcript?: string; confidence?: number; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('google-stt', {
        body: {
          audioBase64,
          language,
        },
      });

      if (error) {
        console.error('STT function error:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('STT API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to transcribe speech'
      };
    }
  },

  async scrapeCollege(): Promise<{ success: boolean; content?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('scrape-college');

      if (error) {
        console.error('Scrape function error:', error);
        return { success: false, error: error.message };
      }

      return data;
    } catch (error) {
      console.error('Scrape API error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to scrape college website'
      };
    }
  },

  /** Fetch aggregated usage analytics from chat_analytics table */
  async getAnalytics(): Promise<AnalyticsData> {
    const defaults: AnalyticsData = {
      totalQueries: 0,
      avgResponseTimeMs: 0,
      topLanguage: 'english',
      answeredRate: 100,
    };

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

      // Get today's start in ISO format
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const response = await fetch(
        `${supabaseUrl}/rest/v1/chat_analytics?created_at=gte.${todayStart.toISOString()}&select=detected_language,response_time_ms,was_answered`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      if (!response.ok) return defaults;

      const rows: Array<{ detected_language: string; response_time_ms: number | null; was_answered: boolean | null }> = await response.json();

      if (!rows || rows.length === 0) return defaults;

      const totalQueries = rows.length;
      const avgResponseTimeMs = Math.round(
        rows.reduce((sum, r) => sum + (r.response_time_ms || 0), 0) / totalQueries
      );
      const answeredCount = rows.filter(r => r.was_answered !== false).length;
      const answeredRate = Math.round((answeredCount / totalQueries) * 100);

      // Find top language
      const langCounts: Record<string, number> = {};
      for (const row of rows) {
        const lang = row.detected_language || 'english';
        langCounts[lang] = (langCounts[lang] || 0) + 1;
      }
      const topLanguage = Object.entries(langCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'english';

      return { totalQueries, avgResponseTimeMs, topLanguage, answeredRate };
    } catch (error) {
      console.error('Analytics fetch error:', error);
      return defaults;
    }
  },
};

