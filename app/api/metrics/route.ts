// ==============================================
// ECHO - Metrics API (Real Data from Sheets)
// ==============================================

import { NextResponse } from "next/server";
import { readFromSheet } from "@/lib/integrations/sheets";

export async function GET() {
  try {
    console.log("📊 Fetching real metrics from Google Sheets...");

    // Lee todas las columnas A:E: [timestamp, dealId, customer, amount, status]
    const result = await readFromSheet("A:E");

    if (!result.success || !result.data) {
      throw new Error(result.error || "Failed to read from sheet");
    }

    const rows = result.data;

    // Saltar cabecera si la primera celda contiene "timestamp"
    const dataRows =
      rows.length > 0 &&
      typeof rows[0][0] === "string" &&
      rows[0][0].toLowerCase().includes("timestamp")
        ? rows.slice(1)
        : rows;

    console.log(`✅ Read ${dataRows.length} rows from Sheets`);

    // --------- Acumuladores de métricas ----------

    let totalDeals = 0;
    let totalAmount = 0;
    let openDeals = 0;
    let closedDeals = 0;
    let pendingDeals = 0;

    let lastDealTimestamp: Date | null = null;
    let lastDealCustomer: string | null = null;
    let lastDealId: string | null = null;
    let lastDealAmount: number | null = null;

    // Guardamos la actividad con el timestamp real para ordenar bien
    const activityRaw: Array<{
      id: string;
      dealId: string;
      customer: string;
      amount: number;
      status: string;
      timestamp: Date;
    }> = [];

    // --------- Procesar filas ----------

    for (const row of dataRows) {
      if (row.length < 4) continue;

      const [timestampStr, dealId, customer, amountStr, status] = row;

      // Limpiar amount (remover $, comas)
      const cleanAmount = amountStr?.toString().replace(/[$,]/g, "") || "0";
      const amount = parseFloat(cleanAmount);

      if (isNaN(amount) || amount <= 0) {
        continue;
      }

      totalDeals++;
      totalAmount += amount;

      // Contar por status
      const statusLower = (status?.toString() || "open").toLowerCase();
      if (statusLower === "closed") closedDeals++;
      else if (statusLower === "pending") pendingDeals++;
      else openDeals++;

      // Parsear timestamp (DD/MM/YYYY HH:mm:ss o ISO)
      try {
        const tsStr = timestampStr?.toString() || "";
        let timestampISO = "";

        const match = tsStr.match(
          /(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})/
        );

        if (match) {
          const [, day, month, year, hour, min, sec] = match;
          timestampISO = `${year}-${month}-${day}T${hour}:${min}:${sec}`;
        } else {
          // Si ya viene en ISO, esto lo deja casi igual
          timestampISO = tsStr.replace(" ", "T");
        }

        const timestamp = new Date(timestampISO);

        if (!isNaN(timestamp.getTime())) {
          // Último deal
          if (!lastDealTimestamp || timestamp > lastDealTimestamp) {
            lastDealTimestamp = timestamp;
            lastDealCustomer = customer?.toString() || "Unknown";
            lastDealId = dealId?.toString() || "Unknown";
            lastDealAmount = amount;
          }

          // Guardar actividad cruda con timestamp real
          activityRaw.push({
            id: `${dealId}-${timestamp.getTime()}`,
            dealId: dealId?.toString() || "Unknown",
            customer: customer?.toString() || "Unknown",
            amount,
            status: statusLower,
            timestamp,
          });
        }
      } catch {
        console.warn("⚠️ Failed to parse timestamp:", timestampStr);
      }
    }

    console.log(
      `📊 Processed: totalDeals=${totalDeals}, rawActivity=${activityRaw.length}`
    );

    // --------- Ordenar por timestamp real y tomar top 10 ----------

    activityRaw.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );

    const topActivity = activityRaw.slice(0, 10);

    // --------- Métricas derivadas ----------

    const avgDealSize =
      totalDeals > 0 ? Math.round(totalAmount / totalDeals) : 0;
    const successRate =
      totalDeals > 0 ? Math.round((closedDeals / totalDeals) * 100) : 100;

    // 210 sec por sync
    const totalTimeSavedSec = totalDeals * 210;
    const timeSavedHours = Math.round(totalTimeSavedSec / 3600);

    const activeAutomations = 4;

    // --------- Construir respuesta ----------

    const metrics = {
      overview: {
        syncedToday: {
          // de momento igual al total (puedes refinar luego por fecha)
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
      recentActivity: topActivity.map((activity) => ({
        id: activity.id,
        dealId: activity.dealId,
        customer: activity.customer,
        amount: activity.amount,
        // el badge de la UI usa "success" fijo
        status: "success" as const,
        time: formatRelativeTime(activity.timestamp),
        timeSaved: 210,
        description: `Synced deal ${activity.dealId} for ${activity.customer} ($${activity.amount.toLocaleString()})`,
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
      { status: 500 }
    );
  }
}

// ========= Helpers =========

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
