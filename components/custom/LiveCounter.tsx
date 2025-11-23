// components/custom/LiveCounter.tsx
"use client";

// ==============================================
// ECHO - Live Counter Component (Real Data Mode)
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

  // ⭐ Detect real data changes (not simulated) ⭐
  useEffect(() => {
    if (initialValue === value) return;

    // Actualizar valor cuando cambie la métrica real
    setValue(initialValue);

    // Mostrar indicador de actualización
    setIsUpdating(true);
    const timeout = setTimeout(() => setIsUpdating(false), 1500);

    return () => clearTimeout(timeout);
  }, [initialValue, value]); // ✅ incluye value en las dependencias

  const colorClasses: Record<NonNullable<LiveCounterProps["color"]>, string> = {
    indigo: "from-indigo-500 to-indigo-600",
    purple: "from-purple-500 to-purple-600",
    green: "from-green-500 to-green-600",
    amber: "from-amber-500 to-amber-600",
  };

  const borderClasses: Record<NonNullable<LiveCounterProps["color"]>, string> = {
    indigo: "border-indigo-500/20",
    purple: "border-purple-500/20",
    green: "border-green-500/20",
    amber: "border-amber-500/20",
  };

  return (
    <Card
      className={`${borderClasses[color]} hover:shadow-lg transition-shadow duration-300`}
    >
      <CardContent className="pt-6">
        {/* Icon and Live Badge */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-2xl">{icon}</span>
          {enableLiveUpdates && (
            <Badge
              variant="outline"
              className={`text-xs gap-1 transition-all duration-300 ${
                isUpdating
                  ? "border-green-500 text-green-600 bg-green-50"
                  : "border-purple-500/50 text-purple-600"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                  isUpdating ? "bg-green-500 animate-pulse" : "bg-purple-500"
                }`}
              />
              Live
            </Badge>
          )}
        </div>

        {/* Label */}
        <div className="text-sm font-medium text-muted-foreground mb-2">
          {label}
        </div>

        {/* Value with animation on change */}
        <div
          className={`text-3xl font-bold bg-gradient-to-r ${
            colorClasses[color]
          } bg-clip-text text-transparent transition-all duration-500 ${
            isUpdating ? "scale-110" : "scale-100"
          }`}
        >
          {value.toLocaleString()}
          {unit && <span className="text-lg ml-1">{unit}</span>}
        </div>
      </CardContent>
    </Card>
  );
}
