"use client";

// ==============================================
// ECHO - Live Counter Component (Simplified)
// ==============================================

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LiveCounterProps {
  label: string;
  value: number;
  unit?: string;
  icon?: string;
  color?: "indigo" | "purple" | "green" | "amber";
  enableLiveUpdates?: boolean;
}

export function LiveCounter({
  label,
  value: initialValue,
  unit = "",
  icon = "📊",
  color = "indigo",
  enableLiveUpdates = false,
}: LiveCounterProps) {
  const [value, setValue] = useState(initialValue);
  const [isUpdating, setIsUpdating] = useState(false);

  // Simulate live updates (seeded data) - Slower pace
  useEffect(() => {
    if (!enableLiveUpdates) return;

    const interval = setInterval(() => {
      // Randomly increment by 1-3
      const increment = Math.floor(Math.random() * 3) + 1;
      setValue((prev) => prev + increment);
      
      // Show brief update indicator
      setIsUpdating(true);
      setTimeout(() => setIsUpdating(false), 800);
    }, 8000); // Every 8 seconds (slower, less distracting)

    return () => clearInterval(interval);
  }, [enableLiveUpdates]);

  const colorClasses = {
    indigo: "from-indigo-500 to-indigo-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    amber: "from-amber-500 to-amber-600",
  };

  const borderClasses = {
    indigo: "border-indigo-500/20",
    purple: "border-purple-500/20",
    green: "border-green-500/20",
    amber: "border-amber-500/20",
  };

  return (
    <Card className={`${borderClasses[color]} hover:shadow-lg transition-shadow duration-300`}>
      <CardContent className="pt-6">
        {/* Icon and Live Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">{icon}</span>
          {enableLiveUpdates && (
            <Badge 
              variant="outline" 
              className={`text-xs gap-1 ${isUpdating ? "border-green-500 text-green-600" : "border-muted text-muted-foreground"}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${isUpdating ? "bg-green-500" : "bg-muted"}`} />
              Live
            </Badge>
          )}
        </div>

        {/* Label */}
        <div className="text-sm font-medium text-muted-foreground mb-2">
          {label}
        </div>

        {/* Value */}
        <div className={`text-3xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent transition-all duration-300`}>
          {value.toLocaleString()}
          {unit && <span className="text-lg ml-1">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  );
}