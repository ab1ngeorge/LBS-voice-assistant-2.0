import { useRef, useEffect } from "react";
import { ChatMessage, Message } from "./ChatMessage";
import { Bot, MessageSquare } from "lucide-react";

interface ChatContainerProps {
  messages: Message[];
  speaker?: string;
}

export const ChatContainer = ({ messages, speaker }: ChatContainerProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 md:w-24 md:h-24 rounded-full voice-gradient flex items-center justify-center mb-6 animate-float shadow-xl">
          <Bot className="w-10 h-10 md:w-12 md:h-12 text-primary-foreground" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold text-foreground mb-2">
          Hello there! 👋
        </h2>
        <p className="text-muted-foreground text-sm md:text-base max-w-md">
          I'm LBS Bot! Ask me anything about LBSCEK – classes, exams, bus timings, or placements. I'm here to help!
        </p>
        <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
          <MessageSquare className="w-4 h-4" />
          <span>Tap the mic or use quick actions below</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4"
    >
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} speaker={speaker} />
      ))}
    </div>
  );
};
