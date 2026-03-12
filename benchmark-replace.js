const { performance } = require('perf_hooks');

const generateText = (lines) => {
  let text = '';
  for (let i = 0; i < lines; i++) {
    text += `This is line ${i} of the simulated search result.\n`;
  }
  return text;
};

const textContent = generateText(1000);
const ITERATIONS = 10000;

function benchmarkReplace() {
  const start = performance.now();
  let result = '';
  for (let i = 0; i < ITERATIONS; i++) {
    result = textContent.replace(/\n/g, '<br>');
  }
  const end = performance.now();
  return end - start;
}

function benchmarkNoReplace() {
  const start = performance.now();
  let result = '';
  for (let i = 0; i < ITERATIONS; i++) {
    result = textContent; // Simulating just passing the string to textContent
  }
  const end = performance.now();
  return end - start;
}

console.log('Running benchmark...');
const replaceTime = benchmarkReplace();
const noReplaceTime = benchmarkNoReplace();

console.log(`innerHTML + replace(/\n/g, '<br>'): ${replaceTime.toFixed(2)} ms`);
console.log(`textContent (no replace): ${noReplaceTime.toFixed(2)} ms`);
console.log(`Improvement: ${((replaceTime - noReplaceTime) / replaceTime * 100).toFixed(2)}% faster`);
