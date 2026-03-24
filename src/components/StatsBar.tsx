import { useState, useEffect, useCallback } from "react";
import { MessageCircle, Clock, Globe, TrendingUp } from "lucide-react";
import { lbsBotApi, AnalyticsData } from "@/lib/api";

export const StatsBar = () => {
  const [stats, setStats] = useState<AnalyticsData>({
    totalQueries: 0,
    avgResponseTimeMs: 0,
    topLanguage: 'english',
    answeredRate: 100,
  });

  const fetchStats = useCallback(async () => {
    try {
      const data = await lbsBotApi.getAnalytics();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchStats]);

  const formatLanguage = (lang: string) => {
    const map: Record<string, string> = {
      english: '🇬🇧 English',
      malayalam: '🇮🇳 Malayalam',
      manglish: '🔤 Manglish',
    };
    return map[lang] || lang;
  };

  const formatTime = (ms: number) => {
    if (ms === 0) return '—';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const statItems = [
    {
      icon: MessageCircle,
      value: stats.totalQueries > 0 ? stats.totalQueries.toString() : '—',
      label: "Queries Today",
    },
    {
      icon: Clock,
      value: formatTime(stats.avgResponseTimeMs),
      label: "Avg Response",
    },
    {
      icon: Globe,
      value: stats.totalQueries > 0 ? formatLanguage(stats.topLanguage) : '—',
      label: "Top Language",
    },
    {
      icon: TrendingUp,
      value: stats.totalQueries > 0 ? `${stats.answeredRate}%` : '—',
      label: "Answer Rate",
    },
  ];

  return (
    <div className="w-full py-3 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-4 gap-3">
          {statItems.map((stat, index) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-1.5 text-primary">
                <stat.icon className="w-3.5 h-3.5" />
                <span className="text-sm md:text-base font-bold">{stat.value}</span>
              </div>
              <span className="text-[9px] md:text-xs text-muted-foreground text-center leading-tight">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
