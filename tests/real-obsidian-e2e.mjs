import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { chromium } from "playwright";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const rootDir = process.cwd();
const outDir = path.join(rootDir, "docs", "obsidian-e2e");
fs.mkdirSync(outDir, { recursive: true });

const vaultDir = path.join(os.tmpdir(), "obsidian-live-e2e-vault");
fs.rmSync(vaultDir, { recursive: true, force: true });
fs.mkdirSync(vaultDir, { recursive: true });

function writeVaultNote(relPath, content) {
  const full = path.join(vaultDir, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
}

console.log("1. Building realistic 38-note Obsidian Vault at", vaultDir);

const coreHubs = [
  "00 Индекс хранилища.md",
  "Карта проектов.md",
  "База знаний.md",
  "Дорожная карта 2026.md",
  "Архитектура системы.md",
  "Обзор квартала.md",
  "Ежедневные заметки.md",
  "Чеклист релиза.md",
  "Встречи команды.md",
  "Идеи развития.md",
];

for (let i = 0; i < coreHubs.length; i++) {
  const nextA = coreHubs[(i + 1) % coreHubs.length].replace(/\.md$/, "");
  const nextB = coreHubs[(i + 3) % coreHubs.length].replace(/\.md$/, "");
  writeVaultNote(
    coreHubs[i],
    `# ${coreHubs[i].replace(/\.md$/, "")}\n#core\nСвязано с [[${nextA}]] и [[${nextB}]].\n`
  );
}

for (let i = 1; i <= 9; i++) {
  const hub = coreHubs[i % coreHubs.length].replace(/\.md$/, "");
  const next = i < 9 ? `[[Backend/Сервис ${i + 1}]]` : `[[Backend/Сервис 1]]`;
  writeVaultNote(
    `Backend/Сервис ${i}.md`,
    `# Сервис ${i}\n#backend #api\nПодключен к [[${hub}]] и ${next}.\n`
  );
}

for (let i = 1; i <= 9; i++) {
  const hub = coreHubs[(i + 2) % coreHubs.length].replace(/\.md$/, "");
  const next = i < 9 ? `[[Дизайн/Макет ${i + 1}]]` : `[[Дизайн/Макет 1]]`;
  writeVaultNote(
    `Дизайн/Макет ${i}.md`,
    `# Макет ${i}\n#дизайн #ui\nСсылается на [[${hub}]] и ${next}.\n`
  );
}

for (let i = 1; i <= 9; i++) {
  const hub = coreHubs[(i + 4) % coreHubs.length].replace(/\.md$/, "");
  const next =
    i < 9 ? `[[Исследования/Модель ${i + 1}]]` : `[[Исследования/Модель 1]]`;
  writeVaultNote(
    `Исследования/Модель ${i}.md`,
    `# Модель ${i}\n#ml #исследования\nСсылается на [[${hub}]] и ${next}.\n`
  );
}

writeVaultNote(
  "Контракты API и UI.md",
  "# Контракты API и UI\n#backend #дизайн\nМост между [[Backend/Сервис 2]], [[Дизайн/Макет 2]] и [[Карта проектов]].\n"
);

// Install our built plugin directly into .obsidian/plugins/graph-magnetic-groups/
const obsDir = path.join(vaultDir, ".obsidian");
const pluginDest = path.join(obsDir, "plugins", "graph-magnetic-groups");
fs.mkdirSync(pluginDest, { recursive: true });

fs.copyFileSync(
  path.join(rootDir, "graph-magnetic-groups", "manifest.json"),
  path.join(pluginDest, "manifest.json")
);
fs.copyFileSync(
  path.join(rootDir, "graph-magnetic-groups", "main.js"),
  path.join(pluginDest, "main.js")
);
fs.copyFileSync(
  path.join(rootDir, "graph-magnetic-groups", "styles.css"),
  path.join(pluginDest, "styles.css")
);

const E2E_TOKEN = "obs_e2e_live_obsidian_token_2026";
fs.writeFileSync(
  path.join(pluginDest, "data.json"),
  JSON.stringify(
    {
      enabled: true,
      enableLocalGraph: true,
      syncNativeColorGroups: true,
      attractionStrength: 0.68,
      clusterTether: 0.78,
      groupCompactness: 0.6,
      showGroupZones: true,
      showGroupLabels: true,
      showTetherLines: true,
      showBoardGrid: false,
      repelOutsidersFromFrames: true,
      zoneOpacity: 0.16,
      shiftDragLasso: true,
      sectionCollapsed: false,
      language: "ru",
      mcpEnabled: true,
      mcpPort: 27125,
      mcpHost: "127.0.0.1",
      mcpUseAuthToken: true,
      mcpAuthToken: E2E_TOKEN,
      mcpAutoStartTunnel: false,
      mcpCloudflaredPath: "",
      pinnedNodes: {},
      groups: [
        {
          id: "g-ml",
          name: "ML Исследования",
          color: "#06d6a0",
          enabled: true,
          query: "path:Исследования/",
          nodeIds: [],
          excludedNodeIds: [],
          strength: 1.0,
          colorNodes: true,
          mode: "organic",
          anchorMode: "auto",
        },
        {
          id: "g-backend",
          name: "Backend & API",
          color: "#ff6b6b",
          enabled: true,
          query: "tag:#backend",
          nodeIds: [],
          excludedNodeIds: [],
          strength: 1.0,
          colorNodes: true,
          mode: "organic",
          anchorMode: "auto",
        },
        {
          id: "g-design",
          name: "Дизайн и UI",
          color: "#7c5cff",
          enabled: true,
          query: "tag:#дизайн",
          nodeIds: [],
          excludedNodeIds: [],
          strength: 1.0,
          colorNodes: true,
          mode: "organic",
          anchorMode: "auto",
        },
      ],
    },
    null,
    2
  )
);

fs.writeFileSync(
  path.join(obsDir, "community-plugins.json"),
  JSON.stringify(["graph-magnetic-groups"], null, 2)
);
fs.writeFileSync(
  path.join(obsDir, "appearance.json"),
  JSON.stringify({ baseFontSize: 15, theme: "obsidian" }, null, 2)
);

// Pre-seed global Obsidian config so it opens our vault directly!
const obsidianGlobalDir = path.join(os.homedir(), ".config", "obsidian");
fs.mkdirSync(obsidianGlobalDir, { recursive: true });
fs.writeFileSync(
  path.join(obsidianGlobalDir, "obsidian.json"),
  JSON.stringify(
    {
      vaults: {
        e2e0000123456789: {
          path: vaultDir,
          ts: Date.now(),
          open: true,
        },
      },
    },
    null,
    2
  )
);

console.log("2. Launching REAL Desktop Obsidian with software WebGL (SwiftShader) + CDP port 9222...");
const obsidianLogs = [];
const obsProc = spawn(
  "obsidian",
  [
    "--no-sandbox",
    "--disable-gpu-sandbox",
    "--disable-dev-shm-usage",
    "--enable-webgl",
    "--ignore-gpu-blocklist",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--window-size=1600,960",
    "--remote-debugging-port=9222",
  ],
  {
    env: {
      ...process.env,
      ELECTRON_DISABLE_SANDBOX: "1",
    },
    stdio: ["ignore", "pipe", "pipe"],
  }
);

obsProc.stdout?.on("data", (d) => obsidianLogs.push(d.toString()));
obsProc.stderr?.on("data", (d) => obsidianLogs.push(d.toString()));

async function waitForCdp(timeoutMs = 45000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch("http://127.0.0.1:9222/json/version");
      if (res.ok) return await res.json();
    } catch {
      // wait
    }
    await sleep(400);
  }
  throw new Error(
    "Timed out waiting for Obsidian CDP on 9222. Logs:\n" +
      obsidianLogs.join("\n")
  );
}

let browser = null;
const report = {
  obsidianVersion: "",
  webglRenderer: "",
  pluginLoaded: false,
  consoleErrors: [],
  phase1Organic: null,
  phase2MiroHybrid: null,
  phase3EmbeddedMcpAndTunnel: null,
  phase4CloudAgentOverCloudflare: null,
};

try {
  const cdpInfo = await waitForCdp();
  console.log("✓ Connected to Obsidian Electron CDP:", cdpInfo.Browser);

  browser = await chromium.connectOverCDP("http://127.0.0.1:9222");

  // Wait for main Obsidian vault page with `window.app`
  let page = null;
  for (let attempt = 0; attempt < 60; attempt++) {
    for (const ctx of browser.contexts()) {
      for (const p of ctx.pages()) {
        try {
          const hasApp = await p.evaluate(() => Boolean(window.app && window.app.vault));
          if (hasApp) {
            page = p;
            break;
          }
        } catch {
          // page still loading
        }
      }
      if (page) break;
    }
    if (page) break;
    await sleep(500);
  }

  if (!page) {
    const urls = browser
      .contexts()
      .flatMap((c) => c.pages().map((p) => p.url()));
    throw new Error(
      `Could not find Obsidian vault page with window.app. Open pages: ${JSON.stringify(
        urls
      )}`
    );
  }

  page.on("pageerror", (err) => {
    report.consoleErrors.push(String(err));
  });

  await page.setViewportSize({ width: 1600, height: 960 });
  await sleep(2500);

  // Click "Trust author and enable plugins" if Obsidian shows the first-open vault trust dialog!
  async function dismissObsidianStartupModals() {
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll(".modal-container button"));
      for (const b of buttons) {
        const txt = (b.textContent || "").toLowerCase();
        if (txt.includes("trust author") || txt.includes("enable plugins") || txt.includes("довер")) {
          b.click();
        }
      }
      document
        .querySelectorAll(".modal-container .modal-close-button")
        .forEach((b) => b.click());
    });
  }

  await dismissObsidianStartupModals();
  await sleep(1000);
  await dismissObsidianStartupModals();

  // Forcefully ensure community plugins + our plugin are enabled!
  const initInfo = await page.evaluate(async () => {
    const app = window.app;
    if (app.plugins) {
      if (typeof app.plugins.setEnable === "function") {
        await app.plugins.setEnable(true);
      }
      if (typeof app.plugins.loadManifests === "function") {
        await app.plugins.loadManifests();
      }
      if (!app.plugins.plugins["graph-magnetic-groups"]) {
        await app.plugins.enablePluginAndSave("graph-magnetic-groups");
      }
    }

    // Check WebGL capability inside Obsidian's Electron renderer
    const cv = document.createElement("canvas");
    const gl = cv.getContext("webgl2") || cv.getContext("webgl");
    let glRenderer = "none";
    if (gl) {
      const dbg = gl.getExtension("WEBGL_debug_renderer_info");
      glRenderer = dbg
        ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL)
        : gl.getParameter(gl.RENDERER);
    }

    return {
      obsidianTitle: document.title,
      vaultName: app.vault.getName(),
      markdownCount: app.vault.getMarkdownFiles().length,
      pluginLoaded: Boolean(app.plugins.plugins["graph-magnetic-groups"]),
      glRenderer,
    };
  });

  console.log("✓ Vault & Plugin initialized inside REAL Obsidian:", initInfo);
  assert.equal(initInfo.pluginLoaded, true, "Plugin must load inside real Obsidian");
  report.obsidianVersion = initInfo.obsidianTitle;
  report.webglRenderer = initInfo.glRenderer;
  report.pluginLoaded = initInfo.pluginLoaded;

  // =========================================================================
  // PHASE 1: Open Real Obsidian Graph View & Verify Organic Magnetic Groups!
  // =========================================================================
  await page.evaluate(async () => {
    const app = window.app;
    // Close sidebars slightly or open graph cleanly in main workspace
    app.commands.executeCommandById("graph:open");
  });

  // Wait until Graph View's WebGL canvas & renderer.nodes are populated and settled
  for (let i = 0; i < 40; i++) {
    const count = await page.evaluate(() => {
      const leaves = window.app.workspace.getLeavesOfType("graph");
      return leaves[0]?.view?.renderer?.nodes?.length || 0;
    });
    if (count >= 35) break;
    await sleep(300);
  }

  // Open the Graph View's native `.graph-controls` panel if collapsed so our injected section is visible too!
  await page.evaluate(() => {
    const leaves = window.app.workspace.getLeavesOfType("graph");
    const view = leaves[0]?.view;
    const ctrlEl = view?.contentEl?.querySelector(".graph-controls");
    if (ctrlEl && ctrlEl.classList.contains("is-close")) {
      ctrlEl.classList.remove("is-close");
    }
    const plugin = window.app.plugins.plugins["graph-magnetic-groups"];
    plugin?.refreshAllGraphLeaves();
  });

  // Let real Obsidian `sim.js` worker + our magnetic physics settle for 5 seconds!
  await sleep(5000);
  await dismissObsidianStartupModals();
  await sleep(300);

  report.phase1Organic = await page.evaluate(() => {
    const leaf = window.app.workspace.getLeavesOfType("graph")[0];
    const r = leaf.view.renderer;
    const badges = Array.from(
      leaf.view.contentEl.querySelectorAll(".gmg-group-badge")
    ).map((el) => el.textContent);
    const hasOverlay = Boolean(
      leaf.view.contentEl.querySelector("canvas.gmg-overlay-canvas")
    );
    const hasControlsSection = Boolean(
      leaf.view.contentEl.querySelector(".gmg-controls-section")
    );
    return {
      nodeCount: r.nodes.length,
      linkCount: r.links.length,
      hasOverlay,
      hasControlsSection,
      badges,
    };
  });
  console.log("✓ Phase 1 (Real Obsidian Organic Groups):", report.phase1Organic);
  assert.equal(report.phase1Organic.hasOverlay, true);
  assert.equal(report.phase1Organic.hasControlsSection, true);
  assert.equal(report.phase1Organic.badges.length, 3);

  await page.screenshot({
    path: path.join(outDir, "01-real-obsidian-organic-groups.png"),
  });

  // =========================================================================
  // PHASE 2: Switch to Hybrid Miro-Board Frames + Dynamic Graph Inside Real Obsidian!
  // =========================================================================
  await page.evaluate(async () => {
    const plugin = window.app.plugins.plugins["graph-magnetic-groups"];
    await plugin.updateSettings(
      {
        showBoardGrid: true,
        pinnedNodes: {
          "00 Индекс хранилища.md": { x: 0, y: -260 },
        },
      },
      false
    );
    const nextGroups = plugin.settings.groups.map((g) => {
      if (g.id === "g-ml") {
        return {
          ...g,
          mode: "miro-pinned",
          frameX: -620,
          frameY: -200,
          frameW: 340,
          frameH: 290,
          frameSubLayout: "grid",
        };
      }
      if (g.id === "g-backend") {
        return {
          ...g,
          mode: "miro-free",
          frameX: 280,
          frameY: -200,
          frameW: 330,
          frameH: 290,
        };
      }
      return g;
    });
    await plugin.saveGroups(nextGroups, true);

    // Frame camera nicely so both Miro Frames and central dynamic cluster are centered
    const ctrl = Array.from(plugin.controllers.values())[0];
    ctrl?.focusWorldRect(-660, -290, 1320, 620);
  });

  await sleep(4500);

  report.phase2MiroHybrid = await page.evaluate(() => {
    const leaf = window.app.workspace.getLeavesOfType("graph")[0];
    const miroHeaders = Array.from(
      leaf.view.contentEl.querySelectorAll(".gmg-miro-header")
    ).map((el) => el.textContent);
    const resizers = leaf.view.contentEl.querySelectorAll(".gmg-miro-resizer").length;
    const mlNodes = leaf.view.renderer.nodes
      .filter((n) => n.id.startsWith("Исследования/"))
      .map((n) => ({ id: n.id, x: Math.round(n.x), y: Math.round(n.y), fx: n.fx, fy: n.fy }));
    return {
      miroHeaders,
      resizersCount: resizers,
      pinnedMlCardsCount: mlNodes.filter((n) => typeof n.fx === "number").length,
      sampleMlCoords: mlNodes.slice(0, 4),
    };
  });
  console.log("✓ Phase 2 (Real Obsidian Miro Hybrid):", report.phase2MiroHybrid);
  assert.equal(report.phase2MiroHybrid.miroHeaders.length, 2);
  assert.equal(report.phase2MiroHybrid.resizersCount, 2);
  assert.equal(report.phase2MiroHybrid.pinnedMlCardsCount, 9);

  await page.screenshot({
    path: path.join(outDir, "02-real-obsidian-miro-hybrid.png"),
  });

  // =========================================================================
  // PHASE 3: Verify Embedded MCP Server Inside Real Obsidian + Launch REAL Cloudflare Quick Tunnel!
  // =========================================================================
  const localHealth = await fetch("http://127.0.0.1:27125/health").then((r) =>
    r.json()
  );
  console.log(
    "✓ Embedded MCP Server running INSIDE real Obsidian Electron process:",
    localHealth
  );
  assert.equal(localHealth.ok, true);

  // Start REAL Cloudflare Quick Tunnel right from inside Obsidian's plugin!
  const tunnelResult = await page.evaluate(async () => {
    const plugin = window.app.plugins.plugins["graph-magnetic-groups"];
    const publicBaseUrl = await plugin.tunnelManager.start(27125);
    const endpoints = plugin.mcpServer.buildPublicEndpoints(publicBaseUrl);
    return { publicBaseUrl, endpoints };
  });
  console.log(
    "✓ REAL Cloudflare Quick Tunnel started from inside Obsidian:",
    tunnelResult.endpoints.mcpUrl
  );

  // Open Obsidian's Settings dialog to our plugin's tab and capture real UI screenshot!
  await page.evaluate(() => {
    const app = window.app;
    if (app.commands?.executeCommandById) {
      app.commands.executeCommandById("app:open-settings");
    }
    if (app.setting?.open) {
      app.setting.open();
    }
  });
  await sleep(600);
  const modalOpened = await page.evaluate(() => Boolean(document.querySelector(".vertical-tab-header")));
  if (!modalOpened) {
    // Fallback: click the Settings gear icon in bottom-left vault switcher bar
    await page.evaluate(() => {
      const icons = Array.from(document.querySelectorAll(".clickable-icon"));
      const gear = icons.find((el) => {
        const label = (el.getAttribute("aria-label") || "").toLowerCase();
        return label.includes("setting") || label.includes("настройк");
      }) || document.querySelector(".workspace-drawer-vault-actions .clickable-icon:last-child");
      if (gear instanceof HTMLElement) gear.click();
    });
    await sleep(600);
  }
  await page.evaluate(() => {
    const app = window.app;
    app.setting?.openTabById?.("graph-magnetic-groups");
    const navItems = Array.from(document.querySelectorAll(".vertical-tab-nav-item"));
    const ourTab = navItems.find((el) => (el.textContent || "").includes("Graph Magnetic Groups"));
    if (ourTab instanceof HTMLElement) ourTab.click();
  });
  await sleep(800);
  // Scroll settings down to show the live MCP + Cloudflare Quick Tunnel card
  await page.evaluate(() => {
    const card = document.querySelector(".gmg-mcp-card");
    card?.scrollIntoView({ behavior: "instant", block: "center" });
  });
  await sleep(600);
  await page.screenshot({
    path: path.join(outDir, "03-real-obsidian-mcp-cloudflare-settings.png"),
  });

  // Close settings modal back to the live Graph View
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    window.app.setting?.close?.();
  });
  await sleep(800);

  report.phase3EmbeddedMcpAndTunnel = {
    localHealth,
    publicTunnelBase: tunnelResult.publicBaseUrl,
  };

  // =========================================================================
  // PHASE 4: Connect Official MCP SDK Client OVER PUBLIC *.trycloudflare.com
  //          INTO REAL RUNNING OBSIDIAN & Arrange Kanban Miro Board Live!
  // =========================================================================
  // Wait briefly for Cloudflare edge DNS/routing propagation of the new Quick Tunnel
  let cloudConnected = false;
  let mcpClient = null;
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      mcpClient = new Client({
        name: "real-cloudflare-cloud-agent",
        version: "2.0.0",
      });
      const transport = new StreamableHTTPClientTransport(
        new URL(tunnelResult.endpoints.mcpUrl)
      );
      await mcpClient.connect(transport);
      cloudConnected = true;
      break;
    } catch (err) {
      console.log(
        `Waiting for trycloudflare.com edge propagation (attempt ${attempt}/10): ${err.message}`
      );
      await sleep(2500);
    }
  }
  assert.equal(
    cloudConnected,
    true,
    "Cloud MCP client must connect through real *.trycloudflare.com tunnel to Obsidian!"
  );

  const toolsList = await mcpClient.listTools();
  assert.equal(toolsList.tools.length, 20);

  // Cloud Agent creates a new note & arranges all 3 groups into 3 Kanban Miro Columns live!
  await mcpClient.callTool({
    name: "create_or_update_note",
    arguments: {
      path: "Исследования/Агент через Cloudflare.md",
      content:
        "# Агент через Cloudflare\n#ml #исследования\nСоздано облачным агентом через Quick Tunnel! Связь с [[00 Индекс хранилища]] и [[Backend/Сервис 1]].\n",
    },
  });

  const arrangeRes = await mcpClient.callTool({
    name: "graph_arrange_miro_board",
    arguments: {
      boardStyle: "columns",
      gap: 110,
    },
  });
  const arrangeJson = JSON.parse(arrangeRes.content[0].text);

  await sleep(4500);
  // Frame all 3 Kanban Miro columns + dynamic core cluster cleanly on camera!
  await page.evaluate((frames) => {
    const plugin = window.app.plugins.plugins["graph-magnetic-groups"];
    const ctrl = Array.from(plugin.controllers.values())[0];
    if (!ctrl || !frames || !frames.length) return;
    let minX = Math.min(...frames.map((f) => f.frameX));
    let maxX = Math.max(...frames.map((f) => f.frameX + f.frameW));
    let minY = Math.min(...frames.map((f) => f.frameY)) - 140;
    let maxY = Math.max(...frames.map((f) => f.frameY + f.frameH)) + 160;
    ctrl.focusWorldRect(minX, minY, maxX - minX, maxY - minY);
  }, arrangeJson.frames);
  await sleep(600);
  await page.screenshot({
    path: path.join(outDir, "04-real-obsidian-arranged-via-cloudflare-mcp.png"),
  });

  report.phase4CloudAgentOverCloudflare = {
    connectedViaTryCloudflare: true,
    toolsExposed: toolsList.tools.length,
    arrangedFrames: arrangeJson.frames,
  };

  await mcpClient.close();

  // Stop tunnel cleanly via plugin
  await page.evaluate(async () => {
    const plugin = window.app.plugins.plugins["graph-magnetic-groups"];
    await plugin.tunnelManager.stop();
  });

  assert.equal(
    report.consoleErrors.length,
    0,
    `Expected 0 page errors in Obsidian, got: ${JSON.stringify(
      report.consoleErrors
    )}`
  );

  fs.writeFileSync(
    path.join(outDir, "e2e-report.json"),
    JSON.stringify(report, null, 2),
    "utf8"
  );
  console.log("=== REAL OBSIDIAN + CLOUDFLARE QUICK TUNNEL E2E SUCCEEDED ===");
} finally {
  try {
    await browser?.close();
  } catch {}
  try {
    obsProc.kill("SIGTERM");
  } catch {}
}
