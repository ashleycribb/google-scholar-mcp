import { searchGoogleScholar } from './google-scholar-search.js';
import { performance } from 'perf_hooks';

async function runBenchmark() {
    console.log('Starting cache benchmark...');

    // First query - Should be a cache miss and take longer
    console.log('\n--- First Query (Cache Miss) ---');
    const start1 = performance.now();
    await searchGoogleScholar('machine learning', 5);
    const end1 = performance.now();
    const duration1 = end1 - start1;
    console.log(`First query took: ${duration1.toFixed(2)} ms`);

    // Second query - Same parameters, should be a cache hit and be much faster
    console.log('\n--- Second Query (Cache Hit) ---');
    const start2 = performance.now();
    await searchGoogleScholar('machine learning', 5);
    const end2 = performance.now();
    const duration2 = end2 - start2;
    console.log(`Second query took: ${duration2.toFixed(2)} ms`);

    console.log('\n--- Results ---');
    if (duration2 < duration1) {
        console.log(`✅ Cache hit is faster by ${(duration1 - duration2).toFixed(2)} ms (${(duration1 / duration2).toFixed(2)}x faster)`);
    } else {
        console.log(`❌ Cache hit was NOT faster! (Miss: ${duration1.toFixed(2)}ms, Hit: ${duration2.toFixed(2)}ms)`);
    }
}

runBenchmark().catch(console.error);
