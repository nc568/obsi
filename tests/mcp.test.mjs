import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import esbuild from "esbuild";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

// Bundle MCP server classes into ESM for direct in-process testing
const built = await esbuild.build({
  stdin: {
    contents: `
      export * from "./src/mcp/filesystemAdapter.ts";
      export * from "./src/mcp/mcpEngine.ts";
      export * from "./src/mcp/mcpHttpServer.ts";
    `,
    resolveDir: process.cwd(),
    loader: "ts",
  },
  bundle: true,
  platform: "node",
  format: "esm",
  plugins: [
    {
      name: "obsidian-stub",
      setup(b) {
        b.onResolve({ filter: /^obsidian$/ }, () => ({
          path: "obs",
          namespace: "stub",
        }));
        b.onLoad({ filter: /.*/, namespace: "stub" }, () => ({
          contents:
            "export class TFile {} export class TFolder {} export function getAllTags() { return []; }",
          loader: "js",
        }));
      },
    },
  ],
  write: false,
});

const mod = await import(
  `data:text/javascript;base64,${Buffer.from(built.outputFiles[0].text).toString(
    "base64"
  )}`
);

const { FilesystemVaultAdapter, ObsidianMcpEngine, EmbeddedMcpHttpServer } = mod;

console.log("=== Running Official MCP SDK + Cloudflare Quick Tunnel E2E Suite ===");

const tmpVault = fs.mkdtempSync(path.join(os.tmpdir(), "obsi-mcp-test-"));
fs.mkdirSync(path.join(tmpVault, "Architecture"), { recursive: true });
fs.mkdirSync(path.join(tmpVault, "AI"), { recursive: true });

fs.writeFileSync(
  path.join(tmpVault, "Index.md"),
  `---\nstatus: active\ntags: [hub, core]\n---\n# Vault Index\nLinks to [[Architecture/API Gateway]] and [[AI/Agent Orchestrator]].\n`,
  "utf8"
);
fs.writeFileSync(
  path.join(tmpVault, "Architecture", "API Gateway.md"),
  `# API Gateway\n#backend #architecture\nConnects to [[Index]].\n`,
  "utf8"
);
fs.writeFileSync(
  path.join(tmpVault, "AI", "Agent Orchestrator.md"),
  `# Agent Orchestrator\n#ai/agents\nUses Cloudflare Quick Tunnels to reach [[Architecture/API Gateway]].\n`,
  "utf8"
);

const SECRET_TOKEN = "obs_testtoken_cloudflare_998877";
const adapter = new FilesystemVaultAdapter(tmpVault);
const engine = new ObsidianMcpEngine(adapter);
const server = new EmbeddedMcpHttpServer(engine, {
  host: "127.0.0.1",
  port: 0, // ephemeral port
  requireToken: true,
  authToken: SECRET_TOKEN,
});

const port = await server.start();
const baseUrl = `http://127.0.0.1:${port}`;

try {
  // 1. Security & Cloudflare Quick Tunnel Edge Headers Verification
  {
    // Unauthenticated call must fail with 401
    const unauth = await fetch(`${baseUrl}/mcp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "ping" }),
    });
    assert.equal(unauth.status, 401, "Missing token must return 401");

    // OAuth discovery probe must cleanly return 404 so Claude/ChatGPT use direct URL mode
    const oauthProbe = await fetch(
      `${baseUrl}/.well-known/oauth-protected-resource`
    );
    assert.equal(oauthProbe.status, 404);

    // Stateless Cloud Agent request simulating Cloudflare Quick Tunnel headers + Bearer auth + Accept: application/json only
    const cfStateless = await fetch(`${baseUrl}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${SECRET_TOKEN}`,
        Host: "vivid-forest-4821.trycloudflare.com",
        "X-Forwarded-Proto": "https",
        "X-Forwarded-Host": "vivid-forest-4821.trycloudflare.com",
        Origin: "https://claude.ai",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 77,
        method: "tools/call",
        params: { name: "vault_info", arguments: {} },
      }),
    });
    assert.equal(cfStateless.status, 200);
    assert.equal(cfStateless.headers.get("access-control-allow-origin"), "*");
    const body = await cfStateless.json();
    const info = JSON.parse(body.result.content[0].text);
    assert.equal(info.noteCount, 3);
    console.log(
      "✓ Cloudflare Quick Tunnel headers, CORS, 401 token guard & stateless Cloud Agent POST verified"
    );
  }

  // 2. Official @modelcontextprotocol/sdk StreamableHTTPClientTransport via single-URL /t/<token>/mcp
  {
    const client = new Client({ name: "cloud-agent-e2e", version: "1.0.0" });
    const transport = new StreamableHTTPClientTransport(
      new URL(`${baseUrl}/t/${SECRET_TOKEN}/mcp`)
    );
    await client.connect(transport);

    const { tools } = await client.listTools();
    assert.equal(tools.length, 20, `Expected 20 MCP tools, got ${tools.length}`);

    const { resources } = await client.listResources();
    assert.equal(resources.length, 3);
    const summaryRes = await client.readResource({
      uri: "obsidian://vault/summary",
    });
    assert.ok(summaryRes.contents[0].text.includes("noteCount"));

    const { prompts } = await client.listPrompts();
    assert.equal(prompts.length, 1);

    // Create a new note via MCP and verify wikilinks & tags
    await client.callTool({
      name: "create_or_update_note",
      arguments: {
        path: "AI/MCP Bridge.md",
        content:
          "# MCP Bridge\n#ai/agents\nConnected to [[Index]] and [[AI/Agent Orchestrator]].\n",
      },
    });

    const readRes = await client.callTool({
      name: "read_note",
      arguments: { path: "AI/Agent Orchestrator.md" },
    });
    const noteData = JSON.parse(readRes.content[0].text);
    assert.ok(
      noteData.backlinks.includes("AI/MCP Bridge.md"),
      "Backlink from newly created note should be resolved"
    );

    const searchRes = await client.callTool({
      name: "search_vault",
      arguments: { query: "Cloudflare Quick Tunnels" },
    });
    const hits = JSON.parse(searchRes.content[0].text);
    assert.equal(hits.length, 1);
    assert.equal(hits[0].path, "AI/Agent Orchestrator.md");

    // Create a Miro-Pinned Frame via MCP!
    const createGrp = await client.callTool({
      name: "graph_create_group",
      arguments: {
        name: "AI Sprint Board",
        mode: "miro-pinned",
        query: "tag:#ai",
        color: "#2ec4b6",
        frameSubLayout: "grid",
        frameX: -420,
        frameY: -180,
        frameW: 320,
        frameH: 240,
      },
    });
    const createdInfo = JSON.parse(createGrp.content[0].text);
    assert.equal(createdInfo.created.mode, "miro-pinned");
    assert.equal(createdInfo.matchedCount, 2);

    // Arrange multi-frame Miro Board in 1 call!
    const boardRes = await client.callTool({
      name: "graph_arrange_miro_board",
      arguments: {
        boardStyle: "columns",
        items: [
          { groupIdOrName: "AI Sprint Board", subLayout: "column" },
          {
            name: "Backend Architecture",
            query: "tag:#backend",
            color: "#ff6b6b",
            mode: "miro-free",
          },
        ],
      },
    });
    const boardData = JSON.parse(boardRes.content[0].text);
    assert.equal(boardData.arrangedCount, 2);
    assert.ok(boardData.frames[0].frameX < boardData.frames[1].frameX);

    // Pin & unpin individual sticky nodes
    const pinRes = await client.callTool({
      name: "graph_pin_nodes",
      arguments: {
        pins: [{ id: "Index.md", x: 0, y: -300 }],
      },
    });
    assert.equal(JSON.parse(pinRes.content[0].text).pinnedCount, 1);

    // Verify plugin data.json was written cleanly for Obsidian
    const savedPluginJson = JSON.parse(
      fs.readFileSync(
        path.join(
          tmpVault,
          ".obsidian",
          "plugins",
          "graph-magnetic-groups",
          "data.json"
        ),
        "utf8"
      )
    );
    assert.equal(savedPluginJson.groups.length, 2);
    assert.equal(savedPluginJson.showBoardGrid, true);
    assert.deepEqual(savedPluginJson.pinnedNodes["Index.md"], {
      x: 0,
      y: -300,
    });

    await client.close();
    console.log(
      "✓ Official @modelcontextprotocol/sdk StreamableHTTPClientTransport passed all 20-tool Vault + Miro operations"
    );
  }

  // 3. Official @modelcontextprotocol/sdk SSEClientTransport via /t/<token>/sse
  {
    const sseClient = new Client({ name: "legacy-sse-agent", version: "1.0.0" });
    const sseTransport = new SSEClientTransport(
      new URL(`${baseUrl}/t/${SECRET_TOKEN}/sse`)
    );
    await sseClient.connect(sseTransport);

    const listRes = await sseClient.callTool({
      name: "graph_list_groups",
      arguments: {},
    });
    const listData = JSON.parse(listRes.content[0].text);
    assert.equal(listData.groups.length, 2);

    await sseClient.close();
    console.log(
      "✓ Official @modelcontextprotocol/sdk SSEClientTransport (/sse + /messages) passed end-to-end"
    );
  }
} finally {
  await server.stop();
  fs.rmSync(tmpVault, { recursive: true, force: true });
}

console.log("=== ALL MCP + CLOUDFLARE QUICK TUNNEL TESTS PASSED ===");
