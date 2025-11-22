// =============================================================================
// ECHO - Orchestration Layer (watsonx Orchestrate + Direct Execution)
// FIXED VERSION - IBM Cloud API endpoints + Thread Messages Debug
// =============================================================================

import { sendDealNotification } from "@/lib/integrations/slack";
import { appendDealToForecast } from "@/lib/integrations/sheets";
import { sendDealConfirmation } from "@/lib/integrations/gmail";
import { createDealFollowUp } from "@/lib/integrations/calendar";
import type { SyncTarget } from "@/lib/types";

// =============================================================================
// Types
// =============================================================================

interface DealData {
    dealId: string;
    customer: string;
    amount: number;
    status?: string;
    closeDate?: string;
}

export interface OrchestrationResult {
    success: boolean;
    message?: string;
    error?: string;
}

export interface OrchestrationExecutor {
    execute(
        targets: SyncTarget[],
        data: DealData
    ): Promise<Map<SyncTarget, OrchestrationResult>>;
}

// =============================================================================
// Direct Executor
// =============================================================================

export class DirectExecutor implements OrchestrationExecutor {
    async execute(
        targets: SyncTarget[],
        data: DealData
    ): Promise<Map<SyncTarget, OrchestrationResult>> {
        console.log("📋 Using DirectExecutor (bypassing watsonx)");

        const results = new Map<SyncTarget, OrchestrationResult>();

        const promises = targets.map(async (target) => {
            try {
                let result: { success: boolean; message?: string; error?: string };

                switch (target) {
                    case "slack":
                        result = await sendDealNotification(data);
                        break;

                    case "sheets":
                        result = await appendDealToForecast(data);
                        break;

                    case "email":
                        const recipientEmail =
                            process.env.SMTP_USER || "test@example.com";
                        result = await sendDealConfirmation(recipientEmail, data);
                        break;

                    case "calendar":
                        result = await createDealFollowUp(data);
                        break;

                    default:
                        result = {
                            success: false,
                            error: `Unknown target: ${target}`,
                        };
                }

                results.set(target, result);
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "Unknown error";
                results.set(target, {
                    success: false,
                    error: errorMessage,
                });
            }
        });

        await Promise.allSettled(promises);
        return results;
    }
}

// =============================================================================
// watsonx Orchestrate Executor - IBM Cloud CORRECTED
// =============================================================================

interface WatsonxConfig {
    instanceUrl: string;
    iamApiKey: string;
    agentId: string;
}

interface OrchestrateRunStart {
    thread_id: string;
    run_id: string;
    task_id?: string;
    message_id?: string;
}

interface OrchestrateRunStatus {
    id: string;
    status: "pending" | "running" | "completed" | "failed" | "cancelled";
    thread_id: string;
    last_error?: { message?: string };
}

export class WatsonxExecutor implements OrchestrationExecutor {
    private config: WatsonxConfig;
    private directExecutor: DirectExecutor;
    private iamTokenCache?: { value: string; expiresAt: number };

    constructor() {
        this.config = {
            instanceUrl: process.env.WZ_INSTANCE_URL || "",
            iamApiKey: process.env.WZ_IAM_API_KEY || "",
            agentId: process.env.WZ_AGENT_ID || "",
        };

        this.directExecutor = new DirectExecutor();
    }

    /**
     * Get IAM token with caching
     */
    private async getIamToken(): Promise<string> {
        const now = Math.floor(Date.now() / 1000);

        if (this.iamTokenCache && now < this.iamTokenCache.expiresAt - 60) {
            console.log("🔄 Reusing cached IAM token");
            return this.iamTokenCache.value;
        }

        if (!this.config.iamApiKey) {
            throw new Error("WZ_IAM_API_KEY is not configured");
        }

        console.log("🔑 Obtaining new IAM token...");

        const body = new URLSearchParams({
            grant_type: "urn:ibm:params:oauth:grant-type:apikey",
            apikey: this.config.iamApiKey,
        });

        const res = await fetch("https://iam.cloud.ibm.com/identity/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body,
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`Failed to obtain IAM token: ${res.status} - ${text}`);
        }

        const json = (await res.json()) as {
            access_token: string;
            expires_in: number;
        };

        this.iamTokenCache = {
            value: json.access_token,
            expiresAt: now + json.expires_in,
        };

        console.log("✅ IAM token obtained successfully");
        return json.access_token;
    }

    /**
     * Main execution method
     */
    async execute(
        targets: SyncTarget[],
        data: DealData
    ): Promise<Map<SyncTarget, OrchestrationResult>> {
        if (
            !this.config.instanceUrl ||
            !this.config.iamApiKey ||
            !this.config.agentId
        ) {
            console.warn(
                "⚠️ watsonx Orchestrate not fully configured - falling back to DirectExecutor"
            );
            return this.fallbackToDirect(targets, data);
        }

        console.log("🤖 Using WatsonxExecutor - orchestrating via watsonx Orchestrate");

        try {
            // 1. Start the run
            console.log("🚀 Starting orchestrate run...");
            const runStart = await this.startRun(targets, data);
            console.log(`✅ Run started: ${runStart.run_id}`);

            // 2. Wait for completion
            console.log("⏳ Waiting for run completion...");
            const finalStatus = await this.waitForRunCompletion(runStart.run_id);

            // 🔍 Debug: Ver mensajes del thread
            try {
                const messages = await this.getThreadMessages(runStart.thread_id);
                console.log("🧵 Thread messages:", JSON.stringify(messages, null, 2));
            } catch (err) {
                console.warn("⚠️ Could not fetch thread messages:", err);
            }

            if (finalStatus.status !== "completed") {
                throw new Error(
                    finalStatus.last_error?.message ||
                        `Run ended with status: ${finalStatus.status}`
                );
            }

            console.log("✅ watsonx orchestration completed successfully");

            // Mark all targets as synced
            const results = new Map<SyncTarget, OrchestrationResult>();
            for (const t of targets) {
                results.set(t, {
                    success: true,
                    message: "Synced via watsonx Orchestrate",
                });
            }

            return results;
        } catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            console.error("❌ watsonx orchestration failed:", msg);
            console.log("🔄 Falling back to DirectExecutor");
            return this.fallbackToDirect(targets, data);
        }
    }

    /**
     * POST /v1/orchestrate/runs - Start a run
     */
    private async startRun(
        targets: SyncTarget[],
        data: DealData
    ): Promise<OrchestrateRunStart> {
        const iamToken = await this.getIamToken();

       const userMessage = `Sync the following deal information to Slack.

        Deal ID: ${data.dealId}
        Customer: ${data.customer}
        Amount: $${data.amount}
        Status: ${data.status || "open"}

        Use the "send_a_message_in_slack" tool with:
        - channel_id: "C09UD3XP3MZ"
        - text: "New deal ${data.dealId} for ${data.customer}"
        - blocks: a valid Slack Block Kit JSON array EXACTLY in this structure:

        [
        {
            "type": "section",
            "text": {
            "type": "mrkdwn",
            "text": ":owl: *New Deal Update*\\n• Customer: *${data.customer}*\\n• Amount: *$${data.amount}*\\n• Deal ID: ${data.dealId}\\n• Status: *${data.status || "open"}*"
            }
        }
        ]

        CRITICAL: The 'blocks' argument must be a valid JSON array, not a string.`;

        // CORRECT format for IBM Cloud API
        const body = {
            message: {  // ← SINGULAR, not "messages"
                role: "user",
                content: userMessage,
            },
            agent_id: this.config.agentId,
        };

        // CORRECT endpoint: {instanceUrl}/v1/orchestrate/runs (NO /api)
        const url = `${this.config.instanceUrl}/v1/orchestrate/runs`;

        console.log("🔄 Calling watsonx Orchestrate API:", url);

        const res = await fetch(url, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${iamToken}`,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            throw new Error(`POST /runs failed: ${res.status} - ${text}`);
        }

        return (await res.json()) as OrchestrateRunStart;
    }

    /**
     * GET /v1/orchestrate/runs/{run_id} - Poll for completion
     */
    private async waitForRunCompletion(
        runId: string,
        timeoutMs = 60000
    ): Promise<OrchestrateRunStatus> {
        const iamToken = await this.getIamToken();
        const url = `${this.config.instanceUrl}/v1/orchestrate/runs/${runId}`;

        const start = Date.now();

        // Simple polling every 500ms
        while (true) {
            const res = await fetch(url, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${iamToken}`,
                    Accept: "application/json",
                },
            });

            if (!res.ok) {
                const text = await res.text();
                throw new Error(`GET /runs/${runId} failed: ${res.status} - ${text}`);
            }

            const json = (await res.json()) as OrchestrateRunStatus;

            if (!["pending", "running"].includes(json.status)) {
                return json;
            }

            if (Date.now() - start > timeoutMs) {
                throw new Error(`Timeout waiting for run ${runId}`);
            }

            await new Promise((r) => setTimeout(r, 500));
        }
    }

    /**
     * GET /v1/orchestrate/threads/{thread_id}/messages - Get thread messages
     */
    private async getThreadMessages(threadId: string) {
        const iamToken = await this.getIamToken();
        const url = `${this.config.instanceUrl}/v1/orchestrate/threads/${threadId}/messages`;
        
        const res = await fetch(url, {
            method: "GET",
            headers: { 
                Authorization: `Bearer ${iamToken}`,
                Accept: "application/json"
            }
        });
        
        if (!res.ok) {
            const text = await res.text();
            throw new Error(`GET /threads/${threadId}/messages failed: ${res.status} - ${text}`);
        }
        
        return await res.json();
    }

    /**
     * Fallback to direct execution
     */
    private async fallbackToDirect(
        targets: SyncTarget[],
        data: DealData
    ): Promise<Map<SyncTarget, OrchestrationResult>> {
        return this.directExecutor.execute(targets, data);
    }
}

// =============================================================================
// Factory
// =============================================================================

export function getOrchestrator(): OrchestrationExecutor {
    const useWatsonx = process.env.FEATURE_USE_REAL_ORCHESTRATE === "true";

    if (useWatsonx) {
        console.log("🎯 Feature flag enabled: using WatsonxExecutor");
        return new WatsonxExecutor();
    } else {
        console.log("🎯 Feature flag disabled: using DirectExecutor");
        return new DirectExecutor();
    }
}