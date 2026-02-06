
import { test } from 'node:test';
import assert from 'node:assert';
import { performance } from 'perf_hooks';
import { MCPClient } from '../build/index.js';

test('Parallel Execution Test', async (t) => {
    // Mock GoogleGenAI
    const mockGenAI = {
        models: {
            generateContent: async (args) => {
                const history = args.contents;
                const lastMessage = history[history.length - 1];

                // Check if the last message is a user message and doesn't have a functionResponse
                if (lastMessage.role === 'user' && (!lastMessage.parts[0].functionResponse)) {
                    return {
                        functionCalls: [
                            { name: "tool1", args: { delay: 100 } },
                            { name: "tool2", args: { delay: 100 } },
                            { name: "tool3", args: { delay: 100 } }
                        ],
                        candidates: [{ content: { role: "model", parts: [{ text: "Calling tools..." }] } }]
                    };
                }

                return {
                    text: "Done",
                    candidates: [{ content: { role: "model", parts: [{ text: "Done" }] } }]
                };
            }
        }
    };

    // Mock MCP Client
    const mockMCP = {
        connect: async () => {},
        listTools: async () => ({ tools: [] }),
        callTool: async (args) => {
            const delay = args.arguments.delay || 0;
            await new Promise(resolve => setTimeout(resolve, delay));
            return { content: [{ text: `Result from ${args.name}` }] };
        },
        close: async () => {}
    };

    const client = new MCPClient(mockGenAI, mockMCP);

    // Patch connectToServer
    client.connectToServer = async (serverUrl) => {
         client.tools = [];
    };

    await client.connectToServer("http://mock-server");

    const start = performance.now();
    await client.processQuery("Run 3 tools in parallel");
    const end = performance.now();

    const duration = end - start;
    console.log(`Test duration: ${duration.toFixed(2)}ms`);

    // With 100ms delay each, parallel should take roughly 100ms + overhead.
    // Sequential would take > 300ms.
    assert.ok(duration < 250, `Expected parallel execution (< 250ms), but took ${duration.toFixed(2)}ms`);
});
