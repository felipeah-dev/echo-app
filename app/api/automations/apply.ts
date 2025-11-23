// lib/automations/apply.ts
import type { SyncTarget } from "@/lib/types";
import type { AutomationRule } from "./types";
import { getAutomationRules } from "./store";

export function applyAutomationsForSync(params: {
  userId?: string;
  amount: number;
  currentTargets: SyncTarget[];
}): { targets: SyncTarget[]; appliedRules: AutomationRule[] } {
  const { userId, amount, currentTargets } = params;
  if (!userId) {
    return { targets: currentTargets, appliedRules: [] };
  }

  const rules = getAutomationRules(userId);
  const applied: AutomationRule[] = [];
  const targets = [...currentTargets];

  for (const rule of rules) {
    if (!rule.active) continue;

    if (rule.type === "high_value_deal" && amount >= rule.minAmount) {
      for (const t of rule.targets) {
        if (!targets.includes(t)) {
          targets.push(t);
        }
      }
      applied.push(rule);
    }
  }

  return { targets, appliedRules: applied };
}
