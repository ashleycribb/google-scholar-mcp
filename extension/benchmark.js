const performance = require('perf_hooks').performance;

function testInnerHTMLReplace() {
  const div = { innerHTML: '' };
  const text = "Line 1\nLine 2\nLine 3\nLine 4\nLine 5\n".repeat(10000);
  const start = performance.now();
  div.innerHTML = text.replace(/\n/g, '<br>');
  const end = performance.now();
  return end - start;
}

function testTextContent() {
  const div = { textContent: '' };
  const text = "Line 1\nLine 2\nLine 3\nLine 4\nLine 5\n".repeat(10000);
  const start = performance.now();
  div.textContent = text;
  const end = performance.now();
  return end - start;
}

const runs = 100;
let innerHTMLTime = 0;
let textContentTime = 0;

for (let i = 0; i < runs; i++) {
  innerHTMLTime += testInnerHTMLReplace();
  textContentTime += testTextContent();
}

console.log(`Average innerHTML + replace time: ${innerHTMLTime / runs} ms`);
console.log(`Average textContent time: ${textContentTime / runs} ms`);
