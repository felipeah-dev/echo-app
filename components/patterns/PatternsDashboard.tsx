// components/patterns/PatternsDashboard.tsx
'use client';

import * as React from 'react';
import { usePatternDetection } from '@/hooks/usePatternDetection';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { UserAction } from '@/lib/patternDetection/types';

function sequenceToString(actions: UserAction[]): string {
  return actions.map((a) => `${a.tool}:${a.type}`).join(' → ');
}

export const PatternsDashboard: React.FC = () => {
  const { patterns } = usePatternDetection();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detected Patterns</CardTitle>
      </CardHeader>
      <CardContent>
        {patterns.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No patterns detected yet.
          </p>
        ) : (
          <div className="space-y-4">
            {patterns.map((p) => (
              <div
                key={p.id}
                className="rounded-lg border p-3 flex flex-col gap-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-sm font-medium">
                    {sequenceToString(p.representative.actions)}
                  </div>
                  <Badge variant="outline">
                    {p.count}× · {p.status}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                  Last seen:{' '}
                  {new Date(p.lastSeenAt).toLocaleString(undefined, {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
