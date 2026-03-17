import { supabase } from '@/integrations/supabase/client';
import { DetectedLanguage } from './languageDetection';
import { ConversationMemory } from './conversationMemory';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export const lbsBotApi = {
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
  }
};
