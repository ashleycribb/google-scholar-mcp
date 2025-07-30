# Google Scholar MCP Server

[![smithery badge](https://smithery.ai/badge/@mochow13/google-scholar-mcp)](https://smithery.ai/server/@mochow13/google-scholar-mcp)

A Model Context Protocol (MCP) server that provides Google Scholar search capabilities through a streamable HTTP transport. This project demonstrates how to build an MCP server with custom tools and integrate it with AI models like Google's Gemini.

## Overview

This project consists of two main components:
- **MCP Server**: Provides Google Scholar search tools via HTTP endpoints
- **MCP Client**: Integrates with Google Gemini AI to process queries and call tools

## Architecture

### MCP Server Implementation

The server is built using the `@modelcontextprotocol/sdk` and implements:

- **Transport**: StreamableHTTPServerTransport for HTTP-based communication
- **Session Management**: Supports multiple simultaneous connections with session IDs
- **Tool System**: Extensible tool registration and execution framework
- **Error Handling**: Comprehensive error responses and logging

### Available Tools

The server currently provides one main tool:

#### `search_google_scholar`
- **Description**: Search Google Scholar for academic papers and research
- **Parameters**: Configurable search parameters (query, filters, etc.)
- **Returns**: Structured search results with paper details

### Transport Protocol

The server uses **StreamableHTTPServerTransport** which supports:
- **HTTP POST**: For sending requests and receiving responses
- **HTTP GET**: For establishing Server-Sent Events (SSE) streams
- **Session Management**: Persistent connections with unique session IDs
- **Real-time Notifications**: Streaming updates via SSE

## Installation

### Installing via Smithery

To install google-scholar-mcp for Claude Desktop automatically via [Smithery](https://smithery.ai/server/@mochow13/google-scholar-mcp):

```bash
npx -y @smithery/cli install @mochow13/google-scholar-mcp --client claude
```

1. Clone the repository:
```bash
git clone <repository-url>
cd google-scholar-mcp
```

2. Install and build:
```bash
cd server
npm install
npm run build

cd client
npm install
npm run build
```

## Running the Server

1. Start the MCP server:
```bash
cd server
node build/index.js
```

The server will start on port 3000 and provide the following endpoints:
- `POST /mcp` - Main MCP communication endpoint
- `GET /mcp` - SSE stream endpoint for real-time updates

### Server Features

- **Multi-session Support**: Handle multiple clients simultaneously
- **Graceful Shutdown**: Proper cleanup on SIGINT
- **Logging**: Comprehensive request/response logging
- **Error Handling**: Structured JSON-RPC error responses

## Running the Client

The client demonstrates how to integrate the MCP server with Google's Gemini AI model.

1. Ensure you have a valid `GEMINI_API_KEY` and provide it with ```export GEMINI_API_KEY=<your-key>```

2. Start the client:
```bash
cd client
node build/index.js
```

3. The client will connect to the server and start an interactive chat loop

### Client Features

#### Conversation Management
- **Persistent Context**: Maintains full conversation history across queries
- **Multi-turn Conversations**: Supports back-and-forth dialogue with context
- **Function Call Integration**: Seamlessly integrates tool calls into conversation flow

#### AI Integration
- **Gemini 2.5 Flash**: Uses Google's latest language model
- **Tool Discovery**: Automatically discovers and registers available MCP tools
- **Function Calling**: Converts MCP tools to Gemini function declarations

#### Interactive Features
- **Chat Loop**: Continuous conversation interface
- **History Management**: View and clear conversation history
- **Graceful Exit**: Type 'quit' to exit cleanly

## Usage Example

```
Query: Find recent papers about machine learning in healthcare

[Called tool search_google_scholar with args {"query":"machine learning healthcare recent"}]

Based on the search results, here are some recent papers about machine learning in healthcare:

1. "Deep Learning Applications in Medical Imaging" - This paper explores...
2. "Predictive Analytics in Patient Care" - Research on using ML for...
...

Query: What about specifically for diagnostic imaging?

[Called tool search_google_scholar with args {"query":"machine learning diagnostic imaging healthcare"}]

Here are papers specifically focused on diagnostic imaging applications:
...
```

## Development

### Project Structure

```
├── server/
│   ├── src/
│   │   ├── index.ts      # Express server setup
│   │   ├── server.ts     # MCP server implementation
│   │   └── tools.ts      # Tool definitions and handlers
├── client/
│   └── index.ts          # MCP client with Gemini integration
└── package.json
```

### Key Components

#### MCPServer Class (`server/src/server.ts`)
- Manages MCP server lifecycle
- Handles HTTP requests and SSE streams
- Implements tool registration and execution
- Manages multiple client sessions

#### MCPClient Class (`client/index.ts`)
- Connects to MCP server via HTTP transport
- Integrates with Google Gemini AI
- Manages conversation history and context
- Handles function calling workflow

### Adding New Tools

1. Define your tool schema in `server/src/tools.ts`:
```typescript
export const myNewTool = {
    name: "my_new_tool",
    description: "Description of what the tool does",
    inputSchema: {
        type: "object",
        properties: {
            // Define parameters
        }
    }
};
```

2. Implement the tool handler:
```typescript
export async function callMyNewTool(args: any) {
    // Tool implementation
    return {
        content: [
            {
                type: "text",
                text: "Tool result"
            }
        ]
    };
}
```

3. Register the tool in the server setup

## Configuration

### Environment Variables

- `GEMINI_API_KEY`: Required for client AI integration
- `PORT`: Server port (defaults to 3000)

### Server Configuration

The server can be configured with different capabilities:
- Tools: Enable/disable tool support
- Logging: Configure logging levels
- Transport: Customize transport settings

## Error Handling

The system includes comprehensive error handling:
- **Server Errors**: JSON-RPC compliant error responses
- **Transport Errors**: Connection and stream error handling
- **Tool Errors**: Graceful tool execution error handling
- **Client Errors**: AI model and function calling error handling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License

## Support

For issues and questions:
- Check the MCP SDK documentation
- Review the Google AI SDK documentation
- Open an issue in this repository
