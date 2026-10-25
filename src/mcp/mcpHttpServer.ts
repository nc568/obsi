import type * as HttpTypes from "http";
import {
  JsonRpcRequest,
  JsonRpcResponse,
  ObsidianMcpEngine,
} from "./mcpEngine";

export interface McpHttpServerOptions {
  host: string;
  port: number;
  requireToken: boolean;
  authToken: string;
  getPublicTunnelUrl?: () => string | null;
}

interface SseSession {
  id: string;
  res: HttpTypes.ServerResponse;
  heartbeat: ReturnType<typeof setInterval>;
}

/**
 * Dynamic loader for Node's built-in `http` module that works in BOTH:
 * - Obsidian Desktop (Electron CommonJS `require("http")`)
 * - Standalone Node ESM (`await import("node:http")`)
 */
async function loadNodeHttp(): Promise<typeof HttpTypes | null> {
  try {
    const req =
      (globalThis as unknown as { require?: (id: string) => typeof HttpTypes })
        .require ||
      (typeof window !== "undefined"
        ? (window as unknown as { require?: (id: string) => typeof HttpTypes })
            .require
        : undefined);
    if (typeof req === "function") {
      return req("http");
    }
  } catch {
    // Fallback to dynamic import in standalone Node ESM
  }
  try {
    const modName = "node:" + "http";
    return (await import(modName)) as typeof HttpTypes;
  } catch {
    return null;
  }
}

export class EmbeddedMcpHttpServer {
  private engine: ObsidianMcpEngine;
  private opts: McpHttpServerOptions;
  private server: HttpTypes.Server | null = null;
  private sseSessions = new Map<string, SseSession>();
  private streamableGetStreams = new Set<{
    res: HttpTypes.ServerResponse;
    heartbeat: ReturnType<typeof setInterval>;
  }>();
  private listeningPort: number | null = null;

  constructor(engine: ObsidianMcpEngine, opts: McpHttpServerOptions) {
    this.engine = engine;
    this.opts = { ...opts };
  }

  public updateOptions(patch: Partial<McpHttpServerOptions>): void {
    this.opts = { ...this.opts, ...patch };
  }

  public isRunning(): boolean {
    return this.server !== null && this.listeningPort !== null;
  }

  public getListeningPort(): number | null {
    return this.listeningPort;
  }

  public getLocalEndpoints(): {
    baseUrl: string;
    mcpUrl: string;
    sseUrl: string;
  } | null {
    if (!this.listeningPort) return null;
    const base = `http://${this.opts.host || "127.0.0.1"}:${this.listeningPort}`;
    const tokenSeg =
      this.opts.requireToken && this.opts.authToken
        ? `/t/${encodeURIComponent(this.opts.authToken)}`
        : "";
    return {
      baseUrl: base,
      mcpUrl: `${base}${tokenSeg}/mcp`,
      sseUrl: `${base}${tokenSeg}/sse`,
    };
  }

  public buildPublicEndpoints(tunnelBaseUrl: string): {
    mcpUrl: string;
    sseUrl: string;
  } {
    const clean = tunnelBaseUrl.replace(/\/+$/, "");
    const tokenSeg =
      this.opts.requireToken && this.opts.authToken
        ? `/t/${encodeURIComponent(this.opts.authToken)}`
        : "";
    return {
      mcpUrl: `${clean}${tokenSeg}/mcp`,
      sseUrl: `${clean}${tokenSeg}/sse`,
    };
  }

  public async start(): Promise<number> {
    if (this.server && this.listeningPort) {
      return this.listeningPort;
    }

    const httpMod = await loadNodeHttp();
    if (!httpMod) {
      throw new Error(
        "Node.js http module is unavailable in this environment (desktop Obsidian or Node.js required)"
      );
    }

    const server = httpMod.createServer((req, res) => {
      void this.handleHttpRequest(req, res);
    });

    // Keep-alive tuning friendly to Cloudflare Quick Tunnels (`cloudflared`)
    server.keepAliveTimeout = 65_000;
    server.headersTimeout = 70_000;

    return await new Promise<number>((resolve, reject) => {
      const onError = (err: Error) => {
        server.removeListener("error", onError);
        reject(err);
      };
      server.once("error", onError);
      server.listen(this.opts.port, this.opts.host || "127.0.0.1", () => {
        server.removeListener("error", onError);
        const addr = server.address();
        const actualPort =
          addr && typeof addr === "object" ? addr.port : this.opts.port;
        this.server = server;
        this.listeningPort = actualPort;
        resolve(actualPort);
      });
    });
  }

  public async stop(): Promise<void> {
    for (const sess of this.sseSessions.values()) {
      clearInterval(sess.heartbeat);
      try {
        sess.res.end();
      } catch {
        // ignore
      }
    }
    this.sseSessions.clear();

    for (const s of this.streamableGetStreams) {
      clearInterval(s.heartbeat);
      try {
        s.res.end();
      } catch {
        // ignore
      }
    }
    this.streamableGetStreams.clear();

    if (!this.server) {
      this.listeningPort = null;
      return;
    }
    const srv = this.server;
    this.server = null;
    this.listeningPort = null;

    await new Promise<void>((resolve) => {
      srv.close(() => resolve());
    });
  }

  /* =========================================================================
   * HTTP Request Router (Cloudflare Quick Tunnel + Streamable HTTP + SSE)
   * ========================================================================= */

  private setCorsHeaders(res: HttpTypes.ServerResponse): void {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Accept, Authorization, X-API-Key, Mcp-Session-Id, MCP-Protocol-Version, Last-Event-ID"
    );
    res.setHeader(
      "Access-Control-Expose-Headers",
      "Mcp-Session-Id, MCP-Protocol-Version"
    );
  }

  private async handleHttpRequest(
    req: HttpTypes.IncomingMessage,
    res: HttpTypes.ServerResponse
  ): Promise<void> {
    this.setCorsHeaders(res);

    const method = (req.method || "GET").toUpperCase();
    if (method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const rawUrl = req.url || "/";
    const parsedUrl = new URL(rawUrl, "http://localhost");
    let pathname = parsedUrl.pathname;

    // OAuth discovery probes sent by Claude.ai / ChatGPT / MCP Inspector:
    // Returning clean 404 tells OAuth-capable clients this server uses direct URL / token access rather than OAuth2 dynamic registration.
    if (pathname.startsWith("/.well-known/")) {
      res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "oauth_not_configured" }));
      return;
    }

    // Extract optional path-embedded token: /t/<token>/mcp, /t/<token>/sse, /t/<token>/messages
    let pathToken: string | null = null;
    let routePrefix = "";
    const pathTokenMatch = pathname.match(/^\/t\/([^/]+)(\/.*)?$/);
    if (pathTokenMatch) {
      pathToken = decodeURIComponent(pathTokenMatch[1]);
      routePrefix = `/t/${pathTokenMatch[1]}`;
      pathname = pathTokenMatch[2] || "/";
    }

    // Public unauthenticated health ping (safe metadata only, never exposes vault notes)
    if (method === "GET" && pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(
        JSON.stringify({
          ok: true,
          service: "obsidian-magnetic-miro-mcp",
          version: "2.0.0",
          transports: ["streamable-http", "sse"],
          authRequired: Boolean(this.opts.requireToken && this.opts.authToken),
          stats: this.engine.stats,
        })
      );
      return;
    }

    // Verify token authentication if enabled
    if (this.opts.requireToken && this.opts.authToken) {
      const provided = this.extractProvidedToken(req, parsedUrl, pathToken);
      if (provided !== this.opts.authToken) {
        res.writeHead(401, {
          "Content-Type": "application/json; charset=utf-8",
        });
        res.end(
          JSON.stringify({
            jsonrpc: "2.0",
            id: null,
            error: {
              code: -32001,
              message:
                "Unauthorized: include valid token via /t/<token>/mcp URL path, ?token=<token>, or Authorization: Bearer <token>.",
            },
          })
        );
        return;
      }
    }

    // Route 1: Legacy HTTP+SSE stream (`GET /sse`)
    if (method === "GET" && pathname === "/sse") {
      this.handleLegacySseConnect(res, routePrefix, parsedUrl);
      return;
    }

    // Route 2: Legacy HTTP+SSE client->server POST (`POST /messages`)
    if (method === "POST" && pathname === "/messages") {
      await this.handleLegacySseMessage(req, res, parsedUrl);
      return;
    }

    // Route 3: Modern MCP Streamable HTTP (`POST/GET/DELETE` on `/mcp` or `/`)
    if (pathname === "/mcp" || pathname === "/") {
      if (method === "POST") {
        await this.handleStreamablePost(req, res);
        return;
      }
      if (method === "DELETE") {
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ closed: true }));
        return;
      }
      if (method === "GET") {
        const accept = String(req.headers["accept"] || "");
        if (accept.includes("text/event-stream")) {
          this.handleStreamableGetSse(req, res);
          return;
        }
        // Friendly status response when user opens the URL in a browser
        this.handleBrowserStatusPage(req, res, routePrefix);
        return;
      }
    }

    res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        error: "Not Found",
        hint: "Connect your MCP client to /mcp (Streamable HTTP) or /sse (HTTP+SSE).",
      })
    );
  }

  private extractProvidedToken(
    req: HttpTypes.IncomingMessage,
    parsedUrl: URL,
    pathToken: string | null
  ): string | null {
    if (pathToken) return pathToken;
    const queryToken = parsedUrl.searchParams.get("token");
    if (queryToken) return queryToken;
    const authHeader = String(req.headers["authorization"] || "");
    if (authHeader.toLowerCase().startsWith("bearer ")) {
      return authHeader.slice(7).trim();
    }
    const apiKey = req.headers["x-api-key"];
    if (typeof apiKey === "string" && apiKey.trim()) {
      return apiKey.trim();
    }
    return null;
  }

  /* =========================================================================
   * Modern Streamable HTTP Transport (`POST /mcp`, `GET /mcp`)
   * Works both Statefully (`Mcp-Session-Id`) AND Statelessly for Cloud Agents!
   * ========================================================================= */

  private async handleStreamablePost(
    req: HttpTypes.IncomingMessage,
    res: HttpTypes.ServerResponse
  ): Promise<void> {
    let rawBody = "";
    try {
      rawBody = await readRequestBody(req);
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(
        JSON.stringify({
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: String(err) },
        })
      );
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(
        JSON.stringify({
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: "Parse error: invalid JSON" },
        })
      );
      return;
    }

    const incomingSessionId =
      typeof req.headers["mcp-session-id"] === "string"
        ? req.headers["mcp-session-id"]
        : generateSessionId();

    res.setHeader("Mcp-Session-Id", incomingSessionId);

    // Handle JSON-RPC batch or single message
    if (Array.isArray(parsed)) {
      const responses: JsonRpcResponse[] = [];
      for (const item of parsed) {
        const out = await this.engine.handleJsonRpcMessage(
          item as JsonRpcRequest
        );
        if (out) responses.push(out);
      }
      if (responses.length === 0) {
        res.writeHead(202);
        res.end();
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(responses));
      return;
    }

    const single = parsed as JsonRpcRequest;
    const response = await this.engine.handleJsonRpcMessage(single);
    if (response === null) {
      // JSON-RPC notification -> 202 Accepted per MCP Streamable HTTP spec
      res.writeHead(202);
      res.end();
      return;
    }

    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(response));
  }

  private handleStreamableGetSse(
    req: HttpTypes.IncomingMessage,
    res: HttpTypes.ServerResponse
  ): void {
    const sid =
      typeof req.headers["mcp-session-id"] === "string"
        ? req.headers["mcp-session-id"]
        : generateSessionId();

    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Mcp-Session-Id": sid,
    });
    res.write(": connected\n\n");

    const heartbeat = setInterval(() => {
      try {
        res.write(": keepalive\n\n");
      } catch {
        clearInterval(heartbeat);
      }
    }, 15_000);

    const entry = { res, heartbeat };
    this.streamableGetStreams.add(entry);

    req.on("close", () => {
      clearInterval(heartbeat);
      this.streamableGetStreams.delete(entry);
    });
  }

  /* =========================================================================
   * Legacy HTTP + SSE Transport (`GET /sse` + `POST /messages`)
   * ========================================================================= */

  private handleLegacySseConnect(
    res: HttpTypes.ServerResponse,
    routePrefix: string,
    parsedUrl: URL
  ): void {
    const sessionId = generateSessionId();
    const queryToken = parsedUrl.searchParams.get("token");
    const tokenParam =
      !routePrefix && queryToken
        ? `&token=${encodeURIComponent(queryToken)}`
        : "";
    const messagesEndpoint = `${routePrefix}/messages?sessionId=${encodeURIComponent(
      sessionId
    )}${tokenParam}`;

    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });

    // Required initial event per MCP 2024-11-05 HTTP+SSE specification
    res.write(`event: endpoint\ndata: ${messagesEndpoint}\n\n`);

    // 15s keepalive prevents Cloudflare Quick Tunnel 100s idle timeout
    const heartbeat = setInterval(() => {
      try {
        res.write(": keepalive\n\n");
      } catch {
        clearInterval(heartbeat);
      }
    }, 15_000);

    const session: SseSession = { id: sessionId, res, heartbeat };
    this.sseSessions.set(sessionId, session);

    res.on("close", () => {
      clearInterval(heartbeat);
      this.sseSessions.delete(sessionId);
    });
  }

  private async handleLegacySseMessage(
    req: HttpTypes.IncomingMessage,
    res: HttpTypes.ServerResponse,
    parsedUrl: URL
  ): Promise<void> {
    const sessionId = parsedUrl.searchParams.get("sessionId") || "";
    const session = this.sseSessions.get(sessionId);
    if (!session) {
      res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "Unknown or expired SSE sessionId" }));
      return;
    }

    let rawBody = "";
    try {
      rawBody = await readRequestBody(req);
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: String(err) }));
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "Invalid JSON" }));
      return;
    }

    res.writeHead(202, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Accepted");

    const items = Array.isArray(parsed) ? parsed : [parsed];
    for (const item of items) {
      const rpcRes = await this.engine.handleJsonRpcMessage(
        item as JsonRpcRequest
      );
      if (rpcRes !== null) {
        try {
          session.res.write(
            `event: message\ndata: ${JSON.stringify(rpcRes)}\n\n`
          );
        } catch {
          // Stream closed
        }
      }
    }
  }

  /* =========================================================================
   * Friendly Status Page when User Visits Tunnel URL in Browser
   * ========================================================================= */

  private handleBrowserStatusPage(
    req: HttpTypes.IncomingMessage,
    res: HttpTypes.ServerResponse,
    routePrefix: string
  ): void {
    const proto = String(req.headers["x-forwarded-proto"] || "http");
    const host = String(
      req.headers["x-forwarded-host"] || req.headers["host"] || "127.0.0.1"
    );
    const base = `${proto}://${host}${routePrefix}`;
    const accept = String(req.headers["accept"] || "");

    if (!accept.includes("text/html")) {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(
        JSON.stringify({
          service: "obsidian-magnetic-miro-mcp",
          status: "online",
          streamableHttpEndpoint: `${base}/mcp`,
          sseEndpoint: `${base}/sse`,
          stats: this.engine.stats,
        })
      );
      return;
    }

    const html = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>Obsidian Magnetic Groups & Miro — MCP Server</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #13151d; color: #e8eaf2; max-width: 680px; margin: 48px auto; padding: 0 20px; line-height: 1.55; }
    .card { background: #1c1f2b; border: 1px solid #2e3348; border-radius: 14px; padding: 24px; box-shadow: 0 12px 32px rgba(0,0,0,0.35); }
    .ok { display: inline-block; padding: 3px 10px; border-radius: 999px; background: rgba(6,214,160,0.16); color: #06d6a0; font-size: 12px; font-weight: 600; }
    code { display: block; background: #11131a; border: 1px solid #2b3044; padding: 10px 12px; border-radius: 8px; color: #a892ff; margin: 6px 0 14px; word-break: break-all; }
  </style>
</head>
<body>
  <div class="card">
    <span class="ok">● MCP-сервер активен</span>
    <h2 style="margin:12px 0 6px;">Obsidian Graph Magnetic Groups & Miro MCP</h2>
    <p style="color:#9ba1b8;margin-top:0;">Готов к подключению облачных ИИ-агентов (Claude, ChatGPT, n8n, LangGraph, Cursor и др.).</p>
    <strong>Streamable HTTP URL (рекомендуется):</strong>
    <code>${base}/mcp</code>
    <strong>Legacy SSE URL (для старых клиентов):</strong>
    <code>${base}/sse</code>
    <p style="font-size:13px;color:#9ba1b8;margin-bottom:0;">Вызовов инструментов за сессию: <b>${this.engine.stats.totalToolCalls}</b></p>
  </div>
</body>
</html>`;
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  }
}

function readRequestBody(
  req: HttpTypes.IncomingMessage,
  maxBytes = 4 * 1024 * 1024
): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    req.on("data", (chunk: Buffer) => {
      total += chunk.length;
      if (total > maxBytes) {
        reject(new Error("Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", reject);
  });
}

function generateSessionId(): string {
  return (
    "mcp-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 10)
  );
}
