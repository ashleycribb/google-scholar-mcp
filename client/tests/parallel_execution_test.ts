
import { MCPClient } from '../index.js';
import { GoogleGenAI } from "@google/genai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { fileURLToPath } from 'url';

// Mock GenAI
const mockGenAI = {
    models: {
        generateContent: async (args: any) => {
            const lastMsg = args.contents[args.contents.length - 1];
            const lastPart = lastMsg.parts[0];

            if (lastMsg.role === 'user' && !lastPart.functionResponse) {
                 return {
                    functionCalls: [
                        { name: "tool1", args: { q: "a" } },
                        { name: "tool2", args: { q: "b" } }
                    ],
                    candidates: [{ content: { role: "model", parts: [{ text: "Calling tools" }] } }],
                    text: ""
                };
            }

            return {
                functionCalls: [],
                candidates: [{ content: { role: "model", parts: [{ text: "Done" }] } }],
                text: "Done"
            };
        }
    }
} as unknown as GoogleGenAI;

// Mock MCP Client
const mockMcpClient = {
    connect: async () => {},
    listTools: async () => ({ tools: [] }),
    callTool: async (args: any) => {
        // console.log(`Mock executing ${args.name}...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
        // console.log(`Mock finished ${args.name}`);
        return { content: ["Result for " + args.name] };
    },
    close: async () => {}
} as unknown as Client;

async function runTest() {
    console.log("Running Parallel Execution Test...");
    const client = new MCPClient(mockGenAI, mockMcpClient);

    const start = Date.now();
    await client.processQuery("test");
    const duration = Date.now() - start;

    console.log(`Duration: ${duration}ms`);

    // With parallel execution, 2 tools of 1s each should take ~1s + overhead.
    // Sequential would be ~2s.
    // We allow up to 1500ms for parallel.
    if (duration > 1500) {
        console.error("Test Failed: Execution took too long, implies sequential execution.");
        process.exit(1);
    } else {
        console.log("Test Passed: Execution completed within parallel time limits.");
        process.exit(0);
    }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    runTest();
}
