import { App, Notice, PluginSettingTab, Setting } from "obsidian";
import { t } from "../i18n";
import type GraphMagneticGroupsPlugin from "../main";
import { generateRandomToken, PluginLanguage } from "../types";

export class MagneticGroupsSettingTab extends PluginSettingTab {
  private plugin: GraphMagneticGroupsPlugin;
  private unsubscribeTunnel: (() => void) | null = null;

  constructor(app: App, plugin: GraphMagneticGroupsPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    if (this.unsubscribeTunnel) {
      this.unsubscribeTunnel();
      this.unsubscribeTunnel = null;
    }

    const s = this.plugin.settings;
    const strings = t(s.language);

    containerEl.createEl("h2", { text: strings.settingsHeader });

    new Setting(containerEl).setName(strings.settingsLang).addDropdown((dd) => {
      dd.addOption("ru", "Русский")
        .addOption("en", "English")
        .setValue(s.language)
        .onChange(async (val) => {
          await this.plugin.updateSettings(
            { language: val as PluginLanguage },
            false
          );
          this.display();
        });
    });

    new Setting(containerEl)
      .setName(strings.enableMagnetic)
      .addToggle((tg) =>
        tg.setValue(s.enabled).onChange(async (v) => {
          await this.plugin.updateSettings({ enabled: v }, true);
        })
      );

    new Setting(containerEl)
      .setName(strings.settingsLocalGraph)
      .setDesc(strings.settingsLocalGraphDesc)
      .addToggle((tg) =>
        tg.setValue(s.enableLocalGraph).onChange(async (v) => {
          await this.plugin.updateSettings({ enableLocalGraph: v }, false);
          this.plugin.refreshAllGraphLeaves();
        })
      );

    new Setting(containerEl)
      .setName(strings.syncNativeLabel)
      .setDesc(strings.syncNativeDesc)
      .addToggle((tg) =>
        tg.setValue(s.syncNativeColorGroups).onChange(async (v) => {
          await this.plugin.updateSettings({ syncNativeColorGroups: v }, true);
        })
      );

    new Setting(containerEl)
      .setName(strings.attractionLabel)
      .setDesc(strings.attractionDesc)
      .addSlider((sl) =>
        sl
          .setLimits(0, 1, 0.02)
          .setValue(s.attractionStrength)
          .setDynamicTooltip()
          .onChange(async (v) => {
            await this.plugin.updateSettings({ attractionStrength: v }, true);
          })
      );

    new Setting(containerEl)
      .setName(strings.tetherLabel)
      .setDesc(strings.tetherDesc)
      .addSlider((sl) =>
        sl
          .setLimits(0, 1, 0.02)
          .setValue(s.clusterTether)
          .setDynamicTooltip()
          .onChange(async (v) => {
            await this.plugin.updateSettings({ clusterTether: v }, true);
          })
      );

    new Setting(containerEl)
      .setName(strings.compactnessLabel)
      .setDesc(strings.compactnessDesc)
      .addSlider((sl) =>
        sl
          .setLimits(0.2, 1, 0.02)
          .setValue(s.groupCompactness)
          .setDynamicTooltip()
          .onChange(async (v) => {
            await this.plugin.updateSettings({ groupCompactness: v }, true);
          })
      );

    new Setting(containerEl)
      .setName(strings.repelOutsidersLabel)
      .addToggle((tg) =>
        tg.setValue(s.repelOutsidersFromFrames).onChange(async (v) => {
          await this.plugin.updateSettings(
            { repelOutsidersFromFrames: v },
            true
          );
        })
      );

    new Setting(containerEl)
      .setName(strings.settingsBoardGrid)
      .addToggle((tg) =>
        tg.setValue(s.showBoardGrid).onChange(async (v) => {
          await this.plugin.updateSettings({ showBoardGrid: v }, false);
        })
      );

    new Setting(containerEl)
      .setName(strings.settingsShiftLasso)
      .setDesc(strings.settingsShiftLassoDesc)
      .addToggle((tg) =>
        tg.setValue(s.shiftDragLasso).onChange(async (v) => {
          await this.plugin.updateSettings({ shiftDragLasso: v }, false);
        })
      );

    new Setting(containerEl)
      .setName(strings.settingsZoneOpacity)
      .addSlider((sl) =>
        sl
          .setLimits(0.04, 0.35, 0.01)
          .setValue(s.zoneOpacity)
          .setDynamicTooltip()
          .onChange(async (v) => {
            await this.plugin.updateSettings({ zoneOpacity: v }, false);
          })
      );

    new Setting(containerEl)
      .setName(strings.settingsTetherLines)
      .addToggle((tg) =>
        tg.setValue(s.showTetherLines).onChange(async (v) => {
          await this.plugin.updateSettings({ showTetherLines: v }, false);
        })
      );

    /* =========================================================================
     * MCP Server + Cloudflare Quick Tunnel Section
     * ========================================================================= */
    containerEl.createEl("h3", {
      text: strings.mcpSectionHeader,
    });
    containerEl.createEl("p", {
      text: strings.mcpSectionDesc,
      cls: "setting-item-description",
    });

    new Setting(containerEl)
      .setName(strings.mcpEnableLabel)
      .addToggle((tg) =>
        tg.setValue(s.mcpEnabled).onChange(async (v) => {
          await this.plugin.updateSettings({ mcpEnabled: v }, false);
          await this.plugin.syncMcpServerLifecycle();
          this.display();
        })
      );

    new Setting(containerEl).setName(strings.mcpPortLabel).addText((txt) => {
      txt
        .setPlaceholder("27125")
        .setValue(String(s.mcpPort || 27125))
        .onChange(async (val) => {
          const parsed = parseInt(val.trim(), 10);
          if (parsed >= 1024 && parsed <= 65535) {
            await this.plugin.updateSettings({ mcpPort: parsed }, false);
            await this.plugin.restartMcpServer();
          }
        });
    });

    new Setting(containerEl)
      .setName(strings.mcpTokenToggleLabel)
      .setDesc(strings.mcpTokenToggleDesc)
      .addToggle((tg) =>
        tg.setValue(s.mcpUseAuthToken).onChange(async (v) => {
          await this.plugin.updateSettings({ mcpUseAuthToken: v }, false);
          this.plugin.refreshMcpAuthOptions();
          this.display();
        })
      );

    if (s.mcpUseAuthToken) {
      new Setting(containerEl)
        .setName(strings.mcpTokenValueLabel)
        .addText((txt) => {
          txt.setValue(s.mcpAuthToken).onChange(async (val) => {
            await this.plugin.updateSettings(
              { mcpAuthToken: val.trim() },
              false
            );
            this.plugin.refreshMcpAuthOptions();
          });
          txt.inputEl.style.width = "240px";
        })
        .addButton((btn) =>
          btn.setButtonText(strings.mcpRegenerateBtn).onClick(async () => {
            await this.plugin.updateSettings(
              { mcpAuthToken: generateRandomToken() },
              false
            );
            this.plugin.refreshMcpAuthOptions();
            this.display();
          })
        );
    }

    // Live MCP & Cloudflare Quick Tunnel Status Card
    const card = containerEl.createDiv({ cls: "gmg-mcp-card" });
    const localUrls = this.plugin.mcpServer?.getLocalEndpoints();
    if (localUrls) {
      card.createEl("strong", {
        text: "🟢 " + strings.mcpStatusRunning(localUrls.baseUrl),
      });
      this.renderCopyableUrlRow(
        card,
        "Local Streamable HTTP:",
        localUrls.mcpUrl,
        strings.noticeCopied
      );
    } else {
      card.createEl("strong", {
        text:
          "⚪ " +
          (this.plugin.lastMcpError
            ? `${strings.mcpStatusStopped} (${this.plugin.lastMcpError})`
            : strings.mcpStatusStopped),
      });
    }

    // Cloudflare Quick Tunnel Controls
    const tunnelHeader = card.createDiv({ cls: "gmg-row" });
    tunnelHeader.style.marginTop = "6px";
    tunnelHeader.createEl("strong", { text: strings.mcpTunnelTitle });

    const tunnelStatus = this.plugin.tunnelManager.getStatus();
    const isTunnelActive =
      tunnelStatus.state === "running" || tunnelStatus.state === "starting";

    const tunnelBtn = tunnelHeader.createEl("button", {
      cls: isTunnelActive ? "" : "mod-cta",
      text: isTunnelActive
        ? strings.mcpTunnelStopBtn
        : strings.mcpTunnelStartBtn,
    });
    tunnelBtn.addEventListener("click", async () => {
      if (isTunnelActive) {
        await this.plugin.tunnelManager.stop();
        this.display();
      } else {
        try {
          if (!this.plugin.mcpServer?.isRunning()) {
            await this.plugin.updateSettings({ mcpEnabled: true }, false);
            await this.plugin.syncMcpServerLifecycle();
          }
          const port =
            this.plugin.mcpServer?.getListeningPort() || s.mcpPort || 27125;
          await this.plugin.tunnelManager.start(port, s.mcpCloudflaredPath);
          this.display();
        } catch (err) {
          new Notice(err instanceof Error ? err.message : String(err));
          this.display();
        }
      }
    });

    if (
      tunnelStatus.state === "running" &&
      tunnelStatus.publicBaseUrl &&
      this.plugin.mcpServer
    ) {
      const pub = this.plugin.mcpServer.buildPublicEndpoints(
        tunnelStatus.publicBaseUrl
      );
      this.renderCopyableUrlRow(
        card,
        strings.mcpCopyHttpUrl,
        pub.mcpUrl,
        strings.noticeCopied
      );
      this.renderCopyableUrlRow(
        card,
        strings.mcpCopySseUrl,
        pub.sseUrl,
        strings.noticeCopied
      );
    } else if (tunnelStatus.state === "starting") {
      card.createDiv({
        cls: "gmg-group-sub",
        text: "⏳ Подключение к Cloudflare Quick Tunnel (trycloudflare.com)...",
      });
    } else if (tunnelStatus.error) {
      card.createDiv({
        cls: "gmg-group-sub",
        text: `⚠️ ${tunnelStatus.error}`,
      });
    }

    const manualPort =
      this.plugin.mcpServer?.getListeningPort() || s.mcpPort || 27125;
    card.createDiv({
      cls: "gmg-group-sub",
      text:
        s.language === "ru"
          ? `Команда для ручного запуска в терминале: cloudflared tunnel --url http://127.0.0.1:${manualPort}`
          : `Manual terminal command: cloudflared tunnel --url http://127.0.0.1:${manualPort}`,
    });

    new Setting(containerEl)
      .setName(strings.mcpAutoTunnelLabel)
      .addToggle((tg) =>
        tg.setValue(s.mcpAutoStartTunnel).onChange(async (v) => {
          await this.plugin.updateSettings({ mcpAutoStartTunnel: v }, false);
        })
      );

    new Setting(containerEl)
      .setName(strings.mcpCloudflaredPathLabel)
      .addText((txt) => {
        txt
          .setPlaceholder("cloudflared")
          .setValue(s.mcpCloudflaredPath || "")
          .onChange(async (val) => {
            await this.plugin.updateSettings(
              { mcpCloudflaredPath: val.trim() },
              false
            );
          });
      });

    this.unsubscribeTunnel = this.plugin.tunnelManager.onStatusChange(() => {
      if (containerEl.isConnected) {
        this.display();
      }
    });
  }

  private renderCopyableUrlRow(
    parent: HTMLElement,
    label: string,
    url: string,
    copiedText: string
  ): void {
    const wrap = parent.createDiv();
    wrap.createDiv({ cls: "gmg-group-sub", text: label });
    const box = wrap.createDiv({ cls: "gmg-mcp-url-box" });
    const codeSpan = box.createSpan({ text: url });
    codeSpan.style.flex = "1";
    const copyBtn = box.createEl("button", {
      cls: "gmg-mini-tag",
      text: "📋 Copy",
    });
    copyBtn.addEventListener("click", () => {
      if (navigator?.clipboard?.writeText) {
        void navigator.clipboard.writeText(url);
      }
      new Notice(copiedText);
    });
  }

  hide(): void {
    if (this.unsubscribeTunnel) {
      this.unsubscribeTunnel();
      this.unsubscribeTunnel = null;
    }
  }
}
