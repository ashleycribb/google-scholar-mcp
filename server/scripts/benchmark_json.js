// server/benchmark_json.js

// Simulate results based on the structure in server/src/google-scholar-search.ts
const results = [];
for (let i = 0; i < 20; i++) {
    results.push({
        Title: `Paper Title ${i}: A very long title that takes up some space to simulate real data`,
        Authors: `Author One, Author Two, Author Three, Author Four`,
        Abstract: `This is a simulated abstract for paper ${i}. It contains a significant amount of text to represent the typical payload size of a Google Scholar search result. The abstract discusses various topics related to machine learning, artificial intelligence, and performance optimization. It is important to have realistic data to measure the impact of JSON minification accurately.`,
        URL: `https://scholar.google.com/scholar?cluster=${1234567890 + i}&hl=en&as_sdt=0,5`
    });
}

// Simulate the response object as constructed in server/src/tools.ts
const response = {
    query: "machine learning",
    filters: {
        author: "none",
        yearRange: "none"
    },
    totalResults: results.length,
    results: results
};

const indented = JSON.stringify(response, null, 2);
const minified = JSON.stringify(response);

console.log(`Indented size: ${indented.length} bytes`);
console.log(`Minified size: ${minified.length} bytes`);
console.log(`Reduction: ${indented.length - minified.length} bytes`);
console.log(`Percentage reduction: ${((indented.length - minified.length) / indented.length * 100).toFixed(2)}%`);
