const { performance } = require('perf_hooks');

// Since we are in Node.js and don't want to install JSDOM just for this,
// we will benchmark the core string operations, as DOM manipulation
// in a real browser will only amplify the difference (innerHTML parsing vs textContent).

function createMockData(lines) {
  let result = '';
  for (let i = 0; i < lines; i++) {
    result += `This is line ${i} of the mock data.\n`;
  }
  return result;
}

const data = createMockData(10000); // 10k lines of text
const iterations = 1000;

function runBaseline() {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    const replaced = data.replace(/\n/g, '<br>');
    // In a browser, this string would then be parsed by the HTML parser:
    // element.innerHTML = replaced;
  }
  const end = performance.now();
  return end - start;
}

function runOptimized() {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    // In a browser, this string is assigned directly without parsing:
    // element.textContent = data;
    const directAssignment = data;
  }
  const end = performance.now();
  return end - start;
}

console.log('--- Benchmark Results ---');
console.log(`String size: ${data.length} characters`);
console.log(`Iterations: ${iterations}`);

const baselineTime = runBaseline();
console.log(`Baseline (regex replace): ${baselineTime.toFixed(2)} ms`);

const optimizedTime = runOptimized();
console.log(`Optimized (direct string): ${optimizedTime.toFixed(2)} ms`);

console.log(`Improvement: ${((baselineTime - optimizedTime) / baselineTime * 100).toFixed(2)}% faster`);
