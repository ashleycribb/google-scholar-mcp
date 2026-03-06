import { searchGoogleScholar } from './google-scholar-search.js';
import { performance } from 'perf_hooks';

async function runBenchmark() {
    console.log("Starting cache optimization benchmark...");

    // Request 1: 10 results
    let start = performance.now();
    await searchGoogleScholar('cache optimization benchmark test', 10);
    let end = performance.now();
    console.log(`First request (10 results, cache miss expected): ${(end - start).toFixed(2)} ms`);

    // Request 2: 5 results (subset of first)
    start = performance.now();
    await searchGoogleScholar('cache optimization benchmark test', 5);
    end = performance.now();
    console.log(`Second request (5 results, should be cache hit after optimization): ${(end - start).toFixed(2)} ms`);
}

runBenchmark().catch(console.error);
