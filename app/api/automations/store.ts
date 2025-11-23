// lib/automations/store.ts
import type { AutomationRule, AutomationType } from "./types";
import type { SyncTarget } from "@/lib/types";

const rulesByUser = new Map<string, AutomationRule[]>();

function generateId() {
  return `rule_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function addAutomationRule(input: {
  userId: string;
  type: AutomationType;
  minAmount: number;
  targets: SyncTarget[];
}): AutomationRule {
  const rule: AutomationRule = {
    id: generateId(),
    createdAt: new Date().toISOString(),
    active: true,
    ...input,
  };

  const existing = rulesByUser.get(input.userId) ?? [];
  rulesByUser.set(input.userId, [...existing, rule]);
  return rule;
}

export function getAutomationRules(userId: string): AutomationRule[] {
  return rulesByUser.get(userId) ?? [];
}
