// lib/patternDetection/engine.ts

import type {
  UserAction,
  DetectedPattern,
  PatternSuggestion,
  PatternStatus,
  // Legacy types
  Action,
  PatternAlert,
  SyncTarget,
} from './types';

// ============================================
// NEW PATTERN DETECTION ENGINE
// ============================================
export interface PatternDetectionEngineOptions {
  minSequenceLength?: number;
  minOccurrences?: number;
  timeWindowMs?: number;
  onSuggestion?: (suggestion: PatternSuggestion) => void;
  onPatternsChanged?: (patterns: DetectedPattern[]) => void;
}

export class PatternDetectionEngine {
  private actions: UserAction[] = [];
  private patterns: DetectedPattern[] = [];
  private options: Required<PatternDetectionEngineOptions>;

  constructor(options: PatternDetectionEngineOptions = {}) {
    this.options = {
      minSequenceLength: options.minSequenceLength ?? 3,
      minOccurrences: options.minOccurrences ?? 3,
      timeWindowMs: options.timeWindowMs ?? 30 * 24 * 60 * 60 * 1000, // 30 days
      onSuggestion: options.onSuggestion ?? (() => {}),
      onPatternsChanged: options.onPatternsChanged ?? (() => {}),
    };
  }

  trackAction(action: UserAction): void {
    this.actions.push(action);
    this.pruneOldActions();
    this.detectPatterns();
  }

  private pruneOldActions(): void {
    const cutoff = Date.now() - this.options.timeWindowMs;
    this.actions = this.actions.filter((a) => a.timestamp >= cutoff);
  }

  private hashSequence(actions: UserAction[]): string {
    return actions.map((a) => `${a.tool}:${a.type}`).join('->');
  }

  private detectPatterns(): void {
    const { minSequenceLength, minOccurrences } = this.options;
    const sequences = new Map<string, UserAction[][]>();

    // Extract all possible sequences
    for (let i = 0; i <= this.actions.length - minSequenceLength; i++) {
      const sequence = this.actions.slice(i, i + minSequenceLength);
      const hash = this.hashSequence(sequence);
      
      if (!sequences.has(hash)) {
        sequences.set(hash, []);
      }
      sequences.get(hash)!.push(sequence);
    }

    // Identify patterns
    const now = Date.now();
    const updatedPatterns: DetectedPattern[] = [];

    for (const [hash, occurrences] of sequences.entries()) {
      if (occurrences.length < minOccurrences) continue;

      const representative = occurrences[0];
      const userId = representative[0].userId;
      const teamId = representative[0].teamId;

      const existingPattern = this.patterns.find((p) => p.representative.hash === hash);

      if (existingPattern) {
        existingPattern.count = occurrences.length;
        existingPattern.lastSeenAt = now;
        updatedPatterns.push(existingPattern);
      } else {
        const newPattern: DetectedPattern = {
          id: `pattern-${hash}-${now}`,
          userId,
          teamId,
          representative: { actions: representative, hash },
          count: occurrences.length,
          firstSeenAt: now,
          lastSeenAt: now,
          status: 'detected',
          confidence: Math.min(0.95, 0.6 + occurrences.length * 0.05),
        };
        updatedPatterns.push(newPattern);

        // Trigger suggestion for new patterns
        if (newPattern.status === 'detected') {
          this.triggerSuggestion(newPattern);
        }
      }
    }

    this.patterns = updatedPatterns;
    this.options.onPatternsChanged(this.patterns);
  }

  private triggerSuggestion(pattern: DetectedPattern): void {
    const suggestion: PatternSuggestion = {
      pattern,
      message: `You've done this sequence ${pattern.count} times. Would you like to automate it?`,
      actions: [
        { label: 'Automate', type: 'accept' },
        { label: 'Not now', type: 'snooze' },
        { label: 'Never', type: 'reject' },
      ],
    };

    this.options.onSuggestion(suggestion);
  }

  updatePatternStatus(patternId: string, status: PatternStatus): void {
    const pattern = this.patterns.find((p) => p.id === patternId);
    if (pattern) {
      pattern.status = status;
      this.options.onPatternsChanged(this.patterns);
    }
  }

  getPatterns(): DetectedPattern[] {
    return [...this.patterns];
  }
}

// ============================================
// LEGACY ENGINE (for backward compatibility)
// ============================================
export class LegacyPatternDetectionEngine {
  private actions: Action[] = [];
  private readonly maxHistory = 50;
  private firedAlertIds = new Set<string>();

  recordAction(action: Action): void {
    this.actions.push(action);

    if (this.actions.length > this.maxHistory) {
      this.actions.shift();
    }
  }

  detectPattern(): PatternAlert | null {
    const BIG_DEAL_THRESHOLD = 100_000;

    if (this.actions.length === 0) {
      return null;
    }

    const bigDeals = this.actions.filter((a) => a.amount >= BIG_DEAL_THRESHOLD);

    if (bigDeals.length < 3) {
      return null;
    }

    const last3 = bigDeals.slice(-3);
    const keyFor = (targets: SyncTarget[]) => [...targets].sort().join('+');
    const firstKey = keyFor(last3[0].targets);
    const allSameTargets = last3.every((a) => keyFor(a.targets) === firstKey);

    if (!allSameTargets) {
      return null;
    }

    const id = `big-deal-${firstKey}`;

    if (this.firedAlertIds.has(id)) {
      return null;
    }

    this.firedAlertIds.add(id);

    const sortedTargets = [...last3[0].targets].sort();
    const targetsLabel = sortedTargets.join(' + ');
    const confidence = 0.9;

    return {
      id,
      title: 'Pattern detected',
      description: `You almost always sync deals ≥ $100K to ${targetsLabel}. Do you want to automate this for future high-value deals?`,
      confidence,
      suggestedAutomation: {
        minAmount: BIG_DEAL_THRESHOLD,
        targets: sortedTargets,
      },
    };
  }
}