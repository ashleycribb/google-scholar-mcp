import { performance } from 'node:perf_hooks';

const iterations = 1000000;
const testString = "This is a test string\nwith multiple lines\nto replace.";

function benchmarkRegexLiteral() {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    testString.replace(/\n/g, '<br>');
  }
  const end = performance.now();
  return end - start;
}

const NEWLINE_REGEX = /\n/g;
function benchmarkRegexConstant() {
  const start = performance.now();
  for (let i = 0; i < iterations; i++) {
    testString.replace(NEWLINE_REGEX, '<br>');
  }
  const end = performance.now();
  return end - start;
}

console.log(`Running benchmark with ${iterations} iterations...`);

// Warmup
benchmarkRegexLiteral();
benchmarkRegexConstant();

const literalTime = benchmarkRegexLiteral();
const constantTime = benchmarkRegexConstant();

console.log(`Regex literal inside loop: ${literalTime.toFixed(2)}ms`);
console.log(`Pre-compiled regex constant: ${constantTime.toFixed(2)}ms`);

const improvement = ((literalTime - constantTime) / literalTime) * 100;
console.log(`Improvement: ${improvement.toFixed(2)}%`);
