import { useState } from "react";
import { cn } from "@/lib/utils";
import { Bot, User, Volume2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { lbsBotApi } from "@/lib/api";
import { playStreamingAudio } from "@/lib/streamingAudio";
import { useToast } from "@/hooks/use-toast";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ChatMessageProps {
  message: Message;
  speaker?: string;
}

export const ChatMessage = ({ message, speaker }: ChatMessageProps) => {
  const isBot = message.role === "assistant";
  const [isSpeaking, setIsSpeaking] = useState(false);
  const { toast } = useToast();

  const handleSpeak = async () => {
    if (isSpeaking) return;

    setIsSpeaking(true);
    try {
      const response = await lbsBotApi.textToSpeechStream(message.content, speaker);
      const handle = playStreamingAudio(response);

      handle.done
        .then(() => setIsSpeaking(false))
        .catch(() => {
          setIsSpeaking(false);
          toast({
            title: "Audio Error",
            description: "Failed to play audio",
            variant: "destructive",
          });
        });
    } catch (error) {
      console.error("TTS error:", error);
      toast({
        title: "Voice Error",
        description: "Couldn't generate speech. Try again.",
        variant: "destructive",
      });
      setIsSpeaking(false);
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 animate-fade-in",
        isBot ? "flex-row" : "flex-row-reverse"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
          isBot
            ? "voice-gradient text-primary-foreground"
            : "bg-secondary text-secondary-foreground"
        )}
      >
        {isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
      </div>

      {/* Message bubble */}
      <div
        className={cn(
          "max-w-[80%] px-4 py-3 rounded-2xl",
          isBot
            ? "glass-card rounded-tl-sm"
            : "bg-primary text-primary-foreground rounded-tr-sm"
        )}
      >
        <p className="text-sm md:text-base leading-relaxed font-malayalam">
          {message.content}
          {message.isStreaming && (
            <span className="inline-block w-2 h-4 ml-0.5 bg-primary animate-pulse rounded-sm" />
          )}
        </p>
        <div className="flex items-center justify-between mt-1.5">
          <p className={cn(
            "text-xs opacity-60",
            isBot ? "text-muted-foreground" : "text-primary-foreground/70"
          )}>
            {message.timestamp.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>

          {/* Speak button for bot messages (hidden during streaming) */}
          {isBot && !message.isStreaming && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSpeak}
              disabled={isSpeaking}
              className="h-6 w-6 p-0 ml-2 hover:bg-primary/10"
            >
              {isSpeaking ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-muted-foreground hover:text-primary" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
