import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Send } from "lucide-react";
import { Header } from "@/components/Header";
import { VoiceButton } from "@/components/VoiceButton";
import { ChatContainer } from "@/components/ChatContainer";
import { QuickActions } from "@/components/QuickActions";

import { Message } from "@/components/ChatMessage";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { lbsBotApi, ChatMessage } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { detectLanguage } from "@/lib/languageDetection";
import { isBusIntent, getBusResponse } from "@/lib/busIntent";
import { isNavigationIntent, getNavigationResponse } from "@/lib/navigationIntent";
import { isWebsiteIntent, getWebsiteResponse } from "@/lib/websiteIntent";
import { useGeolocation } from "@/hooks/useGeolocation";
import { createEmptyMemory, rewriteQuery, updateMemory } from "@/lib/conversationMemory";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { initializeCache, handleOfflineQuery } from "@/lib/offlineCache";

// Check for Web Speech API support
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export type VoiceLang = 'ml-IN' | 'en-IN-manglish' | 'en-IN';
export type VoiceGender = 'male' | 'female';

const VOICE_LANG_MAP: Record<VoiceLang, string> = {
  'ml-IN': 'Malayalam',
  'en-IN-manglish': 'Manglish',
  'en-IN': 'English',
};

const VOICE_GENDER_SPEAKER: Record<VoiceGender, string> = {
  male: 'shubh',
  female: 'simran',
};

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [inputText, setInputText] = useState("");
  const [voiceLang, setVoiceLang] = useState<VoiceLang>('ml-IN');
  const [voiceGender, setVoiceGender] = useState<VoiceGender>('male');
  const { toast } = useToast();
  const { getLocation } = useGeolocation();
  const { isOnline } = useNetworkStatus();

  // Conversational memory — persists across renders, resets on page reload
  const memoryRef = useRef(createEmptyMemory());

  // Initialize offline cache on mount
  useEffect(() => {
    initializeCache();
  }, []);

  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize browser Speech Recognition (fallback only)
  useEffect(() => {
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = voiceLang === 'en-IN-manglish' ? 'en-IN' : voiceLang;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        console.log('[Fallback STT] Voice recognized:', transcript);
        setIsListening(false);
        if (transcript.trim()) {
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('[Fallback STT] error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          toast({
            title: "Microphone Access Required",
            description: "Please allow microphone access to use voice input.",
            variant: "destructive",
          });
        } else if (event.error !== 'aborted') {
          toast({
            title: "Voice Error",
            description: "Couldn't recognize speech. Try again.",
            variant: "destructive",
          });
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
    };
  }, [voiceLang]);

  // Convert audio blob to base64
  const blobToBase64 = useCallback((blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
        const base64 = dataUrl.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }, []);

  // Play TTS for a message
  const playTTS = useCallback(async (text: string) => {
    setIsSpeaking(true);
    try {
      const speaker = VOICE_GENDER_SPEAKER[voiceGender];
      const response = await lbsBotApi.textToSpeech(text, speaker);

      if (response.success && response.audioBase64) {
        const audioUrl = `data:audio/mpeg;base64,${response.audioBase64}`;
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          audioRef.current = null;
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          audioRef.current = null;
          console.error("Audio playback error");
        };

        await audio.play();
      } else {
        setIsSpeaking(false);
        console.error("TTS failed:", response.error);
      }
    } catch (error) {
      console.error("TTS error:", error);
      setIsSpeaking(false);
    }
  }, [voiceGender]);

  const handleSendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Stop any ongoing speech
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsSpeaking(false);
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);
    setInputText("");

    // ── Conversational Memory: Rewrite query if pronouns detected ──
    const { rewritten: resolvedText, wasRewritten } = rewriteQuery(text, memoryRef.current);
    if (wasRewritten) {
      console.log(`[Memory] Rewrote "${text}" → "${resolvedText}"`);
    }

    try {
      // ── Navigation Intent Interception ──────────────────────────────
      if (isNavigationIntent(resolvedText)) {
        console.log('Navigation intent detected for:', resolvedText);
        const userLocation = await getLocation();
        const navResult = getNavigationResponse(resolvedText, userLocation);

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: navResult.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsProcessing(false);

        // Update memory with the original user text
        updateMemory(text, memoryRef.current);

        if (navResult.success && navResult.url) {
          window.open(navResult.url, '_blank');
        }

        playTTS(navResult.message);
        return;
      }

      // ── Bus Intent Interception ──────────────────────────────────
      if (isBusIntent(resolvedText)) {
        console.log('Bus intent detected for:', resolvedText);
        const busResult = getBusResponse(resolvedText);

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: busResult.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsProcessing(false);

        updateMemory(text, memoryRef.current);

        playTTS(busResult.message);
        return;
      }

      // ── Website Intent Interception ──────────────────────────────────
      if (isWebsiteIntent(resolvedText)) {
        console.log('Website intent detected for:', resolvedText);
        const webResult = getWebsiteResponse(resolvedText);

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: webResult.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsProcessing(false);

        updateMemory(text, memoryRef.current);

        if (webResult.success && webResult.url) {
          window.open(webResult.url, '_blank');
        }

        playTTS(webResult.message);
        return;
      }

      // ── Normal Chat Flow ──────────────────────────────────────────

      // OFFLINE MODE: Use cached data when no internet
      if (!isOnline) {
        console.log('[Offline] Handling query offline:', resolvedText);
        const offlineResult = handleOfflineQuery(resolvedText);

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: offlineResult.answer,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsProcessing(false);

        updateMemory(text, memoryRef.current);

        // No TTS in offline mode (requires internet)
        return;
      }

      // ONLINE MODE: Full AI + RAG flow
      const detectedLanguage = detectLanguage(resolvedText);
      console.log('Detected language:', detectedLanguage);

      const conversationHistory: ChatMessage[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Send the resolved (rewritten) query + memory context to the backend
      const response = await lbsBotApi.chat(resolvedText, conversationHistory, detectedLanguage, memoryRef.current);

      if (response.success && response.message) {
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.message,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
        setIsProcessing(false);

        // Update memory with the original user text (not the rewritten one)
        updateMemory(text, memoryRef.current);

        playTTS(response.message);
      } else {
        toast({
          title: "Error",
          description: response.error || response.message || "Failed to get response",
          variant: "destructive",
        });

        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "Sorry, something went wrong! Please try again 🙏",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Chat error:", error);

      // If online but failed, it's a connection error
      // If offline, provide offline fallback
      if (!isOnline) {
        const offlineResult = handleOfflineQuery(text);
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: offlineResult.answer,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        toast({
          title: "Connection Error",
          description: "Couldn't connect to LBS Bot. Please try again.",
          variant: "destructive",
        });
      }
      setIsProcessing(false);
    }
  }, [messages, toast, playTTS, getLocation, isOnline]);

  // Process recorded audio with Google STT, fallback to browser STT
  const processAudioWithGoogleSTT = useCallback(async (audioBlob: Blob) => {
    setIsProcessing(true);
    try {
      console.log(`[Google STT] Processing ${audioBlob.size} bytes, lang=${voiceLang}`);
      const audioBase64 = await blobToBase64(audioBlob);
      const response = await lbsBotApi.speechToText(audioBase64, voiceLang);

      if (response.success && response.transcript) {
        console.log(`[Google STT] Transcript: "${response.transcript}" (confidence: ${response.confidence})`);
        setIsProcessing(false);
        handleSendMessage(response.transcript);
        return;
      }

      // Google STT failed — try browser fallback
      console.warn('[Google STT] Failed, falling back to browser STT:', response.error);
      setIsProcessing(false);

      if (recognitionRef.current) {
        toast({
          title: "Retrying with browser...",
          description: "Cloud STT unavailable. Using browser speech recognition.",
        });
        try {
          recognitionRef.current.start();
          setIsListening(true);
        } catch (err) {
          console.error('[Fallback STT] Failed to start:', err);
        }
      } else {
        toast({
          title: "Voice Error",
          description: "Couldn't transcribe speech. Try typing instead.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('[Google STT] Error:', error);
      setIsProcessing(false);
      toast({
        title: "Voice Error",
        description: "Couldn't process voice input. Try again.",
        variant: "destructive",
      });
    }
  }, [voiceLang, blobToBase64, toast, handleSendMessage]);

  // Start recording audio via MediaRecorder
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : 'audio/webm',
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Stop all tracks to release the mic
        stream.getTracks().forEach(track => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
        console.log(`Recording stopped: ${audioBlob.size} bytes`);

        if (audioBlob.size > 0) {
          processAudioWithGoogleSTT(audioBlob);
        }
      };

      mediaRecorder.onerror = () => {
        stream.getTracks().forEach(track => track.stop());
        setIsListening(false);
        toast({
          title: "Recording Error",
          description: "Couldn't record audio. Try again.",
          variant: "destructive",
        });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsListening(true);
      console.log('Recording started...');
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: "Microphone Access Required",
        description: "Please allow microphone access to use voice input.",
        variant: "destructive",
      });
    }
  }, [processAudioWithGoogleSTT, toast]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setIsListening(false);
      console.log('Stopping recording...');
    }
  }, []);

  const handleVoiceToggle = useCallback(() => {
    // Stop AI speech if playing
    if (isSpeaking && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setIsSpeaking(false);
      // Don't return — fall through to start recording immediately
    }

    if (isListening) {
      // Stop recording (this triggers onstop → processAudioWithGoogleSTT)
      stopRecording();
    } else {
      // Start recording
      startRecording();
    }
  }, [isListening, isSpeaking, startRecording, stopRecording]);

  const handleQuickAction = useCallback((query: string) => {
    handleSendMessage(query);
  }, [handleSendMessage]);

  const handleTextSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isProcessing) {
      // Stop audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
        setIsSpeaking(false);
      }
      handleSendMessage(inputText);
    }
  }, [inputText, isProcessing, handleSendMessage]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-secondary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Header */}
      <Header voiceGender={voiceGender} onVoiceGenderChange={setVoiceGender} isOnline={isOnline} />

      {/* Stats Bar */}


      {/* Main Content */}
      <main className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-4 pb-6">
        {/* Chat Container */}
        <div className="flex-1 glass-card rounded-2xl overflow-hidden flex flex-col min-h-[300px] md:min-h-[400px]">
          <ChatContainer messages={messages} speaker={VOICE_GENDER_SPEAKER[voiceGender]} />

          {/* Text Input */}
          <form onSubmit={handleTextSubmit} className="p-3 md:p-4 border-t border-border/50 bg-card/50">
            <div className="flex gap-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={voiceLang === 'ml-IN' ? "ചോദ്യം ടൈപ്പ് ചെയ്യൂ... (മലയാളം/English)" : "Type your question... (Malayalam/English)"}
                className="flex-1 bg-background/80 border-border/50 focus-visible:ring-primary"
                disabled={isProcessing}
              />
              <Button
                type="submit"
                size="icon"
                disabled={!inputText.trim() || isProcessing}
                className="bg-primary hover:bg-primary/90 shrink-0"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>

        {/* Voice Language Selector */}
        <div className="flex justify-center gap-2 pt-4">
          {(Object.entries(VOICE_LANG_MAP) as [VoiceLang, string][]).map(([lang, label]) => (
            <button
              key={lang}
              onClick={() => setVoiceLang(lang)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-all",
                voiceLang === lang
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Voice Button Area */}
        <div className="flex justify-center py-6 md:py-8">
          <VoiceButton
            isListening={isListening}
            isProcessing={isProcessing}
            isSpeaking={isSpeaking}
            onToggle={handleVoiceToggle}
            voiceLang={voiceLang}
          />
        </div>

        {/* Quick Actions */}
        <QuickActions onActionClick={handleQuickAction} />

        {/* Footer text */}
        <div className="text-center mt-6 space-y-1">
          <p className="text-xs text-muted-foreground">
            Made with ❤️ by LBSCEK 2025 Batch
          </p>
          <p className="text-[10px] text-muted-foreground/60">
            "Your friendly campus assistant! 😊"
          </p>
        </div>
      </main>
    </div>
  );
};

export default Index;
