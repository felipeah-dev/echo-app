// =============================================================================
// ECHO - Sheets Proxy Endpoint
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { appendDealToForecast } from "@/lib/integrations/sheets";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    console.log("📊 Sheets Proxy: Request received");

    const body = await req.json();
    const { dealId, customer, amount, status, timestamp } = body;

    console.log("📊 Sheets Proxy: Payload:", {
      dealId,
      customer,
      amount,
      status,
      timestamp,
    });

    // Validación básica
    if (!dealId || !customer || typeof amount !== "number") {
      console.error("❌ Sheets Proxy: Invalid payload");
      return NextResponse.json(
        {
          success: false,
          message: "Invalid payload: dealId, customer, and amount are required",
        },
        { status: 400 }
      );
    }

    // Llamar a la función que ya funciona
    console.log("📊 Sheets Proxy: Calling appendDealToForecast...");
    const result = await appendDealToForecast({
      dealId,
      customer,
      amount,
      status: status || "open",
    });

    const duration = Date.now() - startTime;

    if (!result.success) {
      console.error(`❌ Sheets Proxy: Failed after ${duration}ms:`, result.error);
      return NextResponse.json(
        {
          success: false,
          message: result.error || "Sheets append failed",
        },
        { status: 500 }
      );
    }

    console.log(`✅ Sheets Proxy: Success in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: "Row appended to Google Sheet via Echo backend",
      dealId,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const duration = Date.now() - startTime;
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ Sheets Proxy: Error after ${duration}ms:`, msg);

    return NextResponse.json(
      {
        success: false,
        message: msg,
      },
      { status: 500 }
    );
  }
}