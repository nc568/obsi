import { Notice, Plugin, WorkspaceLeaf } from "obsidian";
import { GraphViewController } from "./graphController";
import { t } from "./i18n";
import { CloudflareQuickTunnelManager } from "./mcp/cloudflareTunnel";
import { ObsidianMcpEngine } from "./mcp/mcpEngine";
import { EmbeddedMcpHttpServer } from "./mcp/mcpHttpServer";
import { ObsidianLiveVaultAdapter } from "./mcp/obsidianLiveAdapter";
import { INLINE_PLUGIN_STYLES } from "./styles-inline";
import {
  DEFAULT_SETTINGS,
  generateRandomToken,
  InternalGraphView,
  MagneticGroup,
  MagneticGroupsSettings,
} from "./types";
import { MagneticGroupsSettingTab } from "./ui/settingsTab";

export default class GraphMagneticGroupsPlugin extends Plugin {
  public settings: MagneticGroupsSettings = { ...DEFAULT_SETTINGS };
  public mcpEngine!: ObsidianMcpEngine;
  public mcpServer: EmbeddedMcpHttpServer | null = null;
  public tunnelManager = new CloudflareQuickTunnelManager();
  public lastMcpError: string | null = null;

  private controllers = new Map<WorkspaceLeaf, GraphViewController>();
  private fallbackStyleEl: HTMLStyleElement | null = null;

  async onload(): Promise<void> {
    await this.loadSettings();
    this.ensureStylesLoaded();

    // Initialize MCP Engine wired directly to live Obsidian + active Graph View controllers
    const liveAdapter = new ObsidianLiveVaultAdapter({
      app: this.app,
      getSettings: () => this.settings,
      updateSettings: (patch, reheat) => this.updateSettings(patch, reheat),
      saveGroups: (groups, reheat) => this.saveGroups(groups, reheat),
      getActiveControllers: () => Array.from(this.controllers.values()),
    });
    this.mcpEngine = new ObsidianMcpEngine(liveAdapter);

    this.addSettingTab(new MagneticGroupsSettingTab(this.app, this));
    this.registerCommands();

    // Start embedded MCP server (+ optional auto Quick Tunnel) on Desktop Obsidian
    void this.syncMcpServerLifecycle().then(() => {
      if (this.settings.mcpEnabled && this.settings.mcpAutoStartTunnel && this.mcpServer?.isRunning()) {
        const port = this.mcpServer.getListeningPort() || this.settings.mcpPort;
        void this.tunnelManager
          .start(port, this.settings.mcpCloudflaredPath)
          .catch(() => {
            // Non-fatal if cloudflared is offline at boot
          });
      }
    });

    this.app.workspace.onLayoutReady(() => {
      this.refreshAllGraphLeaves();
    });

    this.registerEvent(
      this.app.workspace.on("layout-change", () => {
        this.refreshAllGraphLeaves();
      })
    );

    this.registerEvent(
      this.app.workspace.on("active-leaf-change", () => {
        this.refreshAllGraphLeaves();
      })
    );

    this.registerEvent(
      this.app.metadataCache.on("resolved", () => {
        for (const ctrl of this.controllers.values()) {
          ctrl.markDirtyAndReheat(40);
        }
      })
    );

    this.registerInterval(
      window.setInterval(() => {
        this.ensureAttachedControllersHealthy();
      }, 1500)
    );
  }

  onunload(): void {
    void this.tunnelManager.stop();
    if (this.mcpServer) {
      void this.mcpServer.stop();
      this.mcpServer = null;
    }
    for (const ctrl of this.controllers.values()) {
      ctrl.destroy();
    }
    this.controllers.clear();
    if (this.fallbackStyleEl) {
      this.fallbackStyleEl.remove();
      this.fallbackStyleEl = null;
    }
  }

  /* =========================================================================
   * Embedded MCP Server Lifecycle
   * ========================================================================= */

  public async syncMcpServerLifecycle(): Promise<void> {
    if (!this.settings.mcpEnabled) {
      await this.tunnelManager.stop();
      if (this.mcpServer) {
        await this.mcpServer.stop();
        this.mcpServer = null;
      }
      this.lastMcpError = null;
      return;
    }

    if (this.mcpServer?.isRunning()) {
      this.refreshMcpAuthOptions();
      return;
    }

    this.mcpServer = new EmbeddedMcpHttpServer(this.mcpEngine, {
      host: this.settings.mcpHost || "127.0.0.1",
      port: this.settings.mcpPort || 27125,
      requireToken: this.settings.mcpUseAuthToken,
      authToken: this.settings.mcpAuthToken,
      getPublicTunnelUrl: () => this.tunnelManager.getStatus().publicBaseUrl,
    });

    try {
      await this.mcpServer.start();
      this.lastMcpError = null;
    } catch (err) {
      // Expected in pure browser / mobile environments without Node `http`
      this.lastMcpError = err instanceof Error ? err.message : String(err);
      this.mcpServer = null;
    }
  }

  public async restartMcpServer(): Promise<void> {
    if (this.mcpServer) {
      await this.mcpServer.stop();
      this.mcpServer = null;
    }
    await this.syncMcpServerLifecycle();
  }

  public refreshMcpAuthOptions(): void {
    this.mcpServer?.updateOptions({
      requireToken: this.settings.mcpUseAuthToken,
      authToken: this.settings.mcpAuthToken,
    });
  }

  private ensureStylesLoaded(): void {
    const probe = document.createElement("div");
    probe.className = "gmg-overlay-canvas";
    document.body.appendChild(probe);
    const pos = getComputedStyle(probe).position;
    probe.remove();

    if (pos !== "absolute") {
      this.fallbackStyleEl = document.createElement("style");
      this.fallbackStyleEl.id = "graph-magnetic-groups-inline-styles";
      this.fallbackStyleEl.textContent = INLINE_PLUGIN_STYLES;
      document.head.appendChild(this.fallbackStyleEl);
    }
  }

  private registerCommands(): void {
    const getStrings = () => t(this.settings.language);

    this.addCommand({
      id: "toggle-lasso-mode",
      name: getStrings().cmdToggleLasso,
      callback: () => {
        const ctrl = this.getActiveOrFirstGraphController();
        if (!ctrl) {
          new Notice(getStrings().noticeNoGraphOpen);
          return;
        }
        ctrl.setLassoArmed(true);
      },
    });

    this.addCommand({
      id: "create-magnetic-group",
      name: getStrings().cmdCreateGroupModal,
      callback: () => {
        const ctrl = this.getActiveOrFirstGraphController();
        if (!ctrl) {
          new Notice(getStrings().noticeNoGraphOpen);
          return;
        }
        ctrl.openGroupModal();
      },
    });

    this.addCommand({
      id: "reheat-magnetic-groups",
      name: getStrings().cmdReheat,
      callback: () => {
        const ctrl = this.getActiveOrFirstGraphController();
        if (!ctrl) {
          new Notice(getStrings().noticeNoGraphOpen);
          return;
        }
        ctrl.markDirtyAndReheat(120);
      },
    });

    this.addCommand({
      id: "reset-manual-anchors",
      name: getStrings().cmdResetAllAnchors,
      callback: async () => {
        const next = this.settings.groups.map((g) => ({
          ...g,
          anchorMode: "auto" as const,
          anchorX: undefined,
          anchorY: undefined,
        }));
        await this.saveGroups(next, true);
        await this.updateSettings({ pinnedNodes: {} }, true);
      },
    });
  }

  private getActiveOrFirstGraphController(): GraphViewController | null {
    const activeLeaf = this.app.workspace.activeLeaf;
    if (activeLeaf && this.controllers.has(activeLeaf)) {
      return this.controllers.get(activeLeaf)!;
    }
    const first = this.controllers.values().next();
    return first.done ? null : first.value;
  }

  public refreshAllGraphLeaves(): void {
    const validLeaves = new Set<WorkspaceLeaf>();
    const globalLeaves = this.app.workspace.getLeavesOfType("graph");
    for (const l of globalLeaves) validLeaves.add(l);

    if (this.settings.enableLocalGraph) {
      const localLeaves = this.app.workspace.getLeavesOfType("localgraph");
      for (const l of localLeaves) validLeaves.add(l);
    }

    for (const [leaf, ctrl] of this.controllers.entries()) {
      if (!validLeaves.has(leaf)) {
        ctrl.destroy();
        this.controllers.delete(leaf);
      }
    }

    for (const leaf of validLeaves) {
      if (this.controllers.has(leaf)) continue;
      const view = leaf.view as unknown as InternalGraphView;
      if (view && view.renderer && view.renderer.interactiveEl) {
        const ctrl = new GraphViewController(view, {
          app: this.app,
          getSettings: () => this.settings,
          updateSettings: (patch, reheat) => this.updateSettings(patch, reheat),
          saveGroups: (groups, reheat) => this.saveGroups(groups, reheat),
        });
        this.controllers.set(leaf, ctrl);
      }
    }
  }

  private ensureAttachedControllersHealthy(): void {
    this.refreshAllGraphLeaves();
  }

  async loadSettings(): Promise<void> {
    const saved = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, saved || {});
    if (!Array.isArray(this.settings.groups)) {
      this.settings.groups = [];
    } else {
      // Seamless migration from v1 groups
      this.settings.groups = this.settings.groups.map((g) => ({
        ...g,
        mode: g.mode || "organic",
        anchorMode: g.anchorMode || "auto",
        frameSubLayout: g.frameSubLayout || "grid",
        excludedNodeIds: Array.isArray(g.excludedNodeIds)
          ? g.excludedNodeIds
          : [],
      }));
    }
    if (
      !this.settings.pinnedNodes ||
      typeof this.settings.pinnedNodes !== "object"
    ) {
      this.settings.pinnedNodes = {};
    }
    if (!this.settings.mcpAuthToken) {
      this.settings.mcpAuthToken = generateRandomToken();
      await this.saveData(this.settings);
    }
  }

  async updateSettings(
    patch: Partial<MagneticGroupsSettings>,
    reheat = true
  ): Promise<void> {
    this.settings = {
      ...this.settings,
      ...patch,
    };
    await this.saveData(this.settings);
    for (const ctrl of this.controllers.values()) {
      if (reheat) {
        ctrl.markDirtyAndReheat(85);
      } else {
        ctrl.reheatSimulation(10);
      }
    }
  }

  async saveGroups(groups: MagneticGroup[], reheat = true): Promise<void> {
    this.settings.groups = groups;
    await this.saveData(this.settings);
    for (const ctrl of this.controllers.values()) {
      ctrl.markDirtyAndReheat(reheat ? 100 : 25);
    }
  }
}
