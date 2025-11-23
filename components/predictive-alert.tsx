// components/predictive-alert.tsx
"use client";

import type { PatternAlert } from "@/lib/patternDetection/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = {
  alert: PatternAlert;
  onAccept?: (alert: PatternAlert) => void;
  onDismiss?: (alertId: string) => void;
};

export function PredictiveAlert({ alert, onAccept, onDismiss }: Props) {
  const confidencePercent = Math.round(alert.confidence * 100);

  return (
    <Card className="border border-purple-300/70 bg-purple-50/60 dark:bg-purple-950/40 px-6 py-4 flex flex-col gap-3 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-1 text-xl">🧠</span>
          <div>
            <h3 className="font-semibold text-purple-900 dark:text-purple-50">
              Pattern detected ({confidencePercent}% confidence)
            </h3>
            <p className="text-sm text-purple-800 dark:text-purple-100 mt-1">
              {alert.description}
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          {confidencePercent}%
        </Badge>
      </div>

      {/* Progress bar */}
      <div className="space-y-1">
        <div className="w-full h-1.5 rounded-full bg-purple-100 dark:bg-purple-900 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
            style={{ width: `${confidencePercent}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Based on your recent sync patterns.
        </p>
      </div>

      <div className="flex justify-end gap-2">
        {/* Secondary button */}
        <Button
          variant="outline"
          size="sm"
          className="border-purple-200 text-purple-900 dark:text-purple-100 hover:bg-purple-50 dark:hover:bg-purple-900/40"
          onClick={() => onDismiss?.(alert.id)}
        >
          Not now
        </Button>

        {/* Primary button with gradient */}
        <Button
          size="sm"
          className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 shadow-sm hover:brightness-110 hover:shadow-md"
          onClick={() => onAccept?.(alert)}
        >
          Yes, automate
        </Button>
      </div>
    </Card>
  );
}
