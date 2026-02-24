
import { RateLimiter } from './rate-limiter.js';

async function runBenchmark() {
    const delay = 500; // Use a small delay for testing (0.5s)
    const limiter = new RateLimiter(delay);
    const numRequests = 5;

    console.log(`Starting benchmark with ${numRequests} requests, delay=${delay}ms`);

    const start = performance.now();
    const tasks = [];

    for (let i = 0; i < numRequests; i++) {
        tasks.push(limiter.schedule(async () => {
            const time = (performance.now() - start).toFixed(0);
            console.log(`Task ${i} starting at ${time}ms`);
            await new Promise(resolve => setTimeout(resolve, 50)); // Task takes 50ms
            return i;
        }));
    }

    await Promise.all(tasks);
    const end = performance.now();
    const duration = end - start;

    console.log(`Total duration: ${duration.toFixed(0)}ms`);

    // Expected duration calculation:
    // Task 0 starts at T=0, ends at T=50. lastRequestTime=50.
    // Task 1 waits for 500ms delay. Starts at T=550. Ends at T=600.
    // ...
    // Total duration should be roughly: (numRequests - 1) * delay + (numRequests * taskDuration)
    // 4 * 500 + 5 * 50 = 2250ms.

    const expectedMinDuration = (numRequests - 1) * delay;

    if (duration >= expectedMinDuration) {
        console.log(`✅ Rate limiting working. Duration ${duration.toFixed(0)}ms >= ${expectedMinDuration}ms`);
    } else {
        console.error(`❌ Rate limiting failed. Duration ${duration.toFixed(0)}ms < ${expectedMinDuration}ms`);
        process.exit(1);
    }
}

runBenchmark().catch(console.error);
