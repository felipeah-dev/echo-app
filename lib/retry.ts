    // ==============================================
    // ECHO - Retry Logic & Circuit Breaker
    // ==============================================

    export interface RetryOptions {
    maxAttempts?: number;
    delayMs?: number;
    backoffMultiplier?: number;
    maxDelayMs?: number;
    timeout?: number;
    onRetry?: (attempt: number, error: Error) => void;
    }

    const DEFAULT_OPTIONS: Required<RetryOptions> = {
    maxAttempts: 3,
    delayMs: 1000,
    backoffMultiplier: 2,
    maxDelayMs: 10000,
    timeout: 30000,
    onRetry: () => {},
    };

    /**
     * Retry a function with exponential backoff
     */
    export async function retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
    ): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let lastError: Error;

    for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
        try {
        // Add timeout wrapper
        const result = await Promise.race([
            fn(),
            new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("Timeout")), opts.timeout)
            ),
        ]);
        return result;
        } catch (error) {
        lastError = error as Error;

        // Don't retry on last attempt
        if (attempt === opts.maxAttempts) {
            break;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
            opts.delayMs * Math.pow(opts.backoffMultiplier, attempt - 1),
            opts.maxDelayMs
        );

        // Call retry callback
        opts.onRetry(attempt, lastError);

        // Wait before retrying
        await sleep(delay);
        }
    }

    throw new Error(
        `Failed after ${opts.maxAttempts} attempts: ${lastError!.message}`
    );
    }

    /**
     * Sleep utility
     */
    function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Circuit breaker state
     */
    type CircuitState = "closed" | "open" | "half-open";

    interface CircuitBreakerOptions {
    failureThreshold?: number;
    successThreshold?: number;
    timeout?: number;
    }

    /**
     * Simple circuit breaker implementation
     */
    export class CircuitBreaker {
    private state: CircuitState = "closed";
    private failureCount = 0;
    private successCount = 0;
    private nextAttempt = Date.now();

    constructor(
        private name: string,
        private options: CircuitBreakerOptions = {}
    ) {
        this.options = {
        failureThreshold: 5,
        successThreshold: 2,
        timeout: 60000, // 1 minute
        ...options,
        };
    }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === "open") {
        if (Date.now() < this.nextAttempt) {
            throw new Error(
            `Circuit breaker [${this.name}] is OPEN. Service unavailable.`
            );
        }
        // Try to close circuit
        this.state = "half-open";
        }

        try {
        const result = await fn();
        this.onSuccess();
        return result;
        } catch (error) {
        this.onFailure();
        throw error;
        }
    }

    private onSuccess(): void {
        this.failureCount = 0;

        if (this.state === "half-open") {
        this.successCount++;
        if (this.successCount >= this.options.successThreshold!) {
            this.state = "closed";
            this.successCount = 0;
        }
        }
    }

    private onFailure(): void {
        this.failureCount++;
        this.successCount = 0;

        if (this.failureCount >= this.options.failureThreshold!) {
        this.state = "open";
        this.nextAttempt = Date.now() + this.options.timeout!;
        console.warn(
            `⚠️ Circuit breaker [${this.name}] opened until ${new Date(this.nextAttempt).toISOString()}`
        );
        }
    }

    getState(): CircuitState {
        return this.state;
    }

    reset(): void {
        this.state = "closed";
        this.failureCount = 0;
        this.successCount = 0;
        this.nextAttempt = Date.now();
    }
    }