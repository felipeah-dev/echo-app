// ==============================================
// ECHO - Google Sheets Integration
// ==============================================

import { google } from "googleapis";
import { integrations } from "@/lib/config";
import { retry } from "@/lib/retry";
import type { IntegrationResult } from "@/lib/types";

/**
 * Get authenticated Sheets client
 */
function getSheetsClient() {
  // Parse service account JSON
  let credentials;
  
  try {
    // Check if it's a file path or JSON string
    const saJson = integrations.google.serviceAccountJson;
    
    if (saJson.startsWith("{")) {
      // It's JSON string
      credentials = JSON.parse(saJson);
    } else {
      // It's a file path - would need to read file
      // For now, throw error
      throw new Error("Service account must be provided as JSON string in .env");
    }
  } catch  {
    throw new Error("Invalid Google service account JSON");
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  });

  return google.sheets({ version: "v4", auth });
}

/**
 * Append row to Google Sheet
 */
export async function appendToSheet(
  values: (string | number)[],
  sheetId?: string
): Promise<IntegrationResult> {
  const startTime = Date.now();

  try {
    // Check if Sheets is enabled
    if (!integrations.google.enabled) {
      console.log("🔶 Sheets: Mode MOCK - Row would be:", values);
      return {
        success: true,
        target: "sheets",
        message: "Mock: Row appended to sheet",
        timestamp: new Date(),
      };
    }

    const spreadsheetId = sheetId || integrations.google.sheetId;

    if (!spreadsheetId) {
      throw new Error("Google Sheet ID not configured");
    }

    // Append row with retry logic
    await retry(
      async () => {
        const sheets = getSheetsClient();
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          // Usamos las columnas A–E de la primera hoja
          range: "A:E",
          valueInputOption: "USER_ENTERED",
          requestBody: {
            values: [values],
          },
        });
      },
      {
        maxAttempts: 3,
        delayMs: 1000,
        onRetry: (attempt, error) => {
          console.warn(`⚠️ Sheets retry attempt ${attempt}:`, error.message);
        },
      }
    );

    const duration = Date.now() - startTime;
    console.log(`✅ Sheets: Row appended in ${duration}ms`);

    return {
      success: true,
      target: "sheets",
      message: `Row appended to sheet ${spreadsheetId}`,
      timestamp: new Date(),
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error(`❌ Sheets: Failed after ${duration}ms:`, errorMessage);

    return {
      success: false,
      target: "sheets",
      error: errorMessage,
      timestamp: new Date(),
    };
  }
}

/**
 * Append deal data to forecast sheet
 */
export async function appendDealToForecast(deal: {
  dealId: string;
  customer: string;
  amount: number;
  status?: string;
}): Promise<IntegrationResult> {
  const now = new Date();
  const row = [
    now.toISOString(), // Timestamp
    deal.dealId,
    deal.customer,
    deal.amount,
    deal.status || "open",
  ];

  return appendToSheet(row);
}

/**
 * Read data from Google Sheet
 */
export async function readFromSheet(
  range: string = "A:E",
  sheetId?: string
): Promise<{ success: boolean; data?: unknown[][]; error?: string }> {
  try {
    // Check if Sheets is enabled
    if (!integrations.google.enabled) {
      console.log("🔶 Sheets: Mode MOCK - Would read range:", range);
      return {
        success: true,
        data: [
          ["Mock", "Data", "From", "Sheet"],
          ["Row1", "Value1", "Value2", "Value3"],
        ],
      };
    }

    const spreadsheetId = sheetId || integrations.google.sheetId;

    if (!spreadsheetId) {
      throw new Error("Google Sheet ID not configured");
    }

    const sheets = getSheetsClient();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return {
      success: true,
      data: response.data.values || [],
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    console.error("❌ Sheets: Read failed:", errorMessage);

    return {
      success: false,
      error: errorMessage,
    };
  }
}
