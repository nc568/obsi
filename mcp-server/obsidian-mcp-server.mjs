#!/usr/bin/env node
/* Obsidian Magnetic Groups & Miro — Standalone MCP Server + Cloudflare Quick Tunnel */

// src/mcp/standaloneCli.ts
import * as fs2 from "fs";
import * as http from "http";
import * as path2 from "path";
import * as readline from "readline";

// src/types.ts
var DEFAULT_GROUP_COLORS = [
  "#7c5cff",
  "#ff6b6b",
  "#2ec4b6",
  "#ffbe0b",
  "#3a86ff",
  "#ff70a6",
  "#06d6a0",
  "#fb8500"
];
function generateRandomToken() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "obs_";
  for (let i = 0; i < 24; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}
var DEFAULT_SETTINGS = {
  enabled: true,
  enableLocalGraph: true,
  syncNativeColorGroups: true,
  attractionStrength: 0.62,
  clusterTether: 0.78,
  groupCompactness: 0.58,
  showGroupZones: true,
  showGroupLabels: true,
  showTetherLines: true,
  showBoardGrid: false,
  repelOutsidersFromFrames: true,
  zoneOpacity: 0.13,
  shiftDragLasso: true,
  sectionCollapsed: false,
  language: "ru",
  groups: [],
  pinnedNodes: {},
  mcpEnabled: true,
  mcpPort: 27125,
  mcpHost: "127.0.0.1",
  mcpUseAuthToken: true,
  mcpAuthToken: "",
  mcpAutoStartTunnel: false,
  mcpCloudflaredPath: ""
};

// src/mcp/cloudflareTunnel.ts
async function loadChildProcessAndFs() {
  try {
    const req = globalThis.require || (typeof window !== "undefined" ? window.require : void 0);
    if (typeof req === "function") {
      return {
        cp: req("child_process"),
        fs: req("fs")
      };
    }
  } catch {
  }
  try {
    const cpMod = "node:child_process";
    const fsMod = "node:fs";
    const [cp, fs3] = await Promise.all([import(cpMod), import(fsMod)]);
    return { cp, fs: fs3 };
  } catch {
    return null;
  }
}
var CloudflareQuickTunnelManager = class {
  constructor() {
    this.proc = null;
    this.status = {
      state: "stopped",
      publicBaseUrl: null,
      error: null,
      logsTail: []
    };
    this.listeners = /* @__PURE__ */ new Set();
  }
  getStatus() {
    return { ...this.status, logsTail: [...this.status.logsTail] };
  }
  onStatusChange(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
  emit() {
    const snap = this.getStatus();
    for (const cb of this.listeners) {
      try {
        cb(snap);
      } catch {
      }
    }
  }
  appendLog(line) {
    const trimmed = line.trim();
    if (!trimmed) return;
    this.status.logsTail.push(trimmed);
    if (this.status.logsTail.length > 30) {
      this.status.logsTail.shift();
    }
  }
  async start(localPort, customBinaryPath) {
    if (this.proc && this.status.state === "running" && this.status.publicBaseUrl) {
      return this.status.publicBaseUrl;
    }
    await this.stop();
    const mods = await loadChildProcessAndFs();
    if (!mods) {
      const msg = "child_process unavailable (desktop Obsidian or Node.js required)";
      this.status = {
        state: "error",
        publicBaseUrl: null,
        error: msg,
        logsTail: []
      };
      this.emit();
      throw new Error(msg);
    }
    const bin = this.resolveCloudflaredBinary(mods.fs, customBinaryPath);
    const targetUrl = `http://127.0.0.1:${localPort}`;
    this.status = {
      state: "starting",
      publicBaseUrl: null,
      error: null,
      logsTail: [`Launching: ${bin} tunnel --url ${targetUrl} --no-autoupdate`]
    };
    this.emit();
    return await new Promise((resolve3, reject) => {
      let settled = false;
      const proc = mods.cp.spawn(
        bin,
        ["tunnel", "--url", targetUrl, "--no-autoupdate"],
        {
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true
        }
      );
      this.proc = proc;
      const timeout = setTimeout(() => {
        if (!settled) {
          settled = true;
          const errMsg = "Timed out waiting for trycloudflare.com URL (check internet connection)";
          this.status.state = "error";
          this.status.error = errMsg;
          this.emit();
          reject(new Error(errMsg));
        }
      }, 25e3);
      const handleChunk = (chunk) => {
        const text = chunk.toString();
        for (const line of text.split(/\r?\n/)) {
          this.appendLog(line);
        }
        const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
        if (match && !this.status.publicBaseUrl) {
          this.status.publicBaseUrl = match[0];
          this.status.state = "running";
          this.status.error = null;
          this.emit();
          if (!settled) {
            settled = true;
            clearTimeout(timeout);
            resolve3(match[0]);
          }
        }
      };
      proc.stdout?.on("data", handleChunk);
      proc.stderr?.on("data", handleChunk);
      proc.on("error", (err) => {
        clearTimeout(timeout);
        this.proc = null;
        const friendly = err.code === "ENOENT" ? "cloudflared \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D. \u0423\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0435: brew install cloudflared (macOS) \u0438\u043B\u0438 winget install Cloudflare.cloudflared (Windows)" : err.message;
        this.status.state = "error";
        this.status.error = friendly;
        this.status.publicBaseUrl = null;
        this.emit();
        if (!settled) {
          settled = true;
          reject(new Error(friendly));
        }
      });
      proc.on("exit", (code) => {
        clearTimeout(timeout);
        if (this.proc === proc) {
          this.proc = null;
        }
        if (this.status.state !== "stopped") {
          const msg = code === 0 ? null : `cloudflared exited with code ${code ?? "unknown"}`;
          this.status.state = msg ? "error" : "stopped";
          this.status.error = msg;
          this.status.publicBaseUrl = null;
          this.emit();
          if (!settled) {
            settled = true;
            reject(new Error(msg || "cloudflared exited"));
          }
        }
      });
    });
  }
  async stop() {
    const p = this.proc;
    this.proc = null;
    this.status = {
      state: "stopped",
      publicBaseUrl: null,
      error: null,
      logsTail: this.status.logsTail
    };
    this.emit();
    if (!p) return;
    await new Promise((resolve3) => {
      const killTimer = setTimeout(() => {
        try {
          p.kill("SIGKILL");
        } catch {
        }
        resolve3();
      }, 1500);
      p.once("exit", () => {
        clearTimeout(killTimer);
        resolve3();
      });
      try {
        p.kill("SIGTERM");
      } catch {
        clearTimeout(killTimer);
        resolve3();
      }
    });
  }
  resolveCloudflaredBinary(fs3, customPath) {
    if (customPath && customPath.trim()) {
      return customPath.trim();
    }
    const envObj = typeof process !== "undefined" && process.env ? process.env : {};
    const home = envObj.HOME || envObj.USERPROFILE || "";
    const localAppData = envObj.LOCALAPPDATA || "";
    const candidates = [
      "/opt/homebrew/bin/cloudflared",
      "/usr/local/bin/cloudflared",
      "/usr/bin/cloudflared",
      home ? `${home}/.local/bin/cloudflared` : "",
      "C:\\Program Files (x86)\\cloudflared\\cloudflared.exe",
      "C:\\Program Files\\cloudflared\\cloudflared.exe",
      localAppData ? `${localAppData}\\Microsoft\\WinGet\\Links\\cloudflared.exe` : ""
    ].filter(Boolean);
    for (const c of candidates) {
      try {
        if (fs3.existsSync(c)) return c;
      } catch {
      }
    }
    return "cloudflared";
  }
};

// src/mcp/filesystemAdapter.ts
import * as fs from "fs";
import * as path from "path";

// src/queryMatcher.ts
function tokenizeQuery(query) {
  const tokens = [];
  let i = 0;
  const n = query.length;
  while (i < n) {
    while (i < n && /\s/.test(query[i])) i++;
    if (i >= n) break;
    let token = "";
    let inQuotes = false;
    let bracketDepth = 0;
    while (i < n) {
      const ch = query[i];
      if (ch === '"' && bracketDepth === 0) {
        inQuotes = !inQuotes;
        i++;
        continue;
      }
      if (!inQuotes) {
        if (ch === "[") bracketDepth++;
        else if (ch === "]" && bracketDepth > 0) bracketDepth--;
        else if (/\s/.test(ch) && bracketDepth === 0) break;
      }
      token += ch;
      i++;
    }
    if (token.length > 0) {
      tokens.push(token);
    }
  }
  return tokens;
}
function getBasename(nodeId) {
  const slashIdx = nodeId.lastIndexOf("/");
  const filePart = slashIdx >= 0 ? nodeId.slice(slashIdx + 1) : nodeId;
  return filePart.endsWith(".md") ? filePart.slice(0, -3) : filePart;
}
function matchesSingleAtom(atom, nodeId, nodeType, meta) {
  let negated = false;
  let expr = atom.trim();
  if (expr.startsWith("-") && expr.length > 1) {
    negated = true;
    expr = expr.slice(1).trim();
  }
  const result = evaluatePositiveAtom(expr, nodeId, nodeType, meta);
  return negated ? !result : result;
}
function evaluatePositiveAtom(expr, nodeId, nodeType, meta) {
  if (!expr) return false;
  const lowerExpr = expr.toLowerCase();
  const lowerId = nodeId.toLowerCase();
  const basename2 = getBasename(nodeId).toLowerCase();
  if (expr.startsWith("[") && expr.endsWith("]")) {
    const inner = expr.slice(1, -1).trim();
    const fm = meta.getFrontmatterForNode(nodeId);
    if (!fm) return false;
    const colonIdx = inner.indexOf(":");
    if (colonIdx < 0) {
      const key2 = inner.trim().toLowerCase();
      return Object.keys(fm).some((k) => k.toLowerCase() === key2 && fm[k] != null && fm[k] !== "");
    }
    const key = inner.slice(0, colonIdx).trim().toLowerCase();
    const val = inner.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, "").toLowerCase();
    for (const [k, rawVal] of Object.entries(fm)) {
      if (k.toLowerCase() !== key) continue;
      if (Array.isArray(rawVal)) {
        return rawVal.some((item) => String(item).toLowerCase().includes(val));
      }
      if (rawVal != null) {
        return String(rawVal).toLowerCase().includes(val);
      }
    }
    return false;
  }
  if (lowerExpr.startsWith("tag:") || lowerExpr.startsWith("#")) {
    const rawTag = lowerExpr.startsWith("tag:") ? lowerExpr.slice(4).trim() : lowerExpr;
    const targetTag = rawTag.startsWith("#") ? rawTag : `#${rawTag}`;
    const tags2 = meta.getTagsForNode(nodeId, nodeType);
    return tags2.some((t) => t === targetTag || t.startsWith(`${targetTag}/`));
  }
  if (lowerExpr.startsWith("path:")) {
    const pathNeedle = lowerExpr.slice(5).trim().replace(/^\/+/, "");
    if (!pathNeedle) return false;
    return lowerId.includes(pathNeedle);
  }
  if (lowerExpr.startsWith("file:")) {
    const fileNeedle = lowerExpr.slice(5).trim();
    if (!fileNeedle) return false;
    return basename2.includes(fileNeedle) || lowerId.endsWith(`/${fileNeedle}.md`);
  }
  if (basename2.includes(lowerExpr) || lowerId.includes(lowerExpr)) {
    return true;
  }
  const tags = meta.getTagsForNode(nodeId, nodeType);
  return tags.some((t) => t.includes(lowerExpr));
}
function matchesGroupQuery(query, nodeId, nodeType, meta) {
  const trimmed = query.trim();
  if (!trimmed) return false;
  const tokens = tokenizeQuery(trimmed);
  if (tokens.length === 0) return false;
  const orBranches = [[]];
  for (const tok of tokens) {
    if (tok.toUpperCase() === "OR") {
      if (orBranches[orBranches.length - 1].length > 0) {
        orBranches.push([]);
      }
    } else {
      orBranches[orBranches.length - 1].push(tok);
    }
  }
  for (const andClause of orBranches) {
    if (andClause.length === 0) continue;
    const allMatch = andClause.every(
      (atom) => matchesSingleAtom(atom, nodeId, nodeType, meta)
    );
    if (allMatch) return true;
  }
  return false;
}
function parseGroupQuery(query) {
  return {
    matches(meta) {
      const adapter = {
        getTagsForNode: () => meta.tags.map(
          (t) => t.startsWith("#") ? t.toLowerCase() : `#${t.toLowerCase()}`
        ),
        getFrontmatterForNode: () => {
          if (meta.frontmatter instanceof Map) {
            const obj = {};
            for (const [k, v] of meta.frontmatter.entries()) {
              obj[k] = v;
            }
            return obj;
          }
          return meta.frontmatter;
        }
      };
      return matchesGroupQuery(
        query,
        meta.id,
        meta.isTagNode ? "tag" : "file",
        adapter
      );
    }
  };
}

// src/mcp/filesystemAdapter.ts
var FilesystemVaultAdapter = class {
  constructor(vaultRoot, opts) {
    this.vaultRoot = path.resolve(vaultRoot);
    this.pluginDataPath = opts?.pluginDataPath || path.join(
      this.vaultRoot,
      ".obsidian",
      "plugins",
      "graph-magnetic-groups",
      "data.json"
    );
    this.onSettingsChanged = opts?.onSettingsChanged;
  }
  async getVaultInfo() {
    const { notes, folders } = this.scanVault();
    const tagCounts = /* @__PURE__ */ new Map();
    for (const n of notes) {
      for (const tg of n.tags) {
        tagCounts.set(tg, (tagCounts.get(tg) || 0) + 1);
      }
    }
    const tags = Array.from(tagCounts.entries()).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count).slice(0, 50);
    const settings = await this.getPluginSettings();
    const miroCount = settings.groups.filter(
      (g) => g.enabled && (g.mode === "miro-pinned" || g.mode === "miro-free")
    ).length;
    return {
      vaultName: path.basename(this.vaultRoot),
      adapterMode: "filesystem",
      noteCount: notes.length,
      folderCount: folders.length,
      folders,
      tags,
      liveGraphViewsOpen: 0,
      activeGroupsCount: settings.groups.filter((g) => g.enabled).length,
      miroFramesCount: miroCount,
      pinnedNodesCount: Object.keys(settings.pinnedNodes || {}).length
    };
  }
  async listNotes(opts) {
    const { notes, resolvedLinks, backlinkCounts } = this.buildVaultGraph();
    const compiled = opts?.query ? parseGroupQuery(opts.query) : null;
    const normFolder = opts?.folder ? opts.folder.replace(/^\/+|\/+$/g, "").toLowerCase() : null;
    const normTag = opts?.tag ? ("#" + opts.tag.replace(/^#+/, "")).toLowerCase() : null;
    const limit = Math.max(1, Math.min(1e3, opts?.limit ?? 100));
    const out = [];
    for (const n of notes) {
      if (normFolder && !n.relPath.toLowerCase().startsWith(normFolder)) {
        continue;
      }
      if (normTag && !n.tags.some((t) => t === normTag || t.startsWith(normTag + "/"))) {
        continue;
      }
      if (compiled && !compiled.matches(this.toMatchMeta(n))) {
        continue;
      }
      out.push({
        path: n.relPath,
        title: n.title,
        folder: n.folder,
        tags: n.tags,
        outgoingLinks: resolvedLinks.get(n.relPath) || [],
        backlinksCount: backlinkCounts.get(n.relPath) || 0,
        sizeBytes: n.sizeBytes,
        mtimeMs: n.mtimeMs
      });
      if (out.length >= limit) break;
    }
    return out;
  }
  async readNote(notePath) {
    const { notes, resolvedLinks } = this.buildVaultGraph();
    const target = this.findNote(notes, notePath);
    if (!target) {
      throw new Error(`Note not found: "${notePath}"`);
    }
    const backlinks = [];
    for (const [src, dsts] of resolvedLinks.entries()) {
      if (dsts.includes(target.relPath)) backlinks.push(src);
    }
    return {
      path: target.relPath,
      title: target.title,
      folder: target.folder,
      tags: target.tags,
      outgoingLinks: resolvedLinks.get(target.relPath) || [],
      backlinksCount: backlinks.length,
      backlinks,
      frontmatter: target.frontmatter,
      content: target.content,
      sizeBytes: target.sizeBytes,
      mtimeMs: target.mtimeMs
    };
  }
  async writeNote(opts) {
    const rel = this.safeVaultRelPath(opts.path);
    const full = path.join(this.vaultRoot, rel);
    fs.mkdirSync(path.dirname(full), { recursive: true });
    const exists = fs.existsSync(full);
    const mode = opts.mode || "overwrite";
    if (exists && mode === "create-only") {
      throw new Error(`Note already exists: "${rel}"`);
    }
    let finalContent = opts.content;
    if (exists && mode === "append") {
      const prev = fs.readFileSync(full, "utf8");
      finalContent = prev.endsWith("\n") ? prev + opts.content : prev + "\n" + opts.content;
    } else if (exists && mode === "prepend") {
      const prev = fs.readFileSync(full, "utf8");
      finalContent = opts.content + "\n" + prev;
    }
    fs.writeFileSync(full, finalContent, "utf8");
    return {
      path: rel,
      created: !exists,
      bytes: Buffer.byteLength(finalContent, "utf8")
    };
  }
  async deleteNote(notePath) {
    const { notes } = this.scanVault();
    const target = this.findNote(notes, notePath);
    if (!target) {
      throw new Error(`Note not found: "${notePath}"`);
    }
    const full = path.join(this.vaultRoot, target.relPath);
    const trashDir = path.join(this.vaultRoot, ".trash");
    fs.mkdirSync(trashDir, { recursive: true });
    const trashDest = path.join(
      trashDir,
      `${Date.now()}-${path.basename(target.relPath)}`
    );
    fs.renameSync(full, trashDest);
    return { deleted: true, path: target.relPath };
  }
  async moveNote(fromPath, toPath) {
    const { notes } = this.scanVault();
    const target = this.findNote(notes, fromPath);
    if (!target) {
      throw new Error(`Source note not found: "${fromPath}"`);
    }
    const cleanTo = this.safeVaultRelPath(toPath);
    const fullFrom = path.join(this.vaultRoot, target.relPath);
    const fullTo = path.join(this.vaultRoot, cleanTo);
    fs.mkdirSync(path.dirname(fullTo), { recursive: true });
    fs.renameSync(fullFrom, fullTo);
    return { from: target.relPath, to: cleanTo };
  }
  async searchVault(opts) {
    const q = opts.query.trim();
    const limit = Math.max(1, Math.min(200, opts.limit ?? 25));
    const { notes } = this.scanVault();
    const hasStruct = /(?:^|\s)(?:tag:|path:|file:|\[|-|OR\s)/i.test(q);
    const compiled = hasStruct ? parseGroupQuery(q) : null;
    const terms = q.toLowerCase().split(/\s+/).filter(
      (w) => w.length >= 2 && !w.startsWith("tag:") && !w.startsWith("path:")
    );
    const hits = [];
    for (const n of notes) {
      if (compiled && !compiled.matches(this.toMatchMeta(n))) continue;
      const lower = n.content.toLowerCase();
      const titleLower = n.title.toLowerCase();
      let score = compiled ? 5 : 0;
      const snippets = [];
      for (const term of terms) {
        if (titleLower.includes(term)) score += 10;
        let idx = lower.indexOf(term);
        let occ = 0;
        while (idx !== -1 && occ < 3) {
          score += 3;
          if (snippets.length < 2) {
            const s = Math.max(0, idx - 45);
            const e = Math.min(n.content.length, idx + term.length + 65);
            snippets.push(n.content.slice(s, e).replace(/\s+/g, " ").trim());
          }
          occ++;
          idx = lower.indexOf(term, idx + term.length);
        }
      }
      if (score > 0) {
        hits.push({
          path: n.relPath,
          title: n.title,
          tags: n.tags,
          score,
          snippets
        });
      }
    }
    hits.sort((a, b) => b.score - a.score);
    return hits.slice(0, limit);
  }
  async getGraphTopology() {
    const { notes, links, degree } = this.buildVaultGraph();
    const settings = await this.getPluginSettings();
    const groupMemberships = /* @__PURE__ */ new Map();
    for (const g of settings.groups) {
      if (!g.enabled) continue;
      const matched = await this.resolveMatchingNodeIds(g);
      for (const id of matched) {
        const list = groupMemberships.get(id) || [];
        list.push(g.id);
        groupMemberships.set(id, list);
      }
    }
    const nodes = notes.map((n) => {
      const pin = settings.pinnedNodes?.[n.relPath];
      return {
        id: n.relPath,
        label: n.title,
        type: "file",
        tags: n.tags,
        degree: degree.get(n.relPath) || 0,
        x: pin?.x,
        y: pin?.y,
        hardPinned: Boolean(pin),
        groups: groupMemberships.get(n.relPath) || []
      };
    });
    const sorted = [...nodes].sort((a, b) => b.degree - a.degree);
    return {
      isLiveGraphOpen: false,
      totalNotes: notes.length,
      totalLinks: links.length,
      nodes,
      links,
      topHubs: sorted.slice(0, 12).map((n) => ({ id: n.id, degree: n.degree })),
      orphanNotes: nodes.filter((n) => n.degree === 0).map((n) => n.id)
    };
  }
  async focusGraphTarget(_opts) {
    return {
      focused: false,
      message: "Running in standalone filesystem mode; open Obsidian Desktop to focus live Graph View camera."
    };
  }
  async getPluginSettings() {
    try {
      if (fs.existsSync(this.pluginDataPath)) {
        const raw = JSON.parse(fs.readFileSync(this.pluginDataPath, "utf8"));
        return {
          ...DEFAULT_SETTINGS,
          ...raw,
          groups: Array.isArray(raw?.groups) ? raw.groups : [],
          pinnedNodes: raw?.pinnedNodes && typeof raw.pinnedNodes === "object" ? raw.pinnedNodes : {}
        };
      }
    } catch {
    }
    return {
      ...DEFAULT_SETTINGS,
      groups: [],
      pinnedNodes: {}
    };
  }
  async updatePluginSettings(patch, _reheat) {
    const curr = await this.getPluginSettings();
    const next = {
      ...curr,
      ...patch
    };
    this.writeSettingsToDisk(next);
    return next;
  }
  async saveGroups(groups, _reheat) {
    const curr = await this.getPluginSettings();
    const next = {
      ...curr,
      groups
    };
    this.writeSettingsToDisk(next);
    return groups;
  }
  async resolveMatchingNodeIds(group) {
    const { notes } = this.scanVault();
    const compiled = group.query?.trim() ? parseGroupQuery(group.query) : null;
    const manual = new Set(group.nodeIds || []);
    const excluded = new Set(group.excludedNodeIds || []);
    const matched = /* @__PURE__ */ new Set();
    for (const id of manual) {
      if (!excluded.has(id)) matched.add(id);
    }
    for (const n of notes) {
      if (excluded.has(n.relPath)) continue;
      if (manual.has(n.relPath)) {
        matched.add(n.relPath);
        continue;
      }
      if (compiled && compiled.matches(this.toMatchMeta(n))) {
        matched.add(n.relPath);
      }
    }
    return Array.from(matched).sort();
  }
  /* =========================================================================
   * Internal Markdown / Frontmatter / Wikilink Scanner
   * ========================================================================= */
  writeSettingsToDisk(settings) {
    fs.mkdirSync(path.dirname(this.pluginDataPath), { recursive: true });
    fs.writeFileSync(
      this.pluginDataPath,
      JSON.stringify(settings, null, 2),
      "utf8"
    );
    this.onSettingsChanged?.(settings);
  }
  safeVaultRelPath(inputPath) {
    const normalized = inputPath.replace(/\\/g, "/").replace(/^\/+/, "").trim();
    const withMd = /\.md$/i.test(normalized) ? normalized : `${normalized}.md`;
    const resolved = path.resolve(this.vaultRoot, withMd);
    if (resolved !== this.vaultRoot && !resolved.startsWith(this.vaultRoot + path.sep)) {
      throw new Error("Path traversal outside vault root is not allowed");
    }
    return path.relative(this.vaultRoot, resolved).split(path.sep).join("/");
  }
  findNote(notes, notePath) {
    const clean = notePath.replace(/\\/g, "/").replace(/^\/+/, "").trim();
    const withMd = /\.md$/i.test(clean) ? clean : `${clean}.md`;
    const base = clean.replace(/\.md$/i, "").toLowerCase();
    return notes.find((n) => n.relPath === clean || n.relPath === withMd) || notes.find((n) => n.relPath.toLowerCase() === withMd.toLowerCase()) || notes.find((n) => n.title.toLowerCase() === base);
  }
  toMatchMeta(n) {
    const props = /* @__PURE__ */ new Map();
    for (const [k, v] of Object.entries(n.frontmatter)) {
      const vals = Array.isArray(v) ? v.map((x) => String(x).toLowerCase()) : v !== null && v !== void 0 ? [String(v).toLowerCase()] : [];
      props.set(k.toLowerCase(), vals);
    }
    return {
      id: n.relPath,
      basename: n.title,
      path: n.relPath,
      tags: n.tags,
      frontmatter: props,
      isTagNode: false
    };
  }
  buildVaultGraph() {
    const { notes } = this.scanVault();
    const byRel = /* @__PURE__ */ new Map();
    const byTitle = /* @__PURE__ */ new Map();
    for (const n of notes) {
      byRel.set(n.relPath.toLowerCase(), n);
      byTitle.set(n.title.toLowerCase(), n);
    }
    const links = [];
    const resolvedLinks = /* @__PURE__ */ new Map();
    const backlinkCounts = /* @__PURE__ */ new Map();
    const degree = /* @__PURE__ */ new Map();
    for (const n of notes) degree.set(n.relPath, 0);
    for (const n of notes) {
      const outSet = /* @__PURE__ */ new Set();
      for (const rawTarget of n.rawOutgoingTargets) {
        const clean = rawTarget.split("#")[0].split("|")[0].trim().replace(/\\/g, "/");
        if (!clean) continue;
        const withMd = /\.md$/i.test(clean) ? clean : `${clean}.md`;
        const hit = byRel.get(withMd.toLowerCase()) || byTitle.get(clean.toLowerCase());
        if (hit && hit.relPath !== n.relPath) {
          outSet.add(hit.relPath);
        }
      }
      const list = Array.from(outSet);
      resolvedLinks.set(n.relPath, list);
      for (const dst of list) {
        links.push({ source: n.relPath, target: dst });
        backlinkCounts.set(dst, (backlinkCounts.get(dst) || 0) + 1);
        degree.set(n.relPath, (degree.get(n.relPath) || 0) + 1);
        degree.set(dst, (degree.get(dst) || 0) + 1);
      }
    }
    return { notes, links, resolvedLinks, backlinkCounts, degree };
  }
  scanVault() {
    if (!fs.existsSync(this.vaultRoot)) {
      return { notes: [], folders: [] };
    }
    const notes = [];
    const folders = [];
    const walk = (dir) => {
      let entries = [];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const ent of entries) {
        if (ent.name.startsWith(".")) continue;
        if (ent.name === "node_modules") continue;
        const full = path.join(dir, ent.name);
        const rel = path.relative(this.vaultRoot, full).split(path.sep).join("/");
        if (ent.isDirectory()) {
          folders.push(rel);
          walk(full);
        } else if (ent.isFile() && /\.md$/i.test(ent.name)) {
          try {
            const stat = fs.statSync(full);
            const content = fs.readFileSync(full, "utf8");
            const parsed = parseMarkdownMetadata(content);
            const folder = path.posix.dirname(rel);
            notes.push({
              relPath: rel,
              title: path.basename(ent.name, path.extname(ent.name)),
              folder: folder === "." ? "" : folder,
              content,
              tags: parsed.tags,
              frontmatter: parsed.frontmatter,
              rawOutgoingTargets: parsed.wikilinks,
              sizeBytes: stat.size,
              mtimeMs: stat.mtimeMs
            });
          } catch {
          }
        }
      }
    };
    walk(this.vaultRoot);
    notes.sort((a, b) => a.relPath.localeCompare(b.relPath));
    folders.sort();
    return { notes, folders };
  }
};
function parseMarkdownMetadata(content) {
  const frontmatter = {};
  const tagSet = /* @__PURE__ */ new Set();
  let body = content;
  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (fmMatch) {
    body = content.slice(fmMatch[0].length);
    const lines = fmMatch[1].split(/\r?\n/);
    let activeListKey = null;
    for (const line of lines) {
      const listItem = line.match(/^\s*-\s+(.+)$/);
      if (listItem && activeListKey) {
        const arr = frontmatter[activeListKey] || [];
        arr.push(stripQuotes(listItem[1].trim()));
        frontmatter[activeListKey] = arr;
        continue;
      }
      const kv = line.match(/^([A-Za-z0-9_-]+)\s*:\s*(.*)$/);
      if (kv) {
        const key = kv[1];
        const rawVal = kv[2].trim();
        if (!rawVal) {
          activeListKey = key;
          frontmatter[key] = [];
        } else if (rawVal.startsWith("[") && rawVal.endsWith("]")) {
          activeListKey = null;
          frontmatter[key] = rawVal.slice(1, -1).split(",").map((s) => stripQuotes(s.trim())).filter(Boolean);
        } else {
          activeListKey = null;
          frontmatter[key] = stripQuotes(rawVal);
        }
      }
    }
    const fmTags = frontmatter["tags"] ?? frontmatter["tag"];
    if (Array.isArray(fmTags)) {
      for (const t of fmTags) {
        const clean = String(t).trim().replace(/^#+/, "");
        if (clean) tagSet.add("#" + clean.toLowerCase());
      }
    } else if (typeof fmTags === "string") {
      for (const t of fmTags.split(/[,\s]+/)) {
        const clean = t.trim().replace(/^#+/, "");
        if (clean) tagSet.add("#" + clean.toLowerCase());
      }
    }
  }
  const bodyNoCode = body.replace(/```[\s\S]*?```/g, "");
  const tagRegex = /(?:^|\s)#([A-Za-zА-Яа-яЁё0-9_/-]+)/g;
  let tm;
  while ((tm = tagRegex.exec(bodyNoCode)) !== null) {
    tagSet.add("#" + tm[1].toLowerCase());
  }
  const wikilinks = [];
  const linkRegex = /\[\[([^\]]+)\]\]/g;
  let lm;
  while ((lm = linkRegex.exec(bodyNoCode)) !== null) {
    wikilinks.push(lm[1]);
  }
  return {
    frontmatter,
    tags: Array.from(tagSet),
    wikilinks
  };
}
function stripQuotes(s) {
  if (s.startsWith('"') && s.endsWith('"') || s.startsWith("'") && s.endsWith("'")) {
    return s.slice(1, -1);
  }
  return s;
}

// src/physicsEngine.ts
var MIRO_HEADER_HEIGHT = 38;
var MIRO_FRAME_PADDING = 30;
var MIRO_MIN_WIDTH = 210;
var MIRO_MIN_HEIGHT = 165;
function computeDefaultMiroFrame(memberPositions, fallbackCenter, subLayout = "grid") {
  const n = Math.max(1, memberPositions.length);
  let cx = fallbackCenter.x;
  let cy = fallbackCenter.y;
  if (memberPositions.length > 0) {
    let sx = 0;
    let sy = 0;
    for (const p of memberPositions) {
      sx += p.x;
      sy += p.y;
    }
    cx = sx / memberPositions.length;
    cy = sy / memberPositions.length;
  }
  if (subLayout === "freeform" && memberPositions.length >= 2) {
    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const p of memberPositions) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const padX = 48;
    const padBottom = 46;
    const w = Math.max(MIRO_MIN_WIDTH, maxX - minX + padX * 2);
    const h = Math.max(MIRO_MIN_HEIGHT, maxY - minY + MIRO_HEADER_HEIGHT + padBottom * 2);
    const fx = (minX + maxX) / 2 - w / 2;
    const fy = (minY + maxY) / 2 - (h + MIRO_HEADER_HEIGHT) / 2;
    const customOffsets = {};
    for (const p of memberPositions) {
      customOffsets[p.id] = {
        dx: p.x - fx,
        dy: p.y - fy
      };
    }
    return {
      frameX: Math.round(fx),
      frameY: Math.round(fy),
      frameW: Math.round(w),
      frameH: Math.round(h),
      customOffsets
    };
  }
  let cols = Math.max(1, Math.ceil(Math.sqrt(n * 1.25)));
  let rows = Math.max(1, Math.ceil(n / cols));
  if (subLayout === "column") {
    cols = 1;
    rows = n;
  } else if (subLayout === "row") {
    cols = n;
    rows = 1;
  } else if (subLayout === "circle") {
    const r = Math.max(70, n * 18);
    const w = Math.max(240, r * 2 + MIRO_FRAME_PADDING * 2 + 30);
    const h = Math.max(240, r * 2 + MIRO_HEADER_HEIGHT + MIRO_FRAME_PADDING * 2 + 30);
    return {
      frameX: Math.round(cx - w / 2),
      frameY: Math.round(cy - h / 2),
      frameW: Math.round(w),
      frameH: Math.round(h),
      customOffsets: {}
    };
  }
  const cellW = 104;
  const cellH = 68;
  const frameW = Math.max(MIRO_MIN_WIDTH, cols * cellW + MIRO_FRAME_PADDING * 2);
  const frameH = Math.max(
    MIRO_MIN_HEIGHT,
    rows * cellH + MIRO_HEADER_HEIGHT + MIRO_FRAME_PADDING * 2
  );
  return {
    frameX: Math.round(cx - frameW / 2),
    frameY: Math.round(cy - frameH / 2),
    frameW: Math.round(frameW),
    frameH: Math.round(frameH),
    customOffsets: {}
  };
}
function createGroupId() {
  return "gmg-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}

// src/mcp/mcpEngine.ts
var SUPPORTED_PROTOCOL_VERSIONS = [
  "2025-06-18",
  "2025-03-26",
  "2024-11-05"
];
var MCP_TOOLS = [
  /* ==================== VAULT & NOTES TOOLS (1..10) ==================== */
  {
    name: "vault_info",
    description: "Get an overview of the Obsidian vault (note count, folders, top tags) plus live Graph View & Magnetic Groups / Miro-Board status.",
    inputSchema: {
      type: "object",
      properties: {}
    },
    annotations: { title: "Vault & Graph Overview", readOnlyHint: true }
  },
  {
    name: "list_notes",
    description: "List markdown notes in the Obsidian vault, optionally filtered by folder, tag, or Obsidian search query.",
    inputSchema: {
      type: "object",
      properties: {
        folder: {
          type: "string",
          description: "Optional folder prefix (e.g. 'Projects/' or 'Notes')"
        },
        tag: {
          type: "string",
          description: "Optional tag filter (e.g. '#architecture' or 'sprint')"
        },
        query: {
          type: "string",
          description: "Optional Obsidian-style filter (e.g. 'tag:#ai OR path:Research/')"
        },
        limit: {
          type: "number",
          description: "Maximum number of notes to return (default 100)"
        }
      }
    },
    annotations: { title: "List Vault Notes", readOnlyHint: true }
  },
  {
    name: "read_note",
    description: "Read a note's full markdown content, YAML frontmatter, tags, outgoing [[wikilinks]], and incoming backlinks.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Note path in vault (e.g. 'Folder/Note.md' or 'Note')"
        }
      },
      required: ["path"]
    },
    annotations: { title: "Read Note", readOnlyHint: true }
  },
  {
    name: "create_or_update_note",
    description: "Create a new markdown note or update an existing note in the Obsidian vault. Parent folders are created automatically. Include [[Note Name]] wikilinks or #tags in content to connect it on the live Graph View.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Target note path (e.g. 'Architecture/API Gateway.md')"
        },
        content: {
          type: "string",
          description: "Full markdown content (may include YAML frontmatter, #tags, and [[wikilinks]])"
        },
        mode: {
          type: "string",
          enum: ["overwrite", "create-only", "append", "prepend"],
          description: "Write mode (default 'overwrite')"
        }
      },
      required: ["path", "content"]
    },
    annotations: { title: "Create or Update Note", destructiveHint: false }
  },
  {
    name: "append_to_note",
    description: "Append markdown text, sections, or [[wikilinks]] to the end of an existing note.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Existing note path"
        },
        content: {
          type: "string",
          description: "Markdown text to append"
        }
      },
      required: ["path", "content"]
    },
    annotations: { title: "Append to Note", destructiveHint: false }
  },
  {
    name: "delete_note",
    description: "Delete (move to trash) a markdown note from the Obsidian vault.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Note path to delete"
        }
      },
      required: ["path"]
    },
    annotations: { title: "Delete Note", destructiveHint: true }
  },
  {
    name: "move_or_rename_note",
    description: "Move or rename a note in the vault (updating internal [[wikilinks]] automatically when running inside Obsidian).",
    inputSchema: {
      type: "object",
      properties: {
        fromPath: { type: "string", description: "Current note path" },
        toPath: { type: "string", description: "New note path" }
      },
      required: ["fromPath", "toPath"]
    },
    annotations: { title: "Move or Rename Note", destructiveHint: false }
  },
  {
    name: "search_vault",
    description: "Search notes across the Obsidian vault by full-text keywords and/or Obsidian query expressions (tag:#..., path:..., [prop:val]), returning ranked snippets.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search keywords or query expression"
        },
        limit: {
          type: "number",
          description: "Maximum matches to return (default 25)"
        }
      },
      required: ["query"]
    },
    annotations: { title: "Search Vault", readOnlyHint: true }
  },
  {
    name: "get_graph_topology",
    description: "Inspect the Obsidian knowledge graph: nodes, links, degree hubs, orphan notes, live (x, y) Graph View coordinates, hard-pinned status, and group/Miro-frame memberships.",
    inputSchema: {
      type: "object",
      properties: {
        includeNodes: {
          type: "boolean",
          description: "Include full node list (default true)"
        },
        includeLinks: {
          type: "boolean",
          description: "Include full edge list (default true)"
        }
      }
    },
    annotations: { title: "Inspect Graph Topology", readOnlyHint: true }
  },
  {
    name: "open_note_or_graph",
    description: "Open/focus the Obsidian Graph View and optionally zoom the camera onto a specific Miro Frame, group, or note.",
    inputSchema: {
      type: "object",
      properties: {
        openGraphIfClosed: {
          type: "boolean",
          description: "Open Global Graph View if not currently open (default true)"
        },
        groupId: {
          type: "string",
          description: "Optional group/frame ID or name to focus camera on"
        },
        notePath: {
          type: "string",
          description: "Optional note path to focus or open"
        }
      }
    },
    annotations: { title: "Focus Graph or Note", readOnlyHint: false }
  },
  /* ======== GRAPH MAGNETIC GROUPS & MIRO-BOARD TOOLS (11..20) ======== */
  {
    name: "graph_list_groups",
    description: "List all Graph Magnetic Groups and Miro-Board Frames, including their mode ('organic' | 'miro-free' | 'miro-pinned'), frame geometry, matched notes, and individually pinned nodes.",
    inputSchema: {
      type: "object",
      properties: {}
    },
    annotations: { title: "List Graph Groups & Miro Frames", readOnlyHint: true }
  },
  {
    name: "graph_create_group",
    description: "Create a new Magnetic Group or Miro-Board Frame on Obsidian's Graph View. Choose mode='organic' for a soft lobe hugging the main dynamic cluster without tearing, mode='miro-free' for a fixed Miro rectangle with dynamic nodes inside, or mode='miro-pinned' to hard-lock nodes like cards on a Miro board while the rest of the graph remains dynamic!",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Group or Miro Frame title" },
        mode: {
          type: "string",
          enum: ["organic", "miro-free", "miro-pinned"],
          description: "'organic' = soft cluster lobe; 'miro-free' = fixed Miro frame with live dynamic nodes inside; 'miro-pinned' = hard-pinned Miro board frame"
        },
        color: {
          type: "string",
          description: "Hex color (e.g. '#7c5cff', '#2ec4b6', '#ff6b6b')"
        },
        query: {
          type: "string",
          description: "Optional Obsidian query rule (e.g. 'tag:#backend OR path:API/')"
        },
        nodeIds: {
          type: "array",
          items: { type: "string" },
          description: "Explicit list of note paths / node IDs to include"
        },
        strength: {
          type: "number",
          description: "Group attraction strength multiplier (0.2 to 2.0, default 1.0)"
        },
        colorNodes: {
          type: "boolean",
          description: "Tint member nodes with the group color (default true)"
        },
        frameX: {
          type: "number",
          description: "Miro Frame top-left X coordinate in graph world space"
        },
        frameY: {
          type: "number",
          description: "Miro Frame top-left Y coordinate in graph world space"
        },
        frameW: {
          type: "number",
          description: "Miro Frame width in graph world space (min 210)"
        },
        frameH: {
          type: "number",
          description: "Miro Frame height in graph world space (min 165)"
        },
        frameSubLayout: {
          type: "string",
          enum: ["grid", "column", "row", "circle", "freeform"],
          description: "How cards are arranged inside a 'miro-pinned' frame (default 'grid')"
        }
      },
      required: ["name"]
    },
    annotations: { title: "Create Magnetic Group or Miro Frame" }
  },
  {
    name: "graph_update_group",
    description: "Update an existing Magnetic Group or Miro Frame (by groupId or name): rename, recolor, edit query, switch between 'organic' / 'miro-free' / 'miro-pinned', move or resize the Miro Frame (frameX, frameY, frameW, frameH), or re-tidy cards ('grid' | 'column' | 'row' | 'circle').",
    inputSchema: {
      type: "object",
      properties: {
        groupId: {
          type: "string",
          description: "Group ID or exact group name"
        },
        name: { type: "string" },
        color: { type: "string" },
        enabled: { type: "boolean" },
        query: { type: "string" },
        strength: { type: "number" },
        colorNodes: { type: "boolean" },
        mode: {
          type: "string",
          enum: ["organic", "miro-free", "miro-pinned"]
        },
        frameX: { type: "number" },
        frameY: { type: "number" },
        frameW: { type: "number" },
        frameH: { type: "number" },
        frameSubLayout: {
          type: "string",
          enum: ["grid", "column", "row", "circle", "freeform"]
        },
        anchorMode: { type: "string", enum: ["auto", "manual"] },
        anchorX: { type: "number" },
        anchorY: { type: "number" }
      },
      required: ["groupId"]
    },
    annotations: { title: "Update Group or Miro Frame" }
  },
  {
    name: "graph_delete_group",
    description: "Delete a Magnetic Group or Miro Frame (by ID or name). Any nodes hard-pinned by that Miro Frame are immediately released back into the dynamic graph.",
    inputSchema: {
      type: "object",
      properties: {
        groupId: {
          type: "string",
          description: "Group ID or exact group name to delete"
        }
      },
      required: ["groupId"]
    },
    annotations: { title: "Delete Group or Miro Frame", destructiveHint: true }
  },
  {
    name: "graph_manage_group_nodes",
    description: "Add, remove, or exclude specific notes in a Magnetic Group or Miro Frame.",
    inputSchema: {
      type: "object",
      properties: {
        groupId: {
          type: "string",
          description: "Group ID or exact group name"
        },
        addNodeIds: {
          type: "array",
          items: { type: "string" },
          description: "Note paths to add to the group"
        },
        removeNodeIds: {
          type: "array",
          items: { type: "string" },
          description: "Note paths to remove from manual selection"
        },
        excludeNodeIds: {
          type: "array",
          items: { type: "string" },
          description: "Note paths to explicitly exclude even if matched by query"
        }
      },
      required: ["groupId"]
    },
    annotations: { title: "Add/Remove Notes in Group" }
  },
  {
    name: "graph_pin_nodes",
    description: "Hard-pin individual nodes on the Graph View board (like sticky notes on Miro) while keeping all other nodes and links live and dynamic. Supports explicit {id, x, y} coordinates OR auto-arranging a list of nodeIds into a 'grid' / 'row' / 'column' / 'circle' around (centerX, centerY).",
    inputSchema: {
      type: "object",
      properties: {
        pins: {
          type: "array",
          description: "Explicit coordinates for specific nodes",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              x: { type: "number" },
              y: { type: "number" }
            },
            required: ["id", "x", "y"]
          }
        },
        nodeIds: {
          type: "array",
          items: { type: "string" },
          description: "Alternatively, pass nodeIds to pin in a neat pattern or at their current positions"
        },
        pattern: {
          type: "string",
          enum: ["current", "grid", "row", "column", "circle"],
          description: "Arrangement pattern when nodeIds is provided (default 'grid')"
        },
        centerX: { type: "number", description: "Center X for pattern (default 0)" },
        centerY: { type: "number", description: "Center Y for pattern (default 0)" },
        spacing: { type: "number", description: "Spacing between pinned nodes (default 95)" }
      }
    },
    annotations: { title: "Hard-Pin Individual Nodes on Board" }
  },
  {
    name: "graph_unpin_nodes",
    description: "Unpin specific individually-pinned nodes (or all individually-pinned nodes) so they become free-floating dynamic nodes again.",
    inputSchema: {
      type: "object",
      properties: {
        nodeIds: {
          type: "array",
          items: { type: "string" },
          description: "Node IDs to unpin"
        },
        unpinAll: {
          type: "boolean",
          description: "Set true to unpin all individually-pinned nodes"
        }
      }
    },
    annotations: { title: "Unpin Individual Nodes" }
  },
  {
    name: "graph_arrange_miro_board",
    description: "High-level AI Board Architect tool: arrange multiple groups (existing or newly defined) into a clean, non-overlapping Miro Board on the Graph View ('columns' = Kanban columns, 'quadrants' = 2x2 matrix, 'timeline' = horizontal row, 'ring' = Miro frames arranged around a central dynamic hub cluster!).",
    inputSchema: {
      type: "object",
      properties: {
        boardStyle: {
          type: "string",
          enum: ["columns", "quadrants", "timeline", "ring"],
          description: "'columns' = side-by-side Kanban boards; 'quadrants' = 2x2 matrix; 'timeline' = horizontal sequence; 'ring' = frames surrounding the live central dynamic cluster"
        },
        items: {
          type: "array",
          description: "Frames to arrange. Omit items to automatically arrange all currently enabled groups!",
          items: {
            type: "object",
            properties: {
              groupIdOrName: {
                type: "string",
                description: "Existing group ID or name (omit to create a new frame)"
              },
              name: { type: "string", description: "Frame title" },
              color: { type: "string", description: "Hex color" },
              query: { type: "string", description: "Obsidian query filter" },
              nodeIds: {
                type: "array",
                items: { type: "string" },
                description: "Manual note IDs"
              },
              mode: {
                type: "string",
                enum: ["miro-pinned", "miro-free"],
                description: "Default 'miro-pinned'"
              },
              subLayout: {
                type: "string",
                enum: ["grid", "column", "row", "circle"]
              }
            }
          }
        },
        centerX: {
          type: "number",
          description: "Board center X in graph world coordinates (default 0)"
        },
        centerY: {
          type: "number",
          description: "Board center Y in graph world coordinates (default 0)"
        },
        gap: {
          type: "number",
          description: "Gap between Miro Frames in world units (default 90)"
        },
        showBoardGrid: {
          type: "boolean",
          description: "Turn on the Miro dot-grid background (default true)"
        }
      }
    },
    annotations: { title: "Arrange Multi-Frame Miro Board" }
  },
  {
    name: "graph_configure_physics",
    description: "Configure global Graph Magnetic Groups & Miro-Board physics and visual settings (attractionStrength, clusterTether, groupCompactness, showBoardGrid, repelOutsidersFromFrames, showGroupZones, showGroupLabels).",
    inputSchema: {
      type: "object",
      properties: {
        enabled: { type: "boolean" },
        attractionStrength: {
          type: "number",
          description: "0.0 to 1.0 (default 0.62)"
        },
        clusterTether: {
          type: "number",
          description: "0.0 to 1.0 anti-tear tether to main cluster (default 0.78)"
        },
        groupCompactness: {
          type: "number",
          description: "0.2 to 1.0 (default 0.58)"
        },
        syncNativeColorGroups: { type: "boolean" },
        showGroupZones: { type: "boolean" },
        showGroupLabels: { type: "boolean" },
        showBoardGrid: { type: "boolean" },
        repelOutsidersFromFrames: { type: "boolean" },
        zoneOpacity: { type: "number", description: "0.04 to 0.35" }
      }
    },
    annotations: { title: "Configure Graph Physics & Board Visuals" }
  },
  {
    name: "graph_reset_layout",
    description: "Reheat/relax the dynamic graph simulation, optionally converting all Miro Frames back to soft organic groups and/or unpinning all individual nodes.",
    inputSchema: {
      type: "object",
      properties: {
        convertAllFramesToOrganic: {
          type: "boolean",
          description: "Switch all Miro Frames back to 'organic' cluster lobes"
        },
        resetManualAnchors: {
          type: "boolean",
          description: "Reset manual organic group anchors back to auto"
        },
        unpinAllIndividualNodes: {
          type: "boolean",
          description: "Release all individually-pinned nodes"
        }
      }
    },
    annotations: { title: "Reset / Reheat Graph Layout" }
  }
];
var ObsidianMcpEngine = class {
  constructor(adapter) {
    this.stats = {
      totalRequests: 0,
      totalToolCalls: 0,
      lastToolName: "",
      lastCallTimestamp: 0
    };
    this.adapter = adapter;
  }
  async handleJsonRpcMessage(msg) {
    this.stats.totalRequests++;
    if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
      return {
        jsonrpc: "2.0",
        id: msg?.id ?? null,
        error: { code: -32600, message: "Invalid JSON-RPC 2.0 request" }
      };
    }
    const isNotification = msg.id === void 0;
    try {
      const result = await this.dispatchMethod(msg.method, msg.params || {});
      if (isNotification) return null;
      return {
        jsonrpc: "2.0",
        id: msg.id ?? null,
        result
      };
    } catch (err) {
      if (isNotification) return null;
      const code = typeof err?.rpcCode === "number" ? err.rpcCode : -32603;
      const message = err instanceof Error ? err.message : String(err || "Internal error");
      return {
        jsonrpc: "2.0",
        id: msg.id ?? null,
        error: { code, message }
      };
    }
  }
  async dispatchMethod(method, params) {
    switch (method) {
      case "initialize": {
        const clientProto = typeof params.protocolVersion === "string" ? params.protocolVersion : "2025-03-26";
        const negotiated = SUPPORTED_PROTOCOL_VERSIONS.includes(clientProto) ? clientProto : SUPPORTED_PROTOCOL_VERSIONS[0];
        return {
          protocolVersion: negotiated,
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
            prompts: { listChanged: false }
          },
          serverInfo: {
            name: "obsidian-magnetic-miro-mcp",
            version: "2.0.0"
          },
          instructions: "Obsidian Vault + Graph Magnetic Groups & Miro-Board MCP Server. You can read/search/create/link markdown notes AND organize Obsidian's live Graph View using three group modes: 'organic' (soft magnetic lobe attached to the main cluster without tearing), 'miro-free' (hard-fixed rectangular Miro Frame with live dynamic nodes inside), and 'miro-pinned' (hard-fixed Miro Board Frame locking cards in a clean grid/column/row/circle while surrounding notes remain a live dynamic graph). Use graph_arrange_miro_board to lay out multi-frame Kanban/Quadrant/Ring boards in one call."
        };
      }
      case "notifications/initialized":
      case "notifications/cancelled":
      case "notifications/roots/list_changed":
        return {};
      case "ping":
        return {};
      case "tools/list":
        return { tools: MCP_TOOLS };
      case "tools/call": {
        const name = String(params.name || "");
        const args = params.arguments && typeof params.arguments === "object" ? params.arguments : {};
        this.stats.totalToolCalls++;
        this.stats.lastToolName = name;
        this.stats.lastCallTimestamp = Date.now();
        try {
          const data = await this.executeTool(name, args);
          return {
            content: [
              {
                type: "text",
                text: typeof data === "string" ? data : JSON.stringify(data, null, 2)
              }
            ],
            isError: false
          };
        } catch (toolErr) {
          const errMsg = toolErr instanceof Error ? toolErr.message : String(toolErr);
          return {
            content: [{ type: "text", text: `Error: ${errMsg}` }],
            isError: true
          };
        }
      }
      case "resources/list":
        return {
          resources: [
            {
              uri: "obsidian://vault/summary",
              name: "Obsidian Vault & Graph Summary",
              description: "Overview of vault notes, tags, folders, and active graph groups/frames",
              mimeType: "application/json"
            },
            {
              uri: "obsidian://graph/groups",
              name: "Graph Magnetic Groups & Miro Frames",
              description: "Current configuration and matched notes of all groups and Miro frames",
              mimeType: "application/json"
            },
            {
              uri: "obsidian://graph/topology",
              name: "Vault Link Graph Topology",
              description: "Nodes, links, hubs, orphans, and live coordinates",
              mimeType: "application/json"
            }
          ]
        };
      case "resources/read": {
        const uri = String(params.uri || "");
        let payload;
        if (uri === "obsidian://vault/summary") {
          payload = await this.adapter.getVaultInfo();
        } else if (uri === "obsidian://graph/groups") {
          payload = await this.executeTool("graph_list_groups", {});
        } else if (uri === "obsidian://graph/topology") {
          payload = await this.adapter.getGraphTopology();
        } else {
          throw Object.assign(new Error(`Unknown resource URI: ${uri}`), {
            rpcCode: -32602
          });
        }
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(payload, null, 2)
            }
          ]
        };
      }
      case "prompts/list":
        return {
          prompts: [
            {
              name: "organize-miro-graph",
              description: "Inspect the Obsidian vault and organize key topics into clean Miro-Board Frames around the live dynamic graph",
              arguments: [
                {
                  name: "style",
                  description: "Board layout style: columns, quadrants, timeline, or ring",
                  required: false
                }
              ]
            }
          ]
        };
      case "prompts/get": {
        const pName = String(params.name || "");
        if (pName !== "organize-miro-graph") {
          throw Object.assign(new Error(`Unknown prompt: ${pName}`), {
            rpcCode: -32602
          });
        }
        const style = String(
          params.arguments?.style || "ring"
        );
        return {
          description: "Organize Obsidian Graph View into Miro Frames + dynamic cluster",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Inspect my Obsidian vault using vault_info and list_notes, identify the main thematic clusters, and arrange them onto the Graph View using graph_arrange_miro_board with boardStyle="${style}" while leaving general/hub notes free and dynamic so links flow naturally between frames.`
              }
            }
          ]
        };
      }
      default:
        throw Object.assign(new Error(`Method not found: ${method}`), {
          rpcCode: -32601
        });
    }
  }
  /* =========================================================================
   * Tool Implementations
   * ========================================================================= */
  async executeTool(name, args) {
    switch (name) {
      case "vault_info":
        return await this.adapter.getVaultInfo();
      case "list_notes":
        return await this.adapter.listNotes({
          folder: optStr(args.folder),
          tag: optStr(args.tag),
          query: optStr(args.query),
          limit: optNum(args.limit)
        });
      case "read_note": {
        const p = reqStr(args.path, "path");
        return await this.adapter.readNote(p);
      }
      case "create_or_update_note": {
        const path3 = reqStr(args.path, "path");
        const content = typeof args.content === "string" ? args.content : "";
        const mode = optStr(args.mode) || "overwrite";
        return await this.adapter.writeNote({ path: path3, content, mode });
      }
      case "append_to_note": {
        const path3 = reqStr(args.path, "path");
        const content = reqStr(args.content, "content");
        return await this.adapter.writeNote({
          path: path3,
          content,
          mode: "append"
        });
      }
      case "delete_note": {
        const path3 = reqStr(args.path, "path");
        return await this.adapter.deleteNote(path3);
      }
      case "move_or_rename_note": {
        const fromPath = reqStr(args.fromPath, "fromPath");
        const toPath = reqStr(args.toPath, "toPath");
        return await this.adapter.moveNote(fromPath, toPath);
      }
      case "search_vault": {
        const query = reqStr(args.query, "query");
        return await this.adapter.searchVault({
          query,
          limit: optNum(args.limit)
        });
      }
      case "get_graph_topology": {
        const snap = await this.adapter.getGraphTopology();
        return {
          isLiveGraphOpen: snap.isLiveGraphOpen,
          totalNotes: snap.totalNotes,
          totalLinks: snap.totalLinks,
          topHubs: snap.topHubs,
          orphanNotes: snap.orphanNotes,
          nodes: args.includeNodes === false ? void 0 : snap.nodes,
          links: args.includeLinks === false ? void 0 : snap.links
        };
      }
      case "open_note_or_graph": {
        return await this.adapter.focusGraphTarget({
          openGraphIfClosed: args.openGraphIfClosed !== false,
          groupId: optStr(args.groupId),
          notePath: optStr(args.notePath)
        });
      }
      case "graph_list_groups": {
        const settings = await this.adapter.getPluginSettings();
        const enriched = [];
        for (const g of settings.groups) {
          const matched = await this.adapter.resolveMatchingNodeIds(g);
          enriched.push({
            ...g,
            mode: g.mode || "organic",
            matchedCount: matched.length,
            matchedNodeIds: matched
          });
        }
        return {
          enabled: settings.enabled,
          physics: {
            attractionStrength: settings.attractionStrength,
            clusterTether: settings.clusterTether,
            groupCompactness: settings.groupCompactness,
            showBoardGrid: settings.showBoardGrid,
            repelOutsidersFromFrames: settings.repelOutsidersFromFrames
          },
          groups: enriched,
          pinnedNodes: settings.pinnedNodes || {}
        };
      }
      case "graph_create_group": {
        const settings = await this.adapter.getPluginSettings();
        const title = reqStr(args.name, "name");
        const mode = validMode(args.mode) || "organic";
        const subLayout = validSubLayout(args.frameSubLayout) || "grid";
        const color = optStr(args.color) || DEFAULT_GROUP_COLORS[settings.groups.length % DEFAULT_GROUP_COLORS.length];
        const query = optStr(args.query) || "";
        const nodeIds = strArray(args.nodeIds);
        const matchedIds = await this.adapter.resolveMatchingNodeIds({
          query,
          nodeIds,
          excludedNodeIds: []
        });
        let frameX = optNum(args.frameX);
        let frameY = optNum(args.frameY);
        let frameW = optNum(args.frameW);
        let frameH = optNum(args.frameH);
        if ((mode === "miro-pinned" || mode === "miro-free") && (frameX === void 0 || frameY === void 0 || frameW === void 0 || frameH === void 0)) {
          const topo = await this.adapter.getGraphTopology();
          const pts = topo.nodes.filter(
            (n) => matchedIds.includes(n.id) && typeof n.x === "number" && typeof n.y === "number"
          ).map((n) => ({ id: n.id, x: n.x, y: n.y }));
          const def = computeDefaultMiroFrame(
            pts,
            { x: frameX ?? 0, y: frameY ?? 0 },
            subLayout
          );
          frameX = frameX ?? def.frameX;
          frameY = frameY ?? def.frameY;
          frameW = frameW ?? def.frameW;
          frameH = frameH ?? def.frameH;
        }
        const created = {
          id: createGroupId(),
          name: title,
          color,
          enabled: true,
          query,
          nodeIds,
          excludedNodeIds: [],
          strength: optNum(args.strength) ?? 1,
          colorNodes: args.colorNodes !== false,
          mode,
          anchorMode: "auto",
          frameX,
          frameY,
          frameW,
          frameH,
          frameSubLayout: subLayout
        };
        await this.adapter.saveGroups([...settings.groups, created], true);
        return {
          created,
          matchedCount: matchedIds.length,
          matchedNodeIds: matchedIds
        };
      }
      case "graph_update_group": {
        const settings = await this.adapter.getPluginSettings();
        const key = reqStr(args.groupId, "groupId");
        const target = findGroupByIdOrName(settings.groups, key);
        if (!target) {
          throw new Error(`Group not found: "${key}"`);
        }
        const nextMode = validMode(args.mode) ?? target.mode ?? "organic";
        const nextSub = validSubLayout(args.frameSubLayout) ?? target.frameSubLayout ?? "grid";
        const updated = {
          ...target,
          name: optStr(args.name) ?? target.name,
          color: optStr(args.color) ?? target.color,
          enabled: typeof args.enabled === "boolean" ? args.enabled : target.enabled,
          query: typeof args.query === "string" ? args.query : target.query,
          strength: optNum(args.strength) ?? target.strength,
          colorNodes: typeof args.colorNodes === "boolean" ? args.colorNodes : target.colorNodes,
          mode: nextMode,
          frameSubLayout: nextSub,
          frameX: optNum(args.frameX) ?? target.frameX,
          frameY: optNum(args.frameY) ?? target.frameY,
          frameW: optNum(args.frameW) ?? target.frameW,
          frameH: optNum(args.frameH) ?? target.frameH,
          anchorMode: args.anchorMode === "auto" || args.anchorMode === "manual" ? args.anchorMode : target.anchorMode,
          anchorX: optNum(args.anchorX) ?? target.anchorX,
          anchorY: optNum(args.anchorY) ?? target.anchorY
        };
        if ((updated.mode === "miro-pinned" || updated.mode === "miro-free") && (updated.frameX === void 0 || updated.frameY === void 0 || updated.frameW === void 0 || updated.frameH === void 0)) {
          const matchedIds = await this.adapter.resolveMatchingNodeIds(updated);
          const topo = await this.adapter.getGraphTopology();
          const pts = topo.nodes.filter(
            (n) => matchedIds.includes(n.id) && typeof n.x === "number" && typeof n.y === "number"
          ).map((n) => ({ id: n.id, x: n.x, y: n.y }));
          const def = computeDefaultMiroFrame(
            pts,
            { x: 0, y: 0 },
            updated.frameSubLayout
          );
          updated.frameX = updated.frameX ?? def.frameX;
          updated.frameY = updated.frameY ?? def.frameY;
          updated.frameW = updated.frameW ?? def.frameW;
          updated.frameH = updated.frameH ?? def.frameH;
        }
        if (args.frameSubLayout && args.frameSubLayout !== "freeform") {
          updated.customOffsets = {};
        }
        const nextGroups = settings.groups.map(
          (g) => g.id === target.id ? updated : g
        );
        await this.adapter.saveGroups(nextGroups, true);
        const matched = await this.adapter.resolveMatchingNodeIds(updated);
        return {
          updated,
          matchedCount: matched.length,
          matchedNodeIds: matched
        };
      }
      case "graph_delete_group": {
        const settings = await this.adapter.getPluginSettings();
        const key = reqStr(args.groupId, "groupId");
        const target = findGroupByIdOrName(settings.groups, key);
        if (!target) {
          throw new Error(`Group not found: "${key}"`);
        }
        const nextGroups = settings.groups.filter((g) => g.id !== target.id);
        await this.adapter.saveGroups(nextGroups, true);
        return { deletedGroupId: target.id, deletedName: target.name };
      }
      case "graph_manage_group_nodes": {
        const settings = await this.adapter.getPluginSettings();
        const key = reqStr(args.groupId, "groupId");
        const target = findGroupByIdOrName(settings.groups, key);
        if (!target) {
          throw new Error(`Group not found: "${key}"`);
        }
        const toAdd = strArray(args.addNodeIds);
        const toRemove = new Set(strArray(args.removeNodeIds));
        const toExclude = strArray(args.excludeNodeIds);
        const manualSet = new Set(target.nodeIds);
        for (const id of toAdd) manualSet.add(id);
        for (const id of toRemove) manualSet.delete(id);
        const exclSet = new Set(target.excludedNodeIds || []);
        for (const id of toAdd) exclSet.delete(id);
        for (const id of toExclude) {
          exclSet.add(id);
          manualSet.delete(id);
        }
        const updated = {
          ...target,
          nodeIds: Array.from(manualSet),
          excludedNodeIds: Array.from(exclSet)
        };
        await this.adapter.saveGroups(
          settings.groups.map((g) => g.id === target.id ? updated : g),
          true
        );
        const matched = await this.adapter.resolveMatchingNodeIds(updated);
        return {
          groupId: updated.id,
          name: updated.name,
          matchedCount: matched.length,
          matchedNodeIds: matched
        };
      }
      case "graph_pin_nodes": {
        const settings = await this.adapter.getPluginSettings();
        const nextPins = { ...settings.pinnedNodes || {} };
        if (Array.isArray(args.pins)) {
          for (const item of args.pins) {
            if (item && typeof item === "object" && typeof item.id === "string" && typeof item.x === "number" && typeof item.y === "number") {
              const p = item;
              nextPins[p.id] = { x: p.x, y: p.y };
            }
          }
        }
        const nodeIds = strArray(args.nodeIds);
        if (nodeIds.length > 0) {
          const pattern = optStr(args.pattern) || "grid";
          const cx = optNum(args.centerX) ?? 0;
          const cy = optNum(args.centerY) ?? 0;
          const spacing = Math.max(40, optNum(args.spacing) ?? 95);
          const topo = await this.adapter.getGraphTopology();
          const posById = new Map(
            topo.nodes.map((n2) => [n2.id, { x: n2.x ?? cx, y: n2.y ?? cy }])
          );
          const n = nodeIds.length;
          const cols = pattern === "column" ? 1 : pattern === "row" ? n : Math.max(1, Math.ceil(Math.sqrt(n)));
          const rows = Math.max(1, Math.ceil(n / cols));
          nodeIds.forEach((id, i) => {
            if (pattern === "current") {
              const cur = posById.get(id) || { x: cx, y: cy };
              nextPins[id] = { x: cur.x, y: cur.y };
            } else if (pattern === "circle") {
              const r = n <= 1 ? 0 : Math.max(spacing * 0.8, n * spacing / (2 * Math.PI));
              const ang = -Math.PI / 2 + 2 * Math.PI * i / Math.max(1, n);
              nextPins[id] = {
                x: Math.round((cx + Math.cos(ang) * r) * 10) / 10,
                y: Math.round((cy + Math.sin(ang) * r) * 10) / 10
              };
            } else {
              const c = i % cols;
              const r = Math.floor(i / cols);
              nextPins[id] = {
                x: Math.round((cx + (c - (cols - 1) / 2) * spacing) * 10) / 10,
                y: Math.round((cy + (r - (rows - 1) / 2) * spacing) * 10) / 10
              };
            }
          });
        }
        const updated = await this.adapter.updatePluginSettings(
          { pinnedNodes: nextPins },
          true
        );
        return {
          pinnedCount: Object.keys(updated.pinnedNodes).length,
          pinnedNodes: updated.pinnedNodes
        };
      }
      case "graph_unpin_nodes": {
        const settings = await this.adapter.getPluginSettings();
        if (args.unpinAll === true) {
          await this.adapter.updatePluginSettings({ pinnedNodes: {} }, true);
          return { pinnedCount: 0, pinnedNodes: {} };
        }
        const ids = strArray(args.nodeIds);
        const nextPins = { ...settings.pinnedNodes || {} };
        for (const id of ids) delete nextPins[id];
        const updated = await this.adapter.updatePluginSettings(
          { pinnedNodes: nextPins },
          true
        );
        return {
          pinnedCount: Object.keys(updated.pinnedNodes).length,
          pinnedNodes: updated.pinnedNodes
        };
      }
      case "graph_arrange_miro_board": {
        return await this.arrangeMiroBoard(args);
      }
      case "graph_configure_physics": {
        const patch = {};
        const boolKeys = [
          "enabled",
          "syncNativeColorGroups",
          "showGroupZones",
          "showGroupLabels",
          "showBoardGrid",
          "repelOutsidersFromFrames"
        ];
        for (const k of boolKeys) {
          if (typeof args[k] === "boolean") patch[k] = args[k];
        }
        const numKeys = [
          "attractionStrength",
          "clusterTether",
          "groupCompactness",
          "zoneOpacity"
        ];
        for (const k of numKeys) {
          if (typeof args[k] === "number" && Number.isFinite(args[k])) {
            patch[k] = args[k];
          }
        }
        const updated = await this.adapter.updatePluginSettings(patch, true);
        return {
          enabled: updated.enabled,
          attractionStrength: updated.attractionStrength,
          clusterTether: updated.clusterTether,
          groupCompactness: updated.groupCompactness,
          syncNativeColorGroups: updated.syncNativeColorGroups,
          showGroupZones: updated.showGroupZones,
          showGroupLabels: updated.showGroupLabels,
          showBoardGrid: updated.showBoardGrid,
          repelOutsidersFromFrames: updated.repelOutsidersFromFrames,
          zoneOpacity: updated.zoneOpacity
        };
      }
      case "graph_reset_layout": {
        const settings = await this.adapter.getPluginSettings();
        let nextGroups = settings.groups.map((g) => ({ ...g }));
        if (args.convertAllFramesToOrganic === true) {
          nextGroups = nextGroups.map((g) => ({
            ...g,
            mode: "organic"
          }));
        }
        if (args.resetManualAnchors === true) {
          nextGroups = nextGroups.map((g) => ({
            ...g,
            anchorMode: "auto",
            anchorX: void 0,
            anchorY: void 0
          }));
        }
        await this.adapter.saveGroups(nextGroups, true);
        if (args.unpinAllIndividualNodes === true) {
          await this.adapter.updatePluginSettings({ pinnedNodes: {} }, true);
        } else {
          await this.adapter.updatePluginSettings({}, true);
        }
        return {
          status: "reheated",
          groupsCount: nextGroups.length
        };
      }
      default:
        throw new Error(`Unknown tool: "${name}"`);
    }
  }
  /**
   * Multi-frame Miro Board layout architect ("columns", "quadrants", "timeline", "ring").
   */
  async arrangeMiroBoard(args) {
    const settings = await this.adapter.getPluginSettings();
    const style = optStr(args.boardStyle) || "columns";
    const centerX = optNum(args.centerX) ?? 0;
    const centerY = optNum(args.centerY) ?? 0;
    const gap = Math.max(40, optNum(args.gap) ?? 95);
    const groupsCopy = settings.groups.map((g) => ({ ...g }));
    const rawItems = Array.isArray(args.items) ? args.items : [];
    const targetGroups = [];
    if (rawItems.length === 0) {
      for (const g of groupsCopy) {
        if (g.enabled) targetGroups.push(g);
      }
    } else {
      for (let i = 0; i < rawItems.length; i++) {
        const spec = rawItems[i];
        let grp = spec.groupIdOrName ? findGroupByIdOrName(groupsCopy, spec.groupIdOrName) : void 0;
        if (!grp && spec.name) {
          grp = findGroupByIdOrName(groupsCopy, spec.name);
        }
        if (grp) {
          if (spec.name) grp.name = spec.name;
          if (spec.color) grp.color = spec.color;
          if (typeof spec.query === "string") grp.query = spec.query;
          if (Array.isArray(spec.nodeIds)) grp.nodeIds = spec.nodeIds;
          grp.enabled = true;
          grp.mode = validMode(spec.mode) || "miro-pinned";
          grp.frameSubLayout = validSubLayout(spec.subLayout) || (style === "columns" ? "column" : "grid");
          grp.customOffsets = {};
          targetGroups.push(grp);
        } else {
          const created = {
            id: createGroupId(),
            name: spec.name || `Miro ${groupsCopy.length + 1}`,
            color: spec.color || DEFAULT_GROUP_COLORS[groupsCopy.length % DEFAULT_GROUP_COLORS.length],
            enabled: true,
            query: spec.query || "",
            nodeIds: Array.isArray(spec.nodeIds) ? spec.nodeIds : [],
            excludedNodeIds: [],
            strength: 1,
            colorNodes: true,
            mode: validMode(spec.mode) || "miro-pinned",
            anchorMode: "auto",
            frameSubLayout: validSubLayout(spec.subLayout) || (style === "columns" ? "column" : "grid")
          };
          groupsCopy.push(created);
          targetGroups.push(created);
        }
      }
    }
    const sizedFrames = [];
    for (const grp of targetGroups) {
      if (grp.mode === "organic") grp.mode = "miro-pinned";
      if (!grp.frameSubLayout || grp.frameSubLayout === "freeform") {
        grp.frameSubLayout = style === "columns" ? "column" : "grid";
      }
      grp.customOffsets = {};
      const matched = await this.adapter.resolveMatchingNodeIds(grp);
      const count = Math.max(1, matched.length);
      let w;
      let h;
      if (grp.frameSubLayout === "column") {
        w = 240;
        h = Math.max(
          220,
          MIRO_HEADER_HEIGHT + 60 + Math.max(0, count - 1) * 56
        );
      } else {
        const cols = Math.max(2, Math.ceil(Math.sqrt(count * 1.2)));
        const rows = Math.max(1, Math.ceil(count / cols));
        w = Math.max(MIRO_MIN_WIDTH, cols * 105 + 60);
        h = Math.max(
          MIRO_MIN_HEIGHT,
          MIRO_HEADER_HEIGHT + rows * 68 + 56
        );
      }
      sizedFrames.push({ grp, matchedIds: matched, w, h });
    }
    const total = sizedFrames.length;
    if (total > 0) {
      if (style === "columns" || style === "timeline") {
        const totalW = sizedFrames.reduce((s, f) => s + f.w, 0) + gap * (total - 1);
        let cursorX = centerX - totalW / 2;
        const maxH = Math.max(...sizedFrames.map((f) => f.h));
        for (const f of sizedFrames) {
          f.grp.frameX = Math.round(cursorX);
          f.grp.frameY = style === "columns" ? Math.round(centerY - maxH / 2) : Math.round(centerY - f.h / 2);
          f.grp.frameW = Math.round(f.w);
          f.grp.frameH = style === "columns" ? Math.round(maxH) : Math.round(f.h);
          cursorX += f.w + gap;
        }
      } else if (style === "quadrants") {
        const cols = 2;
        const rows = Math.ceil(total / cols);
        const colW = Math.max(...sizedFrames.map((f) => f.w));
        const rowH = Math.max(...sizedFrames.map((f) => f.h));
        const totalW = cols * colW + (cols - 1) * gap;
        const totalH = rows * rowH + (rows - 1) * gap;
        sizedFrames.forEach((f, idx) => {
          const c = idx % cols;
          const r = Math.floor(idx / cols);
          f.grp.frameX = Math.round(centerX - totalW / 2 + c * (colW + gap));
          f.grp.frameY = Math.round(centerY - totalH / 2 + r * (rowH + gap));
          f.grp.frameW = Math.round(colW);
          f.grp.frameH = Math.round(rowH);
        });
      } else {
        const maxDim = Math.max(
          ...sizedFrames.map((f) => Math.hypot(f.w, f.h))
        );
        const ringRadius = Math.max(
          340,
          total * (maxDim * 0.72 + gap) / (2 * Math.PI) + 150
        );
        sizedFrames.forEach((f, idx) => {
          const ang = -Math.PI / 2 + 2 * Math.PI * idx / total;
          const cx = centerX + Math.cos(ang) * ringRadius;
          const cy = centerY + Math.sin(ang) * ringRadius;
          f.grp.frameX = Math.round(cx - f.w / 2);
          f.grp.frameY = Math.round(cy - f.h / 2);
          f.grp.frameW = Math.round(f.w);
          f.grp.frameH = Math.round(f.h);
        });
      }
    }
    await this.adapter.saveGroups(groupsCopy, true);
    if (args.showBoardGrid !== false) {
      await this.adapter.updatePluginSettings({ showBoardGrid: true }, false);
    }
    return {
      boardStyle: style,
      arrangedCount: sizedFrames.length,
      frames: sizedFrames.map((f) => ({
        id: f.grp.id,
        name: f.grp.name,
        mode: f.grp.mode,
        subLayout: f.grp.frameSubLayout,
        frameX: f.grp.frameX,
        frameY: f.grp.frameY,
        frameW: f.grp.frameW,
        frameH: f.grp.frameH,
        matchedCount: f.matchedIds.length
      }))
    };
  }
};
function findGroupByIdOrName(groups, key) {
  const norm = key.trim().toLowerCase();
  return groups.find((g) => g.id === key) || groups.find((g) => g.name.trim().toLowerCase() === norm);
}
function reqStr(v, field) {
  if (typeof v !== "string" || !v.trim()) {
    throw new Error(`Missing required string parameter "${field}"`);
  }
  return v.trim();
}
function optStr(v) {
  return typeof v === "string" && v.trim() ? v.trim() : void 0;
}
function optNum(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : void 0;
}
function strArray(v) {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === "string" && x.trim().length > 0);
}
function validMode(v) {
  return v === "organic" || v === "miro-free" || v === "miro-pinned" ? v : void 0;
}
function validSubLayout(v) {
  return v === "grid" || v === "column" || v === "row" || v === "circle" || v === "freeform" ? v : void 0;
}

// src/mcp/mcpHttpServer.ts
async function loadNodeHttp() {
  try {
    const req = globalThis.require || (typeof window !== "undefined" ? window.require : void 0);
    if (typeof req === "function") {
      return req("http");
    }
  } catch {
  }
  try {
    const modName = "node:http";
    return await import(modName);
  } catch {
    return null;
  }
}
var EmbeddedMcpHttpServer = class {
  constructor(engine, opts) {
    this.server = null;
    this.sseSessions = /* @__PURE__ */ new Map();
    this.streamableGetStreams = /* @__PURE__ */ new Set();
    this.listeningPort = null;
    this.engine = engine;
    this.opts = { ...opts };
  }
  updateOptions(patch) {
    this.opts = { ...this.opts, ...patch };
  }
  isRunning() {
    return this.server !== null && this.listeningPort !== null;
  }
  getListeningPort() {
    return this.listeningPort;
  }
  getLocalEndpoints() {
    if (!this.listeningPort) return null;
    const base = `http://${this.opts.host || "127.0.0.1"}:${this.listeningPort}`;
    const tokenSeg = this.opts.requireToken && this.opts.authToken ? `/t/${encodeURIComponent(this.opts.authToken)}` : "";
    return {
      baseUrl: base,
      mcpUrl: `${base}${tokenSeg}/mcp`,
      sseUrl: `${base}${tokenSeg}/sse`
    };
  }
  buildPublicEndpoints(tunnelBaseUrl) {
    const clean = tunnelBaseUrl.replace(/\/+$/, "");
    const tokenSeg = this.opts.requireToken && this.opts.authToken ? `/t/${encodeURIComponent(this.opts.authToken)}` : "";
    return {
      mcpUrl: `${clean}${tokenSeg}/mcp`,
      sseUrl: `${clean}${tokenSeg}/sse`
    };
  }
  async start() {
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
    server.keepAliveTimeout = 65e3;
    server.headersTimeout = 7e4;
    return await new Promise((resolve3, reject) => {
      const onError = (err) => {
        server.removeListener("error", onError);
        reject(err);
      };
      server.once("error", onError);
      server.listen(this.opts.port, this.opts.host || "127.0.0.1", () => {
        server.removeListener("error", onError);
        const addr = server.address();
        const actualPort = addr && typeof addr === "object" ? addr.port : this.opts.port;
        this.server = server;
        this.listeningPort = actualPort;
        resolve3(actualPort);
      });
    });
  }
  async stop() {
    for (const sess of this.sseSessions.values()) {
      clearInterval(sess.heartbeat);
      try {
        sess.res.end();
      } catch {
      }
    }
    this.sseSessions.clear();
    for (const s of this.streamableGetStreams) {
      clearInterval(s.heartbeat);
      try {
        s.res.end();
      } catch {
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
    await new Promise((resolve3) => {
      srv.close(() => resolve3());
    });
  }
  /* =========================================================================
   * HTTP Request Router (Cloudflare Quick Tunnel + Streamable HTTP + SSE)
   * ========================================================================= */
  setCorsHeaders(res) {
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
  async handleHttpRequest(req, res) {
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
    if (pathname.startsWith("/.well-known/")) {
      res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "oauth_not_configured" }));
      return;
    }
    let pathToken = null;
    let routePrefix = "";
    const pathTokenMatch = pathname.match(/^\/t\/([^/]+)(\/.*)?$/);
    if (pathTokenMatch) {
      pathToken = decodeURIComponent(pathTokenMatch[1]);
      routePrefix = `/t/${pathTokenMatch[1]}`;
      pathname = pathTokenMatch[2] || "/";
    }
    if (method === "GET" && pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(
        JSON.stringify({
          ok: true,
          service: "obsidian-magnetic-miro-mcp",
          version: "2.0.0",
          transports: ["streamable-http", "sse"],
          authRequired: Boolean(this.opts.requireToken && this.opts.authToken),
          stats: this.engine.stats
        })
      );
      return;
    }
    if (this.opts.requireToken && this.opts.authToken) {
      const provided = this.extractProvidedToken(req, parsedUrl, pathToken);
      if (provided !== this.opts.authToken) {
        res.writeHead(401, {
          "Content-Type": "application/json; charset=utf-8"
        });
        res.end(
          JSON.stringify({
            jsonrpc: "2.0",
            id: null,
            error: {
              code: -32001,
              message: "Unauthorized: include valid token via /t/<token>/mcp URL path, ?token=<token>, or Authorization: Bearer <token>."
            }
          })
        );
        return;
      }
    }
    if (method === "GET" && pathname === "/sse") {
      this.handleLegacySseConnect(res, routePrefix, parsedUrl);
      return;
    }
    if (method === "POST" && pathname === "/messages") {
      await this.handleLegacySseMessage(req, res, parsedUrl);
      return;
    }
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
        this.handleBrowserStatusPage(req, res, routePrefix);
        return;
      }
    }
    res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        error: "Not Found",
        hint: "Connect your MCP client to /mcp (Streamable HTTP) or /sse (HTTP+SSE)."
      })
    );
  }
  extractProvidedToken(req, parsedUrl, pathToken) {
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
  async handleStreamablePost(req, res) {
    let rawBody = "";
    try {
      rawBody = await readRequestBody(req);
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(
        JSON.stringify({
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: String(err) }
        })
      );
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(
        JSON.stringify({
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: "Parse error: invalid JSON" }
        })
      );
      return;
    }
    const incomingSessionId = typeof req.headers["mcp-session-id"] === "string" ? req.headers["mcp-session-id"] : generateSessionId();
    res.setHeader("Mcp-Session-Id", incomingSessionId);
    if (Array.isArray(parsed)) {
      const responses = [];
      for (const item of parsed) {
        const out = await this.engine.handleJsonRpcMessage(
          item
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
    const single = parsed;
    const response = await this.engine.handleJsonRpcMessage(single);
    if (response === null) {
      res.writeHead(202);
      res.end();
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(response));
  }
  handleStreamableGetSse(req, res) {
    const sid = typeof req.headers["mcp-session-id"] === "string" ? req.headers["mcp-session-id"] : generateSessionId();
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Mcp-Session-Id": sid
    });
    res.write(": connected\n\n");
    const heartbeat = setInterval(() => {
      try {
        res.write(": keepalive\n\n");
      } catch {
        clearInterval(heartbeat);
      }
    }, 15e3);
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
  handleLegacySseConnect(res, routePrefix, parsedUrl) {
    const sessionId = generateSessionId();
    const queryToken = parsedUrl.searchParams.get("token");
    const tokenParam = !routePrefix && queryToken ? `&token=${encodeURIComponent(queryToken)}` : "";
    const messagesEndpoint = `${routePrefix}/messages?sessionId=${encodeURIComponent(
      sessionId
    )}${tokenParam}`;
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    });
    res.write(`event: endpoint
data: ${messagesEndpoint}

`);
    const heartbeat = setInterval(() => {
      try {
        res.write(": keepalive\n\n");
      } catch {
        clearInterval(heartbeat);
      }
    }, 15e3);
    const session = { id: sessionId, res, heartbeat };
    this.sseSessions.set(sessionId, session);
    res.on("close", () => {
      clearInterval(heartbeat);
      this.sseSessions.delete(sessionId);
    });
  }
  async handleLegacySseMessage(req, res, parsedUrl) {
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
    let parsed;
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
        item
      );
      if (rpcRes !== null) {
        try {
          session.res.write(
            `event: message
data: ${JSON.stringify(rpcRes)}

`
          );
        } catch {
        }
      }
    }
  }
  /* =========================================================================
   * Friendly Status Page when User Visits Tunnel URL in Browser
   * ========================================================================= */
  handleBrowserStatusPage(req, res, routePrefix) {
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
          stats: this.engine.stats
        })
      );
      return;
    }
    const html = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>Obsidian Magnetic Groups & Miro \u2014 MCP Server</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #13151d; color: #e8eaf2; max-width: 680px; margin: 48px auto; padding: 0 20px; line-height: 1.55; }
    .card { background: #1c1f2b; border: 1px solid #2e3348; border-radius: 14px; padding: 24px; box-shadow: 0 12px 32px rgba(0,0,0,0.35); }
    .ok { display: inline-block; padding: 3px 10px; border-radius: 999px; background: rgba(6,214,160,0.16); color: #06d6a0; font-size: 12px; font-weight: 600; }
    code { display: block; background: #11131a; border: 1px solid #2b3044; padding: 10px 12px; border-radius: 8px; color: #a892ff; margin: 6px 0 14px; word-break: break-all; }
  </style>
</head>
<body>
  <div class="card">
    <span class="ok">\u25CF MCP-\u0441\u0435\u0440\u0432\u0435\u0440 \u0430\u043A\u0442\u0438\u0432\u0435\u043D</span>
    <h2 style="margin:12px 0 6px;">Obsidian Graph Magnetic Groups & Miro MCP</h2>
    <p style="color:#9ba1b8;margin-top:0;">\u0413\u043E\u0442\u043E\u0432 \u043A \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044E \u043E\u0431\u043B\u0430\u0447\u043D\u044B\u0445 \u0418\u0418-\u0430\u0433\u0435\u043D\u0442\u043E\u0432 (Claude, ChatGPT, n8n, LangGraph, Cursor \u0438 \u0434\u0440.).</p>
    <strong>Streamable HTTP URL (\u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F):</strong>
    <code>${base}/mcp</code>
    <strong>Legacy SSE URL (\u0434\u043B\u044F \u0441\u0442\u0430\u0440\u044B\u0445 \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432):</strong>
    <code>${base}/sse</code>
    <p style="font-size:13px;color:#9ba1b8;margin-bottom:0;">\u0412\u044B\u0437\u043E\u0432\u043E\u0432 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u043E\u0432 \u0437\u0430 \u0441\u0435\u0441\u0441\u0438\u044E: <b>${this.engine.stats.totalToolCalls}</b></p>
  </div>
</body>
</html>`;
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  }
};
function readRequestBody(req, maxBytes = 4 * 1024 * 1024) {
  return new Promise((resolve3, reject) => {
    const chunks = [];
    let total = 0;
    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        reject(new Error("Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on("end", () => {
      resolve3(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", reject);
  });
}
function generateSessionId() {
  return "mcp-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

// src/mcp/standaloneCli.ts
function parseCliArgs(argv) {
  const env = process.env;
  const out = {
    vault: env.OBSIDIAN_VAULT_PATH || env.VAULT_PATH || process.cwd(),
    port: parseInt(env.MCP_PORT || "27125", 10) || 27125,
    host: env.MCP_HOST || "127.0.0.1",
    tunnel: env.MCP_TUNNEL === "1" || env.MCP_TUNNEL === "true",
    stdio: false,
    noAuth: env.MCP_NO_AUTH === "1" || env.MCP_NO_AUTH === "true",
    token: env.MCP_AUTH_TOKEN || void 0,
    cloudflaredPath: env.CLOUDFLARED_PATH || void 0
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
function printUsageAndExit() {
  console.log(`
Obsidian Magnetic Groups & Miro \u2014 Standalone MCP Server + Cloudflare Quick Tunnel

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
async function checkExistingObsidianMcpServer(host, port) {
  return await new Promise((resolve3) => {
    const req = http.get(
      { host, port, path: "/health", timeout: 1200 },
      (res) => {
        let data = "";
        res.on("data", (c) => data += c);
        res.on("end", () => {
          resolve3(
            res.statusCode === 200 && data.includes("obsidian-magnetic-miro-mcp")
          );
        });
      }
    );
    req.on("error", () => resolve3(false));
    req.on("timeout", () => {
      req.destroy();
      resolve3(false);
    });
  });
}
async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const vaultAbs = path2.resolve(args.vault);
  if (!fs2.existsSync(vaultAbs)) {
    fs2.mkdirSync(vaultAbs, { recursive: true });
  }
  const adapter = new FilesystemVaultAdapter(vaultAbs);
  const engine = new ObsidianMcpEngine(adapter);
  if (args.stdio) {
    const rl = readline.createInterface({
      input: process.stdin,
      terminal: false
    });
    rl.on("line", async (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      try {
        const msg = JSON.parse(trimmed);
        const resp = await engine.handleJsonRpcMessage(msg);
        if (resp !== null) {
          process.stdout.write(JSON.stringify(resp) + "\n");
        }
      } catch {
        process.stdout.write(
          JSON.stringify({
            jsonrpc: "2.0",
            id: null,
            error: { code: -32700, message: "Parse error" }
          }) + "\n"
        );
      }
    });
    return;
  }
  const settings = await adapter.getPluginSettings();
  let authToken = args.token || settings.mcpAuthToken;
  if (!authToken) {
    authToken = generateRandomToken();
    await adapter.updatePluginSettings({ mcpAuthToken: authToken });
  }
  const requireToken = !args.noAuth && settings.mcpUseAuthToken !== false;
  const alreadyLiveInObsidian = await checkExistingObsidianMcpServer(
    args.host,
    args.port
  );
  let httpServer = null;
  let actualPort = args.port;
  if (alreadyLiveInObsidian) {
    console.log(
      `\u2713 Detected live Obsidian Desktop MCP server already running on http://${args.host}:${args.port}`
    );
  } else {
    httpServer = new EmbeddedMcpHttpServer(engine, {
      host: args.host,
      port: args.port,
      requireToken,
      authToken
    });
    actualPort = await httpServer.start();
    const localUrls = httpServer.getLocalEndpoints();
    console.log(`
=============================================================`);
    console.log(`\u{1F9F2} Obsidian Vault + Graph Miro MCP Server Running`);
    console.log(`   Vault:           ${vaultAbs}`);
    console.log(`   Streamable HTTP: ${localUrls.mcpUrl}`);
    console.log(`   Legacy SSE:      ${localUrls.sseUrl}`);
    console.log(`=============================================================
`);
  }
  let tunnelMgr = null;
  if (args.tunnel) {
    tunnelMgr = new CloudflareQuickTunnelManager();
    console.log(`\u2601\uFE0F  Starting Cloudflare Quick Tunnel -> http://127.0.0.1:${actualPort} ...`);
    try {
      const publicBase = await tunnelMgr.start(
        actualPort,
        args.cloudflaredPath
      );
      const tokenSeg = requireToken && authToken ? `/t/${encodeURIComponent(authToken)}` : "";
      console.log(`
\u{1F680} CLOUDFLARE QUICK TUNNEL READY FOR CLOUD AGENTS:`);
      console.log(`   Streamable HTTP (Claude / ChatGPT / Cursor / LangGraph):`);
      console.log(`   \u{1F449} ${publicBase}${tokenSeg}/mcp
`);
      console.log(`   Legacy SSE (n8n / older SSE clients):`);
      console.log(`   \u{1F449} ${publicBase}${tokenSeg}/sse
`);
    } catch (err) {
      console.error(
        `\u26A0\uFE0F  Could not auto-start cloudflared: ${err instanceof Error ? err.message : String(err)}`
      );
      console.log(
        `   You can also run manually: cloudflared tunnel --url http://127.0.0.1:${actualPort}`
      );
    }
  } else {
    console.log(
      `\u{1F4A1} Tip: pass --tunnel (or run: cloudflared tunnel --url http://127.0.0.1:${actualPort}) to expose HTTPS for cloud agents.`
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
