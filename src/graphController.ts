import { App, Menu, Notice } from "obsidian";
import { t } from "./i18n";
import {
  MIRO_HEADER_HEIGHT,
  MIRO_MIN_HEIGHT,
  MIRO_MIN_WIDTH,
   PhysicsStepOutput,
  SimEdge,
  SimPoint,
  clamp,
  computeDefaultMiroFrame,
  computeMagneticStep,
  createGroupId,
  EffectiveGroupSpec,
  GroupZoneRenderInfo,
} from "./physicsEngine";
import { buildMetadataResolver, parseGroupQuery } from "./queryMatcher";
import {
  DEFAULT_GROUP_COLORS,
  GraphColorAttributes,
  GroupLayoutMode,
  InternalGraphData,
  InternalGraphEngine,
  InternalGraphNode,
  InternalGraphRenderer,
  InternalGraphView,
  MagneticGroup,
  MagneticGroupsSettings,
  MiroSubLayout,
  NativeGraphColorGroup,
} from "./types";
import { GraphControlsSection } from "./ui/controlsPanel";
import { CandidateGraphNode, GroupEditorModal } from "./ui/groupModal";

export interface GraphControllerHost {
  app: App;
  getSettings: () => MagneticGroupsSettings;
  updateSettings: (
    patch: Partial<MagneticGroupsSettings>,
    reheat?: boolean
  ) => Promise<void>;
  saveGroups: (groups: MagneticGroup[], reheat?: boolean) => Promise<void>;
}

interface BadgeDomRecord {
  el: HTMLElement;
  kind: "organic" | "miro";
  nameSpan: HTMLElement;
  countSpan: HTMLElement;
  modeChipEl?: HTMLElement;
  pinSpan?: HTMLElement;
  resizerEl?: HTMLElement;
}

export class GraphViewController {
  public readonly view: InternalGraphView;
  private host: GraphControllerHost;

  private overlayCanvas: HTMLCanvasElement | null = null;
  private badgeLayerEl: HTMLElement | null = null;
  private lassoBannerEl: HTMLElement | null = null;
  private controlsSection: GraphControlsSection | null = null;

  private origRenderCallback: (() => void) | null = null;
  private origSetData: ((data: InternalGraphData) => void) | null = null;
  private origOnNodeRightClick:
    | ((evt: MouseEvent, id: string, type: string) => void)
    | null = null;
  private origWorkerPostMessage: ((msg: unknown) => void) | null = null;

  private badgeMap = new Map<string, BadgeDomRecord>();
  private hoveredGroupId: string | null = null;
  private draggingGroupId: string | null = null;
  private resizingGroupId: string | null = null;

  private cachedSpecs: EffectiveGroupSpec[] = [];
  private groupCounts = new Map<string, number>();
  private membershipDirty = true;
  private lastNativeGroupSig = "";
  private lastKnownNodeCount = 0;
  private boostFramesRemaining = 90;
  private lastZones: GroupZoneRenderInfo[] = [];

  /** Tracks exact worker forceNode pins currently enforced by our plugin */
  private enforcedPins = new Map<string, { x: number; y: number }>();
  private lastDraggedPos = new Map<string, { x: number; y: number }>();

  // Lasso state
  private lassoArmed = false;
  private lassoDrawing = false;
  private lassoPointsCss: Array<{ x: number; y: number }> = [];

  private cleanupFns: Array<() => void> = [];
  private destroyed = false;

  constructor(view: InternalGraphView, host: GraphControllerHost) {
    this.view = view;
    this.host = host;
    this.attach();
  }

  private get renderer(): InternalGraphRenderer | undefined {
    return this.view?.renderer;
  }

  private get engine(): InternalGraphEngine | undefined {
    return this.view?.dataEngine || this.view?.engine;
  }

  private rawPostToWorker(msg: unknown): void {
    if (this.origWorkerPostMessage) {
      this.origWorkerPostMessage(msg);
    } else {
      this.renderer?.worker?.postMessage(msg);
    }
  }

  private attach(): void {
    const renderer = this.renderer;
    if (!renderer || !renderer.interactiveEl) return;

    const canvasParent =
      renderer.interactiveEl.parentElement || renderer.containerEl;
    if (!canvasParent) return;

    const pos = getComputedStyle(canvasParent).position;
    if (pos === "static") {
      canvasParent.style.position = "relative";
    }

    // 1. Create overlay canvas for Miro board grid, frames, organic hulls, pin rings & lasso
    this.overlayCanvas = document.createElement("canvas");
    this.overlayCanvas.className = "gmg-overlay-canvas";
    canvasParent.insertBefore(
      this.overlayCanvas,
      renderer.interactiveEl.nextSibling
    );

    // 2. Insert badge layer right after overlayCanvas (before .graph-controls so .graph-controls always sits cleanly above canvas badges!)
    this.badgeLayerEl = document.createElement("div");
    this.badgeLayerEl.className = "gmg-badge-layer";
    canvasParent.insertBefore(
      this.badgeLayerEl,
      this.overlayCanvas.nextSibling
    );

    // 3. Inject section into Obsidian's native .graph-controls panel + floating bar
    const graphControlsEl =
      this.engine?.controlsEl ||
      (this.view.contentEl.querySelector(".graph-controls") as HTMLElement | null);

    this.controlsSection = new GraphControlsSection(
      graphControlsEl,
      canvasParent,
      {
        getSettings: () => this.host.getSettings(),
        getGroupNodeCounts: () => this.groupCounts,
        isLassoActive: () => this.lassoArmed,
        onUpdateSettings: (patch, reheat) => {
          void this.host.updateSettings(patch, reheat);
        },
        onCreateGroup: (initialMode) => this.openGroupModal(undefined, undefined, initialMode),
        onEditGroup: (grp) => this.openGroupModal(grp),
        onToggleGroup: (id) => void this.toggleGroup(id),
        onCycleGroupMode: (id) => void this.cycleGroupMode(id),
        onResetGroupAnchor: (id) => void this.resetGroupAnchor(id),
        onDeleteGroup: (id) => void this.deleteGroup(id),
        onUnpinAllIndividualNodes: () => void this.unpinAllIndividualNodes(),
        onToggleLasso: () => this.setLassoArmed(!this.lassoArmed),
        onReheat: () => this.reheatSimulation(120),
      }
    );

    // 4. Wrap worker.postMessage so user dragging a hard-pinned node updates its pinned spot instead of unpinning on release!
    this.wrapWorker(renderer);

    // 5. Wrap renderer.renderCallback & setData & onNodeRightClick
    this.origRenderCallback = renderer.renderCallback.bind(renderer);
    renderer.renderCallback = () => {
      if (this.origRenderCallback) {
        this.origRenderCallback();
      }
      if (!this.destroyed) {
        this.onFrame();
      }
    };

    if (typeof renderer.setData === "function") {
      this.origSetData = renderer.setData.bind(renderer);
      renderer.setData = (data: InternalGraphData) => {
        if (this.origSetData) {
          this.origSetData(data);
        }
        // Graph worker reset its node set on setData; re-apply hard pins on next frame!
        this.enforcedPins.clear();
        this.markDirtyAndReheat(85);
      };
    }

    if (typeof renderer.onNodeRightClick === "function") {
      this.origOnNodeRightClick = renderer.onNodeRightClick.bind(renderer);
      renderer.onNodeRightClick = (
        evt: MouseEvent,
        id: string,
        type: string
      ) => {
        if (this.origOnNodeRightClick) {
          this.origOnNodeRightClick(evt, id, type);
        }
        setTimeout(() => this.showNodeQuickMenu(evt, id), 20);
      };
    } else {
      const onCtx = (evt: MouseEvent) => {
        const hit = this.findNodeAtCssPoint(evt);
        if (hit && (evt.shiftKey || evt.altKey)) {
          evt.preventDefault();
          evt.stopPropagation();
          this.showNodeQuickMenu(evt, hit.id);
        }
      };
      renderer.interactiveEl.addEventListener("contextmenu", onCtx);
      this.cleanupFns.push(() =>
        renderer.interactiveEl.removeEventListener("contextmenu", onCtx)
      );
    }

    // 6. Attach Lasso pointer events
    this.setupLassoEvents(renderer.interactiveEl, canvasParent);

    this.markDirtyAndReheat(100);
  }

  private wrapWorker(renderer: InternalGraphRenderer): void {
    if (!renderer.worker || typeof renderer.worker.postMessage !== "function") {
      return;
    }
    const rawPost = renderer.worker.postMessage.bind(renderer.worker);
    this.origWorkerPostMessage = rawPost;

    renderer.worker.postMessage = (msg: unknown) => {
      if (
        !this.destroyed &&
        msg &&
        typeof msg === "object" &&
        "forceNode" in (msg as Record<string, unknown>)
      ) {
        const fn = (msg as {
          forceNode?: { id?: string; x?: number | null; y?: number | null };
        }).forceNode;

        if (fn && typeof fn.id === "string") {
          if (typeof fn.x === "number" && typeof fn.y === "number") {
            this.lastDraggedPos.set(fn.id, { x: fn.x, y: fn.y });
            rawPost(msg);
            return;
          }
          if (fn.x === null && fn.y === null) {
            // User finished dragging fn.id! Check if fn.id is hard-pinned individually or inside a miro-pinned frame
            const handled = this.handlePinnedNodeDragRelease(fn.id);
            if (handled) {
              return;
            }
          }
        }
      }
      rawPost(msg);
    };
  }

  private handlePinnedNodeDragRelease(nodeId: string): boolean {
    const settings = this.host.getSettings();
    if (!settings.enabled) return false;

    const nodeObj = this.findRendererNode(nodeId);
    const dragged = this.lastDraggedPos.get(nodeId);
    const finalX = dragged?.x ?? nodeObj?.x;
    const finalY = dragged?.y ?? nodeObj?.y;
    this.lastDraggedPos.delete(nodeId);

    if (typeof finalX !== "number" || typeof finalY !== "number") {
      return false;
    }

    // Case 1: Node belongs to an enabled "miro-pinned" group -> save custom freeform offset inside that Miro frame!
    for (const spec of this.cachedSpecs) {
      if (spec.mode === "miro-pinned" && spec.memberIds.has(nodeId)) {
        const grp = settings.groups.find((g) => g.id === spec.id);
        const zone = this.lastZones.find((z) => z.id === spec.id);
        if (grp && zone?.frameRect) {
          const rect = zone.frameRect;
          const clampedX = clamp(finalX, rect.x + 22, rect.x + rect.w - 22);
          const clampedY = clamp(
            finalY,
            rect.y + MIRO_HEADER_HEIGHT + 18,
            rect.y + rect.h - 18
          );

          // Snapshot all current member offsets so existing cards don't jump when switching to freeform!
          const nextOffsets: Record<string, { dx: number; dy: number }> = {
            ...(grp.customOffsets || {}),
          };
          for (const memberId of spec.memberIds) {
            const existingPin = this.enforcedPins.get(memberId);
            const mNode = this.findRendererNode(memberId);
            const mx = existingPin?.x ?? mNode?.x ?? rect.x + rect.w / 2;
            const my = existingPin?.y ?? mNode?.y ?? rect.y + rect.h / 2;
            nextOffsets[memberId] = {
              dx: mx - rect.x,
              dy: my - rect.y,
            };
          }
          nextOffsets[nodeId] = {
            dx: clampedX - rect.x,
            dy: clampedY - rect.y,
          };

          const updatedGroups = settings.groups.map((g) =>
            g.id === grp.id
              ? {
                  ...g,
                  frameX: rect.x,
                  frameY: rect.y,
                  frameW: rect.w,
                  frameH: rect.h,
                  frameSubLayout: "freeform" as MiroSubLayout,
                  customOffsets: nextOffsets,
                }
              : g
          );

          if (nodeObj) {
            nodeObj.x = clampedX;
            nodeObj.y = clampedY;
            nodeObj.fx = clampedX;
            nodeObj.fy = clampedY;
          }
          this.enforcedPins.set(nodeId, { x: clampedX, y: clampedY });
          this.rawPostToWorker({
            forceNode: { id: nodeId, x: clampedX, y: clampedY },
          });
          this.membershipDirty = true;
          void this.host.saveGroups(updatedGroups, false);
          this.reheatSimulation(45);
          return true;
        }
      }
    }

    // Case 2: Node is individually pinned on the board -> update its board pin coordinates!
    if (settings.pinnedNodes && settings.pinnedNodes[nodeId]) {
      const nextPins = {
        ...settings.pinnedNodes,
        [nodeId]: { x: Math.round(finalX * 10) / 10, y: Math.round(finalY * 10) / 10 },
      };
      if (nodeObj) {
        nodeObj.x = finalX;
        nodeObj.y = finalY;
        nodeObj.fx = finalX;
        nodeObj.fy = finalY;
      }
      this.enforcedPins.set(nodeId, { x: finalX, y: finalY });
      this.rawPostToWorker({
        forceNode: { id: nodeId, x: finalX, y: finalY },
      });
      void this.host.updateSettings({ pinnedNodes: nextPins }, false);
      this.reheatSimulation(45);
      return true;
    }

    return false;
  }

  private findRendererNode(id: string): InternalGraphNode | undefined {
    const r = this.renderer;
    if (!r) return undefined;
    if (r.nodeLookup && r.nodeLookup[id]) return r.nodeLookup[id];
    return r.nodes?.find((n) => n.id === id);
  }

  public markDirtyAndReheat(boostFrames = 90): void {
    this.membershipDirty = true;
    this.reheatSimulation(boostFrames);
    this.controlsSection?.render();
  }

  public reheatSimulation(boostFrames = 90): void {
    this.boostFramesRemaining = Math.max(
      this.boostFramesRemaining,
      boostFrames
    );
    const renderer = this.renderer;
    if (!renderer) return;
    renderer.idleFrames = 0;
    try {
      this.rawPostToWorker({ alpha: 0.45, run: true });
    } catch {
      // Safe fallback
    }
    renderer.changed();
  }

  /**
   * Main per-frame hook invoked right after Obsidian renders the WebGL/Pixi graph.
   */
  private onFrame(): void {
    const renderer = this.renderer;
    if (!renderer || !this.overlayCanvas) return;

    const settings = this.host.getSettings();
    const nodes = renderer.nodes || [];

    if (!settings.enabled) {
      this.releaseAllEnforcedPins();
      this.restoreNodeColors(nodes);
      this.clearOverlay();
      this.syncBadges([]);
      return;
    }

    if (nodes.length === 0 && settings.groups.length === 0) {
      this.clearOverlay();
      this.syncBadges([]);
      return;
    }

    const nativeSig = settings.syncNativeColorGroups
      ? this.readNativeGroupsSignature()
      : "";
    if (
      this.membershipDirty ||
      nodes.length !== this.lastKnownNodeCount ||
      nativeSig !== this.lastNativeGroupSig
    ) {
      this.rebuildEffectiveGroups(nodes, settings);
      this.lastKnownNodeCount = nodes.length;
      this.lastNativeGroupSig = nativeSig;
      this.membershipDirty = false;
      this.controlsSection?.refreshGroupList();
    }

    this.applyNodeColors(nodes, settings);

    const draggedId = renderer.dragNode?.id || null;
    const simNodes: SimPoint[] = nodes.map((n) => ({
      id: n.id,
      x: Number.isFinite(n.x) ? n.x : 0,
      y: Number.isFinite(n.y) ? n.y : 0,
      pinned: n.id === draggedId,
    }));

    const simEdges: SimEdge[] = (renderer.links || [])
      .filter((l) => l.source && l.target)
      .map((l) => ({
        source: l.source.id,
        target: l.target.id,
      }));

    const linkDist = this.readNativeLinkDistance();
    const step: PhysicsStepOutput = computeMagneticStep(
      simNodes,
      simEdges,
      this.cachedSpecs,
      {
        attractionStrength: settings.attractionStrength,
        clusterTether: settings.clusterTether,
        groupCompactness: settings.groupCompactness,
        nativeLinkDistance: linkDist,
        repelOutsidersFromFrames: settings.repelOutsidersFromFrames,
        pinnedNodes: settings.pinnedNodes,
      }
    );

    this.lastZones = step.zones;

    // 1. Enforce exact fx/fy hard pins for Miro-pinned frames & individual pinned nodes!
    this.syncWorkerHardPins(nodes, step.hardPinnedTargets, draggedId);

    // 2. Apply smooth organic & Miro-free soft forces to dynamic nodes
    const simIsActive =
      (renderer.idleFrames ?? 0) < 55 ||
      this.boostFramesRemaining > 0 ||
      this.draggingGroupId !== null ||
      this.resizingGroupId !== null ||
      draggedId !== null;

    if (simIsActive && step.displacements.size > 0 && nodes.length > 0) {
      const damping =
        this.boostFramesRemaining > 0 ||
        this.draggingGroupId !== null ||
        this.resizingGroupId !== null
          ? 1.0
          : Math.max(0.2, 1 - (renderer.idleFrames ?? 0) / 60);

      const workerNodesPayload: Record<string, [number, number]> = {};
      let movedAny = false;

      for (const n of nodes) {
        const hardPin = step.hardPinnedTargets.get(n.id);
        if (hardPin && n.id !== draggedId) {
          n.x = hardPin.x;
          n.y = hardPin.y;
          workerNodesPayload[n.id] = [hardPin.x, hardPin.y];
          continue;
        }
        const d = step.displacements.get(n.id);
        if (d && n.id !== draggedId) {
          n.x += d.dx * damping;
          n.y += d.dy * damping;
          movedAny = true;
        }
        workerNodesPayload[n.id] = [n.x, n.y];
      }

      if (movedAny) {
        try {
          this.rawPostToWorker({ nodes: workerNodesPayload });
        } catch {
          // Safe fallback
        }
        if (
          this.boostFramesRemaining > 0 ||
          this.draggingGroupId !== null ||
          this.resizingGroupId !== null
        ) {
          renderer.idleFrames = 0;
          renderer.changed();
        }
      }
    }

    if (this.boostFramesRemaining > 0) {
      this.boostFramesRemaining--;
    }

    // 3. Draw Miro board grid, Miro Frames, organic hulls, pin indicators, and Lasso
    this.drawOverlay(step.zones, nodes, settings);

    // 4. Sync interactive Miro headers, resize handles, and organic pills
    if (settings.showGroupLabels) {
      this.syncBadges(step.zones);
    } else {
      this.syncBadges([]);
    }
  }

  private syncWorkerHardPins(
    nodes: InternalGraphNode[],
    hardPinnedTargets: Map<string, { x: number; y: number }>,
    draggedId: string | null
  ): void {
    const nodeById = new Map<string, InternalGraphNode>();
    for (const n of nodes) nodeById.set(n.id, n);

    let changedAny = false;

    // Release pins that are no longer hard-pinned
    for (const prevId of Array.from(this.enforcedPins.keys())) {
      if (!hardPinnedTargets.has(prevId)) {
        const n = nodeById.get(prevId);
        if (n) {
          n.fx = null;
          n.fy = null;
        }
        try {
          this.rawPostToWorker({
            forceNode: { id: prevId, x: null, y: null },
          });
        } catch {
          // ignore
        }
        this.enforcedPins.delete(prevId);
        changedAny = true;
      }
    }

    // Enforce active hard pins
    for (const [id, target] of hardPinnedTargets.entries()) {
      if (id === draggedId) continue;
      const n = nodeById.get(id);
      if (!n) continue;

      const prev = this.enforcedPins.get(id);
      const driftFromTarget = Math.hypot((n.x ?? 0) - target.x, (n.y ?? 0) - target.y);

      n.x = target.x;
      n.y = target.y;
      n.fx = target.x;
      n.fy = target.y;

      if (
        !prev ||
        Math.hypot(prev.x - target.x, prev.y - target.y) > 0.2 ||
        driftFromTarget > 0.5
      ) {
        try {
          this.rawPostToWorker({
            forceNode: { id, x: target.x, y: target.y },
          });
        } catch {
          // ignore
        }
        this.enforcedPins.set(id, { x: target.x, y: target.y });
        changedAny = true;
      }
    }

    if (changedAny && this.renderer) {
      this.renderer.idleFrames = 0;
      this.renderer.changed();
    }
  }

  private releaseAllEnforcedPins(): void {
    if (this.enforcedPins.size === 0) return;
    const renderer = this.renderer;
    for (const id of this.enforcedPins.keys()) {
      const n = this.findRendererNode(id);
      if (n) {
        n.fx = null;
        n.fy = null;
      }
      try {
        this.rawPostToWorker({ forceNode: { id, x: null, y: null } });
      } catch {
        // ignore
      }
    }
    this.enforcedPins.clear();
    if (renderer) {
      renderer.idleFrames = 0;
      renderer.changed();
    }
  }

  private rebuildEffectiveGroups(
    nodes: InternalGraphNode[],
    settings: MagneticGroupsSettings
  ): void {
    const resolver = buildMetadataResolver(this.host.app);
    const specs: EffectiveGroupSpec[] = [];
    this.groupCounts.clear();

    for (const grp of settings.groups) {
      const compiled = grp.query.trim() ? parseGroupQuery(grp.query) : null;
      const manualSet = new Set(grp.nodeIds || []);
      const excludedSet = new Set(grp.excludedNodeIds || []);
      const matched = new Set<string>();

      for (const n of nodes) {
        if (excludedSet.has(n.id)) continue;
        if (manualSet.has(n.id)) {
          matched.add(n.id);
          continue;
        }
        if (compiled) {
          const meta = resolver(n.id, n.type || "");
          if (compiled.matches(meta)) {
            matched.add(n.id);
          }
        }
      }

      this.groupCounts.set(grp.id, matched.size);

      if (grp.enabled) {
        specs.push({
          id: grp.id,
          name: grp.name,
          color: grp.color,
          memberIds: matched,
          strength: grp.strength,
          mode: grp.mode || "organic",
          anchorMode: grp.anchorMode || "auto",
          anchorX: grp.anchorX,
          anchorY: grp.anchorY,
          frameX: grp.frameX,
          frameY: grp.frameY,
          frameW: grp.frameW,
          frameH: grp.frameH,
          frameSubLayout: grp.frameSubLayout || "grid",
          customOffsets: grp.customOffsets,
          isNative: false,
        });
      }
    }

    if (settings.syncNativeColorGroups) {
      const nativeGroups = this.readNativeColorGroups();
      nativeGroups.forEach((ng, idx) => {
        const q = (ng.query || "").trim();
        if (!q) return;
        const alreadyCovered = settings.groups.some(
          (g) => g.enabled && g.query.trim().toLowerCase() === q.toLowerCase()
        );
        if (alreadyCovered) return;

        const compiled = parseGroupQuery(q);
        const matched = new Set<string>();
        for (const n of nodes) {
          if (compiled.matches(resolver(n.id, n.type || ""))) {
            matched.add(n.id);
          }
        }
        if (matched.size >= 2) {
          const hex = rgbIntToHex(ng.color?.rgb ?? 0x7c5cff);
          specs.push({
            id: `native-${idx}-${q}`,
            name: q.length > 22 ? q.slice(0, 20) + "…" : q,
            color: hex,
            memberIds: matched,
            strength: 0.85,
            mode: "organic",
            anchorMode: "auto",
            isNative: true,
          });
        }
      });
    }

    this.cachedSpecs = specs;
  }

  private applyNodeColors(
    nodes: InternalGraphNode[],
    settings: MagneticGroupsSettings
  ): void {
    const colorByNode = new Map<string, GraphColorAttributes>();
    for (const grp of settings.groups) {
      if (!grp.enabled || !grp.colorNodes) continue;
      const spec = this.cachedSpecs.find((s) => s.id === grp.id);
      if (!spec) continue;
      const rgb = hexToRgbInt(grp.color);
      for (const id of spec.memberIds) {
        if (!colorByNode.has(id)) {
          colorByNode.set(id, { a: 1, rgb });
        }
      }
    }

    for (const n of nodes) {
      const desired = colorByNode.get(n.id);
      if (desired) {
        if (!n.__gmgOrigColorSaved) {
          n.__gmgOrigColor = n.color;
          n.__gmgOrigColorSaved = true;
        }
        n.color = desired;
        if (n.circle && typeof n.circle.tint === "number") {
          n.circle.tint = desired.rgb;
        }
      } else if (n.__gmgOrigColorSaved) {
        n.color = n.__gmgOrigColor ?? null;
        n.__gmgOrigColorSaved = false;
        delete n.__gmgOrigColor;
      }
    }
  }

  private restoreNodeColors(nodes: InternalGraphNode[]): void {
    for (const n of nodes) {
      if (n.__gmgOrigColorSaved) {
        n.color = n.__gmgOrigColor ?? null;
        n.__gmgOrigColorSaved = false;
        delete n.__gmgOrigColor;
      }
    }
  }

  /* =========================================================================
   * Coordinate Transforms (World <-> CSS Pixels)
   * ========================================================================= */

  private getTransformParams(): {
    scaleX: number;
    scaleY: number;
    tx: number;
    ty: number;
  } {
    const r = this.renderer!;
    const win = r.interactiveEl?.win || window;
    const dpr = r.px?.renderer?.resolution || win.devicePixelRatio || 1;
    const wt = r.hanger?.worldTransform;
    if (wt && Number.isFinite(wt.a) && wt.a !== 0) {
      return {
        scaleX: wt.a / dpr,
        scaleY: wt.d / dpr,
        tx: wt.tx / dpr,
        ty: wt.ty / dpr,
      };
    }
    return {
      scaleX: (r.scale || 1) / dpr,
      scaleY: (r.scale || 1) / dpr,
      tx: (r.panX || 0) / dpr,
      ty: (r.panY || 0) / dpr,
    };
  }

  public worldToCss(wx: number, wy: number): { x: number; y: number } {
    const { scaleX, scaleY, tx, ty } = this.getTransformParams();
    return {
      x: wx * scaleX + tx,
      y: wy * scaleY + ty,
    };
  }

  public cssToWorld(cx: number, cy: number): { x: number; y: number } {
    const { scaleX, scaleY, tx, ty } = this.getTransformParams();
    return {
      x: (cx - tx) / (scaleX || 1),
      y: (cy - ty) / (scaleY || 1),
    };
  }

  /* =========================================================================
   * Canvas Overlay Rendering (Miro Grid + Miro Frames + Hulls + Pins + Lasso)
   * ========================================================================= */

  private clearOverlay(): void {
    if (!this.overlayCanvas) return;
    const ctx = this.overlayCanvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(
        0,
        0,
        this.overlayCanvas.width,
        this.overlayCanvas.height
      );
    }
  }

  private drawOverlay(
    zones: GroupZoneRenderInfo[],
    nodes: InternalGraphNode[],
    settings: MagneticGroupsSettings
  ): void {
    const canvas = this.overlayCanvas;
    const renderer = this.renderer;
    if (!canvas || !renderer) return;

    const win = renderer.interactiveEl?.win || window;
    const dpr = win.devicePixelRatio || 1;
    const cssW =
      renderer.interactiveEl.clientWidth || canvas.parentElement?.clientWidth || 0;
    const cssH =
      renderer.interactiveEl.clientHeight || canvas.parentElement?.clientHeight || 0;

    if (cssW <= 0 || cssH <= 0) return;

    const targetW = Math.round(cssW * dpr);
    const targetH = Math.round(cssH * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssW, cssH);

    // 1. Optional Miro Board Dot-Grid in world space
    if (settings.showBoardGrid) {
      this.drawMiroBoardGrid(ctx, cssW, cssH);
    }

    // 2. Draw Miro Frames & Organic Hull Zones
    if (settings.showGroupZones) {
      for (const z of zones) {
        const isHighlighted =
          this.hoveredGroupId === z.id ||
          this.draggingGroupId === z.id ||
          this.resizingGroupId === z.id;

        if ((z.mode === "miro-pinned" || z.mode === "miro-free") && z.frameRect) {
          this.drawMiroFrame(ctx, z, isHighlighted, settings.zoneOpacity);
        } else if (z.hull.length >= 3) {
          const screenPts = z.hull.map((p) => this.worldToCss(p.x, p.y));
          ctx.beginPath();
          drawSmoothClosedCurve(ctx, screenPts);

          const alpha = clamp(
            settings.zoneOpacity + (isHighlighted ? 0.08 : 0),
            0.03,
            0.45
          );
          ctx.fillStyle = hexToRgba(z.color, alpha);
          ctx.fill();

          ctx.lineWidth = isHighlighted ? 2.2 : 1.3;
          ctx.setLineDash(z.anchorMode === "manual" ? [] : [6, 5]);
          ctx.strokeStyle = hexToRgba(z.color, isHighlighted ? 0.85 : 0.45);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Draw elastic tether line to main cluster bridge on hover/drag
        if (
          settings.showTetherLines &&
          z.hasBridge &&
          (isHighlighted ||
            (z.mode === "organic" && z.anchorMode === "manual"))
        ) {
          const from = this.worldToCss(z.centroidX, z.centroidY);
          const to = this.worldToCss(z.bridgeX, z.bridgeY);
          ctx.beginPath();
          ctx.moveTo(from.x, from.y);
          ctx.lineTo(to.x, to.y);
          ctx.setLineDash([4, 4]);
          ctx.lineWidth = isHighlighted ? 1.8 : 1.1;
          ctx.strokeStyle = hexToRgba(z.color, isHighlighted ? 0.72 : 0.34);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.beginPath();
          ctx.arc(to.x, to.y, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(z.color, 0.75);
          ctx.fill();
        }
      }
    }

    // 3. Draw crisp pin ring on individually pinned nodes
    const pinnedIds = Object.keys(settings.pinnedNodes || {});
    if (pinnedIds.length > 0) {
      const { scaleX } = this.getTransformParams();
      for (const pid of pinnedIds) {
        const n = this.findRendererNode(pid);
        if (!n) continue;
        const pt = this.worldToCss(n.x, n.y);
        const r = clamp(9 * Math.sqrt(Math.max(0.35, scaleX)), 6, 15);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, r, 0, Math.PI * 2);
        ctx.lineWidth = 1.8;
        ctx.strokeStyle = "rgba(255, 190, 11, 0.9)";
        ctx.stroke();

        // Tiny pin dot at top-right of node
        ctx.beginPath();
        ctx.arc(pt.x + r * 0.68, pt.y - r * 0.68, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#ffbe0b";
        ctx.fill();
      }
    }

    // 4. Draw Lasso selection polygon if currently dragging
    if (this.lassoDrawing && this.lassoPointsCss.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(this.lassoPointsCss[0].x, this.lassoPointsCss[0].y);
      for (let i = 1; i < this.lassoPointsCss.length; i++) {
        ctx.lineTo(this.lassoPointsCss[i].x, this.lassoPointsCss[i].y);
      }
      ctx.closePath();
      ctx.fillStyle = "rgba(124, 92, 255, 0.16)";
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = "rgba(124, 92, 255, 0.92)";
      ctx.stroke();
      ctx.setLineDash([]);
    }

    ctx.restore();
  }

  private drawMiroBoardGrid(
    ctx: CanvasRenderingContext2D,
    cssW: number,
    cssH: number
  ): void {
    const { scaleX, scaleY, tx, ty } = this.getTransformParams();
    let worldStep = 48;
    while (worldStep * scaleX < 20) worldStep *= 2;
    while (worldStep * scaleX > 90) worldStep /= 2;

    const topLeftWorld = this.cssToWorld(0, 0);
    const botRightWorld = this.cssToWorld(cssW, cssH);

    const startX = Math.floor(topLeftWorld.x / worldStep) * worldStep;
    const endX = Math.ceil(botRightWorld.x / worldStep) * worldStep;
    const startY = Math.floor(topLeftWorld.y / worldStep) * worldStep;
    const endY = Math.ceil(botRightWorld.y / worldStep) * worldStep;

    ctx.fillStyle = "rgba(150, 158, 180, 0.22)";
    for (let wx = startX; wx <= endX; wx += worldStep) {
      const sx = wx * scaleX + tx;
      for (let wy = startY; wy <= endY; wy += worldStep) {
        const sy = wy * scaleY + ty;
        ctx.fillRect(sx - 1, sy - 1, 2, 2);
      }
    }
  }

  private drawMiroFrame(
    ctx: CanvasRenderingContext2D,
    z: GroupZoneRenderInfo,
    isHighlighted: boolean,
    zoneOpacity: number
  ): void {
    const rect = z.frameRect!;
    const tl = this.worldToCss(rect.x, rect.y);
    const br = this.worldToCss(rect.x + rect.w, rect.y + rect.h);
    const headerBot = this.worldToCss(rect.x, rect.y + MIRO_HEADER_HEIGHT);

    const x = tl.x;
    const y = tl.y;
    const w = Math.max(24, br.x - tl.x);
    const h = Math.max(24, br.y - tl.y);
    const headerH = clamp(headerBot.y - tl.y, 8, Math.min(44, h * 0.4));
    const radius = clamp(w * 0.03, 6, 14);
    const isHardPinned = z.mode === "miro-pinned";

    // Subtle board card drop shadow
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.24)";
    ctx.shadowBlur = isHighlighted ? 18 : 10;
    ctx.shadowOffsetY = 3;

    drawRoundedRect(ctx, x, y, w, h, radius);
    const fillAlpha = clamp(
      zoneOpacity * (isHardPinned ? 1.15 : 0.9) + (isHighlighted ? 0.06 : 0),
      0.05,
      0.38
    );
    ctx.fillStyle = hexToRgba(z.color, fillAlpha);
    ctx.fill();
    ctx.restore();

    // Header band inside Miro Frame
    ctx.save();
    drawRoundedRect(ctx, x, y, w, h, radius);
    ctx.clip();
    ctx.fillStyle = hexToRgba(z.color, isHardPinned ? 0.24 : 0.15);
    ctx.fillRect(x, y, w, headerH);

    // Subtle Miro card slot crosshairs for miro-pinned mode when zoomed in
    if (isHardPinned && w > 120 && h > 90) {
      ctx.strokeStyle = hexToRgba(z.color, 0.14);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y + headerH);
      ctx.lineTo(x + w, y + headerH);
      ctx.stroke();
    }
    ctx.restore();

    // Frame border: solid bold for hard-pinned Miro board, architectural dashed for live Miro frame
    drawRoundedRect(ctx, x, y, w, h, radius);
    ctx.lineWidth = isHighlighted ? 2.6 : isHardPinned ? 2.0 : 1.7;
    ctx.setLineDash(isHardPinned ? [] : [8, 4]);
    ctx.strokeStyle = hexToRgba(
      z.color,
      isHighlighted ? 0.95 : isHardPinned ? 0.8 : 0.65
    );
    ctx.stroke();
    ctx.setLineDash([]);
  }

  /* =========================================================================
   * Interactive Group Pills & Miro Frame Headers + Resize Handles
   * ========================================================================= */

  private syncBadges(zones: GroupZoneRenderInfo[]): void {
    const layer = this.badgeLayerEl;
    const renderer = this.renderer;
    if (!layer || !renderer) return;

    const settings = this.host.getSettings();
    const strings = t(settings.language);
    const activeIds = new Set<string>();

    const cssW = renderer.interactiveEl.clientWidth || 800;
    const cssH = renderer.interactiveEl.clientHeight || 600;

    for (const z of zones) {
      const desiredKind: "organic" | "miro" =
        z.mode === "miro-pinned" || z.mode === "miro-free" ? "miro" : "organic";
      activeIds.add(z.id);

      let rec = this.badgeMap.get(z.id);
      if (rec && rec.kind !== desiredKind) {
        rec.el.remove();
        rec.resizerEl?.remove();
        this.badgeMap.delete(z.id);
        rec = undefined;
      }

      if (!rec) {
        rec =
          desiredKind === "miro"
            ? this.createMiroHeaderDom(z)
            : this.createOrganicBadgeDom(z);
        this.badgeMap.set(z.id, rec);
        layer.appendChild(rec.el);
        if (rec.resizerEl) {
          layer.appendChild(rec.resizerEl);
        }
      }

      rec.el.style.setProperty("--gmg-color", z.color);
      rec.nameSpan.textContent = z.name;
      rec.countSpan.textContent = String(z.memberCount);

      if (desiredKind === "miro" && z.frameRect) {
        if (rec.modeChipEl) {
          rec.modeChipEl.textContent = strings.modeShort(z.mode);
          rec.modeChipEl.title = strings.modeDesc(z.mode);
        }
        const tl = this.worldToCss(z.frameRect.x, z.frameRect.y);
        const br = this.worldToCss(
          z.frameRect.x + z.frameRect.w,
          z.frameRect.y + z.frameRect.h
        );
        const visible =
          br.x > -40 && tl.x < cssW + 40 && br.y > -40 && tl.y < cssH + 40;
        rec.el.style.display = visible ? "inline-flex" : "none";
        if (visible) {
          const hx = clamp(tl.x + 6, 4, Math.max(4, cssW - 140));
          const hy = clamp(tl.y - 13, 4, Math.max(4, cssH - 28));
          rec.el.style.transform = `translate3d(${hx.toFixed(1)}px, ${hy.toFixed(1)}px, 0)`;
        }

        if (rec.resizerEl) {
          rec.resizerEl.style.setProperty("--gmg-color", z.color);
          const rVis =
            br.x > 10 && br.x < cssW + 10 && br.y > 10 && br.y < cssH + 10;
          rec.resizerEl.style.display = rVis ? "flex" : "none";
          if (rVis) {
            rec.resizerEl.style.transform = `translate3d(${(br.x - 12).toFixed(
              1
            )}px, ${(br.y - 12).toFixed(1)}px, 0)`;
          }
        }
      } else {
        rec.el.toggleClass("is-pinned", z.anchorMode === "manual");
        if (rec.pinSpan) {
          rec.pinSpan.textContent = z.anchorMode === "manual" ? "📌" : "🧲";
        }
        const topWorldY = this.getZoneTopWorldY(z);
        const anchorCss = this.worldToCss(z.centroidX, topWorldY);
        const bx = anchorCss.x;
        const by = anchorCss.y - 14;
        const visible =
          bx > -120 && bx < cssW + 120 && by > -60 && by < cssH + 60;
        rec.el.style.display = visible ? "inline-flex" : "none";
        if (visible) {
          rec.el.style.transform = `translate3d(${bx.toFixed(1)}px, ${by.toFixed(
            1
          )}px, 0) translate(-50%, -50%)`;
        }
      }
    }

    for (const [id, rec] of this.badgeMap.entries()) {
      if (!activeIds.has(id)) {
        rec.el.remove();
        rec.resizerEl?.remove();
        this.badgeMap.delete(id);
      }
    }
  }

  private getZoneTopWorldY(z: GroupZoneRenderInfo): number {
    if (z.hull.length === 0) return z.centroidY - z.radius;
    let minY = Infinity;
    for (const p of z.hull) {
      if (p.y < minY) minY = p.y;
    }
    return minY;
  }

  private createOrganicBadgeDom(z: GroupZoneRenderInfo): BadgeDomRecord {
    const strings = t(this.host.getSettings().language);
    const el = document.createElement("div");
    el.className = "gmg-group-badge";
    el.title = strings.badgeTooltip;

    const dot = document.createElement("span");
    dot.className = "gmg-badge-dot";
    el.appendChild(dot);

    const nameSpan = document.createElement("span");
    nameSpan.textContent = z.name;
    el.appendChild(nameSpan);

    const countSpan = document.createElement("span");
    countSpan.className = "gmg-badge-count";
    countSpan.textContent = String(z.memberCount);
    el.appendChild(countSpan);

    const pinSpan = document.createElement("span");
    pinSpan.className = "gmg-miro-mode-chip";
    pinSpan.textContent = "🧲";
    pinSpan.title = strings.switchToMiroPinned;
    pinSpan.addEventListener("pointerdown", (e) => e.stopPropagation());
    pinSpan.addEventListener("click", (e) => {
      e.stopPropagation();
      if (!z.isNative) {
        void this.cycleGroupMode(z.id);
      } else {
        this.promoteNativeGroupAndCycle(z.id, "miro-pinned");
      }
    });
    el.appendChild(pinSpan);

    el.addEventListener("mouseenter", () => {
      this.hoveredGroupId = z.id;
      this.renderer?.changed();
    });
    el.addEventListener("mouseleave", () => {
      if (this.hoveredGroupId === z.id) {
        this.hoveredGroupId = null;
        this.renderer?.changed();
      }
    });

    this.attachGroupDragBehavior(el, z.id, "organic");

    el.addEventListener("contextmenu", (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      this.showBadgeContextMenu(evt, z.id, z.isNative);
    });

    el.addEventListener("dblclick", (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      if (!z.isNative) {
        const grp = this.host
          .getSettings()
          .groups.find((g) => g.id === z.id);
        if (grp) this.openGroupModal(grp);
      }
    });

    return { el, kind: "organic", nameSpan, countSpan, pinSpan };
  }

  private createMiroHeaderDom(z: GroupZoneRenderInfo): BadgeDomRecord {
    const strings = t(this.host.getSettings().language);
    const el = document.createElement("div");
    el.className = "gmg-miro-header";
    el.title = strings.badgeTooltip;

    const dot = document.createElement("span");
    dot.className = "gmg-badge-dot";
    el.appendChild(dot);

    const nameSpan = document.createElement("span");
    nameSpan.textContent = z.name;
    el.appendChild(nameSpan);

    const countSpan = document.createElement("span");
    countSpan.className = "gmg-badge-count";
    countSpan.textContent = String(z.memberCount);
    el.appendChild(countSpan);

    const modeChipEl = document.createElement("span");
    modeChipEl.className = "gmg-miro-mode-chip";
    modeChipEl.textContent = strings.modeShort(z.mode);
    modeChipEl.addEventListener("pointerdown", (e) => e.stopPropagation());
    modeChipEl.addEventListener("click", (e) => {
      e.stopPropagation();
      void this.cycleGroupMode(z.id);
    });
    el.appendChild(modeChipEl);

    const tidyBtn = document.createElement("button");
    tidyBtn.className = "gmg-miro-mini-btn";
    tidyBtn.textContent = "▦";
    tidyBtn.title = strings.tidyGrid;
    tidyBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
    tidyBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      void this.setMiroSubLayout(z.id, "grid");
    });
    el.appendChild(tidyBtn);

    const menuBtn = document.createElement("button");
    menuBtn.className = "gmg-miro-mini-btn";
    menuBtn.textContent = "⋯";
    menuBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.showBadgeContextMenu(e, z.id, z.isNative);
    });
    el.appendChild(menuBtn);

    el.addEventListener("mouseenter", () => {
      this.hoveredGroupId = z.id;
      this.renderer?.changed();
    });
    el.addEventListener("mouseleave", () => {
      if (this.hoveredGroupId === z.id) {
        this.hoveredGroupId = null;
        this.renderer?.changed();
      }
    });

    this.attachGroupDragBehavior(el, z.id, "miro");

    el.addEventListener("contextmenu", (evt) => {
      evt.preventDefault();
      evt.stopPropagation();
      this.showBadgeContextMenu(evt, z.id, z.isNative);
    });

    // Bottom-right resize handle for Miro Frame
    const resizerEl = document.createElement("div");
    resizerEl.className = "gmg-miro-resizer";
    resizerEl.textContent = "◢";
    resizerEl.title = strings.frameResizeTooltip;
    this.attachMiroResizeBehavior(resizerEl, z.id);

    return {
      el,
      kind: "miro",
      nameSpan,
      countSpan,
      modeChipEl,
      resizerEl,
    };
  }

  private attachGroupDragBehavior(
    el: HTMLElement,
    groupId: string,
    kind: "organic" | "miro"
  ): void {
    let startClientX = 0;
    let startClientY = 0;
    let startFrameX = 0;
    let startFrameY = 0;
    let moved = false;

    const onPointerMove = (evt: PointerEvent) => {
      const dxPx = evt.clientX - startClientX;
      const dyPx = evt.clientY - startClientY;
      if (!moved && Math.hypot(dxPx, dyPx) < 4) return;
      moved = true;

      const parentRect = this.badgeLayerEl?.getBoundingClientRect();
      if (!parentRect) return;

      if (kind === "miro") {
        const { scaleX, scaleY } = this.getTransformParams();
        const worldDx = dxPx / (scaleX || 1);
        const worldDy = dyPx / (scaleY || 1);
        this.setLiveMiroFrameRect(groupId, {
          x: Math.round(startFrameX + worldDx),
          y: Math.round(startFrameY + worldDy),
        });
      } else {
        const localX = evt.clientX - parentRect.left;
        const localY = evt.clientY - parentRect.top;
        const worldPos = this.cssToWorld(localX, localY);
        this.setLiveGroupAnchor(groupId, worldPos.x, worldPos.y);
      }
      this.reheatSimulation(35);
    };

    const onPointerUp = (evt: PointerEvent) => {
      window.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener("pointerup", onPointerUp, true);
      el.classList.remove("is-dragging");
      if (this.draggingGroupId === groupId) {
        this.draggingGroupId = null;
      }
      if (moved) {
        evt.preventDefault();
        evt.stopPropagation();
        if (kind === "miro") {
          void this.persistLiveMiroFrame(groupId);
        } else {
          void this.persistLiveGroupAnchor(groupId);
        }
      }
    };

    el.addEventListener("pointerdown", (evt: PointerEvent) => {
      if (evt.button !== 0) return;
      evt.preventDefault();
      evt.stopPropagation();
      startClientX = evt.clientX;
      startClientY = evt.clientY;
      const zone = this.lastZones.find((zn) => zn.id === groupId);
      startFrameX = zone?.frameRect?.x ?? 0;
      startFrameY = zone?.frameRect?.y ?? 0;
      moved = false;
      this.draggingGroupId = groupId;
      el.classList.add("is-dragging");
      window.addEventListener("pointermove", onPointerMove, true);
      window.addEventListener("pointerup", onPointerUp, true);
    });
  }

  private attachMiroResizeBehavior(
    resizerEl: HTMLElement,
    groupId: string
  ): void {
    let startClientX = 0;
    let startClientY = 0;
    let startW = 280;
    let startH = 220;
    let startX = 0;
    let startY = 0;

    const onPointerMove = (evt: PointerEvent) => {
      const dxPx = evt.clientX - startClientX;
      const dyPx = evt.clientY - startClientY;
      const { scaleX, scaleY } = this.getTransformParams();
      const nextW = Math.max(
        MIRO_MIN_WIDTH,
        Math.round(startW + dxPx / (scaleX || 1))
      );
      const nextH = Math.max(
        MIRO_MIN_HEIGHT,
        Math.round(startH + dyPx / (scaleY || 1))
      );
      this.setLiveMiroFrameRect(groupId, {
        x: startX,
        y: startY,
        w: nextW,
        h: nextH,
      });
      this.reheatSimulation(35);
    };

    const onPointerUp = () => {
      window.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener("pointerup", onPointerUp, true);
      resizerEl.classList.remove("is-resizing");
      if (this.resizingGroupId === groupId) {
        this.resizingGroupId = null;
      }
      void this.persistLiveMiroFrame(groupId);
    };

    resizerEl.addEventListener("pointerdown", (evt: PointerEvent) => {
      if (evt.button !== 0) return;
      evt.preventDefault();
      evt.stopPropagation();
      const zone = this.lastZones.find((zn) => zn.id === groupId);
      if (!zone?.frameRect) return;
      startClientX = evt.clientX;
      startClientY = evt.clientY;
      startX = zone.frameRect.x;
      startY = zone.frameRect.y;
      startW = zone.frameRect.w;
      startH = zone.frameRect.h;
      this.resizingGroupId = groupId;
      resizerEl.classList.add("is-resizing");
      window.addEventListener("pointermove", onPointerMove, true);
      window.addEventListener("pointerup", onPointerUp, true);
    });
  }

  private setLiveMiroFrameRect(
    groupId: string,
    patch: { x?: number; y?: number; w?: number; h?: number }
  ): void {
    const spec = this.cachedSpecs.find((s) => s.id === groupId);
    const zone = this.lastZones.find((z) => z.id === groupId);
    if (!spec) return;
    if (spec.frameX === undefined && zone?.frameRect) {
      spec.frameX = zone.frameRect.x;
      spec.frameY = zone.frameRect.y;
      spec.frameW = zone.frameRect.w;
      spec.frameH = zone.frameRect.h;
    }
    if (patch.x !== undefined) spec.frameX = patch.x;
    if (patch.y !== undefined) spec.frameY = patch.y;
    if (patch.w !== undefined) spec.frameW = patch.w;
    if (patch.h !== undefined) spec.frameH = patch.h;
  }

  private async persistLiveMiroFrame(groupId: string): Promise<void> {
    const spec = this.cachedSpecs.find((s) => s.id === groupId);
    if (!spec) return;
    const settings = this.host.getSettings();
    const groups = settings.groups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            frameX: spec.frameX,
            frameY: spec.frameY,
            frameW: spec.frameW,
            frameH: spec.frameH,
          }
        : g
    );
    await this.host.saveGroups(groups, false);
    this.controlsSection?.refreshGroupList();
  }

  private setLiveGroupAnchor(groupId: string, wx: number, wy: number): void {
    const spec = this.cachedSpecs.find((s) => s.id === groupId);
    if (spec) {
      spec.anchorMode = "manual";
      spec.anchorX = wx;
      spec.anchorY = wy;
    }
  }

  private async persistLiveGroupAnchor(groupId: string): Promise<void> {
    const spec = this.cachedSpecs.find((s) => s.id === groupId);
    if (!spec) return;
    const settings = this.host.getSettings();
    if (spec.isNative) {
      const idx = settings.groups.length + 1;
      const promoted: MagneticGroup = {
        id: createGroupId(),
        name: spec.name || t(settings.language).defaultNewGroupName(idx),
        color: spec.color,
        enabled: true,
        query: spec.name,
        nodeIds: Array.from(spec.memberIds),
        excludedNodeIds: [],
        strength: 1.0,
        colorNodes: false,
        mode: "organic",
        anchorMode: "manual",
        anchorX: spec.anchorX,
        anchorY: spec.anchorY,
      };
      await this.host.saveGroups([...settings.groups, promoted], true);
      return;
    }

    const groups = settings.groups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            anchorMode: "manual" as const,
            anchorX: spec.anchorX,
            anchorY: spec.anchorY,
          }
        : g
    );
    await this.host.saveGroups(groups, false);
    this.controlsSection?.refreshGroupList();
  }

  /* =========================================================================
   * Lasso Tool (Shift + Drag OR Toolbar Button)
   * ========================================================================= */

  public setLassoArmed(armed: boolean): void {
    this.lassoArmed = armed;
    const interactiveEl = this.renderer?.interactiveEl;
    const parent = interactiveEl?.parentElement;
    if (interactiveEl) {
      interactiveEl.toggleClass("gmg-lasso-mode", armed);
    }
    if (armed && parent && !this.lassoBannerEl) {
      const strings = t(this.host.getSettings().language);
      this.lassoBannerEl = document.createElement("div");
      this.lassoBannerEl.className = "gmg-lasso-banner";
      this.lassoBannerEl.createSpan({ text: strings.lassoActiveHint });
      parent.appendChild(this.lassoBannerEl);
    } else if (!armed && this.lassoBannerEl) {
      this.lassoBannerEl.remove();
      this.lassoBannerEl = null;
    }
    this.controlsSection?.syncLassoState();
  }

  private setupLassoEvents(
    interactiveEl: HTMLCanvasElement,
    _parent: HTMLElement
  ): void {
    const onPointerDown = (evt: PointerEvent) => {
      if (evt.button !== 0) return;
      const settings = this.host.getSettings();
      const shiftTrigger =
        settings.shiftDragLasso && evt.shiftKey && !this.findNodeAtCssPoint(evt);

      if (!this.lassoArmed && !shiftTrigger) return;

      evt.preventDefault();
      evt.stopPropagation();
      evt.stopImmediatePropagation();

      const rect = interactiveEl.getBoundingClientRect();
      this.lassoDrawing = true;
      this.lassoPointsCss = [
        { x: evt.clientX - rect.left, y: evt.clientY - rect.top },
      ];
      this.renderer?.changed();
    };

    const onPointerMove = (evt: PointerEvent) => {
      if (!this.lassoDrawing) return;
      evt.preventDefault();
      evt.stopPropagation();
      const rect = interactiveEl.getBoundingClientRect();
      const pt = { x: evt.clientX - rect.left, y: evt.clientY - rect.top };
      const last = this.lassoPointsCss[this.lassoPointsCss.length - 1];
      if (!last || Math.hypot(pt.x - last.x, pt.y - last.y) > 4) {
        this.lassoPointsCss.push(pt);
        this.renderer?.changed();
      }
    };

    const onPointerUp = (evt: PointerEvent) => {
      if (!this.lassoDrawing) return;
      evt.preventDefault();
      evt.stopPropagation();
      this.lassoDrawing = false;

      const poly = this.lassoPointsCss;
      this.lassoPointsCss = [];
      if (this.lassoArmed) {
        this.setLassoArmed(false);
      }
      this.renderer?.changed();

      if (poly.length < 3) return;
      const capturedIds = this.findNodesInsideCssPolygon(poly);
      if (capturedIds.length > 0) {
        this.showLassoActionMenu(evt, capturedIds);
      }
    };

    const onKeyDown = (evt: KeyboardEvent) => {
      if (evt.key === "Escape" && (this.lassoArmed || this.lassoDrawing)) {
        this.lassoDrawing = false;
        this.lassoPointsCss = [];
        this.setLassoArmed(false);
        this.renderer?.changed();
      }
    };

    interactiveEl.addEventListener("pointerdown", onPointerDown, true);
    window.addEventListener("pointermove", onPointerMove, true);
    window.addEventListener("pointerup", onPointerUp, true);
    window.addEventListener("keydown", onKeyDown);

    this.cleanupFns.push(() => {
      interactiveEl.removeEventListener("pointerdown", onPointerDown, true);
      window.removeEventListener("pointermove", onPointerMove, true);
      window.removeEventListener("pointerup", onPointerUp, true);
      window.removeEventListener("keydown", onKeyDown);
    });
  }

  private findNodesInsideCssPolygon(
    poly: Array<{ x: number; y: number }>
  ): string[] {
    const nodes = this.renderer?.nodes || [];
    const hit: string[] = [];
    for (const n of nodes) {
      const p = this.worldToCss(n.x, n.y);
      if (pointInPolygon(p.x, p.y, poly)) {
        hit.push(n.id);
      }
    }
    return hit;
  }

  private findNodeAtCssPoint(evt: MouseEvent): InternalGraphNode | null {
    const r = this.renderer;
    if (!r) return null;
    if (r.highlightNode) return r.highlightNode;

    const rect = r.interactiveEl.getBoundingClientRect();
    const cx = evt.clientX - rect.left;
    const cy = evt.clientY - rect.top;
    let best: InternalGraphNode | null = null;
    let bestDist = 18;
    for (const n of r.nodes || []) {
      const p = this.worldToCss(n.x, n.y);
      const d = Math.hypot(p.x - cx, p.y - cy);
      if (d < bestDist) {
        bestDist = d;
        best = n;
      }
    }
    return best;
  }

  /* =========================================================================
   * Menus, Mode Switching, Node Pinning & Group Actions
   * ========================================================================= */

  private showLassoActionMenu(evt: MouseEvent, nodeIds: string[]): void {
    const settings = this.host.getSettings();
    const strings = t(settings.language);
    const menu = new Menu();

    menu.addItem((item) =>
      item.setTitle(strings.lassoMenuTitle(nodeIds.length)).setDisabled(true)
    );
    menu.addSeparator();

    menu.addItem((item) =>
      item
        .setTitle(strings.lassoCreateMiroPinned(nodeIds.length))
        .setIcon("layout-grid")
        .onClick(() => {
          void this.quickCreateGroupWithNodes(nodeIds, "miro-pinned");
        })
    );

    menu.addItem((item) =>
      item
        .setTitle(strings.lassoCreateMiroFree(nodeIds.length))
        .setIcon("square-dashed")
        .onClick(() => {
          void this.quickCreateGroupWithNodes(nodeIds, "miro-free");
        })
    );

    menu.addItem((item) =>
      item
        .setTitle(strings.lassoCreateNew(nodeIds.length))
        .setIcon("magnet")
        .onClick(() => {
          void this.quickCreateGroupWithNodes(nodeIds, "organic");
        })
    );

    menu.addSeparator();

    menu.addItem((item) =>
      item
        .setTitle(strings.lassoPinIndividual(nodeIds.length))
        .setIcon("pin")
        .onClick(() => {
          void this.pinNodesAtCurrentPositions(nodeIds);
        })
    );

    const anyPinned = nodeIds.some((id) => Boolean(settings.pinnedNodes?.[id]));
    if (anyPinned) {
      menu.addItem((item) =>
        item
          .setTitle(strings.lassoUnpinIndividual)
          .setIcon("pin-off")
          .onClick(() => {
            void this.unpinIndividualNodes(nodeIds);
          })
      );
    }

    if (settings.groups.length > 0) {
      menu.addSeparator();
      for (const grp of settings.groups) {
        menu.addItem((item) =>
          item
            .setTitle(strings.lassoAddTo(grp.name))
            .setIcon("magnet")
            .onClick(() => {
              void this.addNodesToGroup(grp.id, nodeIds);
            })
        );
      }
      menu.addSeparator();
      menu.addItem((item) =>
        item
          .setTitle(strings.lassoRemoveFromAll)
          .setIcon("x")
          .onClick(() => {
            void this.removeNodesFromAllGroups(nodeIds);
          })
      );
    }

    menu.showAtMouseEvent(evt);
  }

  private showNodeQuickMenu(evt: MouseEvent, nodeId: string): void {
    const settings = this.host.getSettings();
    const strings = t(settings.language);
    const menu = new Menu();

    menu.addItem((item) =>
      item.setTitle(`🧲 ${strings.ctxMenuHeader}`).setDisabled(true)
    );

    const isIndividuallyPinned = Boolean(settings.pinnedNodes?.[nodeId]);
    if (isIndividuallyPinned) {
      menu.addItem((item) =>
        item
          .setTitle(strings.ctxUnpinNode)
          .setIcon("pin-off")
          .onClick(() => void this.unpinIndividualNodes([nodeId]))
      );
    } else {
      menu.addItem((item) =>
        item
          .setTitle(strings.ctxPinNodeHere)
          .setIcon("pin")
          .onClick(() => void this.pinNodesAtCurrentPositions([nodeId]))
      );
    }

    const neighborIds = this.collectNodeWithNeighbors(nodeId);
    if (neighborIds.length > 1) {
      menu.addItem((item) =>
        item
          .setTitle(
            `${strings.ctxCreateMiroWithNeighbors} (${neighborIds.length})`
          )
          .setIcon("layout-grid")
          .onClick(() =>
            void this.quickCreateGroupWithNodes(neighborIds, "miro-pinned")
          )
      );
      menu.addItem((item) =>
        item
          .setTitle(`${strings.ctxCreateWithNeighbors} (${neighborIds.length})`)
          .setIcon("git-Fork")
          .onClick(() =>
            void this.quickCreateGroupWithNodes(neighborIds, "organic")
          )
      );
    }

    menu.addItem((item) =>
      item
        .setTitle(strings.ctxCreateWithNode)
        .setIcon("plus-circle")
        .onClick(() => this.openGroupModal(undefined, [nodeId], "organic"))
    );

    if (settings.groups.length > 0) {
      menu.addSeparator();
      for (const grp of settings.groups) {
        const inManual = grp.nodeIds.includes(nodeId);
        if (inManual) {
          menu.addItem((item) =>
            item
              .setTitle(strings.ctxRemoveFromGroup(grp.name))
              .setIcon("minus-circle")
              .onClick(() => void this.removeNodesFromGroup(grp.id, [nodeId]))
          );
        } else {
          menu.addItem((item) =>
            item
              .setTitle(strings.ctxAddToGroup(grp.name))
              .setIcon("magnet")
              .onClick(() => void this.addNodesToGroup(grp.id, [nodeId]))
          );
        }
      }
    }

    menu.showAtMouseEvent(evt);
  }

  private showBadgeContextMenu(
    evt: MouseEvent,
    groupId: string,
    isNative: boolean
  ): void {
    if (isNative) {
      const settings = this.host.getSettings();
      const strings = t(settings.language);
      const menu = new Menu();
      menu.addItem((i) =>
        i
          .setTitle(strings.switchToMiroPinned)
          .setIcon("layout-grid")
          .onClick(() => this.promoteNativeGroupAndCycle(groupId, "miro-pinned"))
      );
      menu.showAtMouseEvent(evt);
      return;
    }

    const settings = this.host.getSettings();
    const strings = t(settings.language);
    const grp = settings.groups.find((g) => g.id === groupId);
    if (!grp) return;

    const mode: GroupLayoutMode = grp.mode || "organic";
    const menu = new Menu();

    menu.addItem((i) =>
      i
        .setTitle(strings.editGroup)
        .setIcon("sliders-horizontal")
        .onClick(() => this.openGroupModal(grp))
    );

    menu.addSeparator();

    if (mode !== "miro-pinned") {
      menu.addItem((i) =>
        i
          .setTitle(strings.switchToMiroPinned)
          .setIcon("pin")
          .onClick(() => void this.setGroupMode(groupId, "miro-pinned", "grid"))
      );
    }
    if (mode !== "miro-free") {
      menu.addItem((i) =>
        i
          .setTitle(strings.switchToMiroFree)
          .setIcon("layout-grid")
          .onClick(() => void this.setGroupMode(groupId, "miro-free"))
      );
    }
    if (mode !== "organic") {
      menu.addItem((i) =>
        i
          .setTitle(strings.switchToOrganic)
          .setIcon("magnet")
          .onClick(() => void this.setGroupMode(groupId, "organic"))
      );
    }

    if (mode === "miro-pinned") {
      menu.addSeparator();
      menu.addItem((i) =>
        i
          .setTitle(strings.tidyGrid)
          .onClick(() => void this.setMiroSubLayout(groupId, "grid"))
      );
      menu.addItem((i) =>
        i
          .setTitle(strings.tidyColumn)
          .onClick(() => void this.setMiroSubLayout(groupId, "column"))
      );
      menu.addItem((i) =>
        i
          .setTitle(strings.tidyCircle)
          .onClick(() => void this.setMiroSubLayout(groupId, "circle"))
      );
    }

    if (mode === "organic" && grp.anchorMode === "manual") {
      menu.addItem((i) =>
        i
          .setTitle(strings.resetAnchor)
          .setIcon("rotate-ccw")
          .onClick(() => void this.resetGroupAnchor(grp.id))
      );
    }

    menu.addSeparator();
    menu.addItem((i) =>
      i
        .setTitle(strings.toggleGroup)
        .setIcon(grp.enabled ? "eye-off" : "eye")
        .onClick(() => void this.toggleGroup(grp.id))
    );
    menu.addItem((i) =>
      i
        .setTitle(strings.deleteGroup)
        .setIcon("trash-2")
        .onClick(() => void this.deleteGroup(grp.id))
    );
    menu.showAtMouseEvent(evt);
  }

  private collectNodeWithNeighbors(nodeId: string): string[] {
    const out = new Set<string>([nodeId]);
    for (const l of this.renderer?.links || []) {
      if (l.source?.id === nodeId && l.target?.id) out.add(l.target.id);
      if (l.target?.id === nodeId && l.source?.id) out.add(l.source.id);
    }
    return Array.from(out);
  }

  public openGroupModal(
    existing?: MagneticGroup,
    initialNodeIds?: string[],
    initialMode: GroupLayoutMode = "organic"
  ): void {
    const settings = this.host.getSettings();
    const candidates: CandidateGraphNode[] = (this.renderer?.nodes || []).map(
      (n) => ({
        id: n.id,
        label:
          typeof n.getDisplayText === "function"
            ? n.getDisplayText()
            : n.id.replace(/\.md$/i, ""),
        type: n.type || "",
      })
    );

    const modal = new GroupEditorModal(this.host.app, {
      existing,
      initialNodeIds,
      initialMode,
      defaultColorIndex: settings.groups.length,
      lang: settings.language,
      candidates,
      onSave: (saved) => {
        // Initialize sensible Miro frame geometry if newly saved as Miro mode and no frameX set yet
        if (
          (saved.mode === "miro-pinned" || saved.mode === "miro-free") &&
          saved.frameX === undefined
        ) {
          const memberPts = this.getMemberPositionsForGroupDraft(saved);
          const def = computeDefaultMiroFrame(
            memberPts,
            this.getViewportCenterWorld(),
            saved.frameSubLayout || "grid"
          );
          saved.frameX = def.frameX;
          saved.frameY = def.frameY;
          saved.frameW = def.frameW;
          saved.frameH = def.frameH;
        }
        const curr = this.host.getSettings().groups;
        const exists = curr.some((g) => g.id === saved.id);
        const next = exists
          ? curr.map((g) => (g.id === saved.id ? saved : g))
          : [...curr, saved];
        void this.host.saveGroups(next, true);
      },
    });
    modal.open();
  }

  private getViewportCenterWorld(): { x: number; y: number } {
    const r = this.renderer;
    if (!r) return { x: 0, y: 0 };
    const w = r.interactiveEl?.clientWidth || 800;
    const h = r.interactiveEl?.clientHeight || 600;
    return this.cssToWorld(w / 2, h / 2);
  }

  private getMemberPositionsForGroupDraft(
    grp: MagneticGroup
  ): Array<{ id: string; x: number; y: number }> {
    const nodes = this.renderer?.nodes || [];
    const resolver = buildMetadataResolver(this.host.app);
    const compiled = grp.query.trim() ? parseGroupQuery(grp.query) : null;
    const manualSet = new Set(grp.nodeIds || []);
    const excludedSet = new Set(grp.excludedNodeIds || []);
    const pts: Array<{ id: string; x: number; y: number }> = [];
    for (const n of nodes) {
      if (excludedSet.has(n.id)) continue;
      if (
        manualSet.has(n.id) ||
        (compiled && compiled.matches(resolver(n.id, n.type || "")))
      ) {
        pts.push({ id: n.id, x: n.x || 0, y: n.y || 0 });
      }
    }
    return pts;
  }

  private promoteNativeGroupAndCycle(
    nativeId: string,
    targetMode: GroupLayoutMode
  ): void {
    const spec = this.cachedSpecs.find((s) => s.id === nativeId);
    if (!spec) return;
    const settings = this.host.getSettings();
    const memberPts = Array.from(spec.memberIds)
      .map((id) => this.findRendererNode(id))
      .filter((n): n is InternalGraphNode => Boolean(n))
      .map((n) => ({ id: n.id, x: n.x, y: n.y }));
    const frameDef = computeDefaultMiroFrame(
      memberPts,
      this.getViewportCenterWorld(),
      "grid"
    );

    const promoted: MagneticGroup = {
      id: createGroupId(),
      name: spec.name,
      color: spec.color,
      enabled: true,
      query: spec.name,
      nodeIds: Array.from(spec.memberIds),
      excludedNodeIds: [],
      strength: 1.0,
      colorNodes: true,
      mode: targetMode,
      anchorMode: "auto",
      frameX: frameDef.frameX,
      frameY: frameDef.frameY,
      frameW: frameDef.frameW,
      frameH: frameDef.frameH,
      frameSubLayout: "grid",
    };
    void this.host.saveGroups([...settings.groups, promoted], true);
  }

  public async cycleGroupMode(groupId: string): Promise<void> {
    const grp = this.host.getSettings().groups.find((g) => g.id === groupId);
    if (!grp) return;
    const curr: GroupLayoutMode = grp.mode || "organic";
    const next: GroupLayoutMode =
      curr === "organic"
        ? "miro-pinned"
        : curr === "miro-pinned"
        ? "miro-free"
        : "organic";
    await this.setGroupMode(groupId, next);
  }

  public async setGroupMode(
    groupId: string,
    nextMode: GroupLayoutMode,
    subLayout?: MiroSubLayout
  ): Promise<void> {
    const settings = this.host.getSettings();
    const grp = settings.groups.find((g) => g.id === groupId);
    if (!grp) return;

    let framePatch: Partial<MagneticGroup> = {};
    if (
      (nextMode === "miro-pinned" || nextMode === "miro-free") &&
      grp.frameX === undefined
    ) {
      const memberPts = this.getMemberPositionsForGroupDraft(grp);
      const def = computeDefaultMiroFrame(
        memberPts,
        this.getViewportCenterWorld(),
        subLayout || grp.frameSubLayout || "grid"
      );
      framePatch = {
        frameX: def.frameX,
        frameY: def.frameY,
        frameW: def.frameW,
        frameH: def.frameH,
      };
    }

    const nextGroups = settings.groups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            ...framePatch,
            mode: nextMode,
            frameSubLayout: subLayout || g.frameSubLayout || "grid",
          }
        : g
    );
    await this.host.saveGroups(nextGroups, true);
  }

  public async setMiroSubLayout(
    groupId: string,
    subLayout: MiroSubLayout
  ): Promise<void> {
    const settings = this.host.getSettings();
    const groups = settings.groups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            mode: "miro-pinned" as const,
            frameSubLayout: subLayout,
            customOffsets: subLayout === "freeform" ? g.customOffsets : {},
          }
        : g
    );
    await this.host.saveGroups(groups, true);
  }

  public async quickCreateGroupWithNodes(
    nodeIds: string[],
    mode: GroupLayoutMode = "organic"
  ): Promise<MagneticGroup> {
    const settings = this.host.getSettings();
    const strings = t(settings.language);
    const idx = settings.groups.length + 1;
    const color =
      DEFAULT_GROUP_COLORS[(idx - 1) % DEFAULT_GROUP_COLORS.length];

    const memberPts = nodeIds
      .map((id) => this.findRendererNode(id))
      .filter((n): n is InternalGraphNode => Boolean(n))
      .map((n) => ({ id: n.id, x: n.x, y: n.y }));

    const frameDef =
      mode === "miro-pinned" || mode === "miro-free"
        ? computeDefaultMiroFrame(
            memberPts,
            this.getViewportCenterWorld(),
            "grid"
          )
        : undefined;

    const newGroup: MagneticGroup = {
      id: createGroupId(),
      name:
        mode === "organic"
          ? strings.defaultNewGroupName(idx)
          : strings.defaultNewFrameName(idx),
      color,
      enabled: true,
      query: "",
      nodeIds: Array.from(new Set(nodeIds)),
      excludedNodeIds: [],
      strength: 1.0,
      colorNodes: true,
      mode,
      anchorMode: "auto",
      frameX: frameDef?.frameX,
      frameY: frameDef?.frameY,
      frameW: frameDef?.frameW,
      frameH: frameDef?.frameH,
      frameSubLayout: "grid",
    };

    await this.host.saveGroups([...settings.groups, newGroup], true);
    new Notice(strings.noticeCreatedGroup(newGroup.name, nodeIds.length));
    return newGroup;
  }

  public async pinNodesAtCurrentPositions(nodeIds: string[]): Promise<void> {
    const settings = this.host.getSettings();
    const strings = t(settings.language);
    const nextPins = { ...(settings.pinnedNodes || {}) };
    let count = 0;
    for (const id of nodeIds) {
      const n = this.findRendererNode(id);
      if (n) {
        nextPins[id] = {
          x: Math.round(n.x * 10) / 10,
          y: Math.round(n.y * 10) / 10,
        };
        count++;
      }
    }
    if (count > 0) {
      await this.host.updateSettings({ pinnedNodes: nextPins }, true);
      new Notice(strings.noticePinnedNodes(count));
    }
  }

  public async unpinIndividualNodes(nodeIds: string[]): Promise<void> {
    const settings = this.host.getSettings();
    const strings = t(settings.language);
    const nextPins = { ...(settings.pinnedNodes || {}) };
    for (const id of nodeIds) {
      delete nextPins[id];
    }
    await this.host.updateSettings({ pinnedNodes: nextPins }, true);
    new Notice(strings.noticeUnpinnedNodes);
  }

  public async unpinAllIndividualNodes(): Promise<void> {
    const strings = t(this.host.getSettings().language);
    await this.host.updateSettings({ pinnedNodes: {} }, true);
    new Notice(strings.noticeUnpinnedNodes);
  }

  private async addNodesToGroup(
    groupId: string,
    nodeIds: string[]
  ): Promise<void> {
    const settings = this.host.getSettings();
    const strings = t(settings.language);
    let targetName = "";
    const next = settings.groups.map((g) => {
      if (g.id !== groupId) return g;
      targetName = g.name;
      const merged = new Set([...g.nodeIds, ...nodeIds]);
      const excl = (g.excludedNodeIds || []).filter(
        (id) => !nodeIds.includes(id)
      );
      return { ...g, nodeIds: Array.from(merged), excludedNodeIds: excl };
    });
    await this.host.saveGroups(next, true);
    if (targetName) {
      new Notice(strings.noticeAddedToGroup(targetName, nodeIds.length));
    }
  }

  private async removeNodesFromGroup(
    groupId: string,
    nodeIds: string[]
  ): Promise<void> {
    const settings = this.host.getSettings();
    const removeSet = new Set(nodeIds);
    const next = settings.groups.map((g) => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        nodeIds: g.nodeIds.filter((id) => !removeSet.has(id)),
      };
    });
    await this.host.saveGroups(next, true);
  }

  private async removeNodesFromAllGroups(nodeIds: string[]): Promise<void> {
    const settings = this.host.getSettings();
    const removeSet = new Set(nodeIds);
    const next = settings.groups.map((g) => ({
      ...g,
      nodeIds: g.nodeIds.filter((id) => !removeSet.has(id)),
    }));
    await this.host.saveGroups(next, true);
  }

  private async toggleGroup(groupId: string): Promise<void> {
    const settings = this.host.getSettings();
    const next = settings.groups.map((g) =>
      g.id === groupId ? { ...g, enabled: !g.enabled } : g
    );
    await this.host.saveGroups(next, true);
  }

  private async resetGroupAnchor(groupId: string): Promise<void> {
    const settings = this.host.getSettings();
    const next = settings.groups.map((g) =>
      g.id === groupId
        ? {
            ...g,
            anchorMode: "auto" as const,
            anchorX: undefined,
            anchorY: undefined,
          }
        : g
    );
    await this.host.saveGroups(next, true);
  }

  private async deleteGroup(groupId: string): Promise<void> {
    const settings = this.host.getSettings();
    const next = settings.groups.filter((g) => g.id !== groupId);
    await this.host.saveGroups(next, true);
  }

  /* =========================================================================
   * Live Graph Inspection & Camera Helpers (Used by MCP Server!)
   * ========================================================================= */

  public getLiveGraphSnapshot(): {
    viewType: string;
    nodes: Array<{
      id: string;
      label: string;
      type: string;
      x: number;
      y: number;
      hardPinned: boolean;
      groups: string[];
    }>;
    links: Array<{ source: string; target: string }>;
    zones: GroupZoneRenderInfo[];
  } {
    const r = this.renderer;
    const nodes = (r?.nodes || []).map((n) => {
      const memberOf: string[] = [];
      for (const s of this.cachedSpecs) {
        if (s.memberIds.has(n.id)) memberOf.push(s.id);
      }
      return {
        id: n.id,
        label:
          typeof n.getDisplayText === "function"
            ? n.getDisplayText()
            : n.id.replace(/\.md$/i, ""),
        type: n.type || "file",
        x: Math.round((n.x || 0) * 10) / 10,
        y: Math.round((n.y || 0) * 10) / 10,
        hardPinned: this.enforcedPins.has(n.id),
        groups: memberOf,
      };
    });
    const links = (r?.links || [])
      .filter((l) => l.source && l.target)
      .map((l) => ({ source: l.source.id, target: l.target.id }));

    return {
      viewType: this.view.getViewType(),
      nodes,
      links,
      zones: this.lastZones,
    };
  }

  public focusWorldRect(wx: number, wy: number, ww: number, wh: number): void {
    const r = this.renderer as
      | (InternalGraphRenderer & {
          autoScale?: boolean;
          panvX?: number;
          panvY?: number;
        })
      | undefined;
    if (!r) return;

    // Disable Obsidian's initial autoScale loop so our explicit camera framing sticks!
    if ("autoScale" in r) {
      r.autoScale = false;
    }
    if ("panvX" in r) r.panvX = 0;
    if ("panvY" in r) r.panvY = 0;

    const win = r.interactiveEl?.win || window;
    const dpr = r.px?.renderer?.resolution || win.devicePixelRatio || 1;
    const rawCssW = r.interactiveEl?.clientWidth || 900;
    const rawCssH = r.interactiveEl?.clientHeight || 650;

    // Account for open .graph-controls panel on the right so boards center in visible canvas space
    const controlsEl = this.view.contentEl.querySelector(
      ".graph-controls"
    ) as HTMLElement | null;
    const controlsCssW =
      controlsEl && !controlsEl.classList.contains("is-close")
        ? controlsEl.offsetWidth + 16
        : 0;

    const usableW = Math.max(300, rawCssW - controlsCssW) * dpr;
    const usableH = Math.max(240, rawCssH - 56) * dpr;
    const padFactor = 1.24;

    const desiredScale = clamp(
      Math.min(
        usableW / Math.max(120, ww * padFactor),
        usableH / Math.max(120, wh * padFactor)
      ),
      0.18 * dpr,
      2.2 * dpr
    );

    const centerX = wx + ww / 2;
    const centerY = wy + wh / 2;
    const targetPanX = usableW / 2 - centerX * desiredScale;
    const targetPanY = usableH / 2 - centerY * desiredScale;

    if (typeof r.setScale === "function") r.setScale(desiredScale);
    r.scale = desiredScale;
    if (typeof r.targetScale === "number") r.targetScale = desiredScale;
    if (typeof r.setPan === "function") r.setPan(targetPanX, targetPanY);
    r.panX = targetPanX;
    r.panY = targetPanY;
    r.changed();
  }

  /* =========================================================================
   * Native Obsidian Graph Engine Helpers & Cleanup
   * ========================================================================= */

  private readNativeColorGroups(): NativeGraphColorGroup[] {
    const eng = this.engine;
    if (!eng) return [];
    const fromGetter =
      typeof eng.getOptions === "function"
        ? eng.getOptions()?.colorGroups
        : undefined;
    return fromGetter || eng.options?.colorGroups || eng.searchQueries || [];
  }

  private readNativeGroupsSignature(): string {
    const list = this.readNativeColorGroups();
    if (!list.length) return "";
    return list.map((g) => `${g.query}:${g.color?.rgb ?? 0}`).join("|");
  }

  private readNativeLinkDistance(): number {
    const eng = this.engine;
    if (!eng) return 140;
    const d =
      (typeof eng.getOptions === "function"
        ? eng.getOptions()?.linkDistance
        : undefined) ?? eng.options?.linkDistance;
    return typeof d === "number" && d > 20 ? d : 140;
  }

  public destroy(): void {
    this.destroyed = true;

    for (const fn of this.cleanupFns) {
      try {
        fn();
      } catch {
        // ignore
      }
    }
    this.cleanupFns = [];

    this.releaseAllEnforcedPins();

    const renderer = this.renderer;
    if (renderer) {
      if (this.origRenderCallback) {
        renderer.renderCallback = this.origRenderCallback;
      }
      if (this.origSetData) {
        renderer.setData = this.origSetData;
      }
      if (this.origOnNodeRightClick) {
        renderer.onNodeRightClick = this.origOnNodeRightClick;
      }
      if (this.origWorkerPostMessage && renderer.worker) {
        renderer.worker.postMessage = this.origWorkerPostMessage;
      }
      renderer.interactiveEl?.removeClass("gmg-lasso-mode");
      this.restoreNodeColors(renderer.nodes || []);
      renderer.changed();
    }

    for (const rec of this.badgeMap.values()) {
      rec.el.remove();
      rec.resizerEl?.remove();
    }
    this.badgeMap.clear();

    this.controlsSection?.destroy();
    this.lassoBannerEl?.remove();
    this.badgeLayerEl?.remove();
    this.overlayCanvas?.remove();
  }
}

/* =========================================================================
 * Geometry & Color Helpers
 * ========================================================================= */

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}

function drawSmoothClosedCurve(
  ctx: CanvasRenderingContext2D,
  pts: Array<{ x: number; y: number }>
): void {
  const n = pts.length;
  if (n < 3) return;
  const firstMid = {
    x: (pts[n - 1].x + pts[0].x) / 2,
    y: (pts[n - 1].y + pts[0].y) / 2,
  };
  ctx.moveTo(firstMid.x, firstMid.y);
  for (let i = 0; i < n; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % n];
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    ctx.quadraticCurveTo(curr.x, curr.y, midX, midY);
  }
  ctx.closePath();
}

function pointInPolygon(
  x: number,
  y: number,
  poly: Array<{ x: number; y: number }>
): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;

    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function hexToRgbInt(hex: string): number {
  const clean = hex.replace(/^#/, "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return (r << 16) | (g << 8) | b;
  }
  const parsed = parseInt(clean.slice(0, 6), 16);
  return Number.isFinite(parsed) ? parsed : 0x7c5cff;
}

function rgbIntToHex(rgb: number): string {
  const clamped = Math.max(0, Math.min(0xffffff, rgb | 0));
  return "#" + clamped.toString(16).padStart(6, "0");
}

function hexToRgba(hex: string, alpha: number): string {
  const rgb = hexToRgbInt(hex);
  const r = (rgb >> 16) & 255;
  const g = (rgb >> 8) & 255;
  const b = rgb & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
}
