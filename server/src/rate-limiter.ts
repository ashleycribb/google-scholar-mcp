
/**
 * A simple rate limiter that ensures tasks are executed sequentially with a minimum delay
 * between the completion of one task and the start of the next.
 */
export class RateLimiter {
    private queue: (() => Promise<void>)[] = [];
    private processing = false;
    private lastRequestTime = 0;
    private minDelay: number;

    /**
     * @param minDelay - Minimum delay in milliseconds between requests
     */
    constructor(minDelay: number) {
        this.minDelay = minDelay;
    }

    /**
     * Schedules a task to be executed with rate limiting.
     * @param fn - The async function to execute
     * @returns A promise that resolves with the result of the function
     */
    async schedule<T>(fn: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const now = Date.now();
                    const timeSinceLast = now - this.lastRequestTime;

                    if (timeSinceLast < this.minDelay) {
                        const waitTime = this.minDelay - timeSinceLast;
                        await new Promise(r => setTimeout(r, waitTime));
                    }

                    const result = await fn();
                    resolve(result);
                } catch (err) {
                    reject(err);
                } finally {
                    this.lastRequestTime = Date.now();
                }
            });

            this.processQueue();
        });
    }

    private async processQueue() {
        if (this.processing) return;

        this.processing = true;

        try {
            while (this.queue.length > 0) {
                const task = this.queue.shift();
                if (task) {
                    await task();
                }
            }
        } finally {
            this.processing = false;
        }
    }
}
