import { RateLimiter } from './rate-limiter.js';
import { performance } from 'perf_hooks';

async function runBenchmark() {
    console.log('Starting RateLimiter Benchmark...');

    // We expect 5 tasks to be scheduled with a 500ms delay.
    // Task 1 should start immediately (approx 0ms).
    // Task 2 should wait 500ms.
    // Task 3 should wait 1000ms.
    // etc.
    const limiter = new RateLimiter(500);
    const results: number[] = [];

    const startTime = performance.now();

    const createTask = (id: number) => {
        return limiter.schedule(async () => {
            const executedAt = performance.now() - startTime;
            results.push(executedAt);
            console.log(`Task ${id} executed at ${executedAt.toFixed(2)}ms`);

            // Simulate work (e.g. 100ms processing)
            await new Promise(resolve => setTimeout(resolve, 100));
            return executedAt;
        });
    };

    console.log('Scheduling 5 tasks simultaneously...');
    const promises = [
        createTask(1),
        createTask(2),
        createTask(3),
        createTask(4),
        createTask(5)
    ];

    await Promise.all(promises);

    let isSuccessful = true;
    for (let i = 1; i < results.length; i++) {
        const diff = results[i] - results[i-1];
        console.log(`Time between task ${i} and ${i+1}: ${diff.toFixed(2)}ms`);
        // Check if the delay is roughly correct (at least 450ms, allowing some margin for the event loop)
        if (diff < 450) {
            isSuccessful = false;
            console.error(`❌ Delay too short between tasks ${i} and ${i+1}! Expected ~500ms, got ${diff.toFixed(2)}ms`);
        }
    }

    const totalTime = performance.now() - startTime;
    console.log(`Total benchmark time: ${totalTime.toFixed(2)}ms`);

    if (isSuccessful) {
        console.log('✅ RateLimiter benchmark passed!');
    } else {
        console.log('❌ RateLimiter benchmark failed!');
        process.exit(1);
    }
}

runBenchmark().catch(console.error);
