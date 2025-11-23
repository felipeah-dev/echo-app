// hooks/usePatternDetection.tsx
'use client';

import React,
{
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

interface PatternDetectionContextValue {
  trackAction: (input: Omit<UserAction, 'id' | 'timestamp' | 'userId'> & {
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
  onAcceptPattern?: (suggestion: PatternSuggestion) => Promise<void> | void;
}

// ============================
// Helpers para agrupar patrones
// ============================

// Extraemos algunos campos frecuentes del context (aunque sea Record<string, unknown>)
type ActionContextShape = {
  source?: string;
  targets?: unknown;
  amount?: unknown;
};

function getPatternKey(action: UserAction): string {
  const ctx = (action.context || {}) as ActionContextShape;

  const source = ctx.source ?? 'unknown';
  const targets = Array.isArray(ctx.targets) ? ctx.targets.join(',') : 'any';

  let bucket = 'normal';
  const rawAmount = ctx.amount;
  if (typeof rawAmount === 'number' && rawAmount >= 100_000) {
    bucket = 'high';
  }

  // clave tipo: sync:manual:slack,sheets,....:high
  return `${action.tool}:${action.type}:${source}:${targets}:${bucket}`;
}

export const PatternDetectionProvider: React.FC<ProviderProps> = ({
  userId,
  teamId,
  children,
  onAcceptPattern,
}) => {
  const actionsRef = useRef<UserAction[]>([]);
  const [suggestion, setSuggestion] = useState<PatternSuggestion | null>(null);
  const [patterns, setPatterns] = useState<DetectedPattern[]>([]);

  const trackAction = useCallback<
    PatternDetectionContextValue['trackAction']
  >(
    (input) => {
      const now = input.timestamp ?? Date.now();

      const action: UserAction = {
        id: input.id ?? `${Math.random().toString(36).slice(2)}-${now}`,
        timestamp: now,
        userId,
        teamId,
        tool: input.tool,
        type: input.type,
        context: input.context,
      };

      console.log('🟣 trackAction called', action);

      // Guardamos la acción en historial
      actionsRef.current.push(action);

      const key = getPatternKey(action);
      let updatedPattern: DetectedPattern | null = null;

      setPatterns((prev) => {
        const next = [...prev];
        const existingIndex = next.findIndex(
          (p) => p.id === key && p.userId === userId
        );

        if (existingIndex === -1) {
          const newPattern: DetectedPattern = {
            id: key,
            userId,
            teamId,
            representative: {
              actions: [action],
              hash: key,
            },
            count: 1,
            firstSeenAt: now,
            lastSeenAt: now,
            status: 'detected',
            confidence: 1 / 3, // con 1 ocurrencia
          };
          next.push(newPattern);
          updatedPattern = newPattern;
        } else {
          const existing = next[existingIndex];
          const newCount = existing.count + 1;

          const newPattern: DetectedPattern = {
            ...existing,
            count: newCount,
            lastSeenAt: now,
            representative: {
              actions: [...existing.representative.actions, action].slice(-3),
              hash: existing.representative.hash,
            },
            confidence: Math.min(1, newCount / 3),
          };

          next[existingIndex] = newPattern;
          updatedPattern = newPattern;
        }

        console.log('📈 Patterns updated:', next);
        return next;
      });

      // Generar sugerencia cuando un patrón se repite 3 veces+
      setSuggestion((prev) => {
        if (prev) return prev; // ya hay una en pantalla

        if (!updatedPattern) return prev;
        if (updatedPattern.count < 3) return prev;
        if (
          updatedPattern.status === 'accepted' ||
          updatedPattern.status === 'rejected'
        ) {
          return prev;
        }

        console.log('🔮 Pattern suggestion candidate:', updatedPattern);

        return {
          pattern: updatedPattern,
          message: 'We detected a repeating workflow pattern.',
          actions: [
            { label: 'Yes, automate this', type: 'accept' },
            { label: 'No, thanks', type: 'reject' },
            { label: 'Remind me later', type: 'snooze' },
          ],
        };
      });
    },
    [userId, teamId]
  );

  const markSuggestionHandled: PatternDetectionContextValue['markSuggestionHandled'] =
    useCallback(
      (status) => {
        const current = suggestion;
        if (!current) return;

        const patternId = current.pattern.id;

        setPatterns((prev) =>
          prev.map((p) =>
            p.id === patternId ? { ...p, status } : p
          )
        );

        if (status === 'accepted' && onAcceptPattern) {
          void onAcceptPattern(current);
        }

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
