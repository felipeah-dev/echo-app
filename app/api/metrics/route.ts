// ==============================================
// ECHO - Metrics API (Real Data from Sheets)
// ==============================================

import { NextResponse } from "next/server";
import { readFromSheet } from "@/lib/integrations/sheets";

type RecentActivityItem = {
  id: string;
  dealId: string;
  customer: string;
  amount: number;
  status: string;
  time: string;
  type: string;
  // 🔥 usamos esto solo para ordenar, no se envía al front
  timestampMs: number;
};

export async function GET() {
  try {
    console.log("📊 Fetching real metrics from Google Sheets...");

    // Read all data
    const result = await readFromSheet("A:E");

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to read from sheet");
    }

    const rows = result.data;

    // Skip header row if exists
    const dataRows =
      rows.length > 0 &&
      typeof rows[0][0] === "string" &&
      rows[0][0].toLowerCase().includes("timestamp")
        ? rows.slice(1)
        : rows;

    console.log(`✅ Read ${dataRows.length} rows from Sheets`);

    // Calculate metrics
    let totalDeals = 0;
    let totalAmount = 0;
    let openDeals = 0;
    let closedDeals = 0;
    let pendingDeals = 0;
    let lastDealTimestamp: Date | null = null;
    let lastDealCustomer: string | null = null;
    let lastDealId: string | null = null;
    let lastDealAmount: number | null = null;

    const recentActivity: RecentActivityItem[] = [];

    for (const row of dataRows) {
      if (row.length < 4) continue;

      const [timestampStr, dealId, customer, amountStr, status] = row;

      // ⭐ Limpiar amount (remover $, comas)
      const cleanAmount = amountStr?.toString().replace(/[$,]/g, "") || "0";
      const amount = parseFloat(cleanAmount);

      if (isNaN(amount) || amount <= 0) {
        continue;
      }

      totalDeals++;
      totalAmount += amount;

      // Count by status
      const statusLower = (status?.toString() || "open").toLowerCase();
      if (statusLower === "closed") closedDeals++;
      else if (statusLower === "pending") pendingDeals++;
      else openDeals++;

      // ⭐ Parsear timestamp (soporta DD/MM/YYYY HH:MM:SS o ISO)
      try {
        let timestampISO = "";
        const tsStr = timestampStr?.toString() || "";

        // Intentar parsear formato: "22/11/2025 22:06:36"
        const match = tsStr.match(
          /(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/,
        );

        if (match) {
          const [, day, month, year, hour, min, sec] = match;
          timestampISO = `${year}-${month}-${day}T${hour}:${min}:${sec}`;
        } else {
          // Si no machea, intentar usarlo tal cual (ISO, etc.)
          timestampISO = tsStr.replace(" ", "T");
        }

        const timestamp = new Date(timestampISO);

        if (!isNaN(timestamp.getTime())) {
          const tsMs = timestamp.getTime();

          // Track "last deal"
          if (!lastDealTimestamp || timestamp > lastDealTimestamp) {
            lastDealTimestamp = timestamp;
            lastDealCustomer = customer?.toString() || "Unknown";
            lastDealId = dealId?.toString() || "Unknown";
            lastDealAmount = amount;
          }

          // Agregar a actividad reciente
          recentActivity.push({
            id: `${dealId}-${tsMs}`,
            dealId: dealId?.toString() || "Unknown",
            customer: customer?.toString() || "Unknown",
            amount,
            status: statusLower,
            time: formatRelativeTime(timestamp),
            type: "sync",
            timestampMs: tsMs,
          });
        }
      } catch {
        console.warn("⚠️ Failed to parse timestamp:", timestampStr);
      }
    }

    console.log(
      `📊 Processed: totalDeals=${totalDeals}, recentActivity=${recentActivity.length}`,
    );

    // 🔥 Ordenar por timestamp REAL (más reciente primero)
    recentActivity.sort((a, b) => b.timestampMs - a.timestampMs);

    // Top 10 actividades
    const topActivity = recentActivity.slice(0, 10);

    // Calculate derived metrics
    const avgDealSize =
      totalDeals > 0 ? Math.round(totalAmount / totalDeals) : 0;
    const successRate =
      totalDeals > 0 ? Math.round((closedDeals / totalDeals) * 100) : 100;

    // Time saved calculation: 210 sec per sync
    const totalTimeSavedSec = totalDeals * 210;
    const timeSavedHours = Math.round(totalTimeSavedSec / 3600);

    const activeAutomations = 4;

    // Response
    const metrics = {
      overview: {
        syncedToday: {
          value: totalDeals,
          change: 12,
        },
        timeSaved: {
          value: timeSavedHours,
          change: 15,
        },
        automations: {
          value: activeAutomations,
          change: 1,
        },
        successRate: {
          value: successRate,
          change: 2,
        },
      },
      deals: {
        total: totalDeals,
        open: openDeals,
        closed: closedDeals,
        pending: pendingDeals,
        totalAmount,
        avgDealSize,
      },
      lastDeal: lastDealId
        ? {
            dealId: lastDealId,
            customer: lastDealCustomer,
            amount: lastDealAmount,
            timestamp: lastDealTimestamp?.toISOString(),
            timeAgo: lastDealTimestamp
              ? formatRelativeTime(lastDealTimestamp)
              : "Unknown",
          }
        : null,
      recentActivity: topActivity.map(({ timestampMs, ...activity }) => ({
        ...activity,
        description: `Synced deal ${activity.dealId} for ${activity.customer} ($${activity.amount.toLocaleString()})`,
        status: "success" as const,
        timeSaved: 210,
      })),
    };

    console.log("✅ Metrics calculated successfully");

    return NextResponse.json(metrics, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Metrics API failed:", errorMessage);

    return NextResponse.json(
      {
        error: errorMessage,
        overview: {
          syncedToday: { value: 0, change: 0 },
          timeSaved: { value: 0, change: 0 },
          automations: { value: 0, change: 0 },
          successRate: { value: 0, change: 0 },
        },
        deals: {
          total: 0,
          open: 0,
          closed: 0,
          pending: 0,
          totalAmount: 0,
          avgDealSize: 0,
        },
        lastDeal: null,
        recentActivity: [],
      },
      { status: 500 },
    );
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSec < 60) return `${diffSec} sec ago`;
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}
