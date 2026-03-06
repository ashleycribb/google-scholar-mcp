export class RateLimiter {
    private queue: (() => Promise<void>)[] = [];
    private isProcessing = false;
    private lastExecutionTime = 0;

    constructor(private readonly minDelayMs: number) {}

    async enqueue<T>(task: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            this.queue.push(async () => {
                try {
                    const result = await task();
                    resolve(result as T);
                } catch (error) {
                    reject(error);
                }
            });

            if (!this.isProcessing) {
                this.isProcessing = true;
                this.processQueue();
            }
        });
    }

    private async processQueue() {
        if (this.queue.length === 0) {
            this.isProcessing = false;
            return;
        }

        const now = Date.now();
        const timeSinceLastExecution = now - this.lastExecutionTime;

        if (timeSinceLastExecution < this.minDelayMs) {
            const delayNeeded = this.minDelayMs - timeSinceLastExecution;
            await new Promise(resolve => setTimeout(resolve, delayNeeded));
        }

        const task = this.queue.shift();
        if (task) {
            this.lastExecutionTime = Date.now();
            await task();
        }

        // Process next item in queue without growing stack
        setTimeout(() => this.processQueue(), 0);
    }
}
