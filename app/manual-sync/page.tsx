"use client";

// ==============================================
// ECHO - Manual Sync Control Center
// ==============================================

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, XCircle, Clock, Zap } from "lucide-react";
import type { SyncTarget, SyncResponse } from "@/lib/types";

export default function ManualSyncPage() {
  // Form state
  const [dealId, setDealId] = useState("");
  const [customer, setCustomer] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<"open" | "closed" | "pending">("open");
  const [customerEmail, setCustomerEmail] = useState("");

  // Targets state
  const [targets, setTargets] = useState<SyncTarget[]>(["slack", "sheets", "email", "calendar"]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SyncResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Toggle target
  const toggleTarget = (target: SyncTarget) => {
    setTargets((prev) =>
      prev.includes(target) ? prev.filter((t) => t !== target) : [...prev, target]
    );
  };

  // Handle submit
  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const payload = {
        source: "manual" as const,
        targets,
        data: {
          dealId,
          customer,
          amount: parseFloat(amount),
          status,
          customerEmail: customerEmail || undefined,
        },
      };

      // ⭐⭐⭐ DEBUG LOGS ⭐⭐⭐
      console.log("=== FRONTEND DEBUG ===");
      console.log("🔵 customerEmail state value:", customerEmail);
      console.log("🔵 payload.data.customerEmail:", payload.data.customerEmail);
      console.log("🔵 FULL payload being sent:");
      console.log(JSON.stringify(payload, null, 2));
      console.log("======================");
      // ⭐⭐⭐ END DEBUG ⭐⭐⭐

      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Sync failed");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setDealId("");
    setCustomer("");
    setAmount("");
    setStatus("open");
    setCustomerEmail("");
    setTargets(["slack", "sheets", "email", "calendar"]);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 sm:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Manual Sync Control
          </h1>
          <p className="text-gray-600 text-lg">
            Manually trigger a sync across your platforms
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* LEFT: Form */}
          <Card className="border-2 border-purple-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-purple-600" />
                Deal Information
              </CardTitle>
              <CardDescription>
                Fill in the deal details to sync across platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSync} className="space-y-4">
                {/* Deal ID */}
                <div className="space-y-2">
                  <Label htmlFor="dealId">Deal ID *</Label>
                  <Input
                    id="dealId"
                    placeholder="DEMO-001"
                    value={dealId}
                    onChange={(e) => setDealId(e.target.value)}
                    required
                  />
                </div>

                {/* Customer */}
                <div className="space-y-2">
                  <Label htmlFor="customer">Customer Name *</Label>
                  <Input
                    id="customer"
                    placeholder="Acme Corp"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    required
                  />
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="150000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={status}
                    onValueChange={(v: "open" | "closed" | "pending") => setStatus(v)}
                  >

                    <SelectTrigger id="status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Customer Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Customer Email (optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="customer@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Email confirmation will be sent to this address
                  </p>
                </div>

                {/* Targets */}
                <div className="space-y-3">
                  <Label>Sync Targets *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { id: "slack", label: "Slack", icon: "💬" },
                      { id: "sheets", label: "Google Sheets", icon: "📊" },
                      { id: "email", label: "Gmail", icon: "📧" },
                      { id: "calendar", label: "Calendar", icon: "📅" },
                    ].map((target) => (
                      <div
                        key={target.id}
                        className="flex items-center space-x-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors"
                      >
                        <Checkbox
                          id={target.id}
                          checked={targets.includes(target.id as SyncTarget)}
                          onCheckedChange={() => toggleTarget(target.id as SyncTarget)}
                        />
                        <Label
                          htmlFor={target.id}
                          className="flex items-center gap-2 cursor-pointer flex-1"
                        >
                          <span>{target.icon}</span>
                          <span className="text-sm">{target.label}</span>
                        </Label>
                      </div>
                    ))}
                  </div>
                  {targets.length === 0 && (
                    <p className="text-sm text-red-500">Select at least one target</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    type="submit"
                    disabled={loading || targets.length === 0}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Sync Now
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Reset
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* RIGHT: Results */}
          <Card className="border-2 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Sync Results
              </CardTitle>
              <CardDescription>
                {result
                  ? "Last sync execution details"
                  : "Results will appear here after sync"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Error State */}
              {error && (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Success State */}
              {result && !error && (
                <div className="space-y-4">
                  {/* Status Badge */}
                  <div className="flex items-center justify-center">
                    <Badge
                      className={
                        result.success
                          ? "bg-green-500 text-white text-lg px-4 py-2"
                          : "bg-yellow-500 text-white text-lg px-4 py-2"
                      }
                    >
                      {result.success ? "✓ All Synced" : "⚠ Partial Sync"}
                    </Badge>
                  </div>

                  {/* Synced Targets */}
                  {result.synced.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Synced Successfully:</p>
                      <div className="flex flex-wrap gap-2">
                        {result.synced.map((target) => (
                          <Badge
                            key={target}
                            className="bg-green-500 text-white hover:bg-green-600"
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            {target}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Failed Targets */}
                  {result.failed.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Failed:</p>
                      <div className="flex flex-wrap gap-2">
                        {result.failed.map((target) => (
                          <Badge
                            key={target}
                            variant="destructive"
                          >
                            <XCircle className="mr-1 h-3 w-3" />
                            {target}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Time Saved */}
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-4 text-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5" />
                        <span className="font-medium">Time Saved</span>
                      </div>
                      <div className="text-2xl font-bold">
                        {Math.floor(result.timeSavedSec / 60)} min
                      </div>
                    </div>
                    <p className="text-sm text-white/80 mt-1">
                      vs. manual process (~{Math.floor((result.timeSavedSec + 210) / 60)} min)
                    </p>
                  </div>

                  {/* Decision Log */}
                  {result.decisionLog && result.decisionLog.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Decision Log:</p>
                      <div className="bg-muted rounded-lg p-3 space-y-1 max-h-48 overflow-y-auto">
                        {result.decisionLog.map((log, idx) => (
                          <p key={idx} className="text-xs font-mono text-gray-700">
                            {log}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Idle State */}
              {!result && !error && !loading && (
                <div className="text-center py-12 text-gray-400">
                  <Zap className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">
                  Fill the form and click &quot;Sync Now&quot;
                </p>
                </div>
              )}

              {/* Loading State */}
              {loading && (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 mx-auto mb-3 animate-spin text-purple-600" />
                  <p className="text-sm text-gray-600">Orchestrating sync...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Info */}
        <Card className="border-2 border-purple-500/20 bg-gradient-to-r from-indigo-50 to-purple-50">
          <CardContent className="pt-6">
            <div className="grid sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-purple-600">3.5 min</div>
                <div className="text-sm text-gray-600">Avg sync time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-pink-600">77%</div>
                <div className="text-sm text-gray-600">Time reduction</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">4</div>
                <div className="text-sm text-gray-600">Integrations</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}