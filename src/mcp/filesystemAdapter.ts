import * as fs from "fs";
import * as path from "path";
import { NodeMatchMetadata, parseGroupQuery } from "../queryMatcher";
import {
  DEFAULT_SETTINGS,
  MagneticGroup,
  MagneticGroupsSettings,
} from "../types";
import {
  GraphTopologySnapshot,
  NoteDetail,
  NoteSummary,
  SearchHit,
  VaultGraphAdapter,
  VaultInfoSummary,
} from "./adapterTypes";

interface ParsedVaultNote {
  relPath: string;
  title: string;
  folder: string;
  content: string;
  tags: string[];
  frontmatter: Record<string, unknown>;
  rawOutgoingTargets: string[];
  sizeBytes: number;
  mtimeMs: number;
}

export class FilesystemVaultAdapter implements VaultGraphAdapter {
  private vaultRoot: string;
  private pluginDataPath: string;
  private onSettingsChanged?: (settings: MagneticGroupsSettings) => void;

  constructor(
    vaultRoot: string,
    opts?: {
      pluginDataPath?: string;
      onSettingsChanged?: (settings: MagneticGroupsSettings) => void;
    }
  ) {
    this.vaultRoot = path.resolve(vaultRoot);
    this.pluginDataPath =
      opts?.pluginDataPath ||
      path.join(
        this.vaultRoot,
        ".obsidian",
        "plugins",
        "graph-magnetic-groups",
        "data.json"
      );
    this.onSettingsChanged = opts?.onSettingsChanged;
  }

  public async getVaultInfo(): Promise<VaultInfoSummary> {
    const { notes, folders } = this.scanVault();
    const tagCounts = new Map<string, number>();
    for (const n of notes) {
      for (const tg of n.tags) {
        tagCounts.set(tg, (tagCounts.get(tg) || 0) + 1);
      }
    }
    const tags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);

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
      pinnedNodesCount: Object.keys(settings.pinnedNodes || {}).length,
    };
  }

  public async listNotes(opts?: {
    folder?: string;
    tag?: string;
    query?: string;
    limit?: number;
  }): Promise<NoteSummary[]> {
    const { notes, resolvedLinks, backlinkCounts } = this.buildVaultGraph();
    const compiled = opts?.query ? parseGroupQuery(opts.query) : null;
    const normFolder = opts?.folder
      ? opts.folder.replace(/^\/+|\/+$/g, "").toLowerCase()
      : null;
    const normTag = opts?.tag
      ? ("#" + opts.tag.replace(/^#+/, "")).toLowerCase()
      : null;
    const limit = Math.max(1, Math.min(1000, opts?.limit ?? 100));

    const out: NoteSummary[] = [];
    for (const n of notes) {
      if (normFolder && !n.relPath.toLowerCase().startsWith(normFolder)) {
        continue;
      }
      if (
        normTag &&
        !n.tags.some((t) => t === normTag || t.startsWith(normTag + "/"))
      ) {
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
        mtimeMs: n.mtimeMs,
      });
      if (out.length >= limit) break;
    }
    return out;
  }

  public async readNote(notePath: string): Promise<NoteDetail> {
    const { notes, resolvedLinks } = this.buildVaultGraph();
    const target = this.findNote(notes, notePath);
    if (!target) {
      throw new Error(`Note not found: "${notePath}"`);
    }
    const backlinks: string[] = [];
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
      mtimeMs: target.mtimeMs,
    };
  }

  public async writeNote(opts: {
    path: string;
    content: string;
    mode?: "overwrite" | "create-only" | "append" | "prepend";
  }): Promise<{ path: string; created: boolean; bytes: number }> {
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
      finalContent = prev.endsWith("\n")
        ? prev + opts.content
        : prev + "\n" + opts.content;
    } else if (exists && mode === "prepend") {
      const prev = fs.readFileSync(full, "utf8");
      finalContent = opts.content + "\n" + prev;
    }

    fs.writeFileSync(full, finalContent, "utf8");
    return {
      path: rel,
      created: !exists,
      bytes: Buffer.byteLength(finalContent, "utf8"),
    };
  }

  public async deleteNote(
    notePath: string
  ): Promise<{ deleted: boolean; path: string }> {
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

  public async moveNote(
    fromPath: string,
    toPath: string
  ): Promise<{ from: string; to: string }> {
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

  public async searchVault(opts: {
    query: string;
    limit?: number;
  }): Promise<SearchHit[]> {
    const q = opts.query.trim();
    const limit = Math.max(1, Math.min(200, opts.limit ?? 25));
    const { notes } = this.scanVault();
    const hasStruct = /(?:^|\s)(?:tag:|path:|file:|\[|-|OR\s)/i.test(q);
    const compiled = hasStruct ? parseGroupQuery(q) : null;
    const terms = q
      .toLowerCase()
      .split(/\s+/)
      .filter(
        (w) => w.length >= 2 && !w.startsWith("tag:") && !w.startsWith("path:")
      );

    const hits: SearchHit[] = [];
    for (const n of notes) {
      if (compiled && !compiled.matches(this.toMatchMeta(n))) continue;
      const lower = n.content.toLowerCase();
      const titleLower = n.title.toLowerCase();
      let score = compiled ? 5 : 0;
      const snippets: string[] = [];

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
          snippets,
        });
      }
    }
    hits.sort((a, b) => b.score - a.score);
    return hits.slice(0, limit);
  }

  public async getGraphTopology(): Promise<GraphTopologySnapshot> {
    const { notes, links, degree } = this.buildVaultGraph();
    const settings = await this.getPluginSettings();

    const groupMemberships = new Map<string, string[]>();
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
        groups: groupMemberships.get(n.relPath) || [],
      };
    });

    const sorted = [...nodes].sort((a, b) => b.degree - a.degree);
    return {
      isLiveGraphOpen: false,
      totalNotes: notes.length,
      totalLinks: links.length,
      nodes,
      links,
      topHubs: sorted
        .slice(0, 12)
        .map((n) => ({ id: n.id, degree: n.degree })),
      orphanNotes: nodes.filter((n) => n.degree === 0).map((n) => n.id),
    };
  }

  public async focusGraphTarget(_opts: {
    openGraphIfClosed?: boolean;
    notePath?: string;
    groupId?: string;
  }): Promise<{ focused: boolean; message: string }> {
    return {
      focused: false,
      message:
        "Running in standalone filesystem mode; open Obsidian Desktop to focus live Graph View camera.",
    };
  }

  public async getPluginSettings(): Promise<MagneticGroupsSettings> {
    try {
      if (fs.existsSync(this.pluginDataPath)) {
        const raw = JSON.parse(fs.readFileSync(this.pluginDataPath, "utf8"));
        return {
          ...DEFAULT_SETTINGS,
          ...raw,
          groups: Array.isArray(raw?.groups) ? raw.groups : [],
          pinnedNodes:
            raw?.pinnedNodes && typeof raw.pinnedNodes === "object"
              ? raw.pinnedNodes
              : {},
        };
      }
    } catch {
      // Fallback to defaults
    }
    return {
      ...DEFAULT_SETTINGS,
      groups: [],
      pinnedNodes: {},
    };
  }

  public async updatePluginSettings(
    patch: Partial<MagneticGroupsSettings>,
    _reheat?: boolean
  ): Promise<MagneticGroupsSettings> {
    const curr = await this.getPluginSettings();
    const next: MagneticGroupsSettings = {
      ...curr,
      ...patch,
    };
    this.writeSettingsToDisk(next);
    return next;
  }

  public async saveGroups(
    groups: MagneticGroup[],
    _reheat?: boolean
  ): Promise<MagneticGroup[]> {
    const curr = await this.getPluginSettings();
    const next: MagneticGroupsSettings = {
      ...curr,
      groups,
    };
    this.writeSettingsToDisk(next);
    return groups;
  }

  public async resolveMatchingNodeIds(group: {
    query?: string;
    nodeIds?: string[];
    excludedNodeIds?: string[];
  }): Promise<string[]> {
    const { notes } = this.scanVault();
    const compiled = group.query?.trim()
      ? parseGroupQuery(group.query)
      : null;
    const manual = new Set(group.nodeIds || []);
    const excluded = new Set(group.excludedNodeIds || []);
    const matched = new Set<string>();

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

  private writeSettingsToDisk(settings: MagneticGroupsSettings): void {
    fs.mkdirSync(path.dirname(this.pluginDataPath), { recursive: true });
    fs.writeFileSync(
      this.pluginDataPath,
      JSON.stringify(settings, null, 2),
      "utf8"
    );
    this.onSettingsChanged?.(settings);
  }

  private safeVaultRelPath(inputPath: string): string {
    const normalized = inputPath
      .replace(/\\/g, "/")
      .replace(/^\/+/, "")
      .trim();
    const withMd = /\.md$/i.test(normalized) ? normalized : `${normalized}.md`;
    const resolved = path.resolve(this.vaultRoot, withMd);
    if (
      resolved !== this.vaultRoot &&
      !resolved.startsWith(this.vaultRoot + path.sep)
    ) {
      throw new Error("Path traversal outside vault root is not allowed");
    }
    return path.relative(this.vaultRoot, resolved).split(path.sep).join("/");
  }

  private findNote(
    notes: ParsedVaultNote[],
    notePath: string
  ): ParsedVaultNote | undefined {
    const clean = notePath.replace(/\\/g, "/").replace(/^\/+/, "").trim();
    const withMd = /\.md$/i.test(clean) ? clean : `${clean}.md`;
    const base = clean.replace(/\.md$/i, "").toLowerCase();
    return (
      notes.find((n) => n.relPath === clean || n.relPath === withMd) ||
      notes.find((n) => n.relPath.toLowerCase() === withMd.toLowerCase()) ||
      notes.find((n) => n.title.toLowerCase() === base)
    );
  }

  private toMatchMeta(n: ParsedVaultNote): NodeMatchMetadata {
    const props = new Map<string, string[]>();
    for (const [k, v] of Object.entries(n.frontmatter)) {
      const vals = Array.isArray(v)
        ? v.map((x) => String(x).toLowerCase())
        : v !== null && v !== undefined
        ? [String(v).toLowerCase()]
        : [];
      props.set(k.toLowerCase(), vals);
    }
    return {
      id: n.relPath,
      basename: n.title,
      path: n.relPath,
      tags: n.tags,
      frontmatter: props,
      isTagNode: false,
    };
  }

  private buildVaultGraph(): {
    notes: ParsedVaultNote[];
    links: Array<{ source: string; target: string }>;
    resolvedLinks: Map<string, string[]>;
    backlinkCounts: Map<string, number>;
    degree: Map<string, number>;
  } {
    const { notes } = this.scanVault();
    const byRel = new Map<string, ParsedVaultNote>();
    const byTitle = new Map<string, ParsedVaultNote>();
    for (const n of notes) {
      byRel.set(n.relPath.toLowerCase(), n);
      byTitle.set(n.title.toLowerCase(), n);
    }

    const links: Array<{ source: string; target: string }> = [];
    const resolvedLinks = new Map<string, string[]>();
    const backlinkCounts = new Map<string, number>();
    const degree = new Map<string, number>();
    for (const n of notes) degree.set(n.relPath, 0);

    for (const n of notes) {
      const outSet = new Set<string>();
      for (const rawTarget of n.rawOutgoingTargets) {
        const clean = rawTarget
          .split("#")[0]
          .split("|")[0]
          .trim()
          .replace(/\\/g, "/");
        if (!clean) continue;
        const withMd = /\.md$/i.test(clean) ? clean : `${clean}.md`;
        const hit =
          byRel.get(withMd.toLowerCase()) || byTitle.get(clean.toLowerCase());
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

  private scanVault(): { notes: ParsedVaultNote[]; folders: string[] } {
    if (!fs.existsSync(this.vaultRoot)) {
      return { notes: [], folders: [] };
    }
    const notes: ParsedVaultNote[] = [];
    const folders: string[] = [];

    const walk = (dir: string) => {
      let entries: fs.Dirent[] = [];
      try {
        entries = fs.readdirSync(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const ent of entries) {
        if (ent.name.startsWith(".")) continue;
        if (ent.name === "node_modules") continue;
        const full = path.join(dir, ent.name);
        const rel = path
          .relative(this.vaultRoot, full)
          .split(path.sep)
          .join("/");
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
              mtimeMs: stat.mtimeMs,
            });
          } catch {
            // Skip unreadable file
          }
        }
      }
    };

    walk(this.vaultRoot);
    notes.sort((a, b) => a.relPath.localeCompare(b.relPath));
    folders.sort();
    return { notes, folders };
  }
}

function parseMarkdownMetadata(content: string): {
  frontmatter: Record<string, unknown>;
  tags: string[];
  wikilinks: string[];
} {
  const frontmatter: Record<string, unknown> = {};
  const tagSet = new Set<string>();
  let body = content;

  const fmMatch = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (fmMatch) {
    body = content.slice(fmMatch[0].length);
    const lines = fmMatch[1].split(/\r?\n/);
    let activeListKey: string | null = null;
    for (const line of lines) {
      const listItem = line.match(/^\s*-\s+(.+)$/);
      if (listItem && activeListKey) {
        const arr = (frontmatter[activeListKey] as string[]) || [];
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
          frontmatter[key] = rawVal
            .slice(1, -1)
            .split(",")
            .map((s) => stripQuotes(s.trim()))
            .filter(Boolean);
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

  // Strip fenced code blocks before scanning inline tags & wikilinks
  const bodyNoCode = body.replace(/```[\s\S]*?```/g, "");
  const tagRegex = /(?:^|\s)#([A-Za-zА-Яа-яЁё0-9_/-]+)/g;
  let tm: RegExpExecArray | null;
  while ((tm = tagRegex.exec(bodyNoCode)) !== null) {
    tagSet.add("#" + tm[1].toLowerCase());
  }

  const wikilinks: string[] = [];
  const linkRegex = /\[\[([^\]]+)\]\]/g;
  let lm: RegExpExecArray | null;
  while ((lm = linkRegex.exec(bodyNoCode)) !== null) {
    wikilinks.push(lm[1]);
  }

  return {
    frontmatter,
    tags: Array.from(tagSet),
    wikilinks,
  };
}

function stripQuotes(s: string): string {
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    return s.slice(1, -1);
  }
  return s;
}
