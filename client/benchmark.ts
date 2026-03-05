import { MCPClient } from "./index.js";
import { performance } from "perf_hooks";

async function runBenchmark() {
    // Mock GenAI and MCP Client
    const mockGenAI = {
        models: {
            generateContent: async (args: any) => {
                // Simulate some work so measuring makes sense
                return {
                    text: "Mocked response",
                    functionCalls: []
                };
            }
        }
    } as any;

    const mockMCP = {
        listTools: async () => ({ tools: [] }),
        callTool: async () => ({ content: [] })
    } as any;

    const client = new MCPClient(mockGenAI, mockMCP);

    // Bypass connectToServer by setting up tools manually
    (client as any).tools = [];

    const start = performance.now();

    // Simulate 10000 queries to see the history grow and take up memory
    for (let i = 0; i < 10000; i++) {
        await client.processQuery(`Test query ${i}`);
    }

    const end = performance.now();
    const history = (client as any).conversationHistory;
    const historyLength = history.length;

    console.log(`Baseline benchmark time: ${(end - start).toFixed(2)} ms`);
    console.log(`History length after 10000 queries: ${historyLength}`);
}

runBenchmark().catch(console.error);
