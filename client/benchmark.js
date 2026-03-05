import { MCPClient } from "./index.js";
import { performance } from "perf_hooks";
async function runBenchmark() {
    // Mock GenAI and MCP Client
    const mockGenAI = {
        models: {
            generateContent: async (args) => {
                return {
                    text: "Mocked response",
                    functionCalls: []
                };
            }
        }
    };
    const mockMCP = {
        listTools: async () => ({ tools: [] }),
        callTool: async () => ({ content: [] })
    };
    const client = new MCPClient(mockGenAI, mockMCP);
    // Bypass connectToServer by setting up tools manually
    client.tools = [];
    const start = performance.now();
    // Simulate 100 queries
    for (let i = 0; i < 100; i++) {
        await client.processQuery(`Test query ${i}`);
    }
    const end = performance.now();
    const history = client.conversationHistory;
    const historyLength = history.length;
    console.log(`Baseline benchmark time: ${(end - start).toFixed(2)} ms`);
    console.log(`History length after 100 queries: ${historyLength}`);
}
runBenchmark().catch(console.error);
