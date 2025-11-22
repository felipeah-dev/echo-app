// =============================================================================
// ECHO - Gmail Proxy Endpoint
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { sendDealConfirmation } from "@/lib/integrations/gmail";

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    console.log("📧 Gmail Proxy: Request received");

    const body = await req.json();
    const { dealId, customer, amount, status, email } = body;

    console.log("📧 Gmail Proxy: Payload:", {
      dealId,
      customer,
      amount,
      email,
    });

    // Validación
    if (!dealId || !customer || typeof amount !== "number") {
      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 }
      );
    }

    const recipientEmail = email || process.env.SMTP_USER || "customer@example.com";

    // Llamar función existente
    console.log("📧 Gmail Proxy: Calling sendDealConfirmation...");
    const result = await sendDealConfirmation(recipientEmail, {
      dealId,
      customer,
      amount,
      status: status || "open",
    });

    const duration = Date.now() - startTime;

    if (!result.success) {
      console.error(`❌ Gmail Proxy: Failed after ${duration}ms`);
      return NextResponse.json(
        { success: false, message: result.error || "Email send failed" },
        { status: 500 }
      );
    }

    console.log(`✅ Gmail Proxy: Success in ${duration}ms`);

    return NextResponse.json({
      success: true,
      message: "Email sent via Echo backend",
      dealId,
      recipient: recipientEmail,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("❌ Gmail Proxy:", msg);
    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}