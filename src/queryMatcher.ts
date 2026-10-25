import { App, TFile, getAllTags } from "obsidian";
import {
  InternalGraphEngine,
  InternalGraphNode,
  MagneticGroup,
  NativeGraphColorGroup,
} from "./types";

export interface NodeMetadataProvider {
  getTagsForNode(nodeId: string, nodeType: string): string[];
  getFrontmatterForNode(nodeId: string): Record<string, unknown> | undefined;
}

export function createObsidianMetadataProvider(app: App): NodeMetadataProvider {
  return {
    getTagsForNode(nodeId: string, nodeType: string): string[] {
      if (nodeType === "tag" || nodeId.startsWith("#")) {
        return [nodeId.startsWith("#") ? nodeId.toLowerCase() : `#${nodeId.toLowerCase()}`];
      }
      const abstractFile = app.vault.getAbstractFileByPath(nodeId);
      if (abstractFile && abstractFile instanceof TFile) {
        const cache = app.metadataCache.getFileCache(abstractFile);
        if (!cache) return [];
        const raw = getAllTags(cache) || [];
        return raw.map((t) => (t.startsWith("#") ? t.toLowerCase() : `#${t.toLowerCase()}`));
      }
      return [];
    },
    getFrontmatterForNode(nodeId: string): Record<string, unknown> | undefined {
      const abstractFile = app.vault.getAbstractFileByPath(nodeId);
      if (abstractFile && abstractFile instanceof TFile) {
        return app.metadataCache.getFileCache(abstractFile)?.frontmatter as
          | Record<string, unknown>
          | undefined;
      }
      return undefined;
    },
  };
}

export function rgbIntToHex(rgb: number): string {
  const clamped = Math.max(0, Math.min(0xffffff, Math.floor(rgb || 0)));
  return "#" + clamped.toString(16).padStart(6, "0");
}

export function hexToRgbInt(hex: string): number {
  const clean = hex.trim().replace(/^#/, "");
  if (clean.length === 3) {
    const expanded = clean
      .split("")
      .map((c) => c + c)
      .join("");
    const parsed = parseInt(expanded, 16);
    return Number.isNaN(parsed) ? 0x7c5cff : parsed;
  }
  const parsed = parseInt(clean.slice(0, 6), 16);
  return Number.isNaN(parsed) ? 0x7c5cff : parsed;
}

/**
 * Tokenize a query string preserving quoted segments and bracketed [prop:val] expressions.
 */
function tokenizeQuery(query: string): string[] {
  const tokens: string[] = [];
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

function getBasename(nodeId: string): string {
  const slashIdx = nodeId.lastIndexOf("/");
  const filePart = slashIdx >= 0 ? nodeId.slice(slashIdx + 1) : nodeId;
  return filePart.endsWith(".md") ? filePart.slice(0, -3) : filePart;
}

function matchesSingleAtom(
  atom: string,
  nodeId: string,
  nodeType: string,
  meta: NodeMetadataProvider
): boolean {
  let negated = false;
  let expr = atom.trim();
  if (expr.startsWith("-") && expr.length > 1) {
    negated = true;
    expr = expr.slice(1).trim();
  }

  const result = evaluatePositiveAtom(expr, nodeId, nodeType, meta);
  return negated ? !result : result;
}

function evaluatePositiveAtom(
  expr: string,
  nodeId: string,
  nodeType: string,
  meta: NodeMetadataProvider
): boolean {
  if (!expr) return false;
  const lowerExpr = expr.toLowerCase();
  const lowerId = nodeId.toLowerCase();
  const basename = getBasename(nodeId).toLowerCase();

  // [property:value] or [property]
  if (expr.startsWith("[") && expr.endsWith("]")) {
    const inner = expr.slice(1, -1).trim();
    const fm = meta.getFrontmatterForNode(nodeId);
    if (!fm) return false;
    const colonIdx = inner.indexOf(":");
    if (colonIdx < 0) {
      const key = inner.trim().toLowerCase();
      return Object.keys(fm).some((k) => k.toLowerCase() === key && fm[k] != null && fm[k] !== "");
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

  // tag:#foo or #foo
  if (lowerExpr.startsWith("tag:") || lowerExpr.startsWith("#")) {
    const rawTag = lowerExpr.startsWith("tag:") ? lowerExpr.slice(4).trim() : lowerExpr;
    const targetTag = rawTag.startsWith("#") ? rawTag : `#${rawTag}`;
    const tags = meta.getTagsForNode(nodeId, nodeType);
    return tags.some((t) => t === targetTag || t.startsWith(`${targetTag}/`));
  }

  // path:Folder/Sub
  if (lowerExpr.startsWith("path:")) {
    const pathNeedle = lowerExpr.slice(5).trim().replace(/^\/+/, "");
    if (!pathNeedle) return false;
    return lowerId.includes(pathNeedle);
  }

  // file:Name
  if (lowerExpr.startsWith("file:")) {
    const fileNeedle = lowerExpr.slice(5).trim();
    if (!fileNeedle) return false;
    return basename.includes(fileNeedle) || lowerId.endsWith(`/${fileNeedle}.md`);
  }

  // Plain keyword fallback: matches note title, path, or tags
  if (basename.includes(lowerExpr) || lowerId.includes(lowerExpr)) {
    return true;
  }
  const tags = meta.getTagsForNode(nodeId, nodeType);
  return tags.some((t) => t.includes(lowerExpr));
}

/**
 * Evaluates an Obsidian-like query supporting `OR` and implicit `AND`.
 */
export function matchesGroupQuery(
  query: string,
  nodeId: string,
  nodeType: string,
  meta: NodeMetadataProvider
): boolean {
  const trimmed = query.trim();
  if (!trimmed) return false;

  const tokens = tokenizeQuery(trimmed);
  if (tokens.length === 0) return false;

  // Split tokens by case-insensitive "OR" into conjunctive (AND) clauses
  const orBranches: string[][] = [[]];
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
    const allMatch = andClause.every((atom) =>
      matchesSingleAtom(atom, nodeId, nodeType, meta)
    );
    if (allMatch) return true;
  }

  return false;
}

/**
 * Resolves whether a given graph node belongs to a MagneticGroup.
 */
export function nodeMatchesMagneticGroup(
  node: Pick<InternalGraphNode, "id" | "type">,
  group: MagneticGroup,
  meta: NodeMetadataProvider
): boolean {
  if (!group.enabled) return false;
  if (group.excludedNodeIds?.includes(node.id)) return false;
  if (group.nodeIds?.includes(node.id)) return true;
  if (group.query && group.query.trim().length > 0) {
    return matchesGroupQuery(group.query, node.id, node.type || "", meta);
  }
  return false;
}

/**
 * Extracts active native Color Groups from Obsidian's Graph Engine options
 * and converts them into transient MagneticGroup definitions (deduplicating queries).
 */
export function extractSyncedNativeGroups(
  engine: InternalGraphEngine | undefined,
  existingCustomGroups: MagneticGroup[]
): MagneticGroup[] {
  if (!engine) return [];
  const rawOpts =
    (typeof engine.getOptions === "function" ? engine.getOptions() : undefined) ||
    engine.options;
  const nativeGroups: NativeGraphColorGroup[] =
    rawOpts?.colorGroups || engine.searchQueries || [];

  if (!Array.isArray(nativeGroups) || nativeGroups.length === 0) return [];

  const existingQueries = new Set(
    existingCustomGroups
      .map((g) => g.query.trim().toLowerCase())
      .filter((q) => q.length > 0)
  );

  const synced: MagneticGroup[] = [];
  nativeGroups.forEach((ng, idx) => {
    const q = (ng?.query || "").trim();
    if (!q || existingQueries.has(q.toLowerCase())) return;
    existingQueries.add(q.toLowerCase());

    const hex = ng.color && typeof ng.color.rgb === "number" ? rgbIntToHex(ng.color.rgb) : "#7c5cff";
    synced.push({
      id: `__native_color_group_${idx}_${q}`,
      name: q,
      color: hex,
      enabled: true,
      query: q,
      nodeIds: [],
      excludedNodeIds: [],
      strength: 0.9,
      colorNodes: false, // Obsidian already colors native color groups!
      mode: "organic",
      anchorMode: "auto",
    });
  });

  return synced;
}

/* =========================================================================
 * Compiled Query & Metadata Resolver Helpers (used by GraphController & MCP)
 * ========================================================================= */

export interface NodeMatchMetadata {
  id: string;
  basename: string;
  path: string;
  tags: string[];
  frontmatter: Map<string, string[]> | Record<string, unknown>;
  isTagNode: boolean;
}

export function buildMetadataResolver(
  app: App
): (nodeId: string, nodeType: string) => NodeMatchMetadata {
  const provider = createObsidianMetadataProvider(app);
  return (nodeId: string, nodeType: string): NodeMatchMetadata => ({
    id: nodeId,
    basename: getBasename(nodeId),
    path: nodeId,
    tags: provider.getTagsForNode(nodeId, nodeType),
    frontmatter: provider.getFrontmatterForNode(nodeId) || {},
    isTagNode: nodeType === "tag" || nodeId.startsWith("#"),
  });
}

export function parseGroupQuery(query: string): {
  matches: (meta: NodeMatchMetadata) => boolean;
} {
  return {
    matches(meta: NodeMatchMetadata): boolean {
      const adapter: NodeMetadataProvider = {
        getTagsForNode: () =>
          meta.tags.map((t) =>
            t.startsWith("#") ? t.toLowerCase() : `#${t.toLowerCase()}`
          ),
        getFrontmatterForNode: () => {
          if (meta.frontmatter instanceof Map) {
            const obj: Record<string, unknown> = {};
            for (const [k, v] of meta.frontmatter.entries()) {
              obj[k] = v;
            }
            return obj;
          }
          return meta.frontmatter;
        },
      };
      return matchesGroupQuery(
        query,
        meta.id,
        meta.isTagNode ? "tag" : "file",
        adapter
      );
    },
  };
}
