import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

// 1. Tell the client HOW to launch and talk to our server
const transport = new StdioClientTransport({
    command: "node",
    args: ["src/index.mjs"],
});

// 2. Create the client and connect
const client = new Client({ name: "test-client", version: "1.0.0" });
await client.connect(transport);

// 3. Ask the server what tools it has (proves capability negotiation works)
const tools = await client.listTools();
console.log("Tools available:", tools.tools.map(t => t.name));

// 4. Actually call the ping tool
const result = await client.callTool({
    name: "ping",
    arguments: { message: "hello from test-client" },
});
console.log("Result:", result.content);

const fetchResult = await client.callTool({
    name: "fetch_page",
    arguments: { url: "https://example.com" },
});
console.log("Fetch result:", fetchResult.content);

const searchResult = await client.callTool({
    name: "web_search",
    arguments: { query: "model context protocol" },
});
console.log("Search result:", searchResult.content);

const readableResult = await client.callTool({
    name: "fetch_page",
    arguments: { url: "https://en.wikipedia.org/wiki/Model_Context_Protocol", mode: "readable" },
});
console.log("Readable result (first 500 chars):",
    readableResult.content[0].text.slice(0, 500));

// 5. Clean up
await client.close();