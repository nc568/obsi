import assert from "node:assert/strict";
import esbuild from "esbuild";
import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceX,
  forceY,
} from "d3-force";

const bundled = await esbuild.build({
  stdin: {
    contents: `
      export * from "./src/physicsEngine.ts";
      export * from "./src/queryMatcher.ts";
    `,
    resolveDir: process.cwd(),
    loader: "ts",
  },
  bundle: true,
  format: "esm",
  external: ["obsidian"],
  write: false,
});

const code = bundled.outputFiles[0].text.replace(
  /from\s*["']obsidian["']/g,
  'from "data:text/javascript,export class TFile {} export class TFolder {} export function getAllTags(){return [];}"'
);
const mod = await import(
  `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
);

const {
  computeMagneticStep,
  computeMiroFrameNodeTargets,
  matchesGroupQuery,
  nodeMatchesMagneticGroup,
} = mod;

function buildSyntheticVault() {
  const nodes = [];
  const links = [];

  for (let i = 0; i < 16; i++) {
    nodes.push({ id: `Core/Hub-${i}.md`, groupTag: "#core" });
  }
  const topics = [
    { prefix: "AI", tag: "#ai", count: 10 },
    { prefix: "Backend", tag: "#backend", count: 10 },
    { prefix: "Design", tag: "#design", count: 10 },
    { prefix: "Notes", tag: "#misc", count: 10 },
  ];
  for (const t of topics) {
    for (let i = 0; i < t.count; i++) {
      nodes.push({ id: `${t.prefix}/Note-${i}.md`, groupTag: t.tag });
    }
  }

  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0xffffffff;
  };

  for (let i = 0; i < 16; i++) {
    links.push({
      source: `Core/Hub-${i}.md`,
      target: `Core/Hub-${(i + 1) % 16}.md`,
    });
    links.push({
      source: `Core/Hub-${i}.md`,
      target: `Core/Hub-${(i + 4) % 16}.md`,
    });
  }

  for (const n of nodes) {
    if (n.groupTag === "#core") continue;
    const hubA = Math.floor(rand() * 16);
    const hubB = Math.floor(rand() * 16);
    links.push({ source: n.id, target: `Core/Hub-${hubA}.md` });
    if (hubB !== hubA && rand() > 0.35) {
      links.push({ source: n.id, target: `Core/Hub-${hubB}.md` });
    }
  }

  for (let i = 0; i < 28; i++) {
    const a = nodes[Math.floor(rand() * nodes.length)];
    const b = nodes[Math.floor(rand() * nodes.length)];
    if (a.id !== b.id) {
      links.push({ source: a.id, target: b.id });
    }
  }

  for (let i = 0; i < nodes.length; i++) {
    const ang = (2 * Math.PI * i) / nodes.length;
    const r = 120 + (i % 5) * 45;
    nodes[i].x = Math.cos(ang) * r;
    nodes[i].y = Math.sin(ang) * r;
  }

  return { nodes, links };
}

function runHybridGraphSimulation({
  groups,
  pinnedNodes = {},
  attractionStrength = 0.65,
  clusterTether = 0.78,
  groupCompactness = 0.6,
  repelOutsidersFromFrames = true,
  ticks = 240,
}) {
  const { nodes, links } = buildSyntheticVault();
  const simEdges = links.map((l) => ({ source: l.source, target: l.target }));

  const sim = forceSimulation(nodes)
    .alphaDecay(0.012)
    .velocityDecay(0.38)
    .force("charge", forceManyBody().strength(-240))
    .force(
      "link",
      forceLink(links)
        .id((d) => d.id)
        .distance(140)
        .strength(0.35)
    )
    .force("x", forceX(0).strength(0.04))
    .force("y", forceY(0).strength(0.04))
    .stop();

  let lastStep = null;
  for (let t = 0; t < ticks; t++) {
    sim.tick();

    if (groups.length > 0 || Object.keys(pinnedNodes).length > 0) {
      lastStep = computeMagneticStep(
        nodes.map((n) => ({ id: n.id, x: n.x, y: n.y })),
        simEdges,
        groups,
        {
          attractionStrength,
          clusterTether,
          groupCompactness,
          nativeLinkDistance: 140,
          repelOutsidersFromFrames,
          pinnedNodes,
        }
      );

      for (const n of nodes) {
        const hardPin = lastStep.hardPinnedTargets.get(n.id);
        if (hardPin) {
          n.x = hardPin.x;
          n.y = hardPin.y;
          n.fx = hardPin.x;
          n.fy = hardPin.y;
        } else {
          n.fx = null;
          n.fy = null;
          const d = lastStep.displacements.get(n.id);
          if (d) {
            n.x += d.dx;
            n.y += d.dy;
          }
        }
      }
    }
  }

  return { nodes, links: simEdges, lastStep };
}

function avgPairwiseDistance(pts) {
  let sum = 0;
  let pairs = 0;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      sum += Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
      pairs++;
    }
  }
  return pairs > 0 ? sum / pairs : 0;
}

console.log("=== Running Graph Magnetic Groups + Miro-Board Physics Suite ===");

// 1. Query Matcher Verification
{
  const meta = {
    getTagsForNode: (id) =>
      id.startsWith("AI/") ? ["#ai", "#ai/agents"] : ["#core"],
    getFrontmatterForNode: (id) =>
      id === "AI/Note-0.md" ? { status: "active", sprint: 2 } : undefined,
  };
  assert.equal(matchesGroupQuery("tag:#ai", "AI/Note-1.md", "file", meta), true);
  assert.equal(
    matchesGroupQuery("tag:#ai/agents -Note-3", "AI/Note-3.md", "file", meta),
    false
  );
  assert.equal(
    matchesGroupQuery("[status:active]", "AI/Note-0.md", "file", meta),
    true
  );
  assert.equal(
    nodeMatchesMagneticGroup(
      { id: "Backend/Note-2.md", type: "file" },
      {
        id: "g1",
        name: "G1",
        color: "#fff",
        enabled: true,
        query: "path:Backend/",
        nodeIds: [],
        excludedNodeIds: [],
        strength: 1,
        colorNodes: true,
        mode: "organic",
        anchorMode: "auto",
      },
      meta
    ),
    true
  );
  console.log("✓ Query parser & metadata matcher passed");
}

// 2. Organic Group Cohesion WITHOUT Tearing from Main Cluster
{
  const aiIds = new Set(Array.from({ length: 10 }, (_, i) => `AI/Note-${i}.md`));
  const baseline = runHybridGraphSimulation({ groups: [] });
  const organic = runHybridGraphSimulation({
    groups: [
      {
        id: "g-ai",
        name: "AI Organic",
        color: "#7c5cff",
        memberIds: aiIds,
        strength: 1.0,
        mode: "organic",
        anchorMode: "auto",
      },
    ],
  });

  const baseDist = avgPairwiseDistance(
    baseline.nodes.filter((n) => aiIds.has(n.id))
  );
  const orgDist = avgPairwiseDistance(
    organic.nodes.filter((n) => aiIds.has(n.id))
  );
  assert.ok(
    orgDist < baseDist * 0.72,
    `Expected organic group to tighten significantly (${orgDist.toFixed(
      1
    )} vs ${baseDist.toFixed(1)})`
  );

  // Verify zero tearing on bridge links
  const byId = new Map(organic.nodes.map((n) => [n.id, n]));
  let maxBridgeLen = 0;
  for (const e of organic.links) {
    if (aiIds.has(e.source) !== aiIds.has(e.target)) {
      const a = byId.get(e.source);
      const b = byId.get(e.target);
      maxBridgeLen = Math.max(maxBridgeLen, Math.hypot(a.x - b.x, a.y - b.y));
    }
  }
  assert.ok(
    maxBridgeLen < 320,
    `Bridge links must not tear away from main cluster (maxBridgeLen=${maxBridgeLen.toFixed(
      1
    )})`
  );
  console.log(
    `✓ Organic group cohesion (${baseDist.toFixed(1)} -> ${orgDist.toFixed(
      1
    )} px) with zero cluster tearing (max bridge ${maxBridgeLen.toFixed(1)} px)`
  );
}

// 3. Miro-Pinned Board Frame ("miro-pinned") + Dynamic Surrounding Graph!
{
  const aiIds = new Set(Array.from({ length: 9 }, (_, i) => `AI/Note-${i}.md`));
  const frameX = -460;
  const frameY = -160;
  const frameW = 340;
  const frameH = 260;

  const miroSim = runHybridGraphSimulation({
    groups: [
      {
        id: "miro-ai",
        name: "AI Miro Sprint",
        color: "#2ec4b6",
        memberIds: aiIds,
        strength: 1.0,
        mode: "miro-pinned",
        anchorMode: "manual",
        frameX,
        frameY,
        frameW,
        frameH,
        frameSubLayout: "grid",
      },
    ],
    pinnedNodes: {
      "Core/Hub-0.md": { x: 0, y: -260 },
    },
  });

  const expectedSlots = computeMiroFrameNodeTargets(
    frameX,
    frameY,
    frameW,
    frameH,
    Array.from(aiIds).map((id) => ({ id, x: 0, y: 0 })),
    "grid"
  );

  const byId = new Map(miroSim.nodes.map((n) => [n.id, n]));

  // Every Miro-pinned node must sit at its EXACT grid slot (0.0 px drift!)
  for (const [id, slot] of expectedSlots.targets.entries()) {
    const actual = byId.get(id);
    const err = Math.hypot(actual.x - slot.x, actual.y - slot.y);
    assert.ok(err < 1e-6, `Miro-pinned card ${id} drifted by ${err}`);
    assert.ok(
      actual.x > frameX && actual.x < frameX + expectedSlots.effectiveW,
      `Card ${id} X inside frame`
    );
    assert.ok(
      actual.y > frameY + 38 && actual.y < frameY + expectedSlots.effectiveH,
      `Card ${id} Y inside frame`
    );
  }

  // Individual sticky-pinned node must also sit at exact (0, -260)
  const hub0 = byId.get("Core/Hub-0.md");
  assert.ok(Math.hypot(hub0.x - 0, hub0.y - -260) < 1e-6);

  // Outsider ungrouped dynamic nodes must be kept outside the Miro Frame rectangle!
  let outsidersInsideFrame = 0;
  for (const n of miroSim.nodes) {
    if (aiIds.has(n.id)) continue;
    if (
      n.x > frameX + 4 &&
      n.x < frameX + expectedSlots.effectiveW - 4 &&
      n.y > frameY + 4 &&
      n.y < frameY + expectedSlots.effectiveH - 4
    ) {
      outsidersInsideFrame++;
    }
  }
  assert.equal(
    outsidersInsideFrame,
    0,
    "Ungrouped dynamic nodes should stay clear of the Miro Frame interior"
  );

  // Dynamic unpinned Core hubs connected to AI Miro Frame on the left should shift toward negative X compared to symmetric baseline!
  const connectedHubIds = new Set();
  for (const e of miroSim.links) {
    if (aiIds.has(e.source) && e.target.startsWith("Core/"))
      connectedHubIds.add(e.target);
    if (aiIds.has(e.target) && e.source.startsWith("Core/"))
      connectedHubIds.add(e.source);
  }
  connectedHubIds.delete("Core/Hub-0.md");
  const meanConnectedHubX =
    Array.from(connectedHubIds).reduce((s, id) => s + byId.get(id).x, 0) /
    connectedHubIds.size;
  assert.ok(
    meanConnectedHubX < -15,
    `Dynamic neighbors should naturally pull toward the left Miro Frame (meanX=${meanConnectedHubX.toFixed(
      1
    )})`
  );

  console.log(
    `✓ Miro-pinned frame locked 9 cards in crisp grid (0.0 px drift), 0 outsiders inside frame, and dynamic hub neighbors adapted live (meanX=${meanConnectedHubX.toFixed(
      1
    )} px)`
  );
}

// 4. Miro Live Frame ("miro-free"): Fixed Frame Walls + Dynamic Nodes Inside!
{
  const designIds = new Set(
    Array.from({ length: 8 }, (_, i) => `Design/Note-${i}.md`)
  );
  const fx = 240;
  const fy = -150;
  const fw = 320;
  const fh = 280;

  const liveMiro = runHybridGraphSimulation({
    groups: [
      {
        id: "miro-live-design",
        name: "Design Live Miro",
        color: "#ff6b6b",
        memberIds: designIds,
        strength: 1.0,
        mode: "miro-free",
        anchorMode: "manual",
        frameX: fx,
        frameY: fy,
        frameW: fw,
        frameH: fh,
      },
    ],
  });

  const designNodes = liveMiro.nodes.filter((n) => designIds.has(n.id));
  for (const n of designNodes) {
    assert.equal(n.fx, null, "miro-free nodes must remain dynamic (fx === null)");
    assert.ok(
      n.x >= fx - 8 && n.x <= fx + fw + 8 && n.y >= fy + 20 && n.y <= fy + fh + 8,
      `miro-free node ${n.id} stayed dynamically bounded inside Miro Frame (${n.x.toFixed(
        1
      )}, ${n.y.toFixed(1)})`
    );
  }
  console.log(
    `✓ Miro live frame ("miro-free") kept all 8 dynamic nodes inside fixed board walls`
  );
}

console.log("=== ALL PHYSICS & MIRO-BOARD TESTS PASSED ===");
