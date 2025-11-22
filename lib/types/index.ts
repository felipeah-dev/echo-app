    // ==============================================
    // ECHO - TypeScript Types
    // ==============================================

    /**
     * Deal data structure (from CRM/Sheet)
     */
    export interface Deal {
    dealId: string;
    customer: string;
    amount: number;
    status?: "open" | "closed" | "pending";
    assignedTo?: string;
    notes?: string;
    createdAt?: Date;
    updatedAt?: Date;
    }

    /**
     * Sync request payload
     */
    export interface SyncRequest {
    source: "crm" | "sheet" | "manual";
    data: Deal;
    targets: SyncTarget[];
    userId?: string;
    timestamp?: string;
    }

    /**
     * Available sync targets
     */
    export type SyncTarget = "slack" | "sheets" | "email" | "calendar";

    /**
     * Sync response
     */
    export interface SyncResponse {
    success: boolean;
    synced: SyncTarget[];
    failed: SyncTarget[];
    timeSavedSec: number;
    decisionLog: string[];
    error?: string;
    }

    /**
     * Integration result
     */
    export interface IntegrationResult {
    success: boolean;
    target: SyncTarget;
    message?: string;
    error?: string;
    timestamp: Date;
    }

    /**
     * Pattern detection
     */
    export interface PatternData {
    sequence: SyncTarget[];
    frequency: number; // 0-100
    lastOccurrence: Date;
    shouldAutomate: boolean;
    }

    /**
     * Live metrics
     */
    export interface LiveMetrics {
    totalSyncs: number;
    timeSavedToday: number; // seconds
    timeSavedTotal: number; // seconds
    activeAutomations: number;
    errorRate: number; // 0-100
    avgResponseTime: number; // milliseconds
    lastUpdate: Date;
    }

    /**
     * Decision log entry
     */
    export interface DecisionLogEntry {
    timestamp: Date;
    type: "intent" | "rule" | "pattern";
    description: string;
    metadata?: Record<string, unknown>;
    }

    /**
     * Automation rule
     */
    export interface AutomationRule {
    id: string;
    name: string;
    pattern: SyncTarget[];
    enabled: boolean;
    createdAt: Date;
    timesExecuted: number;
    successRate: number; // 0-100
    }

    /**
     * Feature flags
     */
    export interface FeatureFlags {
    predictiveAlert: boolean;
    seededMetrics: boolean;
    useRealGmail: boolean;
    useRealOrchestrate: boolean;
    }

    /**
     * Config type
     */
    export interface AppConfig {
    features: FeatureFlags;
    integrations: {
        slack: boolean;
        sheets: boolean;
        email: boolean;
        calendar: boolean;
        orchestrate: boolean;
    };
    demo: {
        mode: boolean;
        seedInterval: number; // milliseconds
        seedAmount: number;
    };
    }