// lib/patternDetection/types.ts

export type SyncSource = 'crm' | 'sheet' | 'manual';

export type SyncTarget = 'slack' | 'email' | 'calendar' | 'sheets';

export type Action = {
  source: SyncSource;
  targets: SyncTarget[];
  amount: number;
  timestamp: string; // ISO string
};

export type PatternAlert = {
  id: string;
  title: string;
  description: string;
  confidence: number; // 0–1
  suggestedAutomation: {
    minAmount?: number;
    targets: SyncTarget[];
  };
};
