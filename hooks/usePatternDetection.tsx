// hooks/usePatternDetection.tsx
'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  DetectedPattern,
  PatternSuggestion,
  UserAction,
} from '@/lib/patternDetection/types';
import {
  PatternDetectionEngine,
  PatternDetectionEngineOptions,
} from '@/lib/patternDetection/engine';

interface PatternDetectionContextValue {
  trackAction: (input: Omit<UserAction, 'id' | 'timestamp'> & {
    id?: string;
    timestamp?: number;
  }) => void;
  suggestion: PatternSuggestion | null;
  patterns: DetectedPattern[];
  markSuggestionHandled: (status: 'accepted' | 'rejected' | 'snoozed') => void;
}

const PatternDetectionContext =
  createContext<PatternDetectionContextValue | null>(null);

interface ProviderProps {
  userId: string;
  teamId?: string;
  children: React.ReactNode;
  engineOptions?: Partial<PatternDetectionEngineOptions>;
  onAcceptPattern?: (suggestion: PatternSuggestion) => Promise<void> | void;
}

export const PatternDetectionProvider: React.FC<ProviderProps> = ({
  userId,
  teamId,
  children,
  engineOptions,
  onAcceptPattern,
}) => {
  const engineRef = useRef<PatternDetectionEngine | null>(null);
  const [suggestion, setSuggestion] = useState<PatternSuggestion | null>(null);
  const [patterns, setPatterns] = useState<DetectedPattern[]>([]);

  if (!engineRef.current) {
    engineRef.current = new PatternDetectionEngine({
      ...(engineOptions || {}),
      onSuggestion: (s) => {
        if (s.pattern.userId === userId) {
          setSuggestion(s);
        }
      },
      onPatternsChanged: (updatedPatterns) => {
        setPatterns(updatedPatterns.filter((p) => p.userId === userId));
      },
    });
  }

  const trackAction = useCallback<
    PatternDetectionContextValue['trackAction']
  >(
    (input) => {
      const engine = engineRef.current;
      if (!engine) return;

      const action: UserAction = {
        id: input.id ?? `${Math.random().toString(36).slice(2)}-${Date.now()}`,
        timestamp: input.timestamp ?? Date.now(),
        userId,
        teamId,
        tool: input.tool,
        type: input.type,
        context: input.context,
      };

      engine.trackAction(action);
    },
    [userId, teamId]
  );

  const markSuggestionHandled: PatternDetectionContextValue['markSuggestionHandled'] =
    useCallback(
      (status) => {
        const engine = engineRef.current;
        if (!engine || !suggestion) return;

        const patternId = suggestion.pattern.id;

        if (status === 'accepted' && onAcceptPattern) {
          void onAcceptPattern(suggestion);
        }

        engine.updatePatternStatus(patternId, status);
        setSuggestion(null);
      },
      [suggestion, onAcceptPattern]
    );

  const value = useMemo<PatternDetectionContextValue>(
    () => ({
      trackAction,
      suggestion,
      patterns,
      markSuggestionHandled,
    }),
    [trackAction, suggestion, patterns, markSuggestionHandled]
  );

  return (
    <PatternDetectionContext.Provider value={value}>
      {children}
    </PatternDetectionContext.Provider>
  );
};

export const usePatternDetection = (): PatternDetectionContextValue => {
  const ctx = useContext(PatternDetectionContext);
  if (!ctx) {
    throw new Error(
      'usePatternDetection must be used within a PatternDetectionProvider'
    );
  }
  return ctx;
};

// Atajo para usar solo el tracker
export const useActionTracker = () => {
  const { trackAction } = usePatternDetection();
  return trackAction;
};
