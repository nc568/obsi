import {
  GroupLayoutMode,
  MagneticGroup,
  MiroSubLayout,
  PinnedNodePosition,
} from "./types";

export const MIRO_HEADER_HEIGHT = 38;
export const MIRO_FRAME_PADDING = 30;
export const MIRO_MIN_WIDTH = 210;
export const MIRO_MIN_HEIGHT = 165;

export interface SimPoint {
  id: string;
  x: number;
  y: number;
  pinned?: boolean;
}

export interface SimEdge {
  source: string;
  target: string;
}

export interface EffectiveGroupSpec {
  id: string;
  name: string;
  color: string;
  memberIds: Set<string>;
  strength: number;
  mode: GroupLayoutMode;
  anchorMode: "auto" | "manual";
  anchorX?: number;
  anchorY?: number;
  frameX?: number;
  frameY?: number;
  frameW?: number;
  frameH?: number;
  frameSubLayout?: MiroSubLayout;
  customOffsets?: Record<string, { dx: number; dy: number }>;
  isNative?: boolean;
}

export interface PhysicsConfig {
  attractionStrength: number; // 0..1
  clusterTether: number; // 0..1
  groupCompactness: number; // 0.2..1
  nativeLinkDistance: number; // typically 120..250 in Obsidian
  repelOutsidersFromFrames?: boolean;
  pinnedNodes?: Record<string, PinnedNodePosition>;
}

export interface MiroFrameRect {
  x: number;
  y: number;
  w: number;
  h: number;
  subLayout: MiroSubLayout;
}

export interface GroupZoneRenderInfo {
  id: string;
  name: string;
  color: string;
  mode: GroupLayoutMode;
  memberCount: number;
  centroidX: number;
  centroidY: number;
  pocketX: number;
  pocketY: number;
  bridgeX: number;
  bridgeY: number;
  hasBridge: boolean;
  anchorMode: "auto" | "manual";
  isNative: boolean;
  hull: Array<{ x: number; y: number }>;
  radius: number;
  frameRect?: MiroFrameRect;
}

export interface PhysicsStepOutput {
  displacements: Map<string, { dx: number; dy: number }>;
  hardPinnedTargets: Map<string, { x: number; y: number; sourceGroupId?: string }>;
  zones: GroupZoneRenderInfo[];
  globalCenter: { x: number; y: number };
}

/**
 * Compute sensible initial Miro Frame dimensions & position around existing nodes (or graph center).
 */
export function computeDefaultMiroFrame(
  memberPositions: Array<{ id: string; x: number; y: number }>,
  fallbackCenter: { x: number; y: number },
  subLayout: MiroSubLayout = "grid"
): {
  frameX: number;
  frameY: number;
  frameW: number;
  frameH: number;
  customOffsets: Record<string, { dx: number; dy: number }>;
} {
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
    const customOffsets: Record<string, { dx: number; dy: number }> = {};
    for (const p of memberPositions) {
      customOffsets[p.id] = {
        dx: p.x - fx,
        dy: p.y - fy,
      };
    }
    return {
      frameX: Math.round(fx),
      frameY: Math.round(fy),
      frameW: Math.round(w),
      frameH: Math.round(h),
      customOffsets,
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
      customOffsets: {},
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
    customOffsets: {},
  };
}

/**
 * Deterministic Miro-board card positions inside a frame for "miro-pinned" mode.
 * Returns both exact target coordinates per node ID and the effective frame dimensions
 * (expanding height cleanly if many notes were added by query so cards never pile up).
 */
export function computeMiroFrameNodeTargets(
  frameX: number,
  frameY: number,
  frameW: number,
  frameH: number,
  memberNodes: SimPoint[],
  subLayout: MiroSubLayout = "grid",
  customOffsets?: Record<string, { dx: number; dy: number }>
): {
  targets: Map<string, { x: number; y: number }>;
  effectiveW: number;
  effectiveH: number;
} {
  const targets = new Map<string, { x: number; y: number }>();
  const w = Math.max(MIRO_MIN_WIDTH, frameW);
  let h = Math.max(MIRO_MIN_HEIGHT, frameH);
  const sorted = [...memberNodes].sort((a, b) => a.id.localeCompare(b.id));
  const n = sorted.length;
  if (n === 0) {
    return { targets, effectiveW: w, effectiveH: h };
  }

  const padX = MIRO_FRAME_PADDING;
  const topInset = MIRO_HEADER_HEIGHT + 28;
  const bottomInset = 28;
  const innerW = Math.max(60, w - padX * 2);

  if (subLayout === "freeform") {
    for (let i = 0; i < n; i++) {
      const node = sorted[i];
      const saved = customOffsets?.[node.id];
      let dx: number;
      let dy: number;
      if (saved && Number.isFinite(saved.dx) && Number.isFinite(saved.dy)) {
        dx = clamp(saved.dx, 22, w - 22);
        dy = clamp(saved.dy, MIRO_HEADER_HEIGHT + 18, h - 18);
      } else {
        dx = clamp(node.x - frameX, 26, w - 26);
        dy = clamp(node.y - frameY, MIRO_HEADER_HEIGHT + 22, h - 22);
      }
      targets.set(node.id, { x: frameX + dx, y: frameY + dy });
    }
    return { targets, effectiveW: w, effectiveH: h };
  }

  if (subLayout === "circle") {
    const innerH = Math.max(80, h - topInset - bottomInset);
    const cx = frameX + w / 2;
    const cy = frameY + topInset + innerH / 2;
    if (n === 1) {
      targets.set(sorted[0].id, { x: cx, y: cy });
      return { targets, effectiveW: w, effectiveH: h };
    }
    const rx = Math.max(32, innerW / 2 - 18);
    const ry = Math.max(32, innerH / 2 - 18);
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + (2 * Math.PI * i) / n;
      targets.set(sorted[i].id, {
        x: cx + Math.cos(angle) * rx,
        y: cy + Math.sin(angle) * ry,
      });
    }
    return { targets, effectiveW: w, effectiveH: h };
  }

  let cols: number;
  if (subLayout === "column") {
    cols = 1;
  } else if (subLayout === "row") {
    cols = n;
  } else {
    // Grid: `cols` columns occupy `cols - 1` intervals across `innerW`!
    const maxColsByWidth = Math.max(1, Math.floor(innerW / 74) + 1);
    const aspectCols = Math.max(
      1,
      Math.round(Math.sqrt(n * Math.max(0.75, innerW / Math.max(80, h - topInset))))
    );
    cols = clamp(aspectCols, 1, Math.min(n, maxColsByWidth));
  }

  const rows = Math.max(1, Math.ceil(n / cols));
  const minRequiredH = topInset + bottomInset + Math.max(0, rows - 1) * 52 + 24;
  if (h < minRequiredH) {
    h = minRequiredH;
  }
  const innerH = Math.max(40, h - topInset - bottomInset);

  for (let i = 0; i < n; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const itemsInThisRow = row === rows - 1 ? n - row * cols : cols;

    let x: number;
    if (itemsInThisRow <= 1) {
      x = frameX + w / 2;
    } else {
      const rowSpanW = innerW * (itemsInThisRow / cols);
      const rowStartX = frameX + (w - rowSpanW) / 2;
      const stepX = cols > 1 ? innerW / (cols - 1) : 0;
      x =
        itemsInThisRow === cols
          ? frameX + padX + col * stepX
          : rowStartX + (col / (itemsInThisRow - 1)) * rowSpanW;
    }

    const y =
      rows <= 1
        ? frameY + topInset + innerH / 2
        : frameY + topInset + (row / (rows - 1)) * innerH;

    targets.set(sorted[i].id, { x, y });
  }

  return { targets, effectiveW: w, effectiveH: h };
}

/**
 * Core cluster-tethered magnetic grouping + Miro-Board hybrid solver.
 *
 * Supports simultaneously on the same live graph:
 * 1. "miro-pinned" frames: Hard-locks member nodes into exact Miro card positions (grid/column/row/circle/freeform).
 * 2. Individual pinnedNodes: Hard-locks individual sticky-pinned nodes at exact (x, y) coordinates.
 * 3. "miro-free" frames: Keeps the rectangular Miro frame fixed while member nodes stay dynamically alive inside its walls.
 * 4. "organic" groups: Softly attracts members into a cohesive lobe attached to the main cluster without tearing.
 * 5. Optional soft frame-wall clearing so random ungrouped dynamic nodes don't drift through Miro frames.
 */
export function computeMagneticStep(
  nodes: SimPoint[],
  edges: SimEdge[],
  groups: EffectiveGroupSpec[],
  config: PhysicsConfig
): PhysicsStepOutput {
  const displacements = new Map<string, { dx: number; dy: number }>();
  const hardPinnedTargets = new Map<
    string,
    { x: number; y: number; sourceGroupId?: string }
  >();
  const zones: GroupZoneRenderInfo[] = [];

  if (nodes.length === 0) {
    return {
      displacements,
      hardPinnedTargets,
      zones,
      globalCenter: { x: 0, y: 0 },
    };
  }

  const nodeMap = new Map<string, SimPoint>();
  let sumAllX = 0;
  let sumAllY = 0;
  for (const n of nodes) {
    nodeMap.set(n.id, n);
    sumAllX += n.x;
    sumAllY += n.y;
  }
  const globalCenter = {
    x: sumAllX / nodes.length,
    y: sumAllY / nodes.length,
  };

  // Build adjacency list for fast bridge lookup
  const neighbors = new Map<string, string[]>();
  for (const n of nodes) neighbors.set(n.id, []);
  for (const e of edges) {
    if (e.source === e.target) continue;
    const sList = neighbors.get(e.source);
    const tList = neighbors.get(e.target);
    if (sList && tList) {
      sList.push(e.target);
      tList.push(e.source);
    }
  }

  // Register individual pinned nodes first (miro-pinned group frames can override if node is also in a miro-pinned frame)
  if (config.pinnedNodes) {
    for (const [nodeId, pos] of Object.entries(config.pinnedNodes)) {
      if (nodeMap.has(nodeId) && Number.isFinite(pos.x) && Number.isFinite(pos.y)) {
        hardPinnedTargets.set(nodeId, { x: pos.x, y: pos.y });
      }
    }
  }

  const accum = new Map<string, { dx: number; dy: number; weightSum: number }>();
  const linkDist = Math.max(60, config.nativeLinkDistance || 140);
  const tether = clamp(config.clusterTether, 0, 1);
  const compact = clamp(config.groupCompactness, 0.15, 1);
  const globalAttract = clamp(config.attractionStrength, 0, 1);

  const activeMiroFrames: Array<{
    groupId: string;
    memberIds: Set<string>;
    x: number;
    y: number;
    w: number;
    h: number;
  }> = [];

  const organicPocketTrackers: Array<{
    spec: EffectiveGroupSpec;
    zoneIndex: number;
    memberNodes: SimPoint[];
    desiredRadius: number;
    maxLeashDist: number;
    leashOriginX: number;
    leashOriginY: number;
  }> = [];

  for (const group of groups) {
    const mode: GroupLayoutMode = group.mode || "organic";
    const memberNodes: SimPoint[] = [];
    for (const id of group.memberIds) {
      const pt = nodeMap.get(id);
      if (pt) memberNodes.push(pt);
    }

    // Even empty Miro frames should render on the board so the user/agent can drag notes into them!
    const isMiro = mode === "miro-pinned" || mode === "miro-free";
    if (memberNodes.length === 0 && !isMiro) continue;

    // Group centroid + external bridge calculation
    let gx = globalCenter.x;
    let gy = globalCenter.y;
    if (memberNodes.length > 0) {
      let sx = 0;
      let sy = 0;
      for (const m of memberNodes) {
        sx += m.x;
        sy += m.y;
      }
      gx = sx / memberNodes.length;
      gy = sy / memberNodes.length;
    }

    let extSumX = 0;
    let extSumY = 0;
    let extLinks = 0;
    const externalLinkCountByMember = new Map<string, number>();
    for (const m of memberNodes) {
      const adj = neighbors.get(m.id) || [];
      let mExt = 0;
      for (const nbId of adj) {
        if (!group.memberIds.has(nbId)) {
          const nb = nodeMap.get(nbId);
          if (nb) {
            extSumX += nb.x;
            extSumY += nb.y;
            extLinks++;
            mExt++;
          }
        }
      }
      externalLinkCountByMember.set(m.id, mExt);
    }

    const hasBridge = extLinks > 0;
    const bridgeX = hasBridge ? extSumX / extLinks : globalCenter.x;
    const bridgeY = hasBridge ? extSumY / extLinks : globalCenter.y;

    // =========================================================================
    // MODE A & B: MIRO BOARD FRAMES ("miro-pinned" and "miro-free")
    // =========================================================================
    if (isMiro) {
      const subLayout: MiroSubLayout = group.frameSubLayout || "grid";
      const defaults =
        group.frameX !== undefined &&
        group.frameY !== undefined &&
        group.frameW !== undefined &&
        group.frameH !== undefined
          ? {
              frameX: group.frameX,
              frameY: group.frameY,
              frameW: group.frameW,
              frameH: group.frameH,
              customOffsets: group.customOffsets || {},
            }
          : computeDefaultMiroFrame(memberNodes, { x: gx, y: gy }, subLayout);

      const fx = defaults.frameX;
      const fy = defaults.frameY;
      let fw = Math.max(MIRO_MIN_WIDTH, defaults.frameW);
      let fh = Math.max(MIRO_MIN_HEIGHT, defaults.frameH);

      if (mode === "miro-pinned") {
        const layout = computeMiroFrameNodeTargets(
          fx,
          fy,
          fw,
          fh,
          memberNodes,
          subLayout,
          group.customOffsets || defaults.customOffsets
        );
        fw = layout.effectiveW;
        fh = layout.effectiveH;
        for (const [nodeId, targetPos] of layout.targets.entries()) {
          hardPinnedTargets.set(nodeId, {
            x: targetPos.x,
            y: targetPos.y,
            sourceGroupId: group.id,
          });
        }
      } else {
        // mode === "miro-free": Fixed Miro rectangle on the board, DYNAMIC nodes inside its walls!
        const pad = 28;
        const minInX = fx + pad;
        const maxInX = fx + fw - pad;
        const minInY = fy + MIRO_HEADER_HEIGHT + pad;
        const maxInY = fy + fh - pad;
        const innerCenterX = (minInX + maxInX) / 2;
        const innerCenterY = (minInY + maxInY) / 2;
        const comfortDist = Math.max(
          42,
          Math.min(90, Math.sqrt(((maxInX - minInX) * (maxInY - minInY)) / Math.max(1, memberNodes.length)) * 0.72)
        );

        for (const m of memberNodes) {
          if (m.pinned || hardPinnedTargets.has(m.id)) continue;

          let stepX = 0;
          let stepY = 0;

          // Strong smooth containment wall when outside the Miro frame bounds
          if (m.x < minInX) stepX += (minInX - m.x) * 0.42;
          else if (m.x > maxInX) stepX += (maxInX - m.x) * 0.42;

          if (m.y < minInY) stepY += (minInY - m.y) * 0.42;
          else if (m.y > maxInY) stepY += (maxInY - m.y) * 0.42;

          // Centering pull toward the interior of the Miro frame so external links lean nodes naturally without squashing them onto the border
          stepX += (innerCenterX - m.x) * 0.095 * clamp(group.strength, 0.2, 2);
          stepY += (innerCenterY - m.y) * 0.095 * clamp(group.strength, 0.2, 2);

          // Pairwise breathing repulsion inside the Miro frame so dynamic cards stay legible
          for (const other of memberNodes) {
            if (other.id === m.id) continue;
            let rx = m.x - other.x;
            let ry = m.y - other.y;
            let rd = Math.hypot(rx, ry);
            if (rd < comfortDist) {
              if (rd < 0.5) {
                const a = deterministicAngle(m.id + ":" + other.id);
                rx = Math.cos(a);
                ry = Math.sin(a);
                rd = 1;
              }
              const rep = ((comfortDist - rd) / comfortDist) * 4.5;
              stepX += (rx / rd) * rep;
              stepY += (ry / rd) * rep;
            }
          }

          const stepMag = Math.hypot(stepX, stepY);
          const maxStep = 28;
          if (stepMag > maxStep) {
            stepX = (stepX / stepMag) * maxStep;
            stepY = (stepY / stepMag) * maxStep;
          }

          const prev = accum.get(m.id) || { dx: 0, dy: 0, weightSum: 0 };
          prev.dx += stepX;
          prev.dy += stepY;
          prev.weightSum += 1;
          accum.set(m.id, prev);
        }
      }

      activeMiroFrames.push({
        groupId: group.id,
        memberIds: group.memberIds,
        x: fx,
        y: fy,
        w: fw,
        h: fh,
      });

      const frameCenterX = fx + fw / 2;
      const frameCenterY = fy + fh / 2;
      zones.push({
        id: group.id,
        name: group.name,
        color: group.color,
        mode,
        memberCount: memberNodes.length,
        centroidX: frameCenterX,
        centroidY: frameCenterY,
        pocketX: fx + fw / 2,
        pocketY: fy,
        bridgeX,
        bridgeY,
        hasBridge,
        anchorMode: "manual",
        isNative: Boolean(group.isNative),
        hull: [
          { x: fx, y: fy },
          { x: fx + fw, y: fy },
          { x: fx + fw, y: fy + fh },
          { x: fx, y: fy + fh },
        ],
        radius: Math.hypot(fw, fh) / 2,
        frameRect: {
          x: fx,
          y: fy,
          w: fw,
          h: fh,
          subLayout,
        },
      });
      continue;
    }

    // =========================================================================
    // MODE C: ORGANIC CLUSTER-TETHERED MAGNETIC GROUP ("organic")
    // =========================================================================
    const nonMemberCount = nodes.length - memberNodes.length;
    let outDirX: number;
    let outDirY: number;

    if (nonMemberCount > 0) {
      const restX = (sumAllX - gx * memberNodes.length) / nonMemberCount;
      const restY = (sumAllY - gy * memberNodes.length) / nonMemberCount;
      outDirX = gx - restX;
      outDirY = gy - restY;
    } else {
      outDirX = gx - globalCenter.x;
      outDirY = gy - globalCenter.y;
    }

    let outLen = Math.hypot(outDirX, outDirY);
    if (outLen < 1) {
      const h = deterministicAngle(group.id);
      outDirX = Math.cos(h);
      outDirY = Math.sin(h);
      outLen = 1;
    }
    outDirX /= outLen;
    outDirY /= outLen;

    const spacingFactor = 1.35 - compact * 0.72;
    const desiredRadius = Math.max(
      28,
      Math.sqrt(memberNodes.length) * linkDist * 0.28 * spacingFactor
    );

    const lobeOffset = hasBridge
      ? linkDist * (0.45 + (1 - tether) * 1.15)
      : linkDist * (0.65 + (1 - tether) * 0.9);

    let pocketX: number;
    let pocketY: number;

    if (
      group.anchorMode === "manual" &&
      typeof group.anchorX === "number" &&
      typeof group.anchorY === "number"
    ) {
      const anchorOriginX = hasBridge ? bridgeX : globalCenter.x;
      const anchorOriginY = hasBridge ? bridgeY : globalCenter.y;
      const rawDx = group.anchorX - anchorOriginX;
      const rawDy = group.anchorY - anchorOriginY;
      const rawDist = Math.hypot(rawDx, rawDy);
      const maxLeash = linkDist * (1.2 + (1 - tether) * 4.2) + desiredRadius * 0.6;
      if (tether > 0.03 && rawDist > maxLeash && rawDist > 0) {
        const excess = rawDist - maxLeash;
        const dampedDist = maxLeash + Math.log1p(excess / 90) * 90 * (1 - tether * 0.78);
        pocketX = anchorOriginX + (rawDx / rawDist) * dampedDist;
        pocketY = anchorOriginY + (rawDy / rawDist) * dampedDist;
      } else {
        pocketX = group.anchorX;
        pocketY = group.anchorY;
      }
    } else if (hasBridge) {
      const organicPocketX = bridgeX + outDirX * lobeOffset;
      const organicPocketY = bridgeY + outDirY * lobeOffset;
      const blend = 0.55 + tether * 0.35;
      pocketX = gx * (1 - blend) + organicPocketX * blend;
      pocketY = gy * (1 - blend) + organicPocketY * blend;
    } else {
      const maxFloatDist = linkDist * (1.35 + (1 - tether) * 1.8);
      const distFromGlobal = Math.hypot(gx - globalCenter.x, gy - globalCenter.y);
      if (distFromGlobal > maxFloatDist && distFromGlobal > 0) {
        pocketX =
          globalCenter.x + ((gx - globalCenter.x) / distFromGlobal) * maxFloatDist;
        pocketY =
          globalCenter.y + ((gy - globalCenter.y) / distFromGlobal) * maxFloatDist;
      } else {
        pocketX = gx;
        pocketY = gy;
      }
    }

    const hull = computePaddedConvexHull(memberNodes, 24);
    const zoneIdx = zones.length;
    zones.push({
      id: group.id,
      name: group.name,
      color: group.color,
      mode: "organic",
      memberCount: memberNodes.length,
      centroidX: gx,
      centroidY: gy,
      pocketX,
      pocketY,
      bridgeX,
      bridgeY,
      hasBridge,
      anchorMode: group.anchorMode,
      isNative: Boolean(group.isNative),
      hull,
      radius: Math.max(desiredRadius, estimateClusterRadius(memberNodes, gx, gy) + 22),
    });

    organicPocketTrackers.push({
      spec: group,
      zoneIndex: zoneIdx,
      memberNodes,
      desiredRadius,
      maxLeashDist: linkDist * (1.25 + (1 - tether) * 3.8) + desiredRadius * 0.6,
      leashOriginX: hasBridge ? bridgeX : globalCenter.x,
      leashOriginY: hasBridge ? bridgeY : globalCenter.y,
    });
  }

  // Soft inter-pocket separation for auto organic groups so sibling lobes don't overlap each other OR overlap Miro Frames!
  if (organicPocketTrackers.length >= 1) {
    for (let iter = 0; iter < 2; iter++) {
      // Separate sibling organic pockets
      for (let i = 0; i < organicPocketTrackers.length; i++) {
        for (let j = i + 1; j < organicPocketTrackers.length; j++) {
          const a = organicPocketTrackers[i];
          const b = organicPocketTrackers[j];
          const za = zones[a.zoneIndex];
          const zb = zones[b.zoneIndex];

          let overlap = 0;
          for (const id of a.spec.memberIds) {
            if (b.spec.memberIds.has(id)) overlap++;
          }
          const minSize = Math.min(a.spec.memberIds.size, b.spec.memberIds.size);
          if (minSize > 0 && overlap / minSize > 0.45) continue;

          let dx = zb.pocketX - za.pocketX;
          let dy = zb.pocketY - za.pocketY;
          let dist = Math.hypot(dx, dy);
          const minSep = a.desiredRadius + b.desiredRadius + 36;
          if (dist < minSep) {
            if (dist < 1) {
              const ang = deterministicAngle(a.spec.id + ":" + b.spec.id);
              dx = Math.cos(ang);
              dy = Math.sin(ang);
              dist = 1;
            }
            const push = (minSep - dist) * 0.45;
            const ux = dx / dist;
            const uy = dy / dist;
            if (a.spec.anchorMode !== "manual") {
              za.pocketX -= ux * push;
              za.pocketY -= uy * push;
            }
            if (b.spec.anchorMode !== "manual") {
              zb.pocketX += ux * push;
              zb.pocketY += uy * push;
            }
          }
        }
      }

      // Also keep auto organic pockets from landing directly on top of a Miro Frame!
      for (const p of organicPocketTrackers) {
        if (p.spec.anchorMode === "manual") continue;
        const z = zones[p.zoneIndex];
        for (const mf of activeMiroFrames) {
          const pad = p.desiredRadius + 30;
          const cx = mf.x + mf.w / 2;
          const cy = mf.y + mf.h / 2;
          const halfW = mf.w / 2 + pad;
          const halfH = mf.h / 2 + pad;
          const relX = z.pocketX - cx;
          const relY = z.pocketY - cy;
          if (Math.abs(relX) < halfW && Math.abs(relY) < halfH) {
            const penX = halfW - Math.abs(relX);
            const penY = halfH - Math.abs(relY);
            if (penX < penY) {
              z.pocketX += (relX >= 0 ? 1 : -1) * penX * 0.65;
            } else {
              z.pocketY += (relY >= 0 ? 1 : -1) * penY * 0.65;
            }
          }
        }

        if (tether > 0.05) {
          const rdx = z.pocketX - p.leashOriginX;
          const rdy = z.pocketY - p.leashOriginY;
          const rdist = Math.hypot(rdx, rdy);
          if (rdist > p.maxLeashDist && rdist > 0) {
            z.pocketX = p.leashOriginX + (rdx / rdist) * p.maxLeashDist;
            z.pocketY = p.leashOriginY + (rdy / rdist) * p.maxLeashDist;
          }
        }
      }
    }
  }

  // Apply organic group attraction displacements
  if (globalAttract > 0.001) {
    for (const p of organicPocketTrackers) {
      const z = zones[p.zoneIndex];
      const groupStrength = clamp(p.spec.strength, 0.1, 2.5);
      const baseAlpha = globalAttract * groupStrength * 0.155;

      for (const m of p.memberNodes) {
        if (m.pinned || hardPinnedTargets.has(m.id)) continue;

        const adj = neighbors.get(m.id) || [];
        let extCount = 0;
        for (const nbId of adj) {
          if (!p.spec.memberIds.has(nbId)) extCount++;
        }

        const bridgeDamping =
          extCount > 0 ? 1 / (1 + extCount * 0.26 * tether) : 1.08;

        const toPocketX = z.pocketX - m.x;
        const toPocketY = z.pocketY - m.y;
        const distToPocket = Math.hypot(toPocketX, toPocketY);

        let radialBoost = 1;
        if (distToPocket < p.desiredRadius * 0.65) {
          radialBoost = 0.28 + compact * 0.32;
        } else if (distToPocket > p.desiredRadius) {
          radialBoost = Math.min(
            1.75,
            1 + (distToPocket - p.desiredRadius) / (p.desiredRadius + 80)
          );
        }

        const stepScale = Math.min(0.42, baseAlpha * bridgeDamping * radialBoost);
        const stepDx = toPocketX * stepScale;
        const stepDy = toPocketY * stepScale;

        const prev = accum.get(m.id) || { dx: 0, dy: 0, weightSum: 0 };
        prev.dx += stepDx * groupStrength;
        prev.dy += stepDy * groupStrength;
        prev.weightSum += groupStrength;
        accum.set(m.id, prev);
      }
    }
  }

  // Optional soft wall clearing: gently push non-member dynamic nodes outside Miro Frames so frames stay uncluttered
  if (config.repelOutsidersFromFrames !== false && activeMiroFrames.length > 0) {
    for (const n of nodes) {
      if (n.pinned || hardPinnedTargets.has(n.id)) continue;
      for (const mf of activeMiroFrames) {
        if (mf.memberIds.has(n.id)) continue;
        const margin = 18;
        const left = mf.x - margin;
        const right = mf.x + mf.w + margin;
        const top = mf.y - margin;
        const bottom = mf.y + mf.h + margin;
        if (n.x > left && n.x < right && n.y > top && n.y < bottom) {
          const dLeft = n.x - left;
          const dRight = right - n.x;
          const dTop = n.y - top;
          const dBottom = bottom - n.y;
          const minSide = Math.min(dLeft, dRight, dTop, dBottom);
          let pushX = 0;
          let pushY = 0;
          if (minSide === dLeft) pushX = -Math.min(18, dLeft * 0.35 + 2.5);
          else if (minSide === dRight) pushX = Math.min(18, dRight * 0.35 + 2.5);
          else if (minSide === dTop) pushY = -Math.min(18, dTop * 0.35 + 2.5);
          else pushY = Math.min(18, dBottom * 0.35 + 2.5);

          const prev = accum.get(n.id) || { dx: 0, dy: 0, weightSum: 0 };
          prev.dx += pushX;
          prev.dy += pushY;
          prev.weightSum = Math.max(1, prev.weightSum);
          accum.set(n.id, prev);
        }
      }
    }
  }

  const maxStepPerFrame = 24;
  for (const [id, v] of accum.entries()) {
    if (hardPinnedTargets.has(id)) continue;
    if (v.weightSum <= 0) continue;
    let dx = v.dx / Math.max(1, v.weightSum);
    let dy = v.dy / Math.max(1, v.weightSum);
    const mag = Math.hypot(dx, dy);
    if (mag > maxStepPerFrame) {
      dx = (dx / mag) * maxStepPerFrame;
      dy = (dy / mag) * maxStepPerFrame;
    }
    if (Math.abs(dx) > 0.04 || Math.abs(dy) > 0.04) {
      displacements.set(id, { dx, dy });
    }
  }

  return { displacements, hardPinnedTargets, zones, globalCenter };
}

export function computePaddedConvexHull(
  points: Array<{ x: number; y: number }>,
  pad: number
): Array<{ x: number; y: number }> {
  if (points.length === 0) return [];
  if (points.length === 1) {
    return circlePolygon(points[0].x, points[0].y, pad + 10, 12);
  }
  if (points.length === 2) {
    const [a, b] = points;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    const ux = dx / len;
    const uy = dy / len;
    const r = pad + 8;
    const out: Array<{ x: number; y: number }> = [];
    for (let i = 0; i <= 6; i++) {
      const ang = (Math.PI * i) / 6;
      out.push({
        x: a.x - ux * Math.sin(ang) * r + nx * Math.cos(ang) * r,
        y: a.y - uy * Math.sin(ang) * r + ny * Math.cos(ang) * r,
      });
    }
    for (let i = 0; i <= 6; i++) {
      const ang = (Math.PI * i) / 6;
      out.push({
        x: b.x + ux * Math.sin(ang) * r - nx * Math.cos(ang) * r,
        y: b.y + uy * Math.sin(ang) * r - ny * Math.cos(ang) * r,
      });
    }
    return out;
  }

  const sorted = [...points].sort((p, q) => (p.x === q.x ? p.y - q.y : p.x - q.x));
  const lower: Array<{ x: number; y: number }> = [];
  for (const p of sorted) {
    while (
      lower.length >= 2 &&
      cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0
    ) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper: Array<{ x: number; y: number }> = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (
      upper.length >= 2 &&
      cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0
    ) {
      upper.pop();
    }
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  const hull = lower.concat(upper);
  if (hull.length < 3) {
    const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
    const cy = points.reduce((s, p) => s + p.y, 0) / points.length;
    return circlePolygon(cx, cy, pad + 16, 12);
  }

  const cx = hull.reduce((s, p) => s + p.x, 0) / hull.length;
  const cy = hull.reduce((s, p) => s + p.y, 0) / hull.length;

  return hull.map((p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return {
      x: p.x + (dx / len) * pad,
      y: p.y + (dy / len) * pad,
    };
  });
}

function circlePolygon(
  cx: number,
  cy: number,
  r: number,
  steps: number
): Array<{ x: number; y: number }> {
  const pts: Array<{ x: number; y: number }> = [];
  for (let i = 0; i < steps; i++) {
    const a = (2 * Math.PI * i) / steps;
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  return pts;
}

function estimateClusterRadius(
  pts: Array<{ x: number; y: number }>,
  cx: number,
  cy: number
): number {
  let maxD = 0;
  for (const p of pts) {
    const d = Math.hypot(p.x - cx, p.y - cy);
    if (d > maxD) maxD = d;
  }
  return maxD;
}

function cross(
  o: { x: number; y: number },
  a: { x: number; y: number },
  b: { x: number; y: number }
): number {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

function deterministicAngle(seed: string): number {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return ((hash >>> 0) % 3600) * ((2 * Math.PI) / 3600);
}

export function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

export function createGroupId(): string {
  return (
    "gmg-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 7)
  );
}
