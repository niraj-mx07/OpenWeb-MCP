import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { fetchPage } from "./fetch.mjs";
import { webSearch } from "./search.mjs";
import { readRecentLogs, getStats } from "./log.mjs";

const server = new McpServer({
  name: "web-mcp-learn",
  version: "1.0.0",
});

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

server.tool(
  "web_search",
  "Searches the web and returns a list of results with title, url, and snippet.",
  { query: z.string().describe("The search query") },
  async ({ query }) => {
    try {
      const results = await webSearch(query);
      return { content: [{ type: "text", text: JSON.stringify(results, null, 2) }] };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error searching: ${err.message}` }],
        isError: true,
      };
    }
  }
);
server.tool(
  "web_log",
  "View recent search/fetch activity logs, or aggregate stats per engine.",
  { action: z.enum(["recent", "stats"]).describe("'recent' for latest log entries, 'stats' for per-engine success/fail counts") },
  async ({ action }) => {
    if (action === "stats") {
      const stats = await getStats();
      return { content: [{ type: "text", text: JSON.stringify(stats, null, 2) }] };
    } else {
      const logs = await readRecentLogs(20);
      return { content: [{ type: "text", text: JSON.stringify(logs, null, 2) }] };
    }
  }
);
server.tool(
  "fetch_page",
  "Fetches a URL and returns its content. Use mode 'readable' for articles/blog posts (strips nav/ads), 'text' for everything else.",
  {
    url: z.string().url().describe("The URL to fetch"),
    mode: z.enum(["text", "readable"]).default("text").describe("Extraction mode"),
  },
  async ({ url, mode }) => {
    try {
      const result = await fetchPage(url, mode);
      const text = result.title ? `# ${result.title}\n\n${result.text}` : result.text;
      return { content: [{ type: "text", text }] };
    } catch (err) {
      return {
        content: [{ type: "text", text: `Error fetching ${url}: ${err.message}` }],
        isError: true,
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);