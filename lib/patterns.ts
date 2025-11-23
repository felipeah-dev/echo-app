// lib/patterns.ts

import { LegacyPatternDetectionEngine } from './patternDetection/engine';
import type { Action, PatternAlert } from './patternDetection/types';

const legacyEngine = new LegacyPatternDetectionEngine();

export const patternDetector = {
  recordAction(action: Action): void {
    legacyEngine.recordAction(action);
  },

  detectPattern(): PatternAlert | null {
    return legacyEngine.detectPattern();
  },
};