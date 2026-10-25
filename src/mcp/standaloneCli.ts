import * as fs from "fs";
import * as http from "http";
import * as path from "path";
import * as readline from "readline";
import { generateRandomToken } from "../types";
import { CloudflareQuickTunnelManager } from "./cloudflareTunnel";
import { FilesystemVaultAdapter } from "./filesystemAdapter";
import { JsonRpcRequest, ObsidianMcpEngine } from "./mcpEngine";
import { EmbeddedMcpHttpServer } from "./mcpHttpServer";

interface CliArgs {
  vault: string;
  port: number;
  host: string;
  tunnel: boolean;
  stdio: boolean;
  noAuth: boolean;
  token?: string;
  cloudflaredPath?: string;
}

function parseCliArgs(argv: string[]): CliArgs {
  const env = process.env;
  const out: CliArgs = {
    vault: env.OBSIDIAN_VAULT_PATH || env.VAULT_PATH || process.cwd(),
    port: parseInt(env.MCP_PORT || "27125", 10) || 27125,
    host: env.MCP_HOST || "127.0.0.1",
    tunnel: env.MCP_TUNNEL === "1" || env.MCP_TUNNEL === "true",
    stdio: false,
    noAuth: env.MCP_NO_AUTH === "1" || env.MCP_NO_AUTH === "true",
    token: env.MCP_AUTH_TOKEN || undefined,
    cloudflaredPath: env.CLOUDFLARED_PATH || undefined,
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if ((a === "--vault" || a === "-v") && argv[i + 1]) {
      out.vault = argv[++i];
    } else if ((a === "--port" || a === "-p") && argv[i + 1]) {
      out.port = parseInt(argv[++i], 10) || 27125;
    } else if (a === "--host" && argv[i + 1]) {
      out.host = argv[++i];
    } else if (a === "--tunnel" || a === "-t") {
      out.tunnel = true;
    } else if (a === "--stdio") {
      out.stdio = true;
    } else if (a === "--no-auth") {
      out.noAuth = true;
    } else if (a === "--token" && argv[i + 1]) {
      out.token = argv[++i];
    } else if (a === "--cloudflared" && argv[i + 1]) {
      out.cloudflaredPath = argv[++i];
    } else if (a === "--help" || a === "-h") {
      printUsageAndExit();
    }
  }
  return out;
}

function printUsageAndExit(): never {
  console.log(`
Obsidian Magnetic Groups & Miro — Standalone MCP Server + Cloudflare Quick Tunnel

Usage:
  node obsidian-mcp-server.mjs --vault "/path/to/ObsidianVault" [options]

Options:
  --vault, -v <dir>      Path to your Obsidian vault folder (or set OBSIDIAN_VAULT_PATH)
  --port, -p <port>      Local HTTP port (default: 27125)
  --host <host>          Bind address (default: 127.0.0.1)
  --tunnel, -t           Automatically start a Cloudflare Quick Tunnel (trycloudflare.com)
  --token <secret>       Explicit secret token (otherwise synced with plugin data.json)
  --no-auth              Disable secret token verification
  --stdio                Run in MCP STDIO mode (for local Claude Desktop / Cursor)
  --cloudflared <path>   Custom path to cloudflared binary
`);
  process.exit(0);
}

async function checkExistingObsidianMcpServer(
  host: string,
  port: number
): Promise<boolean> {
  return await new Promise<boolean>((resolve) => {
    const req = http.get(
      { host, port, path: "/health", timeout: 1200 },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          resolve(
            res.statusCode === 200 &&
              data.includes("obsidian-magnetic-miro-mcp")
          );
        });
      }
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function main(): Promise<void> {
  const args = parseCliArgs(process.argv.slice(2));
  const vaultAbs = path.resolve(args.vault);
  if (!fs.existsSync(vaultAbs)) {
    fs.mkdirSync(vaultAbs, { recursive: true });
  }

  const adapter = new FilesystemVaultAdapter(vaultAbs);
  const engine = new ObsidianMcpEngine(adapter);

  // Mode 1: STDIO transport (must only write JSON-RPC lines to stdout!)
  if (args.stdio) {
    const rl = readline.createInterface({
      input: process.stdin,
      terminal: false,
    });
    rl.on("line", async (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      try {
        const msg = JSON.parse(trimmed) as JsonRpcRequest;
        const resp = await engine.handleJsonRpcMessage(msg);
        if (resp !== null) {
          process.stdout.write(JSON.stringify(resp) + "\n");
        }
      } catch {
        process.stdout.write(
          JSON.stringify({
            jsonrpc: "2.0",
            id: null,
            error: { code: -32700, message: "Parse error" },
          }) + "\n"
        );
      }
    });
    return;
  }

  // Ensure token is synced with plugin data.json
  const settings = await adapter.getPluginSettings();
  let authToken = args.token || settings.mcpAuthToken;
  if (!authToken) {
    authToken = generateRandomToken();
    await adapter.updatePluginSettings({ mcpAuthToken: authToken });
  }
  const requireToken = !args.noAuth && settings.mcpUseAuthToken !== false;

  // Smart check: if Obsidian Desktop is ALREADY running the embedded MCP server on this port, reuse it seamlessly!
  const alreadyLiveInObsidian = await checkExistingObsidianMcpServer(
    args.host,
    args.port
  );

  let httpServer: EmbeddedMcpHttpServer | null = null;
  let actualPort = args.port;

  if (alreadyLiveInObsidian) {
    console.log(
      `✓ Detected live Obsidian Desktop MCP server already running on http://${args.host}:${args.port}`
    );
  } else {
    httpServer = new EmbeddedMcpHttpServer(engine, {
      host: args.host,
      port: args.port,
      requireToken,
      authToken,
    });
    actualPort = await httpServer.start();
    const localUrls = httpServer.getLocalEndpoints()!;
    console.log(`\n=============================================================`);
    console.log(`🧲 Obsidian Vault + Graph Miro MCP Server Running`);
    console.log(`   Vault:           ${vaultAbs}`);
    console.log(`   Streamable HTTP: ${localUrls.mcpUrl}`);
    console.log(`   Legacy SSE:      ${localUrls.sseUrl}`);
    console.log(`=============================================================\n`);
  }

  let tunnelMgr: CloudflareQuickTunnelManager | null = null;
  if (args.tunnel) {
    tunnelMgr = new CloudflareQuickTunnelManager();
    console.log(`☁️  Starting Cloudflare Quick Tunnel -> http://127.0.0.1:${actualPort} ...`);
    try {
      const publicBase = await tunnelMgr.start(
        actualPort,
        args.cloudflaredPath
      );
      const tokenSeg =
        requireToken && authToken
          ? `/t/${encodeURIComponent(authToken)}`
          : "";
      console.log(`\n🚀 CLOUDFLARE QUICK TUNNEL READY FOR CLOUD AGENTS:`);
      console.log(`   Streamable HTTP (Claude / ChatGPT / Cursor / LangGraph):`);
      console.log(`   👉 ${publicBase}${tokenSeg}/mcp\n`);
      console.log(`   Legacy SSE (n8n / older SSE clients):`);
      console.log(`   👉 ${publicBase}${tokenSeg}/sse\n`);
    } catch (err) {
      console.error(
        `⚠️  Could not auto-start cloudflared: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
      console.log(
        `   You can also run manually: cloudflared tunnel --url http://127.0.0.1:${actualPort}`
      );
    }
  } else {
    console.log(
      `💡 Tip: pass --tunnel (or run: cloudflared tunnel --url http://127.0.0.1:${actualPort}) to expose HTTPS for cloud agents.`
    );
  }

  const shutdown = async () => {
    console.log("\nShutting down MCP server & tunnel...");
    await tunnelMgr?.stop();
    await httpServer?.stop();
    process.exit(0);
  };
  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());
}

void main();
