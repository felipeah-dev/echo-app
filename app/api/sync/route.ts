//app/api/sync/route.ts

// =============================================================================
// ECHO - Main Sync API Endpoint (Serverless)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { validateSyncRequest } from "@/lib/validation";
import { getOrchestrator } from "@/lib/orchestrate";
import type { SyncResponse, SyncTarget } from "@/lib/types";
import { applyAutomationsForSync } from "@/app/api/automations/apply";

/**
 * POST /api/sync
 * Main endpoint to sync deal data across platforms
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log("🚀 Sync request started");

  try {
    // Parse and validate request body
    const body = await request.json();
    const syncRequest = validateSyncRequest(body);

    const userId = syncRequest.userId ?? "demo-user-1";

    console.log("✅ Request validated:", {
      userId,
      source: syncRequest.source,
      dealId: syncRequest.data.dealId,
      targets: syncRequest.targets,
    });

    // Apply saved automations before orchestrating
    const { targets: finalTargets, appliedRules } = applyAutomationsForSync({
      userId,
      amount: syncRequest.data.amount,
      currentTargets: syncRequest.targets,
    });

    // Get the orchestrator (watsonx or direct)
    const orchestrator = getOrchestrator();

    // Execute orchestration with finalTargets
    const resultsMap = await orchestrator.execute(
      finalTargets,
      syncRequest.data
    );

    // Process results
    const synced: SyncTarget[] = [];
    const failed: SyncTarget[] = [];
    const decisionLog: string[] = [];

    resultsMap.forEach((result, target) => {
      if (result.success) {
        synced.push(target);
        decisionLog.push(`✅ ${target}: ${result.message || "Success"}`);
      } else {
        failed.push(target);
        decisionLog.push(
          `❌ ${target}: ${result.error || "Unknown error"}`
        );
      }
    });

    // Calculate time saved (15 min manual - 3.5 min with Echo = 11.5 min per sync)
    const timeSavedSec = synced.length * 210; // 3.5 min = 210 sec per target

    // Add business rules to decision log
    if (syncRequest.data.amount >= 50000) {
      decisionLog.push("💼 Rule: Large deal (>$50k) - VP notified");
    }

    // Log applied automation rules
    if (appliedRules.length > 0) {
      appliedRules.forEach((rule) => {
        decisionLog.push(
          `🤖 Automation applied: high-value deals ≥ $${rule.minAmount.toLocaleString()} auto-synced to ${rule.targets.join(
            ", "
          )}`
        );
      });
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Sync completed in ${duration}ms`);
    console.log(`   Synced: ${synced.join(", ")}`);
    console.log(`   Failed: ${failed.join(", ") || "none"}`);

    const response: SyncResponse = {
      success: failed.length === 0,
      synced,
      failed,
      timeSavedSec,
      decisionLog,
      // Used by pattern detector on the frontend
      amount: syncRequest.data.amount,
      source: syncRequest.source,
    };

    return NextResponse.json(response, {
      status: failed.length === 0 ? 200 : 207, // 207 = Multi-Status
    });
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error(`❌ Sync failed after ${duration}ms:`, errorMessage);

    const response: SyncResponse = {
      success: false,
      synced: [],
      failed: ["slack", "sheets", "email", "calendar"],
      timeSavedSec: 0,
      decisionLog: [`❌ Fatal error: ${errorMessage}`],
      error: errorMessage,
    };

    return NextResponse.json(response, { status: 500 });
  }
}
