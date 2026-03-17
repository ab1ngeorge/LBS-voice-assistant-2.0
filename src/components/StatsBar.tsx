import { Users, MessageCircle, Shield } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "2,500+",
    label: "Daily Users",
  },
  {
    icon: MessageCircle,
    value: "843",
    label: "Knowledge Docs",
  },
  {
    icon: Shield,
    value: "0",
    label: "Jailbreaks",
  },
];

export const StatsBar = () => {
  return (
    <div className="w-full py-4 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-3 gap-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="flex flex-col items-center gap-1 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-center gap-2 text-primary">
                <stat.icon className="w-4 h-4" />
                <span className="text-lg md:text-xl font-bold">{stat.value}</span>
              </div>
              <span className="text-[10px] md:text-xs text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
