// components/patterns/PatternSuggestionModal.tsx
'use client';

import * as React from 'react';
import { usePatternDetection } from '@/hooks/usePatternDetection';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserAction } from '@/lib/patternDetection/types';

function actionLabel(action: UserAction): string {
  const base = `${action.tool.toUpperCase()} – ${action.type}`;
  if (action.context.entityType) {
    return `${base} (${action.context.entityType})`;
  }
  return base;
}

export const PatternSuggestionModal: React.FC = () => {
  const { suggestion, markSuggestionHandled } = usePatternDetection();

  if (!suggestion) return null;

  const { pattern } = suggestion;
  const sequenceSummary = pattern.representative.actions
    .map(actionLabel)
    .join(' → ');

  return (
    <Dialog open onOpenChange={() => markSuggestionHandled('snoozed')}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>I noticed a repeating workflow</DialogTitle>
          <DialogDescription>
            It looks like you&apos;ve done this workflow at least 3 times:
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 rounded-xl border p-3 text-sm">
          <p className="font-medium">Detected sequence:</p>
          <p className="mt-1 text-muted-foreground break-words">
            {sequenceSummary}
          </p>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Do you want ECHO to automate this for you?
        </p>

        <div className="mt-6 flex flex-wrap gap-3 justify-end">
          <Button
            variant="outline"
            onClick={() => markSuggestionHandled('rejected')}
          >
            No, thanks
          </Button>
          <Button
            variant="outline"
            onClick={() => markSuggestionHandled('snoozed')}
          >
            Remind me later
          </Button>
          <Button onClick={() => markSuggestionHandled('accepted')}>
            Yes, automate this
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
