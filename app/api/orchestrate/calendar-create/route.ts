// =============================================================================
// ECHO - Calendar Proxy Endpoint
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createDealFollowUp } from "@/lib/integrations/calendar";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    console.log("📅 Calendar Proxy: Request received");

    const body = await req.json();
    const { dealId, customer, amount, status } = body;

    console.log("📅 Calendar Proxy: Payload:", {
      dealId,
      customer,
      amount,
      status,
    });

    // Validación
    if (!dealId || !customer || typeof amount !== "number") {
      console.error("❌ Calendar Proxy: Invalid payload");
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payload: dealId, customer, and amount required",
        },
        { status: 400 }
      );
    }

    // Llamar función existente
    console.log("📅 Calendar Proxy: Calling createDealFollowUp...");
    const result = await createDealFollowUp({
    dealId,
    customer,
    amount,
    });

    const duration = Date.now() - startTime;

    if (!result.success) {
      console.error(`❌ Calendar Proxy: Failed after ${duration}ms:`, result.error);
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Calendar creation failed",
        },
        { status: 500 }
      );
    }

    console.log(`✅ Calendar Proxy: Success in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: "Calendar event created via Echo backend",
      dealId,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ Calendar Proxy: Error after ${duration}ms:`, msg);

    return NextResponse.json(
      {
        success: false,
        message: msg,
      },
      { status: 500 }
    );
  }
}