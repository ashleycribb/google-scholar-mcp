export class RateLimiter {
    private delayMs: number;
    private queue: (() => void)[] = [];
    private isProcessing: boolean = false;
    private lastExecutionTime: number = 0;

    constructor(delayMs: number) {
        this.delayMs = delayMs;
    }

    public async schedule<T>(task: () => Promise<T>): Promise<T> {
        return new Promise<T>((resolve, reject) => {
            const queuedTask = async () => {
                try {
                    const result = await task();
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };

            this.queue.push(queuedTask);
            this.processQueue();
        });
    }

    private async processQueue() {
        if (this.isProcessing || this.queue.length === 0) {
            return;
        }

        this.isProcessing = true;

        while (this.queue.length > 0) {
            const task = this.queue.shift();
            if (task) {
                const now = Date.now();
                const timeSinceLastExecution = now - this.lastExecutionTime;

                if (this.lastExecutionTime > 0 && timeSinceLastExecution < this.delayMs) {
                    const waitTime = this.delayMs - timeSinceLastExecution;
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                }

                await task();
                this.lastExecutionTime = Date.now();
            }
        }

        this.isProcessing = false;
    }
}
