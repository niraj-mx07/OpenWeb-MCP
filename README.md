# web-mcp

Give your AI agent real-time access to the web. 🌐

Most agents and local models are stuck at their training cutoff — ask about today's news or the latest docs and they either refuse or confidently make something up. **web-mcp** is a small, from-scratch MCP server that gives any MCP-compatible client (Antigravity, Claude Code, Cursor, etc.) the ability to search the web and fetch real page content, live.

No cloud dependency required to get started — built and tested end-to-end as a learning project, and now running as a real tool inside [Antigravity](https://antigravity.google/).

## Why web-mcp

| Your situation | web-mcp's answer |
|---|---|
| Agent's knowledge is frozen at training time | `web_search` hits the live web and returns real, current results |
| Need the actual content of a page, not just a snippet | `fetch_page` retrieves and extracts readable page text |
| Don't want a single search engine to be a single point of failure | Multi-engine routing across DuckDuckGo, Wikipedia, and GitHub, with cooldowns and dedup |
| Want to know what your agent is actually doing under the hood | `web_log` records every search/fetch so you can audit activity |
| Just want to sanity-check the server without a full client | `ping` for a trivial connectivity check |

## Get started

```bash
git clone <your-repo-url>
cd web-mcp
npm install

# Smoke-test without any client
node test-client.mjs
```

## Connect it to your client

Most MCP clients (Antigravity, Claude Code, Cursor, etc.) use the same basic config shape. Add this to the client's MCP settings (in Antigravity: **"..."** menu → **MCP Servers** → **Manage MCP Servers** → **View raw config**):

```json
{
  "mcpServers": {
    "web-mcp": {
      "command": "node",
      "args": ["/absolute/path/to/web-mcp/src/index.mjs"]
    }
  }
}
```

Restart the client, then ask it something that requires current information (e.g. *"What's the latest LTS version of Node.js?"*) and watch it reach for `web_search` on its own.

## Tools

### 1. `web_search` — multi-engine search
Runs your query across DuckDuckGo, Wikipedia, and GitHub, with intent-aware routing, per-engine cooldowns on failure, timeouts, and deduplication of results by URL.

### 2. `fetch_page` — page fetching
Fetches a URL and returns its content in one of two modes:

| Mode | Use case |
|---|---|
| `text` | General-purpose extraction |
| `readable` | Strips nav/ads for articles and blog posts |

### 3. `web_log` — usage log
Shows recent search/fetch activity, or aggregate stats per engine — useful for seeing exactly which path each request took.

### 4. `ping`
Replies with `pong` plus whatever message you send it. Good for a first connectivity check when wiring up a new client.

## Architecture

```
MCP client (Antigravity / Claude Code / Cursor / ...)
   │  stdio
   ▼
web-mcp (Node.js + MCP SDK)
   ├── web_search ── intent routing → parallel engines → cooldown → dedup
   │      DuckDuckGo / Wikipedia / GitHub
   ├── fetch_page ── text / readable extraction
   └── web_log ── activity log (recent / stats)
```

## Known limitations

- Free search engines can rate-limit under heavy or repeated use — cooldown logic minimizes but doesn't eliminate this.
- No LLM-backed summarization tools (yet) — results come back raw for the client's own model to reason over.

## Testing

```bash
node test-client.mjs
```

Runs an end-to-end smoke test against the server without needing a full MCP client.

## License

MIT — update if you intend something else.