import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

// 1. Create the server — this is the "identity card" your client will see
const server = new McpServer({
    name: "web-mcp-learn",
    version: "1.0.0",
});

// 2. Register ONE dummy tool so we can prove the connection works
server.tool(
    "ping",
    "Replies with pong plus whatever message you send it.",
    { message: z.string().describe("Any text you want echoed back") },
    async ({ message }) => {
        return {
            content: [{ type: "text", text: `pong: ${message}` }],
        };
    }
);

// 3. Connect over stdio (the transport your local MCP clients use)
const transport = new StdioServerTransport();
await server.connect(transport);