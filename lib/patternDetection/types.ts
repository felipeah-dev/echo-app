// lib/patternDetection/types.ts

// ============================================
// CORE USER ACTION TYPES
// ============================================
export interface UserAction {
  id: string;
  timestamp: number;
  userId: string;
  teamId?: string;
  tool: string;
  type: string;
  context?: Record<string, unknown>;
}

export interface ActionSequence {
  actions: UserAction[];
  hash: string;
}

// ============================================
// PATTERN DETECTION TYPES
// ============================================
export type PatternStatus = 'detected' | 'suggested' | 'accepted' | 'rejected' | 'snoozed';

export interface DetectedPattern {
  id: string;
  userId: string;
  teamId?: string;
  representative: ActionSequence;
  count: number;
  firstSeenAt: number;
  lastSeenAt: number;
  status: PatternStatus;
  confidence: number;
}

export interface PatternSuggestion {
  pattern: DetectedPattern;
  message: string;
  actions: Array<{
    label: string;
    type: 'accept' | 'reject' | 'snooze';
  }>;
}

// ============================================
// LEGACY TYPES (for backward compatibility)
// ============================================
export type SyncSource = 'crm' | 'sheet' | 'manual';
export type SyncTarget = 'slack' | 'email' | 'calendar' | 'sheets';

export interface Action {
  source: SyncSource;
  targets: SyncTarget[];
  amount: number;
  timestamp: string; // ISO string
}

export interface PatternAlert {
  id: string;
  title: string;
  description: string;
  confidence: number; // 0–1
  suggestedAutomation: {
    minAmount?: number;
    targets: SyncTarget[];
  };
}