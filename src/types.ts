import { ItemView, WorkspaceLeaf } from "obsidian";

export type GroupAnchorMode = "auto" | "manual";
export type PluginLanguage = "ru" | "en";

/**
 * - "organic": Soft magnetic lobe attached to the main cluster without tearing (Turn 1 default)
 * - "miro-free": Hard-fixed rectangular Miro Frame on the canvas; member nodes stay dynamically alive inside its walls!
 * - "miro-pinned": Hard-fixed rectangular Miro Board Frame; member nodes are hard-locked (fx/fy) in grid/column/row/circle/freeform while the rest of the graph remains dynamic around them!
 */
export type GroupLayoutMode = "organic" | "miro-free" | "miro-pinned";

export type MiroSubLayout = "grid" | "column" | "row" | "circle" | "freeform";

export interface MagneticGroup {
  id: string;
  name: string;
  color: string;
  enabled: boolean;
  /** Obsidian-style query: tag:#..., path:..., file:..., [prop:val], OR, -negation, or plain text */
  query: string;
  /** Explicitly included node IDs (file paths or tag IDs) */
  nodeIds: string[];
  /** Explicitly excluded node IDs */
  excludedNodeIds: string[];
  /** Per-group strength multiplier (0.2 .. 2.0) */
  strength: number;
  /** Whether to tint member nodes in the group color */
  colorNodes: boolean;
  /** Layout behavior: organic lobe vs Miro live frame vs Miro hard-pinned board */
  mode: GroupLayoutMode;
  /** Automatic organic lobe vs user-dragged directional anchor (used when mode === "organic") */
  anchorMode: GroupAnchorMode;
  anchorX?: number;
  anchorY?: number;
  /** Miro Frame top-left X in graph world coordinates */
  frameX?: number;
  /** Miro Frame top-left Y in graph world coordinates */
  frameY?: number;
  /** Miro Frame width in graph world coordinates */
  frameW?: number;
  /** Miro Frame height in graph world coordinates */
  frameH?: number;
  /** Arrangement of nodes inside a Miro Frame */
  frameSubLayout?: MiroSubLayout;
  /** Custom relative offsets (dx, dy from frame top-left) when user drags individual pinned cards inside a Miro Frame */
  customOffsets?: Record<string, { dx: number; dy: number }>;
}

export interface PinnedNodePosition {
  x: number;
  y: number;
}

export interface MagneticGroupsSettings {
  enabled: boolean;
  enableLocalGraph: boolean;
  syncNativeColorGroups: boolean;
  /** Overall attraction pull toward group pocket (0 .. 1) */
  attractionStrength: number;
  /** Elastic leash keeping organic groups attached to the main cluster without tearing (0 .. 1) */
  clusterTether: number;
  /** Comfort density / compactness inside each group (0.2 .. 1) */
  groupCompactness: number;
  /** Draw translucent smooth hull zones / Miro frames */
  showGroupZones: boolean;
  /** Show interactive draggable group pills / Miro headers on the graph */
  showGroupLabels: boolean;
  /** Draw subtle elastic tether lines to bridge nodes on hover/drag */
  showTetherLines: boolean;
  /** Show subtle Miro-style dot grid on the graph canvas */
  showBoardGrid: boolean;
  /** Gently push ungrouped dynamic nodes out of Miro Frame rectangles so frames stay clean */
  repelOutsidersFromFrames: boolean;
  /** Opacity of group zones (0.04 .. 0.35) */
  zoneOpacity: number;
  /** Hold Shift + Drag on empty graph space to lasso nodes into a group */
  shiftDragLasso: boolean;
  /** Collapsed state of the in-graph controls section */
  sectionCollapsed: boolean;
  language: PluginLanguage;
  groups: MagneticGroup[];
  /** Individual nodes hard-pinned on the graph board outside frames */
  pinnedNodes: Record<string, PinnedNodePosition>;

  /* === Embedded MCP Server & Cloudflare Quick Tunnel Settings === */
  mcpEnabled: boolean;
  mcpPort: number;
  mcpHost: string;
  mcpUseAuthToken: boolean;
  mcpAuthToken: string;
  mcpAutoStartTunnel: boolean;
  mcpCloudflaredPath: string;
}

export const DEFAULT_GROUP_COLORS = [
  "#7c5cff",
  "#ff6b6b",
  "#2ec4b6",
  "#ffbe0b",
  "#3a86ff",
  "#ff70a6",
  "#06d6a0",
  "#fb8500",
];

export function generateRandomToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "obs_";
  for (let i = 0; i < 24; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export const DEFAULT_SETTINGS: MagneticGroupsSettings = {
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
  mcpCloudflaredPath: "",
};

/* =========================================================================
 * Obsidian Internal Graph View Interfaces (verified against Obsidian 1.14.x)
 * ========================================================================= */

export interface GraphColorAttributes {
  a: number;
  rgb: number;
}

export interface NativeGraphColorGroup {
  query: string;
  color: GraphColorAttributes;
}

export interface InternalGraphNode {
  id: string;
  type: string;
  x: number;
  y: number;
  fx: number | null;
  fy: number | null;
  weight?: number;
  color?: GraphColorAttributes | null;
  circle?: {
    getGlobalPosition?: () => { x: number; y: number };
    tint?: number;
  } | null;
  text?: {
    alpha?: number;
  } | null;
  forward?: Record<string, InternalGraphLink>;
  reverse?: Record<string, InternalGraphLink>;
  getDisplayText?: () => string;
  getFillColor?: () => GraphColorAttributes;
  getSize?: () => number;
  __gmgOrigColorSaved?: boolean;
  __gmgOrigColor?: GraphColorAttributes | null | undefined;
}

export interface InternalGraphLink {
  source: InternalGraphNode;
  target: InternalGraphNode;
}

export interface InternalGraphRenderer {
  containerEl: HTMLElement;
  interactiveEl: HTMLCanvasElement & { win?: Window };
  hanger?: {
    x?: number;
    y?: number;
    scale?: { x: number; y: number };
    worldTransform?: {
      a: number;
      b: number;
      c: number;
      d: number;
      tx: number;
      ty: number;
    };
  };
  px?: {
    renderer?: {
      resolution?: number;
    };
    stage?: unknown;
  };
  nodes: InternalGraphNode[];
  nodeLookup?: Record<string, InternalGraphNode>;
  links: InternalGraphLink[];
  dragNode: InternalGraphNode | null;
  highlightNode: InternalGraphNode | null;
  panX: number;
  panY: number;
  scale: number;
  targetScale?: number;
  width: number;
  height: number;
  idleFrames: number;
  worker: {
    postMessage: (msg: unknown) => void;
    __gmgOriginalPostMessage?: (msg: unknown) => void;
  };
  changed: () => void;
  queueRender?: () => void;
  setPan?: (panX: number, panY: number) => void;
  setScale?: (scale: number) => void;
  renderCallback: () => void;
  setData: (data: InternalGraphData) => void;
  onNodeRightClick?: (evt: MouseEvent, id: string, type: string) => void;
}

export interface InternalGraphData {
  nodes: Record<
    string,
    {
      type: string;
      links: Record<string, boolean>;
      color?: GraphColorAttributes;
    }
  >;
  numLinks: number;
}

export interface InternalGraphEngine {
  controlsEl?: HTMLElement;
  options?: {
    colorGroups?: NativeGraphColorGroup[];
    linkDistance?: number;
    linkStrength?: number;
    repelStrength?: number;
    centerStrength?: number;
    search?: string;
    [key: string]: unknown;
  };
  searchQueries?: NativeGraphColorGroup[];
  getOptions?: () => {
    colorGroups?: NativeGraphColorGroup[];
    linkDistance?: number;
    [key: string]: unknown;
  };
  setOptions?: (opts: Record<string, unknown>) => void;
  render?: () => void;
}

export interface InternalGraphView extends ItemView {
  renderer: InternalGraphRenderer;
  dataEngine?: InternalGraphEngine;
  engine?: InternalGraphEngine;
}

export type GraphWorkspaceLeaf = WorkspaceLeaf & {
  view: InternalGraphView;
};
