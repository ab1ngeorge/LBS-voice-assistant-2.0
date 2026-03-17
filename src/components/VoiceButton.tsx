import { Mic, Loader2, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  onToggle: () => void;
  voiceLang?: string;
}

export const VoiceButton = ({ isListening, isProcessing, isSpeaking, onToggle, voiceLang = 'en-IN' }: VoiceButtonProps) => {
  const isMl = voiceLang === 'ml-IN';

  const getStatusText = () => {
    if (isSpeaking) return isMl ? "നിർത്തൂ" : "Tap to stop";
    if (isProcessing) return isMl ? "ചിന്തിക്കുന്നു..." : "Thinking...";
    if (isListening) return isMl ? "കേൾക്കുന്നു..." : "Listening...";
    return isMl ? "സംസാരിക്കൂ" : "Tap to speak";
  };

  return (
    <div className="relative">
      {/* Pulse rings when listening */}
      {isListening && (
        <>
          <div className="absolute inset-0 rounded-full voice-gradient animate-pulse-ring" />
          <div className="absolute inset-0 rounded-full voice-gradient animate-pulse-ring" style={{ animationDelay: "0.5s" }} />
          <div className="absolute inset-0 rounded-full voice-gradient animate-pulse-ring" style={{ animationDelay: "1s" }} />
        </>
      )}

      {/* Speaking indicator rings */}
      {isSpeaking && (
        <>
          <div className="absolute inset-0 rounded-full bg-green-500/30 animate-pulse" />
          <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
        </>
      )}

      {/* Main button */}
      <button
        onClick={onToggle}
        disabled={isProcessing}
        className={cn(
          "relative w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-all duration-300 transform",
          isListening
            ? "voice-gradient glow-effect scale-110"
            : isSpeaking
              ? "bg-destructive hover:bg-destructive/90 scale-105"
              : "bg-primary hover:bg-primary/90 hover:scale-105",
          isProcessing && "cursor-not-allowed",
          "shadow-xl"
        )}
        aria-label={isListening ? "Stop listening" : "Start listening"}
      >
        {isProcessing ? (
          <Loader2 className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground animate-spin" />
        ) : isSpeaking ? (
          <Volume2 className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground animate-pulse" />
        ) : isListening ? (
          <div className="flex items-center gap-1">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="w-1 md:w-1.5 bg-primary-foreground rounded-full animate-voice-wave"
                style={{
                  height: "24px",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        ) : (
          <Mic className="w-8 h-8 md:w-10 md:h-10 text-primary-foreground" />
        )}
      </button>

      {/* Status text */}
      <p className={cn(
        "absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-medium whitespace-nowrap transition-all duration-300",
        isListening ? "text-primary" : isSpeaking ? "text-green-500" : "text-muted-foreground"
      )}>
        {getStatusText()}
      </p>
    </div>
  );
};
