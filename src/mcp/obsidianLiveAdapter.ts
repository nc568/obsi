import { App, getAllTags, TFile, TFolder } from "obsidian";
import { GraphViewController } from "../graphController";
import { buildMetadataResolver, parseGroupQuery } from "../queryMatcher";
import {
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

export interface LivePluginHost {
  app: App;
  getSettings: () => MagneticGroupsSettings;
  updateSettings: (
    patch: Partial<MagneticGroupsSettings>,
    reheat?: boolean
  ) => Promise<void>;
  saveGroups: (groups: MagneticGroup[], reheat?: boolean) => Promise<void>;
  getActiveControllers: () => GraphViewController[];
}

export class ObsidianLiveVaultAdapter implements VaultGraphAdapter {
  private host: LivePluginHost;

  constructor(host: LivePluginHost) {
    this.host = host;
  }

  private get app(): App {
    return this.host.app;
  }

  public async getVaultInfo(): Promise<VaultInfoSummary> {
    const mdFiles = this.app.vault.getMarkdownFiles();
    const allLoaded = this.app.vault.getAllLoadedFiles
      ? this.app.vault.getAllLoadedFiles()
      : mdFiles;
    const folders = allLoaded
      .filter((f): f is TFolder => f instanceof TFolder && f.path !== "/")
      .map((f) => f.path)
      .sort();

    const tagCounts = new Map<string, number>();
    for (const file of mdFiles) {
      for (const tg of this.extractFileTags(file)) {
        tagCounts.set(tg, (tagCounts.get(tg) || 0) + 1);
      }
    }
    const tags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 50);

    const settings = this.host.getSettings();
    const miroCount = settings.groups.filter(
      (g) => g.enabled && (g.mode === "miro-pinned" || g.mode === "miro-free")
    ).length;

    return {
      vaultName:
        typeof this.app.vault.getName === "function"
          ? this.app.vault.getName()
          : "Obsidian Vault",
      adapterMode: "obsidian-live",
      noteCount: mdFiles.length,
      folderCount: folders.length,
      folders,
      tags,
      liveGraphViewsOpen: this.host.getActiveControllers().length,
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
    const mdFiles = this.app.vault.getMarkdownFiles();
    const resolvedLinks = this.app.metadataCache.resolvedLinks || {};
    const backlinkCounts = new Map<string, number>();
    for (const targets of Object.values(resolvedLinks)) {
      for (const targetPath of Object.keys(targets || {})) {
        backlinkCounts.set(
          targetPath,
          (backlinkCounts.get(targetPath) || 0) + 1
        );
      }
    }

    const resolver = buildMetadataResolver(this.app);
    const compiled = opts?.query ? parseGroupQuery(opts.query) : null;
    const normFolder = opts?.folder
      ? opts.folder.replace(/^\/+|\/+$/g, "").toLowerCase()
      : null;
    const normTag = opts?.tag
      ? ("#" + opts.tag.replace(/^#+/, "")).toLowerCase()
      : null;
    const limit = Math.max(1, Math.min(1000, opts?.limit ?? 100));

    const results: NoteSummary[] = [];
    for (const file of mdFiles) {
      if (normFolder && !file.path.toLowerCase().startsWith(normFolder)) {
        continue;
      }
      const tags = this.extractFileTags(file);
      if (normTag && !tags.some((t) => t === normTag || t.startsWith(normTag + "/"))) {
        continue;
      }
      if (compiled && !compiled.matches(resolver(file.path, "file"))) {
        continue;
      }

      const outgoing = Object.keys(resolvedLinks[file.path] || {});
      results.push({
        path: file.path,
        title: file.basename,
        folder: file.parent?.path || "",
        tags,
        outgoingLinks: outgoing,
        backlinksCount: backlinkCounts.get(file.path) || 0,
        sizeBytes: file.stat?.size,
        mtimeMs: file.stat?.mtime,
      });
      if (results.length >= limit) break;
    }

    return results;
  }

  public async readNote(notePath: string): Promise<NoteDetail> {
    const file = this.resolveNoteFile(notePath);
    if (!file) {
      throw new Error(`Note not found: "${notePath}"`);
    }
    const content = await this.app.vault.cachedRead(file);
    const cache = this.app.metadataCache.getFileCache(file);
    const fm: Record<string, unknown> = {};
    if (cache?.frontmatter) {
      for (const [k, v] of Object.entries(cache.frontmatter)) {
        if (k !== "position") fm[k] = v;
      }
    }
    const resolvedLinks = this.app.metadataCache.resolvedLinks || {};
    const outgoing = Object.keys(resolvedLinks[file.path] || {});
    const backlinks: string[] = [];
    for (const [src, targets] of Object.entries(resolvedLinks)) {
      if (targets && targets[file.path]) {
        backlinks.push(src);
      }
    }
    return {
      path: file.path,
      title: file.basename,
      folder: file.parent?.path || "",
      tags: this.extractFileTags(file),
      outgoingLinks: outgoing,
      backlinksCount: backlinks.length,
      backlinks,
      frontmatter: fm,
      content,
      sizeBytes: file.stat?.size,
      mtimeMs: file.stat?.mtime,
    };
  }

  public async writeNote(opts: {
    path: string;
    content: string;
    mode?: "overwrite" | "create-only" | "append" | "prepend";
  }): Promise<{ path: string; created: boolean; bytes: number }> {
    const cleanPath = normalizeMdPath(opts.path);
    await this.ensureParentFolders(cleanPath);

    const existing = this.app.vault.getAbstractFileByPath(cleanPath);
    const mode = opts.mode || "overwrite";

    if (existing instanceof TFile) {
      if (mode === "create-only") {
        throw new Error(`Note already exists: "${cleanPath}"`);
      }
      let nextContent = opts.content;
      if (mode === "append") {
        const prev = await this.app.vault.read(existing);
        nextContent = prev.endsWith("\n")
          ? prev + opts.content
          : prev + "\n" + opts.content;
      } else if (mode === "prepend") {
        const prev = await this.app.vault.read(existing);
        nextContent = opts.content + "\n" + prev;
      }
      await this.app.vault.modify(existing, nextContent);
      return {
        path: cleanPath,
        created: false,
        bytes: nextContent.length,
      };
    }

    await this.app.vault.create(cleanPath, opts.content);
    return {
      path: cleanPath,
      created: true,
      bytes: opts.content.length,
    };
  }

  public async deleteNote(
    notePath: string
  ): Promise<{ deleted: boolean; path: string }> {
    const file = this.resolveNoteFile(notePath);
    if (!file) {
      throw new Error(`Note not found: "${notePath}"`);
    }
    await this.app.vault.trash(file, true);
    return { deleted: true, path: file.path };
  }

  public async moveNote(
    fromPath: string,
    toPath: string
  ): Promise<{ from: string; to: string }> {
    const file = this.resolveNoteFile(fromPath);
    if (!file) {
      throw new Error(`Source note not found: "${fromPath}"`);
    }
    const cleanTo = normalizeMdPath(toPath);
    await this.ensureParentFolders(cleanTo);
    await this.app.fileManager.renameFile(file, cleanTo);
    return { from: fromPath, to: cleanTo };
  }

  public async searchVault(opts: {
    query: string;
    limit?: number;
  }): Promise<SearchHit[]> {
    const q = opts.query.trim();
    const limit = Math.max(1, Math.min(200, opts.limit ?? 25));
    const mdFiles = this.app.vault.getMarkdownFiles();
    const resolver = buildMetadataResolver(this.app);
    const hasStructuredSyntax = /(?:^|\s)(?:tag:|path:|file:|\[|-|OR\s)/i.test(q);
    const compiled = hasStructuredSyntax ? parseGroupQuery(q) : null;
    const terms = q
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length >= 2 && !w.startsWith("tag:") && !w.startsWith("path:"));

    const hits: SearchHit[] = [];
    for (const file of mdFiles) {
      if (compiled && !compiled.matches(resolver(file.path, "file"))) {
        continue;
      }
      const content = await this.app.vault.cachedRead(file);
      const lower = content.toLowerCase();
      const titleLower = file.basename.toLowerCase();

      let score = compiled ? 5 : 0;
      const snippets: string[] = [];

      for (const term of terms) {
        if (titleLower.includes(term)) score += 10;
        let idx = lower.indexOf(term);
        let occ = 0;
        while (idx !== -1 && occ < 3) {
          score += 3;
          if (snippets.length < 2) {
            const start = Math.max(0, idx - 45);
            const end = Math.min(content.length, idx + term.length + 65);
            snippets.push(content.slice(start, end).replace(/\s+/g, " ").trim());
          }
          occ++;
          idx = lower.indexOf(term, idx + term.length);
        }
      }

      if (score > 0) {
        hits.push({
          path: file.path,
          title: file.basename,
          tags: this.extractFileTags(file),
          score,
          snippets,
        });
      }
    }

    hits.sort((a, b) => b.score - a.score);
    return hits.slice(0, limit);
  }

  public async getGraphTopology(): Promise<GraphTopologySnapshot> {
    const ctrls = this.host.getActiveControllers();
    const primaryCtrl = ctrls[0];
    const liveSnap = primaryCtrl ? primaryCtrl.getLiveGraphSnapshot() : null;
    const liveById = new Map(
      (liveSnap?.nodes || []).map((n) => [n.id, n])
    );

    const mdFiles = this.app.vault.getMarkdownFiles();
    const resolvedLinks = this.app.metadataCache.resolvedLinks || {};
    const degree = new Map<string, number>();
    const links: Array<{ source: string; target: string }> = [];

    for (const f of mdFiles) degree.set(f.path, 0);
    for (const [src, targets] of Object.entries(resolvedLinks)) {
      for (const dst of Object.keys(targets || {})) {
        links.push({ source: src, target: dst });
        degree.set(src, (degree.get(src) || 0) + 1);
        degree.set(dst, (degree.get(dst) || 0) + 1);
      }
    }

    const settings = this.host.getSettings();
    const nodes = mdFiles.map((f) => {
      const live = liveById.get(f.path);
      return {
        id: f.path,
        label: f.basename,
        type: "file",
        tags: this.extractFileTags(f),
        degree: degree.get(f.path) || 0,
        x: live?.x,
        y: live?.y,
        hardPinned:
          live?.hardPinned ?? Boolean(settings.pinnedNodes?.[f.path]),
        groups: live?.groups || [],
      };
    });

    const sortedByDeg = [...nodes].sort((a, b) => b.degree - a.degree);
    const topHubs = sortedByDeg
      .slice(0, 12)
      .map((n) => ({ id: n.id, degree: n.degree }));
    const orphanNotes = nodes.filter((n) => n.degree === 0).map((n) => n.id);

    return {
      isLiveGraphOpen: Boolean(primaryCtrl),
      totalNotes: mdFiles.length,
      totalLinks: links.length,
      nodes,
      links,
      topHubs,
      orphanNotes,
    };
  }

  public async focusGraphTarget(opts: {
    openGraphIfClosed?: boolean;
    notePath?: string;
    groupId?: string;
  }): Promise<{ focused: boolean; message: string }> {
    let ctrls = this.host.getActiveControllers();
    if (ctrls.length === 0 && opts.openGraphIfClosed !== false) {
      const leaf = this.app.workspace.getLeaf(false);
      if (leaf && typeof leaf.setViewState === "function") {
        await leaf.setViewState({ type: "graph", active: true });
      }
      ctrls = this.host.getActiveControllers();
    }

    const ctrl = ctrls[0];
    if (!ctrl) {
      return {
        focused: false,
        message: "No Graph View is currently open in Obsidian",
      };
    }

    if (opts.groupId) {
      const snap = ctrl.getLiveGraphSnapshot();
      const zone = snap.zones.find(
        (z) =>
          z.id === opts.groupId ||
          z.name.toLowerCase() === opts.groupId!.toLowerCase()
      );
      if (zone) {
        if (zone.frameRect) {
          ctrl.focusWorldRect(
            zone.frameRect.x,
            zone.frameRect.y,
            zone.frameRect.w,
            zone.frameRect.h
          );
        } else {
          ctrl.focusWorldRect(
            zone.centroidX - zone.radius,
            zone.centroidY - zone.radius,
            zone.radius * 2,
            zone.radius * 2
          );
        }
        return {
          focused: true,
          message: `Focused Graph View on "${zone.name}"`,
        };
      }
    }

    if (opts.notePath) {
      const file = this.resolveNoteFile(opts.notePath);
      const targetId = file?.path || opts.notePath;
      const snap = ctrl.getLiveGraphSnapshot();
      const node = snap.nodes.find((n) => n.id === targetId);
      if (node) {
        ctrl.focusWorldRect(node.x - 160, node.y - 120, 320, 240);
        return { focused: true, message: `Focused Graph View on "${targetId}"` };
      }
    }

    return { focused: true, message: "Graph View is active" };
  }

  public async getPluginSettings(): Promise<MagneticGroupsSettings> {
    return this.host.getSettings();
  }

  public async updatePluginSettings(
    patch: Partial<MagneticGroupsSettings>,
    reheat = true
  ): Promise<MagneticGroupsSettings> {
    await this.host.updateSettings(patch, reheat);
    return this.host.getSettings();
  }

  public async saveGroups(
    groups: MagneticGroup[],
    reheat = true
  ): Promise<MagneticGroup[]> {
    await this.host.saveGroups(groups, reheat);
    return this.host.getSettings().groups;
  }

  public async resolveMatchingNodeIds(group: {
    query?: string;
    nodeIds?: string[];
    excludedNodeIds?: string[];
  }): Promise<string[]> {
    const resolver = buildMetadataResolver(this.app);
    const compiled = group.query?.trim()
      ? parseGroupQuery(group.query)
      : null;
    const manual = new Set(group.nodeIds || []);
    const excluded = new Set(group.excludedNodeIds || []);

    const candidateIds = new Set<string>();
    for (const f of this.app.vault.getMarkdownFiles()) {
      candidateIds.add(f.path);
    }
    const ctrls = this.host.getActiveControllers();
    if (ctrls[0]) {
      for (const n of ctrls[0].getLiveGraphSnapshot().nodes) {
        candidateIds.add(n.id);
      }
    }

    const matched: string[] = [];
    for (const id of candidateIds) {
      if (excluded.has(id)) continue;
      if (manual.has(id)) {
        matched.push(id);
        continue;
      }
      if (compiled) {
        const type = id.startsWith("#") ? "tag" : "file";
        if (compiled.matches(resolver(id, type))) {
          matched.push(id);
        }
      }
    }
    return matched.sort();
  }

  private extractFileTags(file: TFile): string[] {
    const cache = this.app.metadataCache.getFileCache(file);
    if (!cache) return [];
    const raw = getAllTags(cache) || [];
    return Array.from(new Set(raw.map((t) => t.toLowerCase())));
  }

  private resolveNoteFile(notePath: string): TFile | null {
    const exact = this.app.vault.getAbstractFileByPath(notePath);
    if (exact instanceof TFile) return exact;
    const withMd = normalizeMdPath(notePath);
    const byMd = this.app.vault.getAbstractFileByPath(withMd);
    if (byMd instanceof TFile) return byMd;
    const byLink = this.app.metadataCache.getFirstLinkpathDest(
      notePath.replace(/\.md$/i, ""),
      ""
    );
    return byLink instanceof TFile ? byLink : null;
  }

  private async ensureParentFolders(filePath: string): Promise<void> {
    const parts = filePath.split("/");
    parts.pop();
    if (parts.length === 0) return;
    let cur = "";
    for (const p of parts) {
      cur = cur ? `${cur}/${p}` : p;
      const existing = this.app.vault.getAbstractFileByPath(cur);
      if (!existing && typeof this.app.vault.createFolder === "function") {
        try {
          await this.app.vault.createFolder(cur);
        } catch {
          // Folder may already exist
        }
      }
    }
  }
}

function normalizeMdPath(raw: string): string {
  const clean = raw.replace(/\\/g, "/").replace(/^\/+/, "").trim();
  return /\.md$/i.test(clean) ? clean : `${clean}.md`;
}
