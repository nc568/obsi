import {
  GroupLayoutMode,
  MagneticGroup,
  MagneticGroupsSettings,
  MiroSubLayout,
} from "../types";

export interface NoteSummary {
  path: string;
  title: string;
  folder: string;
  tags: string[];
  outgoingLinks: string[];
  backlinksCount: number;
  sizeBytes?: number;
  mtimeMs?: number;
}

export interface NoteDetail extends NoteSummary {
  content: string;
  frontmatter: Record<string, unknown>;
  backlinks: string[];
}

export interface SearchHit {
  path: string;
  title: string;
  tags: string[];
  score: number;
  snippets: string[];
}

export interface GraphTopologySnapshot {
  isLiveGraphOpen: boolean;
  totalNotes: number;
  totalLinks: number;
  nodes: Array<{
    id: string;
    label: string;
    type: string;
    tags: string[];
    degree: number;
    x?: number;
    y?: number;
    hardPinned: boolean;
    groups: string[];
  }>;
  links: Array<{ source: string; target: string }>;
  topHubs: Array<{ id: string; degree: number }>;
  orphanNotes: string[];
}

export interface VaultInfoSummary {
  vaultName: string;
  adapterMode: "obsidian-live" | "filesystem";
  noteCount: number;
  folderCount: number;
  folders: string[];
  tags: Array<{ tag: string; count: number }>;
  liveGraphViewsOpen: number;
  activeGroupsCount: number;
  miroFramesCount: number;
  pinnedNodesCount: number;
}

export interface VaultGraphAdapter {
  getVaultInfo(): Promise<VaultInfoSummary>;

  listNotes(opts?: {
    folder?: string;
    tag?: string;
    query?: string;
    limit?: number;
  }): Promise<NoteSummary[]>;

  readNote(notePath: string): Promise<NoteDetail>;

  writeNote(opts: {
    path: string;
    content: string;
    mode?: "overwrite" | "create-only" | "append" | "prepend";
  }): Promise<{ path: string; created: boolean; bytes: number }>;

  deleteNote(notePath: string): Promise<{ deleted: boolean; path: string }>;

  moveNote(
    fromPath: string,
    toPath: string
  ): Promise<{ from: string; to: string }>;

  searchVault(opts: {
    query: string;
    limit?: number;
  }): Promise<SearchHit[]>;

  getGraphTopology(): Promise<GraphTopologySnapshot>;

  focusGraphTarget(opts: {
    openGraphIfClosed?: boolean;
    notePath?: string;
    groupId?: string;
  }): Promise<{ focused: boolean; message: string }>;

  getPluginSettings(): Promise<MagneticGroupsSettings>;

  updatePluginSettings(
    patch: Partial<MagneticGroupsSettings>,
    reheat?: boolean
  ): Promise<MagneticGroupsSettings>;

  saveGroups(
    groups: MagneticGroup[],
    reheat?: boolean
  ): Promise<MagneticGroup[]>;

  resolveMatchingNodeIds(group: {
    query?: string;
    nodeIds?: string[];
    excludedNodeIds?: string[];
  }): Promise<string[]>;
}

export interface ArrangeMiroBoardItemInput {
  /** Existing group ID or name (if omitted, creates a new Miro Frame group) */
  groupIdOrName?: string;
  name?: string;
  color?: string;
  query?: string;
  nodeIds?: string[];
  mode?: GroupLayoutMode;
  subLayout?: MiroSubLayout;
}
