// ==============================================
// ECHO - Google Calendar Integration
// ==============================================

import { google } from "googleapis";
import { integrations } from "@/lib/config";
import { retry } from "@/lib/retry";
import type { IntegrationResult } from "@/lib/types";

/**
 * Get authenticated Calendar client
 */
function getCalendarClient() {
  // Parse service account JSON
  let credentials;

  try {
    const saJson = integrations.google.serviceAccountJson;

    if (saJson.startsWith("{")) {
      credentials = JSON.parse(saJson);
    } else {
      throw new Error("Service account must be provided as JSON string in .env");
    }
  } catch (error) {
    throw new Error("Invalid Google service account JSON");
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/calendar"],
  });

  return google.calendar({ version: "v3", auth });
}

/**
 * Create calendar event
 */
export async function createCalendarEvent(options: {
  summary: string;
  description?: string;
  start: Date;
  end: Date;
  attendees?: string[];
}): Promise<IntegrationResult> {
  const startTime = Date.now();

  try {
    // Check if Calendar is enabled
    if (!integrations.google.enabled) {
      console.log("🔶 Calendar: Mode MOCK - Event would be:", options.summary);
      return {
        success: true,
        target: "calendar",
        message: `Mock: Event created - ${options.summary}`,
        timestamp: new Date(),
      };
    }

    const calendarId = integrations.google.calendarId;

    if (!calendarId) {
      throw new Error("Google Calendar ID not configured");
    }

    // Create event with retry logic
    const result = await retry(
      async () => {
        const calendar = getCalendarClient();
        return await calendar.events.insert({
          calendarId,
          requestBody: {
            summary: options.summary,
            description: options.description,
            start: {
              dateTime: options.start.toISOString(),
              timeZone: "America/Mexico_City",
            },
            end: {
              dateTime: options.end.toISOString(),
              timeZone: "America/Mexico_City",
            },
            attendees: options.attendees?.map((email) => ({ email })),
            reminders: {
              useDefault: false,
              overrides: [
                { method: "email", minutes: 24 * 60 }, // 1 day before
                { method: "popup", minutes: 15 }, // 15 min before
              ],
            },
          },
        });
      },
      {
        maxAttempts: 3,
        delayMs: 1000,
        onRetry: (attempt, error) => {
          console.warn(`⚠️ Calendar retry attempt ${attempt}:`, error.message);
        },
      }
    );

    const duration = Date.now() - startTime;
    console.log(`✅ Calendar: Event created in ${duration}ms`);

    return {
      success: true,
      target: "calendar",
      message: `Event created: ${options.summary}`,
      timestamp: new Date(),
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error(`❌ Calendar: Failed after ${duration}ms:`, errorMessage);

    return {
      success: false,
      target: "calendar",
      error: errorMessage,
      timestamp: new Date(),
    };
  }
}

/**
 * Create follow-up event for deal
 */
export async function createDealFollowUp(
  deal: {
    dealId: string;
    customer: string;
    amount: number;
  },
  daysFromNow: number = 1
): Promise<IntegrationResult> {
  const start = new Date();
  start.setDate(start.getDate() + daysFromNow);
  start.setHours(10, 0, 0, 0); // 10 AM

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 30); // 30 min meeting

  return createCalendarEvent({
    summary: `Follow-up: ${deal.customer}`,
    description: `
Deal Follow-up
--------------
Deal ID: ${deal.dealId}
Customer: ${deal.customer}
Amount: $${deal.amount.toLocaleString()}

Next steps:
- Review proposal status
- Address any concerns
- Move towards closure
    `.trim(),
    start,
    end,
  });
}

/**
 * List upcoming events
 */
export async function listUpcomingEvents(
  maxResults: number = 10
): Promise<{
  success: boolean;
  events?: Array<{ id: string; summary: string; start: string }>;
  error?: string;
}> {
  try {
    // Check if Calendar is enabled
    if (!integrations.google.enabled) {
      console.log("🔶 Calendar: Mode MOCK - Would list events");
      return {
        success: true,
        events: [
          { id: "mock1", summary: "Mock Event 1", start: new Date().toISOString() },
          { id: "mock2", summary: "Mock Event 2", start: new Date().toISOString() },
        ],
      };
    }

    const calendarId = integrations.google.calendarId;

    if (!calendarId) {
      throw new Error("Google Calendar ID not configured");
    }

    const calendar = getCalendarClient();
    const response = await calendar.events.list({
      calendarId,
      timeMin: new Date().toISOString(),
      maxResults,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items?.map((event) => ({
      id: event.id || "",
      summary: event.summary || "No title",
      start: event.start?.dateTime || event.start?.date || "",
    }));

    return {
      success: true,
      events: events || [],
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error("❌ Calendar: List failed:", errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}