import { searchGoogleScholar } from './google-scholar-search.js';
import axios from 'axios';
import { performance } from 'perf_hooks';

const mockHtml = Array.from({ length: 20 }, (_, i) => `
    <div class="gs_r gs_or gs_scl">
        <h3 class="gs_rt"><a href="http://example.com/${i}">Paper ${i}</a></h3>
        <div class="gs_a">Author ${i} - 2021</div>
        <div class="gs_rs">Abstract ${i}</div>
    </div>
`).join('');

let fetchCount = 0;

// @ts-ignore
axios.default.get = async () => {
    fetchCount++;
    return { data: mockHtml };
};

async function run() {
    // Warm cache with numResults=20
    await searchGoogleScholar('test-query', 20);

    const start = performance.now();

    // Simulate requests for subsets of results
    for (let i = 0; i < 100; i++) {
        await searchGoogleScholar('test-query', 10);
        await searchGoogleScholar('test-query', 5);
        await searchGoogleScholar('test-query', 15);
    }

    const end = performance.now();
    console.log(`Execution time: ${(end - start).toFixed(2)} ms`);
    console.log(`Network fetches: ${fetchCount}`);
}

run().catch(console.error);
