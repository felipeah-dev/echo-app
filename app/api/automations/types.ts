// lib/automations/types.ts
import type { SyncTarget } from "@/lib/types";

export type AutomationType = "high_value_deal";

export interface AutomationRule {
  id: string;
  userId: string;
  type: AutomationType;
  minAmount: number;
  targets: SyncTarget[];
  createdAt: string;
  active: boolean;
}
