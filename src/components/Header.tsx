import { Bot, Sparkles, WifiOff, User2, Database, DatabaseZap } from "lucide-react";
import { cn } from "@/lib/utils";

export type VoiceGender = 'male' | 'female';

interface HeaderProps {
  voiceGender?: VoiceGender;
  onVoiceGenderChange?: (gender: VoiceGender) => void;
  isOnline?: boolean;
  offlineCacheEnabled?: boolean;
  onOfflineCacheToggle?: (enabled: boolean) => void;
}

export const Header = ({ voiceGender = 'male', onVoiceGenderChange, isOnline = true, offlineCacheEnabled = true, onOfflineCacheToggle }: HeaderProps) => {
  return (
    <header className="w-full py-4 px-4 md:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        {/* Logo + Voice Gender Toggle */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl voice-gradient flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 md:w-6 md:h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-foreground">
              LBS Bot
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              LBSCEK Voice Assistant
            </p>
          </div>

          {/* Voice Gender Toggle */}
          {onVoiceGenderChange && (
            <div className="flex items-center gap-1.5 ml-2">
              <User2 className="w-3.5 h-3.5 text-muted-foreground" />
              <div className="flex gap-0.5 bg-muted/50 rounded-full p-0.5">
                <button
                  onClick={() => onVoiceGenderChange('male')}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all",
                    voiceGender === 'male'
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Male
                </button>
                <button
                  onClick={() => onVoiceGenderChange('female')}
                  className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-medium transition-all",
                    voiceGender === 'female'
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Female
                </button>
              </div>
            </div>
          )}

          {/* Offline Cache Toggle */}
          {onOfflineCacheToggle && (
            <div className="flex items-center gap-1.5 ml-2">
              {offlineCacheEnabled ? (
                <DatabaseZap className="w-3.5 h-3.5 text-muted-foreground" />
              ) : (
                <Database className="w-3.5 h-3.5 text-muted-foreground" />
              )}
              <button
                onClick={() => onOfflineCacheToggle(!offlineCacheEnabled)}
                className={cn(
                  "relative w-9 h-5 rounded-full transition-colors duration-200",
                  offlineCacheEnabled
                    ? "bg-primary"
                    : "bg-muted-foreground/30"
                )}
                title={offlineCacheEnabled ? "Offline cache is ON — click to disable" : "Offline cache is OFF — click to enable"}
              >
                <span
                  className={cn(
                    "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200",
                    offlineCacheEnabled ? "translate-x-4" : "translate-x-0"
                  )}
                />
              </button>
              <span className="text-[10px] text-muted-foreground hidden sm:inline">
                Cache
              </span>
            </div>
          )}
        </div>

        {/* Status badge — dynamic online/offline */}
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-colors",
          isOnline
            ? "bg-primary/10 text-primary"
            : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
        )}>
          {isOnline ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="hidden sm:inline">Online</span>
              <Sparkles className="w-3.5 h-3.5 sm:hidden" />
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Offline</span>
              <span className="sm:hidden text-[10px]">📴</span>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

