import {
  Bus,
  UtensilsCrossed,
  Briefcase,
  Building2,
  MapPin
} from "lucide-react";
import { cn } from "@/lib/utils";

interface QuickAction {
  id: string;
  label: string;
  malayalamLabel: string;
  icon: React.ElementType;
  query: string;
  color: string;
}

const quickActions: QuickAction[] = [
  {
    id: "bus",
    label: "Bus Timings",
    malayalamLabel: "ബസ് ടൈം",
    icon: Bus,
    query: "Bus timing എപ്പോൾ?",
    color: "bg-accent/10 text-accent hover:bg-accent/20",
  },
  {
    id: "canteen",
    label: "Canteen Menu",
    malayalamLabel: "കാന്റീൻ മെനു",
    icon: UtensilsCrossed,
    query: "ഇന്ന് canteen ൽ എന്താ?",
    color: "bg-destructive/10 text-destructive hover:bg-destructive/20",
  },
  {
    id: "placements",
    label: "Placements",
    malayalamLabel: "പ്ലേസ്മെന്റ്",
    icon: Briefcase,
    query: "Placement stats എന്താ?",
    color: "bg-primary/10 text-primary hover:bg-primary/20",
  },
  {
    id: "hostel",
    label: "Hostel Info",
    malayalamLabel: "ഹോസ്റ്റൽ",
    icon: Building2,
    query: "Hostel vacancy ഉണ്ടോ?",
    color: "bg-accent/10 text-accent hover:bg-accent/20",
  },
  {
    id: "navigate",
    label: "Navigate",
    malayalamLabel: "വഴി കാണിക്കൂ",
    icon: MapPin,
    query: "How do I reach the canteen?",
    color: "bg-green-500/10 text-green-600 hover:bg-green-500/20",
  },
];

interface QuickActionsProps {
  onActionClick: (query: string) => void;
}

export const QuickActions = ({ onActionClick }: QuickActionsProps) => {
  return (
    <div className="w-full">

      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
        {quickActions.map((action, index) => (
          <button
            key={action.id}
            onClick={() => onActionClick(action.query)}
            className={cn(
              "flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]",
              action.color,
              "animate-fade-in"
            )}
            style={{ animationDelay: `${index * 0.05}s` }}
          >
            <action.icon className="w-5 h-5 md:w-6 md:h-6" />
            <div className="text-center">
              <p className="text-xs md:text-sm font-medium">{action.label}</p>
              <p className="text-[10px] md:text-xs opacity-70 font-malayalam">
                {action.malayalamLabel}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
