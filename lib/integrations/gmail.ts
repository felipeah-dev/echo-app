//lib/integrations/gmail.ts

// ==============================================
// ECHO - Gmail Integration (Nodemailer)
// ==============================================

import nodemailer from "nodemailer";
import { integrations } from "@/lib/config";
import { retry } from "@/lib/retry";
import type { IntegrationResult } from "@/lib/types";

/**
 * Email transporter singleton
 */
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: integrations.email.host,
      port: integrations.email.port,
      secure: false, // true for 465, false for other ports
      auth: {
        user: integrations.email.user,
        pass: integrations.email.pass,
      },
    });
  }
  return transporter;
}

/**
 * Send email
 */
export async function sendEmail(options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}): Promise<IntegrationResult> {
  const startTime = Date.now();

  try {
    // Check if email is enabled
    if (!integrations.email.enabled) {
      console.log("🔶 Email: Mode MOCK - Email would be sent to:", options.to);
      console.log("   Subject:", options.subject);
      return {
        success: true,
        target: "email",
        message: `Mock: Email sent to ${options.to}`,
        timestamp: new Date(),
      };
    }

    // Send email with retry logic
    await retry(
      async () => {
        const transport = getTransporter();
        await transport.sendMail({
          from: integrations.email.from,
          to: options.to,
          subject: options.subject,
          text: options.text,
          html: options.html,
        });
      },
      {
        maxAttempts: 3,
        delayMs: 1000,
        onRetry: (attempt, error) => {
          console.warn(`⚠️ Email retry attempt ${attempt}:`, error.message);
        },
      }
    );

    const duration = Date.now() - startTime;
    console.log(`✅ Email: Sent to ${options.to} in ${duration}ms`);

    return {
      success: true,
      target: "email",
      message: `Email sent to ${options.to}`,
      timestamp: new Date(),
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error(`❌ Email: Failed after ${duration}ms:`, errorMessage);

    return {
      success: false,
      target: "email",
      error: errorMessage,
      timestamp: new Date(),
    };
  }
}

/**
 * Send deal confirmation email
 */
export async function sendDealConfirmation(
  to: string,
  deal: {
    dealId: string;
    customer: string;
    amount: number;
    status?: string;
  }
): Promise<IntegrationResult> {
  const subject = `Deal ${deal.dealId} - ${deal.customer}`;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f8f9fa; padding: 20px; border-radius: 0 0 8px 8px; }
          .deal-info { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .amount { font-size: 24px; font-weight: bold; color: #6366f1; }
          .footer { text-align: center; margin-top: 20px; color: #64748b; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔊 Echo - Deal Update</h1>
          </div>
          <div class="content">
            <p>A deal has been updated and synced across all platforms:</p>
            <div class="deal-info">
              <p><strong>Deal ID:</strong> ${deal.dealId}</p>
              <p><strong>Customer:</strong> ${deal.customer}</p>
              <p><strong>Amount:</strong> <span class="amount">$${deal.amount.toLocaleString()}</span></p>
              ${deal.status ? `<p><strong>Status:</strong> ${deal.status}</p>` : ""}
            </div>
            <p>This update has been automatically synced to:</p>
            <ul>
              <li>✅ Slack notification sent</li>
              <li>✅ Google Sheets updated</li>
              <li>✅ Follow-up scheduled</li>
            </ul>
          </div>
          <div class="footer">
            <p>Automated by Echo - Shadow Work Eliminator</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const text = `
Echo - Deal Update

Deal ID: ${deal.dealId}
Customer: ${deal.customer}
Amount: $${deal.amount.toLocaleString()}
${deal.status ? `Status: ${deal.status}` : ""}

This update has been automatically synced across all platforms.

---
Automated by Echo - Shadow Work Eliminator
  `;

  return sendEmail({ to, subject, text, html });
}

/**
 * Send error notification email
 */
export async function sendErrorEmail(
  to: string,
  error: string,
  context?: Record<string, unknown>
): Promise<IntegrationResult> {
  const subject = "🚨 Echo - Error Alert";

  const html = `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h2 style="color: #ef4444;">Error Alert</h2>
        <p><strong>Error:</strong> ${error}</p>
        ${context ? `<pre style="background: #f1f5f9; padding: 10px; border-radius: 4px;">${JSON.stringify(context, null, 2)}</pre>` : ""}
      </body>
    </html>
  `;

  return sendEmail({ to, subject, html });
}