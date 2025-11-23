"use client";

// ==============================================
// ECHO - Dashboard Page (REAL DATA from API)
// ==============================================

import { useEffect, useState } from "react";
import { LiveCounter } from "@/components/custom/LiveCounter";


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
import { Bell, Settings, RefreshCw, Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface MetricsData {
  overview: {
    syncedToday: { value: number; change: number };
    timeSaved: { value: number; change: number };
    automations: { value: number; change: number };
    successRate: { value: number; change: number };
  };
  deals: {
    total: number;
    open: number;
    closed: number;
    pending: number;
    totalAmount: number;
    avgDealSize: number;
  };
  lastDeal: {
    dealId: string;
    customer: string;
    amount: number;
    timestamp: string;
    timeAgo: string;
  } | null;
  recentActivity: Array<{
    id: string;
    dealId: string;
    customer: string;
    amount: number;
    status: string;
    description: string;
    time: string;
    timeSaved: number;
  }>;
}

export default function DashboardPage() {
  // ---------- Metrics state ----------
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // ---------- Fetch metrics from /api/metrics ----------
  const fetchMetrics = async () => {
    try {
      setError(null);
      const res = await fetch("/api/metrics", { cache: "no-store" });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch metrics");
      }

      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchMetrics();
  }, []);

  // Manual refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchMetrics();
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
              <Button
                variant="ghost"
                size="icon"
                onClick={handleRefresh}
                disabled={refreshing}
              >
                <RefreshCw
                  className={`h-5 w-5 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
              </Button>
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
            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-3" />
                  <p className="text-gray-600">
                    Loading metrics from Google Sheets...
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <Card className="border-red-500/50 bg-red-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-red-600 font-medium mb-2">
                      Failed to load metrics
                    </p>
                    <p className="text-sm text-red-500 mb-4">{error}</p>
                    <Button onClick={handleRefresh} variant="outline">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Data Loaded */}
            {metrics && !loading && (
              <>
                {/* Hero Stats (todo real de /api/metrics) */}
                <div className="rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8">
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                      label="Actions Automated Today"
                      value={metrics.overview.syncedToday.value}
                      change={metrics.overview.syncedToday.change}
                      trend="up"
                    />
                    <StatCard
                      label="Time Saved This Month"
                      value={`${metrics.overview.timeSaved.value}h`}
                      change={metrics.overview.timeSaved.change}
                      trend="up"
                    />
                    <StatCard
                      label="Active Automations"
                      value={metrics.overview.automations.value}
                      change={metrics.overview.automations.change}
                      isCount
                    />
                    <StatCard
                      label="Success Rate"
                      value={`${metrics.overview.successRate.value}%`}
                      change={metrics.overview.successRate.change}
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
                            metrics.overview.timeSaved.value * 50
                          ).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-white/70 text-sm mb-1">
                          Total Deal Value
                        </div>
                        <div className="text-2xl font-bold text-white">
                          ${metrics.deals.totalAmount.toLocaleString()}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-white/70 text-sm mb-1">
                          Avg Deal Size
                        </div>
                        <div className="text-2xl font-bold text-white">
                          ${metrics.deals.avgDealSize.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Counters */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <LiveCounter
                    label="Total Syncs"
                    value={metrics.deals.total}
                    icon="⚡"
                    color="indigo"
                    enableLiveUpdates={true}
                  />

                  <LiveCounter
                    label="Time Saved"
                    value={metrics.overview.timeSaved.value}
                    unit="h"
                    icon="⏱️"
                    color="purple"
                  />

                  <LiveCounter
                    label="Closed Deals"
                    value={metrics.deals.closed}
                    icon="✅"
                    color="green"
                  />

                  <LiveCounter
                    label="Open Deals"
                    value={metrics.deals.open}
                    icon="📊"
                    color="green"
                  />
                </div>

                {/* Two Column Layout */}
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Recent Activity (real) */}
                  <Card className="border-purple-500/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl">
                            Recent Activity
                          </CardTitle>
                          <CardDescription>
                            Latest {metrics.recentActivity.length} synchronizations
                          </CardDescription>
                        </div>
                        <Badge
                          variant="outline"
                          className="border-green-500/50 bg-green-50 text-green-700"
                        >
                          Real Data
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {metrics.recentActivity.length > 0 ? (
                          metrics.recentActivity.map((activity) => (
                            <div
                              key={activity.id}
                              className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0 hover:bg-muted/50 -mx-2 px-2 py-2 rounded-lg transition-colors"
                            >
                              <div className="text-2xl">⚡</div>

                              <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium">
                                  {activity.description}
                                </p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-xs text-muted-foreground">
                                    {activity.time}
                                  </p>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    Saved{" "}
                                    {Math.floor(
                                      activity.timeSaved / 60
                                    )}{" "}
                                    min
                                  </Badge>
                                  <Badge
                                    className={
                                      activity.status === "closed"
                                        ? "bg-green-500 text-xs"
                                        : activity.status === "pending"
                                        ? "bg-yellow-500 text-xs"
                                        : "bg-blue-500 text-xs"
                                    }
                                  >
                                    {activity.status}
                                  </Badge>
                                </div>
                              </div>

                              <Badge className="bg-green-500 shrink-0">
                                ✓
                              </Badge>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-400">
                            <p className="text-sm">No recent activity</p>
                            <Link href="/manual-sync">
                              <Button
                                variant="outline"
                                className="mt-3"
                                size="sm"
                              >
                                Create First Sync
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Deals Overview (solo métricas reales) */}
                  <Card className="border-indigo-500/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-xl">
                            Deals Overview
                          </CardTitle>
                          <CardDescription>
                            Breakdown of your current pipeline
                          </CardDescription>
                        </div>
                        <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 border-0">
                          Real Metrics
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-muted/60">
                            <p className="text-xs text-muted-foreground">
                              Total Deals
                            </p>
                            <p className="text-2xl font-bold">
                              {metrics.deals.total}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/60">
                            <p className="text-xs text-muted-foreground">
                              Closed
                            </p>
                            <p className="text-2xl font-bold text-green-600">
                              {metrics.deals.closed}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/60">
                            <p className="text-xs text-muted-foreground">
                              Open
                            </p>
                            <p className="text-2xl font-bold text-blue-600">
                              {metrics.deals.open}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-muted/60">
                            <p className="text-xs text-muted-foreground">
                              Pending
                            </p>
                            <p className="text-2xl font-bold text-amber-600">
                              {metrics.deals.pending}
                            </p>
                          </div>
                        </div>

                        {/* Distribution bar (real, basada en open/closed/pending) */}
                        <div className="space-y-2">
                          <p className="text-xs text-muted-foreground">
                            Pipeline Distribution
                          </p>
                          <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                            {["closed", "open", "pending"].map((status) => {
                              const total =
                                metrics.deals.total || 1;
                              const count =
                                metrics.deals[
                                  status as "closed" | "open" | "pending"
                                ];
                              const pct = (count / total) * 100;

                              const color =
                                status === "closed"
                                  ? "bg-green-500"
                                  : status === "open"
                                  ? "bg-blue-500"
                                  : "bg-amber-500";

                              return (
                                <div
                                  key={status}
                                  className={color}
                                  style={{ width: `${pct}%` }}
                                />
                              );
                            })}
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground mt-1">
                            <span>Closed</span>
                            <span>Open</span>
                            <span>Pending</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Last Deal Card */}
                {metrics.lastDeal && (
                  <Card className="border-2 border-purple-500/20 bg-gradient-to-br from-purple-50 to-pink-50">
                    <CardHeader>
                      <CardTitle className="text-lg">
                        Latest Deal Synced
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid sm:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Deal ID
                          </p>
                          <p className="font-mono font-semibold">
                            {metrics.lastDeal.dealId}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Customer
                          </p>
                          <p className="font-semibold">
                            {metrics.lastDeal.customer}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Amount
                          </p>
                          <p className="text-lg font-bold text-purple-600">
                            $
                            {metrics.lastDeal.amount.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">
                            Time
                          </p>
                          <p className="text-sm font-medium">
                            {metrics.lastDeal.timeAgo}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
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
