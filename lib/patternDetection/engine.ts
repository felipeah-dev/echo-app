// lib/patternDetection/engine.ts

import type { Action, PatternAlert, SyncTarget } from "./types";

export class PatternDetectionEngine {
  private actions: Action[] = [];
  private readonly maxHistory = 50;
  private firedAlertIds = new Set<string>();

  recordAction(action: Action) {
    this.actions.push(action);

    if (this.actions.length > this.maxHistory) {
      this.actions.shift();
    }
  }

  // Detect "big deal" pattern: 3 recent high-value deals with the same targets
  detectPattern(): PatternAlert | null {
    const BIG_DEAL_THRESHOLD = 100_000;

    if (this.actions.length === 0) {
      return null;
    }

    // Only look at high-value deals
    const bigDeals = this.actions.filter(
      (a) => a.amount >= BIG_DEAL_THRESHOLD
    );

    // We need at least 3 big deals to consider a pattern
    if (bigDeals.length < 3) {
      return null;
    }

    // Look at the last 3 big deals
    const last3 = bigDeals.slice(-3);

    const keyFor = (targets: SyncTarget[]) =>
      [...targets].sort().join("+");

    const firstKey = keyFor(last3[0].targets);
    const allSameTargets = last3.every(
      (a) => keyFor(a.targets) === firstKey
    );

    if (!allSameTargets) {
      return null;
    }

    const id = `big-deal-${firstKey}`;

    // Don't show the same alert twice for the same pattern
    if (this.firedAlertIds.has(id)) {
      return null;
    }

    this.firedAlertIds.add(id);

    const sortedTargets = [...last3[0].targets].sort();
    const targetsLabel = sortedTargets.join(" + ");

    const confidence = 0.9; // 90% for demo

    const alert: PatternAlert = {
      id,
      title: "Pattern detected",
      description: `You almost always sync deals ≥ $100K to ${targetsLabel}. Do you want to automate this for future high-value deals?`,
      confidence,
      suggestedAutomation: {
        minAmount: BIG_DEAL_THRESHOLD,
        targets: sortedTargets,
      },
    };

    return alert;
  }
}
