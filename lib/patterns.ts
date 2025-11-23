// lib/patterns.ts

import { PatternDetectionEngine } from './patternDetection/engine';
import type { Action, PatternAlert } from './patternDetection/types';

const engine = new PatternDetectionEngine();

export const patternDetector = {
  recordAction(action: Action) {
    engine.recordAction(action);
  },

  detectPattern(): PatternAlert | null {
    return engine.detectPattern();
  },

};
