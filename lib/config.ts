    // ==============================================
    // ECHO - Configuration & Feature Flags
    // ==============================================

    import { AppConfig, FeatureFlags } from "./types";

    /**
     * Get environment variable with fallback
     */
    function getEnv(key: string, fallback: string = ""): string {
    return process.env[key] || fallback;
    }

    /**
     * Get boolean environment variable
     */
    function getBoolEnv(key: string, fallback: boolean = false): boolean {
    const value = process.env[key];
    if (!value) return fallback;
    return value === "true" || value === "1";
    }

    /**
     * Feature flags
     */
    export const features: FeatureFlags = {
    predictiveAlert: getBoolEnv("FEATURE_PREDICTIVE_ALERT", true),
    seededMetrics: getBoolEnv("FEATURE_SEEDED_LIVE_METRICS", true),
    useRealGmail: getBoolEnv("FEATURE_USE_REAL_GMAIL", true),
    useRealOrchestrate: getBoolEnv("FEATURE_USE_REAL_ORCHESTRATE", true),
    };

    /**
     * Integration credentials
     */
    export const integrations = {
    slack: {
        token: getEnv("SLACK_BOT_TOKEN"),
        channelId: getEnv("SLACK_CHANNEL_ID"),
        signingSecret: getEnv("SLACK_SIGNING_SECRET"),
        enabled: !!getEnv("SLACK_BOT_TOKEN"),
    },
    watsonx: {
        apiBase: getEnv("WZ_API_BASE", "https://api.orchestrate.ibm.com"),
        apiKey: getEnv("WZ_API_KEY"),
        projectId: getEnv("WZ_PROJECT_ID"),
        enabled: !!getEnv("WZ_API_KEY") && features.useRealOrchestrate,
    },
    google: {
        serviceAccountJson: getEnv("GOOGLE_SA_JSON"),
        sheetId: getEnv("GOOGLE_SHEET_ID"),
        calendarId: getEnv("GOOGLE_CALENDAR_ID"),
        enabled: !!getEnv("GOOGLE_SA_JSON"),
    },
    email: {
        host: getEnv("SMTP_HOST", "smtp.gmail.com"),
        port: parseInt(getEnv("SMTP_PORT", "587")),
        user: getEnv("SMTP_USER"),
        pass: getEnv("SMTP_PASS"),
        from: getEnv("EMAIL_FROM", "Echo Bot <noreply@echo.com>"),
        enabled: !!getEnv("SMTP_USER") && features.useRealGmail,
    },
    };

    /**
     * Demo configuration
     */
    export const demo = {
    mode: getBoolEnv("NEXT_PUBLIC_DEMO_MODE", false),
    seedInterval: 3000, // 3 seconds
    seedAmount: 5, // increment per seed
    };

    /**
     * App configuration
     */
    export const config: AppConfig = {
    features,
    integrations: {
        slack: integrations.slack.enabled,
        sheets: integrations.google.enabled,
        email: integrations.email.enabled,
        calendar: integrations.google.enabled,
        orchestrate: integrations.watsonx.enabled,
    },
    demo,
    };

    /**
     * Validate required environment variables
     */
    export function validateEnv(): { valid: boolean; missing: string[] } {
    const required = [
        "WZ_API_KEY",
        "SLACK_BOT_TOKEN",
        "SLACK_CHANNEL_ID",
        "GOOGLE_SA_JSON",
        "GOOGLE_SHEET_ID",
        "SMTP_USER",
        "SMTP_PASS",
    ];

    const missing = required.filter((key) => !process.env[key]);

    return {
        valid: missing.length === 0,
        missing,
    };
    }

    /**
     * Log configuration status
     */
    export function logConfigStatus(): void {
    console.log("🔧 ECHO Configuration:");
    console.log("  Features:");
    console.log(`    - Predictive Alert: ${features.predictiveAlert}`);
    console.log(`    - Seeded Metrics: ${features.seededMetrics}`);
    console.log(`    - Real Gmail: ${features.useRealGmail}`);
    console.log(`    - Real Orchestrate: ${features.useRealOrchestrate}`);
    console.log("  Integrations:");
    console.log(`    - Slack: ${config.integrations.slack ? "✅" : "❌"}`);
    console.log(`    - Sheets: ${config.integrations.sheets ? "✅" : "❌"}`);
    console.log(`    - Email: ${config.integrations.email ? "✅" : "❌"}`);
    console.log(`    - Calendar: ${config.integrations.calendar ? "✅" : "❌"}`);
    console.log(`    - Orchestrate: ${config.integrations.orchestrate ? "✅" : "❌"}`);
    console.log(`  Demo Mode: ${demo.mode ? "ON" : "OFF"}`);
    }