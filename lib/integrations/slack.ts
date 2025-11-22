// ==============================================
// ECHO - Slack Integration
// ==============================================

import { WebClient } from "@slack/web-api";
import { integrations } from "@/lib/config";
import { retry } from "@/lib/retry";
import type { IntegrationResult } from "@/lib/types";

/**
 * Slack client singleton
 */
let slackClient: WebClient | null = null;

function getSlackClient(): WebClient {
  if (!slackClient) {
    slackClient = new WebClient(integrations.slack.token);
  }
  return slackClient;
}

/**
 * Send message to Slack channel
 */
export async function sendSlackMessage(
  text: string,
  channelId?: string
): Promise<IntegrationResult> {
  const startTime = Date.now();

  try {
    // Check if Slack is enabled
    if (!integrations.slack.enabled) {
      console.log("🔶 Slack: Mode MOCK - Message would be:", text);
      return {
        success: true,
        target: "slack",
        message: "Mock: Message sent to Slack",
        timestamp: new Date(),
      };
    }

    // Use provided channel or default
    const channel = channelId || integrations.slack.channelId;

    if (!channel) {
      throw new Error("Slack channel ID not configured");
    }

    // Send message with retry logic
    await retry(
      async () => {
        const client = getSlackClient();
        return await client.chat.postMessage({
          channel,
          text,
          unfurl_links: false,
          unfurl_media: false,
        });
      },
      {
        maxAttempts: 3,
        delayMs: 1000,
        onRetry: (attempt, error) => {
          console.warn(`⚠️ Slack retry attempt ${attempt}:`, error.message);
        },
      }
    );

    const duration = Date.now() - startTime;
    console.log(`✅ Slack: Message sent in ${duration}ms`);

    return {
      success: true,
      target: "slack",
      message: `Message sent to ${channel}`,
      timestamp: new Date(),
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error(`❌ Slack: Failed after ${duration}ms:`, errorMessage);

    return {
      success: false,
      target: "slack",
      error: errorMessage,
      timestamp: new Date(),
    };
  }
}

/**
 * Send formatted deal notification to Slack
 */
export async function sendDealNotification(deal: {
  dealId: string;
  customer: string;
  amount: number;
  status?: string;
}): Promise<IntegrationResult> {
  const emoji = deal.amount >= 50000 ? "🎉" : "💰";
  const text = [
    `${emoji} *New Deal Update*`,
    `• Customer: *${deal.customer}*`,
    `• Amount: *$${deal.amount.toLocaleString()}*`,
    `• Deal ID: ${deal.dealId}`,
    deal.status ? `• Status: ${deal.status}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return sendSlackMessage(text);
}

/**
 * Send error notification to Slack
 */
export async function sendErrorNotification(
  error: string,
  context?: Record<string, unknown>
): Promise<IntegrationResult> {
  const text = [
    "🚨 *Echo Error Alert*",
    `• Error: ${error}`,
    context ? `• Context: \`\`\`${JSON.stringify(context, null, 2)}\`\`\`` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return sendSlackMessage(text);
}