// components/SyncWithPredictiveAlert.tsx
'use client';

import { useState } from 'react';
import { patternDetector } from '@/lib/patterns';
import type { PatternAlert } from '@/lib/patternDetection/types';
import { PredictiveAlert } from '@/components/predictive-alert';
import { Button } from '@/components/ui/button';
import type { SyncResponse } from '@/lib/types';

export function SyncWithPredictiveAlert() {
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<PatternAlert | null>(null);
  const [lastResult, setLastResult] = useState<SyncResponse | null>(null);

  const handleSync = async () => {
    try {
      setLoading(true);

      // 👇 Ajusta el body a lo que YA mandas hoy a /api/sync
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // TODO: aquí van tus datos reales: source, data, targets, etc.
          // Ejemplo si ya tienes algo así:
          // source: 'crm',
          // data: { dealId, amount, customerName, ... },
          // targets: ['slack', 'sheets'],
        }),
      });

      if (!res.ok) {
        console.error('Sync failed', await res.text());
        return;
      }

      const data = (await res.json()) as SyncResponse;
      setLastResult(data);

      // Si el backend no mandó amount o source, no hacemos nada
      if (
        data.amount == null ||
        !data.source ||
        !data.synced ||
        data.synced.length === 0
      ) {
        return;
      }

      // 1️⃣ Registrar acción en el motor de patrones
      patternDetector.recordAction({
        source: data.source,     // 'crm' | 'sheet' | 'manual'
        targets: data.synced,    // ['slack', 'email', ...]
        amount: data.amount,     // número
        timestamp: new Date().toISOString(),
      });

      // 2️⃣ Ver si hay patrón
      const maybeAlert = patternDetector.detectPattern();
      if (maybeAlert) {
        setAlert(maybeAlert);
      }
    } catch (err) {
      console.error('Error calling /api/sync', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Botón de sync real */}
      <Button onClick={handleSync} disabled={loading}>
        {loading ? 'Sincronizando…' : 'Sync ahora'}
      </Button>

      {/* Info básica del último sync */}
      {lastResult && (
        <div className="text-sm text-muted-foreground">
          Último sync: {lastResult.amount ?? 'N/A'} ·{' '}
          {lastResult.synced.join(', ') || 'sin targets'}{' '}
          {lastResult.source ? `desde ${lastResult.source}` : ''}
        </div>
      )}

      {/* Predictive Alert */}
      {alert && (
        <PredictiveAlert
          alert={alert}
          onAccept={(a) => {
            // Para el hackathon, con esto ya contamos la historia
            console.log('✅ Aceptar automation sugerida:', a);
            // Aquí podrías guardar la regla en tu backend, etc.
            setAlert(null);
          }}
          onDismiss={(id) => {
            console.log('❌ Dismiss alert', id);
            setAlert(null);
          }}
        />
      )}
    </div>
  );
}
