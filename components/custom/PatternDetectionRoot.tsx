// components/custom/PatternDetectionRoot.tsx
"use client";

import React from "react";
import { PatternDetectionProvider } from "@/hooks/usePatternDetection";
import { PatternSuggestionModal } from "@/components/patterns/PatternSuggestionModal";
import type { PatternSuggestion } from "@/lib/patternDetection/types";
import type { SyncTarget } from "@/lib/types";

interface Props {
  children: React.ReactNode;
}

export function PatternDetectionRoot({ children }: Props) {
  const handleAcceptPattern = async (suggestion: PatternSuggestion) => {
    try {
      const representative = suggestion.pattern.representative;
      const firstAction = representative.actions[0];

      const ctx = (firstAction?.context ?? {}) as {
        targets?: SyncTarget[];
        amount?: number | string;
      };

      const targets: SyncTarget[] =
        (ctx.targets as SyncTarget[] | undefined) ?? [
          "slack",
          "sheets",
          "email",
          "calendar",
        ];

      const rawAmount = ctx.amount;
      const numericAmount =
        typeof rawAmount === "string"
          ? parseFloat(rawAmount)
          : typeof rawAmount === "number"
          ? rawAmount
          : NaN;

      const minAmount = !Number.isNaN(numericAmount)
        ? numericAmount
        : 50000; // fallback

      await fetch("/api/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: suggestion.pattern.userId ?? "demo-user-1",
          type: "high_value_deal",
          minAmount,
          targets,
        }),
      });

      console.log("✅ Automation created from pattern", {
        patternId: suggestion.pattern.id,
        minAmount,
        targets,
      });
    } catch (error) {
      console.error("❌ Failed to create automation from pattern", error);
    }
  };

  return (
    <PatternDetectionProvider
      userId="demo-user-1"
      onAcceptPattern={handleAcceptPattern}
    >
      {/* Modal global que aparece cuando hay sugerencia */}
      <PatternSuggestionModal />
      {children}
    </PatternDetectionProvider>
  );
}
