import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { fetchPage } from "./fetch.mjs";

// 1. Create the server — this is the "identity card" your client will see
const server = new McpServer({
    name: "web-mcp-learn",
    version: "1.0.0",
});

// 2. Register ONE dummy tool so we can prove the connection works
server.tool(
    "fetch_page",
    "Fetches a URL and returns its text content.",
    { url: z.string().url().describe("The URL to fetch") },
    async ({ url }) => {
        try {
            const text = await fetchPage(url);
            return { content: [{ type: "text", text }] };
        } catch (err) {
            return {
                content: [{ type: "text", text: `Error fetching ${url}: ${err.message}` }],
                isError: true,
            };
        }
    }
);
// 3. Connect over stdio (the transport your local MCP clients use)
const transport = new StdioServerTransport();
await server.connect(transport);