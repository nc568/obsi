import fs from "node:fs";
import path from "node:path";
import esbuild from "esbuild";
import { Resvg } from "@resvg/resvg-js";
import {
  forceSimulation,
  forceManyBody,
  forceLink,
  forceX,
  forceY,
} from "d3-force";

const bundled = await esbuild.build({
  stdin: {
    contents: `export * from "./src/physicsEngine.ts";`,
    resolveDir: process.cwd(),
    loader: "ts",
  },
  bundle: true,
  format: "esm",
  write: false,
});
const { computeMagneticStep } = await import(
  `data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString(
    "base64"
  )}`
);

function buildVault() {
  const nodes = [];
  const links = [];
  for (let i = 0; i < 14; i++) nodes.push({ id: `Core/Hub-${i}.md`, topic: "core" });
  for (let i = 0; i < 9; i++) nodes.push({ id: `AI/Agent-${i}.md`, topic: "ai" });
  for (let i = 0; i < 8; i++) nodes.push({ id: `Backend/API-${i}.md`, topic: "backend" });
  for (let i = 0; i < 8; i++) nodes.push({ id: `Design/UI-${i}.md`, topic: "design" });

  let seed = 99;
  const rand = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 0xffffffff);

  for (let i = 0; i < 14; i++) {
    links.push({ source: `Core/Hub-${i}.md`, target: `Core/Hub-${(i + 1) % 14}.md` });
    links.push({ source: `Core/Hub-${i}.md`, target: `Core/Hub-${(i + 3) % 14}.md` });
  }
  for (const n of nodes) {
    if (n.topic === "core") continue;
    links.push({ source: n.id, target: `Core/Hub-${Math.floor(rand() * 14)}.md` });
    if (rand() > 0.35) {
      links.push({ source: n.id, target: `Core/Hub-${Math.floor(rand() * 14)}.md` });
    }
  }
  for (let i = 0; i < nodes.length; i++) {
    const a = (2 * Math.PI * i) / nodes.length;
    nodes[i].x = Math.cos(a) * 180;
    nodes[i].y = Math.sin(a) * 180;
  }
  return { nodes, links };
}

function simulate(groups, pinnedNodes = {}) {
  const { nodes, links } = buildVault();
  const simEdges = links.map((l) => ({ source: l.source, target: l.target }));
  const sim = forceSimulation(nodes)
    .alphaDecay(0.012)
    .velocityDecay(0.38)
    .force("charge", forceManyBody().strength(-220))
    .force("link", forceLink(links).id((d) => d.id).distance(125).strength(0.35))
    .force("x", forceX(0).strength(0.045))
    .force("y", forceY(0).strength(0.045))
    .stop();

  let step = null;
  for (let i = 0; i < 240; i++) {
    sim.tick();
    step = computeMagneticStep(
      nodes.map((n) => ({ id: n.id, x: n.x, y: n.y })),
      simEdges,
      groups,
      {
        attractionStrength: 0.65,
        clusterTether: 0.78,
        groupCompactness: 0.6,
        nativeLinkDistance: 125,
        repelOutsidersFromFrames: true,
        pinnedNodes,
      }
    );
    for (const n of nodes) {
      const hp = step.hardPinnedTargets.get(n.id);
      if (hp) {
        n.x = hp.x;
        n.y = hp.y;
        n.fx = hp.x;
        n.fy = hp.y;
      } else {
        n.fx = null;
        n.fy = null;
        const d = step.displacements.get(n.id);
        if (d) {
          n.x += d.dx;
          n.y += d.dy;
        }
      }
    }
  }
  return { nodes, edges: simEdges, step, groups, pinnedNodes };
}

const aiIds = new Set(Array.from({ length: 9 }, (_, i) => `AI/Agent-${i}.md`));
const beIds = new Set(Array.from({ length: 8 }, (_, i) => `Backend/API-${i}.md`));
const uiIds = new Set(Array.from({ length: 8 }, (_, i) => `Design/UI-${i}.md`));

const organicSim = simulate([
  { id: "g1", name: "AI Agents", color: "#2ec4b6", memberIds: aiIds, strength: 1, mode: "organic", anchorMode: "auto" },
  { id: "g2", name: "Backend", color: "#ff6b6b", memberIds: beIds, strength: 1, mode: "organic", anchorMode: "auto" },
  { id: "g3", name: "Design", color: "#7c5cff", memberIds: uiIds, strength: 1, mode: "organic", anchorMode: "auto" },
]);

const miroHybridSim = simulate(
  [
    {
      id: "m1",
      name: "AI Sprint (Miro Pin)",
      color: "#2ec4b6",
      memberIds: aiIds,
      strength: 1,
      mode: "miro-pinned",
      anchorMode: "manual",
      frameX: -540,
      frameY: -170,
      frameW: 290,
      frameH: 250,
      frameSubLayout: "grid",
    },
    {
      id: "m2",
      name: "Backend (Miro Live)",
      color: "#ff6b6b",
      memberIds: beIds,
      strength: 1,
      mode: "miro-free",
      anchorMode: "manual",
      frameX: 250,
      frameY: -170,
      frameW: 280,
      frameH: 250,
    },
    {
      id: "m3",
      name: "Design (Organic)",
      color: "#7c5cff",
      memberIds: uiIds,
      strength: 1,
      mode: "organic",
      anchorMode: "auto",
    },
  ],
  { "Core/Hub-0.md": { x: 0, y: -220 } }
);

function renderPanel(sim, title, subtitle, offsetX, panelW, panelH, showGrid) {
  const { nodes, edges, step, groups, pinnedNodes } = sim;
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const colorById = new Map();
  for (const g of groups) {
    for (const id of g.memberIds) colorById.set(id, g.color);
  }

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x);
    maxX = Math.max(maxX, n.x);
    minY = Math.min(minY, n.y);
    maxY = Math.max(maxY, n.y);
  }
  for (const z of step.zones) {
    if (z.frameRect) {
      minX = Math.min(minX, z.frameRect.x);
      maxX = Math.max(maxX, z.frameRect.x + z.frameRect.w);
      minY = Math.min(minY, z.frameRect.y);
      maxY = Math.max(maxY, z.frameRect.y + z.frameRect.h);
    }
  }

  const pad = 65;
  const spanX = maxX - minX + pad * 2;
  const spanY = maxY - minY + pad * 2;
  const usableH = panelH - 95;
  const scale = Math.min((panelW - 44) / spanX, usableH / spanY);
  const cxW = (minX + maxX) / 2;
  const cyW = (minY + maxY) / 2;
  const cxS = offsetX + panelW / 2;
  const cyS = 78 + usableH / 2;
  const sx = (wx) => cxS + (wx - cxW) * scale;
  const sy = (wy) => cyS + (wy - cyW) * scale;

  const out = [];
  out.push(`<rect x="${offsetX + 10}" y="10" width="${panelW - 20}" height="${panelH - 20}" rx="14" fill="#141620" stroke="#2c3146" stroke-width="1.5"/>`);
  out.push(`<text x="${offsetX + 28}" y="38" fill="#eef1f8" font-family="DejaVu Sans" font-size="16" font-weight="bold">${title}</text>`);
  out.push(`<text x="${offsetX + 28}" y="58" fill="#8e96b0" font-family="DejaVu Sans" font-size="12">${subtitle}</text>`);

  if (showGrid) {
    for (let gx = offsetX + 28; gx < offsetX + panelW - 24; gx += 26) {
      for (let gy = 80; gy < panelH - 24; gy += 26) {
        out.push(`<circle cx="${gx}" cy="${gy}" r="1" fill="#3a405a" fill-opacity="0.55"/>`);
      }
    }
  }

  for (const z of step.zones) {
    if ((z.mode === "miro-pinned" || z.mode === "miro-free") && z.frameRect) {
      const rx = sx(z.frameRect.x);
      const ry = sy(z.frameRect.y);
      const rw = z.frameRect.w * scale;
      const rh = z.frameRect.h * scale;
      const hh = Math.max(18, 38 * scale);
      const dash = z.mode === "miro-pinned" ? "" : `stroke-dasharray="7,4"`;
      out.push(`<rect x="${rx.toFixed(1)}" y="${ry.toFixed(1)}" width="${rw.toFixed(1)}" height="${rh.toFixed(1)}" rx="10" fill="${z.color}" fill-opacity="0.14" stroke="${z.color}" stroke-width="2" ${dash}/>`);
      out.push(`<rect x="${rx.toFixed(1)}" y="${ry.toFixed(1)}" width="${rw.toFixed(1)}" height="${hh.toFixed(1)}" rx="8" fill="${z.color}" fill-opacity="0.28"/>`);
      out.push(`<text x="${(rx + 10).toFixed(1)}" y="${(ry + hh * 0.68).toFixed(1)}" fill="#ffffff" font-family="DejaVu Sans" font-size="11.5" font-weight="bold">${z.name}</text>`);
    } else if (z.hull.length >= 3) {
      const pts = z.hull.map((p) => `${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" ");
      out.push(`<polygon points="${pts}" fill="${z.color}" fill-opacity="0.14" stroke="${z.color}" stroke-opacity="0.6" stroke-width="1.5" stroke-dasharray="5,4"/>`);
      const topY = Math.min(...z.hull.map((p) => sy(p.y))) - 8;
      out.push(`<text x="${sx(z.centroidX).toFixed(1)}" y="${topY.toFixed(1)}" text-anchor="middle" fill="${z.color}" font-family="DejaVu Sans" font-size="11.5" font-weight="bold">${z.name}</text>`);
    }
  }

  for (const e of edges) {
    const a = byId.get(e.source);
    const b = byId.get(e.target);
    out.push(`<line x1="${sx(a.x).toFixed(1)}" y1="${sy(a.y).toFixed(1)}" x2="${sx(b.x).toFixed(1)}" y2="${sy(b.y).toFixed(1)}" stroke="#5c6482" stroke-opacity="0.38" stroke-width="1.1"/>`);
  }

  for (const n of nodes) {
    const col = colorById.get(n.id) || "#9aa3be";
    const x = sx(n.x);
    const y = sy(n.y);
    const isIndividualPin = Boolean(pinnedNodes[n.id]);
    if (isIndividualPin) {
      out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="10" fill="none" stroke="#ffbe0b" stroke-width="2"/>`);
    }
    out.push(`<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${col === "#9aa3be" ? 5 : 6}" fill="${col}" stroke="#141620" stroke-width="1.2"/>`);
  }

  return out.join("\n");
}

const W = 1520;
const H = 680;
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#0d0f17"/>
  ${renderPanel(
    organicSim,
    "1. Органические магнитные группы (режим: У кучи)",
    "Ноды собираются в лепестки вокруг основной кучи без разрыва связей",
    0,
    W / 2,
    H,
    false
  )}
  ${renderPanel(
    miroHybridSim,
    "2. Гибрид Доски Miro + Динамического Графа (Сетка + Живая рамка + Магнит)",
    "Слева жёсткая доска Miro 3x3, справа живая рамка Miro, в центре — динамический граф!",
    W / 2,
    W / 2,
    H,
    true
  )}
</svg>`;

const outDir = path.resolve("tests/.artifacts");
fs.mkdirSync(outDir, { recursive: true });
const pngBuf = new Resvg(svg, {
  font: { fontDirs: ["/usr/share/fonts/truetype/dejavu"], loadSystemFonts: true },
})
  .render()
  .asPng();
const outPath = path.join(outDir, "miro-hybrid-comparison.png");
fs.writeFileSync(outPath, pngBuf);
console.log("Wrote visual verification PNG:", outPath);
