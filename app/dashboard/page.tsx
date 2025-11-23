"use client";

// ==============================================
// ECHO - Dashboard Page (Clean & Focused)
// ==============================================

import { useState } from "react";
import { LiveCounter } from "@/components/custom/LiveCounter";
import { PredictiveAlert } from "@/components/predictive-alert";
import { patternDetector } from "@/lib/patterns";
import type { PatternAlert } from "@/lib/patternDetection/types";
import type { SyncResponse } from "@/lib/types";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import data from "./data.json";
import { Bell, Settings } from "lucide-react";
import Image from "next/image";

export default function DashboardPage() {
  const [alert, setAlert] = useState<PatternAlert | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [lastSync, setLastSync] = useState<{
    amount: number;
    source: string;
    targets: string[];
  } | null>(null);

  const handleRunDemoSync = async () => {
    try {
      setSyncLoading(true);

      const res = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "crm",
          targets: ["slack", "sheets"],
          data: {
            dealId: "demo-deal-123",
            customer: "Acme Corp",
            amount: 120000,
            status: "open",
            assignedTo: "alice@echo.app",
            notes: "Demo sync triggered from dashboard",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            customerEmail: "contact@acme.com",
          },
          userId: "demo-user-1",
          timestamp: new Date().toISOString(),
        }),
      });

      if (!res.ok) {
        console.error("Sync failed", await res.text());
        return;
      }

      const dataRes = (await res.json()) as SyncResponse;

      const amount = dataRes.amount ?? 120000;
      const source = dataRes.source ?? "crm";
      const targets = dataRes.synced ?? [];

      setLastSync({ amount, source, targets });

      // 🔮 Send action to pattern detector
      patternDetector.recordAction({
        source,
        targets,
        amount,
        timestamp: new Date().toISOString(),
      });

      const maybeAlert = patternDetector.detectPattern();
      if (maybeAlert) {
        setAlert(maybeAlert);
      }
    } catch (err) {
      console.error("Error calling /api/sync", err);
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        {/* Sidebar */}
        <AppSidebar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
            <SidebarTrigger />

            <div className="flex items-center gap-3">
              <Image
                src="/Echo_logo.png"
                alt="ECHO Logo"
                width={40}
                height={40}
                className="transition-transform hover:scale-110"
              />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Echo
              </h1>
              <Badge
                variant="outline"
                className="gap-1 border-purple-500/50 text-purple-600"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500" />
                </span>
                Live
              </Badge>
            </div>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-3">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="flex-1 p-6 space-y-6">
            {/* 🔮 Predictive Alert from patternDetector */}
            {alert && (
              <PredictiveAlert
                alert={alert}
                onAccept={async (a) => {
                  try {
                    await fetch("/api/automations", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        userId: "demo-user-1", // in real app: from auth/session
                        type: "high_value_deal",
                        minAmount:
                          a.suggestedAutomation.minAmount ?? 100000,
                        targets: a.suggestedAutomation.targets,
                      }),
                    });
                    console.log("✅ Automation created", a);
                  } catch (err) {
                    console.error(
                      "Failed to create automation",
                      err
                    );
                  } finally {
                    setAlert(null);
                  }
                }}
                onDismiss={(id) => {
                  console.log("❌ Alert dismissed", id);
                  setAlert(null);
                }}
              />
            )}

            {/* Demo sync card */}
            <Card className="border-purple-500/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">
                      Run sync demo with ECHO
                    </CardTitle>
                    <CardDescription>
                      Trigger a real sync and let ECHO detect patterns
                      automatically.
                    </CardDescription>
                  </div>

                  {/* Run demo sync button with gradient */}
                  <Button
                    onClick={handleRunDemoSync}
                    disabled={syncLoading}
                    className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white border-0 shadow-sm hover:brightness-110 hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {syncLoading ? "Syncing…" : "Run demo sync"}
                  </Button>
                </div>
                {lastSync && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Last sync: ${lastSync.amount.toLocaleString()} ·{" "}
                    {lastSync.targets.join(", ") || "no targets"} from{" "}
                    {lastSync.source}
                  </p>
                )}
              </CardHeader>
            </Card>

            {/* Hero Stats */}
            <div className="rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Actions Automated Today"
                  value={data.overview.syncedToday.value}
                  change={data.overview.syncedToday.change}
                  trend="up"
                />
                <StatCard
                  label="Time Saved This Month"
                  value={`${data.overview.timeSaved.value}h`}
                  change={data.overview.timeSaved.change}
                  trend="up"
                />
                <StatCard
                  label="Active Automations"
                  value={data.overview.automations.value}
                  change={`+${data.overview.automations.change} new`}
                  isCount
                />
                <StatCard
                  label="Success Rate"
                  value={`${data.overview.successRate.value}%`}
                  change={data.overview.successRate.change}
                  trend="up"
                />
              </div>

              {/* ROI Section */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-white/70 text-sm mb-1">
                      Monthly Savings
                    </div>
                    <div className="text-2xl font-bold text-white">
                      $
                      {(
                        data.overview.timeSaved.value * 50
                      ).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/70 text-sm mb-1">
                      Annual ROI
                    </div>
                    <div className="text-2xl font-bold text-white">
                      800%+
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/70 text-sm mb-1">
                      Avg Response Time
                    </div>
                    <div className="text-2xl font-bold text-white">
                      1.8s
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Counters */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <LiveCounter
                label="Live Syncs"
                value={data.overview.syncedToday.value}
                icon="⚡"
                color="indigo"
                enableLiveUpdates={true}
              />

              <LiveCounter
                label="Time Saved"
                value={data.overview.timeSaved.value}
                unit="h"
                icon="⏱️"
                color="purple"
              />

              <LiveCounter
                label="Automations"
                value={data.overview.automations.value}
                icon="🤖"
                color="green"
              />

              <LiveCounter
                label="Success Rate"
                value={data.overview.successRate.value}
                unit="%"
                icon="✅"
                color="green"
              />
            </div>

            {/* Two Column Layout */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Recent Activity */}
              <Card className="border-purple-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        Recent Activity
                      </CardTitle>
                      <CardDescription>
                        Latest synchronizations across platforms
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className="border-purple-500/50"
                    >
                      Live
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.recentActivity.map((activity) => (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0 hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                      >
                        <div className="text-2xl">
                          {activity.type === "sync"
                            ? "⚡"
                            : activity.type === "email"
                            ? "📧"
                            : "🔮"}
                        </div>

                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">
                            {activity.description}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground">
                              {activity.time}
                            </p>
                            {activity.timeSaved > 0 && (
                              <Badge variant="secondary" className="text-xs">
                                Saved{" "}
                                {Math.floor(activity.timeSaved / 60)} min
                              </Badge>
                            )}
                          </div>
                        </div>

                        <Badge
                          className={
                            activity.status === "success"
                              ? "bg-green-500"
                              : "bg-blue-500"
                          }
                        >
                          {activity.status === "success" ? "✓" : "ℹ"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Active Automations */}
              <Card className="border-indigo-500/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        Active Automations
                      </CardTitle>
                      <CardDescription>
                        Patterns running automatically
                      </CardDescription>
                    </div>
                    <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 border-0">
                      {data.automationRules.length} Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.automationRules.map((rule) => (
                      <div
                        key={rule.id}
                        className="p-4 rounded-lg border hover:border-purple-500/50 transition-all hover:shadow-md"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">🤖</span>
                            <span className="font-medium">
                              {rule.name}
                            </span>
                          </div>
                          <Badge
                            className={
                              rule.enabled
                                ? "bg-green-500"
                                : "bg-gray-500"
                            }
                          >
                            {rule.enabled ? "Active" : "Paused"}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                          {rule.pattern.map((step, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5"
                            >
                              <span className="px-2.5 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-medium rounded-full">
                                {step}
                              </span>
                              {idx < rule.pattern.length - 1 && (
                                <span className="text-purple-500">
                                  →
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1.5">
                            <div className="w-full max-w-[100px] h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                style={{ width: `${rule.frequency}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium">
                              {rule.frequency}%
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {rule.timesExecuted}x executed
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

// Helper Component for Hero Stats
function StatCard({
  label,
  value,
  change,
  trend,
  isCount = false,
}: {
  label: string;
  value: string | number;
  change: string | number;
  trend?: "up" | "down";
  isCount?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="text-white/80 text-sm font-medium">{label}</div>
      <div className="text-4xl font-bold text-white">{value}</div>
      <div className="flex items-center gap-2">
        <Badge className="bg-white/20 text-white border-0">
          {trend === "up" && "↑ "}
          {trend === "down" && "↓ "}
          {change}
          {isCount ? "" : "%"}
        </Badge>
        <span className="text-white/60 text-xs">
          {isCount
            ? "this week"
            : trend === "up"
            ? "increase"
            : "vs previous"}
        </span>
      </div>
    </div>
  );
}
