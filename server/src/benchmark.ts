import { searchGoogleScholar } from './google-scholar-search.js';
import { performance } from 'perf_hooks';

async function runBenchmark() {
    console.log('Starting benchmark...');
    const start = performance.now();

    const queries = ['machine learning', 'artificial intelligence', 'deep learning'];

    // Run them concurrently without rate limiter, they might get blocked or happen very fast
    const results = await Promise.all(
        queries.map(q => searchGoogleScholar(q, 1))
    );

    const end = performance.now();
    console.log(`Time taken: ${(end - start).toFixed(2)} ms`);
    console.log(`Results: ${results.length}`);
}

runBenchmark().catch(console.error);
