import { setIcon } from "obsidian";
import { t } from "../i18n";
import {
  GroupLayoutMode,
  MagneticGroup,
  MagneticGroupsSettings,
} from "../types";

export interface ControlsPanelCallbacks {
  getSettings: () => MagneticGroupsSettings;
  getGroupNodeCounts: () => Map<string, number>;
  isLassoActive: () => boolean;
  onUpdateSettings: (
    patch: Partial<MagneticGroupsSettings>,
    reheat?: boolean
  ) => void;
  onCreateGroup: (initialMode?: GroupLayoutMode) => void;
  onEditGroup: (group: MagneticGroup) => void;
  onToggleGroup: (groupId: string) => void;
  onCycleGroupMode: (groupId: string) => void;
  onResetGroupAnchor: (groupId: string) => void;
  onDeleteGroup: (groupId: string) => void;
  onUnpinAllIndividualNodes: () => void;
  onToggleLasso: () => void;
  onReheat: () => void;
}

export class GraphControlsSection {
  private rootEl: HTMLElement;
  private floatingBarEl: HTMLElement;
  private cb: ControlsPanelCallbacks;
  private groupListEl: HTMLElement | null = null;
  private pinnedRowEl: HTMLElement | null = null;
  private lassoToolBtn: HTMLButtonElement | null = null;
  private gridToolBtn: HTMLButtonElement | null = null;

  constructor(
    graphControlsEl: HTMLElement | null,
    canvasParentEl: HTMLElement,
    cb: ControlsPanelCallbacks
  ) {
    this.cb = cb;

    this.rootEl = document.createElement("div");
    this.rootEl.className = "tree-item graph-control-section gmg-controls-section";
    if (graphControlsEl) {
      graphControlsEl.appendChild(this.rootEl);
    }

    this.floatingBarEl = document.createElement("div");
    this.floatingBarEl.className = "gmg-floating-toolbar";
    canvasParentEl.appendChild(this.floatingBarEl);

    this.render();
  }

  render(): void {
    const settings = this.cb.getSettings();
    const strings = t(settings.language);

    // 1. Floating quick-access toolbar on the canvas
    this.floatingBarEl.empty();

    const powerBtn = this.floatingBarEl.createEl("button", {
      cls: "gmg-tool-btn" + (settings.enabled ? " is-active" : ""),
      attr: { title: strings.enableMagnetic },
    });
    const powerIcon = powerBtn.createSpan();
    setIcon(powerIcon, "magnet");
    powerBtn.createSpan({ text: strings.pluginTitle });
    powerBtn.addEventListener("click", () => {
      this.cb.onUpdateSettings({ enabled: !settings.enabled }, true);
      this.render();
    });

    this.lassoToolBtn = this.floatingBarEl.createEl("button", {
      cls: "gmg-tool-btn" + (this.cb.isLassoActive() ? " is-active" : ""),
      attr: { title: strings.lassoBtn },
    });
    const lassoIcon = this.lassoToolBtn.createSpan();
    setIcon(lassoIcon, "lasso");
    this.lassoToolBtn.createSpan({
      text: settings.language === "ru" ? "Лассо" : "Lasso",
    });
    this.lassoToolBtn.addEventListener("click", () => {
      this.cb.onToggleLasso();
      this.syncLassoState();
    });

    const addGroupQuickBtn = this.floatingBarEl.createEl("button", {
      cls: "gmg-tool-btn",
      attr: { title: strings.addGroupBtn },
    });
    const plusIcon = addGroupQuickBtn.createSpan();
    setIcon(plusIcon, "plus");
    addGroupQuickBtn.createSpan({
      text: strings.addGroupBtn.replace(/^\+\s*/, ""),
    });
    addGroupQuickBtn.addEventListener("click", () =>
      this.cb.onCreateGroup("organic")
    );

    const addMiroQuickBtn = this.floatingBarEl.createEl("button", {
      cls: "gmg-tool-btn",
      attr: { title: strings.addMiroFrameBtn },
    });
    const frameIcon = addMiroQuickBtn.createSpan();
    setIcon(frameIcon, "layout-grid");
    addMiroQuickBtn.createSpan({
      text: strings.addMiroFrameBtn.replace(/^\+\s*/, ""),
    });
    addMiroQuickBtn.addEventListener("click", () =>
      this.cb.onCreateGroup("miro-pinned")
    );

    this.gridToolBtn = this.floatingBarEl.createEl("button", {
      cls: "gmg-tool-btn" + (settings.showBoardGrid ? " is-active" : ""),
      attr: { title: strings.boardGridBtn },
    });
    const gridIcon = this.gridToolBtn.createSpan();
    setIcon(gridIcon, "grid");
    this.gridToolBtn.addEventListener("click", () => {
      this.cb.onUpdateSettings(
        { showBoardGrid: !this.cb.getSettings().showBoardGrid },
        false
      );
      this.render();
    });

    const reheatQuickBtn = this.floatingBarEl.createEl("button", {
      cls: "gmg-tool-btn",
      attr: { title: strings.reheatBtn },
    });
    const refreshIcon = reheatQuickBtn.createSpan();
    setIcon(refreshIcon, "refresh-cw");
    reheatQuickBtn.addEventListener("click", () => this.cb.onReheat());

    // 2. Native Graph Controls Sidebar Section
    this.rootEl.empty();
    this.rootEl.toggleClass("is-collapsed", settings.sectionCollapsed);

    const header = this.rootEl.createDiv({ cls: "gmg-section-header" });
    const titleWrap = header.createDiv({ cls: "gmg-section-title" });
    const chev = titleWrap.createSpan();
    setIcon(chev, settings.sectionCollapsed ? "chevron-right" : "chevron-down");
    titleWrap.createSpan({ text: strings.pluginTitle });

    header.addEventListener("click", () => {
      const next = !this.cb.getSettings().sectionCollapsed;
      this.cb.onUpdateSettings({ sectionCollapsed: next }, false);
      this.render();
    });

    const body = this.rootEl.createDiv({ cls: "gmg-section-body" });

    this.buildToggleRow(body, strings.enableMagnetic, settings.enabled, (v) => {
      this.cb.onUpdateSettings({ enabled: v }, true);
      this.render();
    });

    this.buildSliderRow(
      body,
      strings.attractionLabel,
      strings.attractionDesc,
      settings.attractionStrength,
      0,
      1,
      0.02,
      (v) => `${Math.round(v * 100)}%`,
      (v) => this.cb.onUpdateSettings({ attractionStrength: v }, true)
    );

    this.buildSliderRow(
      body,
      strings.tetherLabel,
      strings.tetherDesc,
      settings.clusterTether,
      0,
      1,
      0.02,
      (v) => `${Math.round(v * 100)}%`,
      (v) => this.cb.onUpdateSettings({ clusterTether: v }, true)
    );

    this.buildSliderRow(
      body,
      strings.compactnessLabel,
      strings.compactnessDesc,
      settings.groupCompactness,
      0.2,
      1,
      0.02,
      (v) => `${Math.round(v * 100)}%`,
      (v) => this.cb.onUpdateSettings({ groupCompactness: v }, true)
    );

    this.buildToggleRow(
      body,
      strings.syncNativeLabel,
      settings.syncNativeColorGroups,
      (v) => this.cb.onUpdateSettings({ syncNativeColorGroups: v }, true)
    );

    this.buildToggleRow(body, strings.showZonesLabel, settings.showGroupZones, (v) =>
      this.cb.onUpdateSettings({ showGroupZones: v }, false)
    );

    this.buildToggleRow(body, strings.showLabelsLabel, settings.showGroupLabels, (v) =>
      this.cb.onUpdateSettings({ showGroupLabels: v }, false)
    );

    this.buildToggleRow(
      body,
      strings.repelOutsidersLabel,
      settings.repelOutsidersFromFrames,
      (v) => this.cb.onUpdateSettings({ repelOutsidersFromFrames: v }, true)
    );

    this.buildToggleRow(body, strings.boardGridBtn, settings.showBoardGrid, (v) => {
      this.cb.onUpdateSettings({ showBoardGrid: v }, false);
      this.render();
    });

    const actions = body.createDiv({ cls: "gmg-actions-bar" });
    const createBtn = actions.createEl("button", {
      cls: "mod-cta",
      text: strings.addGroupBtn,
    });
    createBtn.addEventListener("click", () => this.cb.onCreateGroup("organic"));

    const createMiroBtn = actions.createEl("button", {
      text: strings.addMiroFrameBtn,
    });
    createMiroBtn.addEventListener("click", () =>
      this.cb.onCreateGroup("miro-pinned")
    );

    this.pinnedRowEl = body.createDiv();
    this.groupListEl = body.createDiv({ cls: "gmg-group-list" });
    this.refreshGroupList();
  }

  syncLassoState(): void {
    if (this.lassoToolBtn) {
      this.lassoToolBtn.toggleClass("is-active", this.cb.isLassoActive());
    }
  }

  refreshGroupList(): void {
    const settings = this.cb.getSettings();
    const strings = t(settings.language);

    if (this.pinnedRowEl) {
      this.pinnedRowEl.empty();
      const pinCount = Object.keys(settings.pinnedNodes || {}).length;
      if (pinCount > 0) {
        const pinBar = this.pinnedRowEl.createDiv({ cls: "gmg-group-item" });
        pinBar.createSpan({ text: "📍 " + strings.pinnedNodesSummary(pinCount) });
        const spacer = pinBar.createSpan();
        spacer.style.flex = "1";
        const unpinBtn = pinBar.createEl("button", {
          cls: "gmg-mini-tag",
          text: strings.unpinAllBtn,
        });
        unpinBtn.addEventListener("click", () =>
          this.cb.onUnpinAllIndividualNodes()
        );
      }
    }

    if (!this.groupListEl) return;
    this.groupListEl.empty();

    const counts = this.cb.getGroupNodeCounts();

    if (settings.groups.length === 0) {
      this.groupListEl.createDiv({
        cls: "gmg-empty-hint",
        text: strings.emptyGroupsHint,
      });
      return;
    }

    for (const grp of settings.groups) {
      const mode: GroupLayoutMode = grp.mode || "organic";
      const item = this.groupListEl.createDiv({
        cls: "gmg-group-item" + (grp.enabled ? "" : " is-disabled"),
      });

      const swatch = item.createDiv({ cls: "gmg-color-swatch" });
      swatch.style.backgroundColor = grp.color;
      swatch.addEventListener("click", () => this.cb.onToggleGroup(grp.id));

      const info = item.createDiv({ cls: "gmg-group-info" });
      info.addEventListener("click", () => this.cb.onEditGroup(grp));

      const nameLine = info.createDiv({ cls: "gmg-group-name-line" });
      nameLine.createSpan({ cls: "gmg-group-title-text", text: grp.name });

      const modeTag = nameLine.createSpan({
        cls: "gmg-mini-tag",
        text: strings.modeShort(mode),
        attr: { title: strings.modeDesc(mode) },
      });
      modeTag.addEventListener("click", (evt) => {
        evt.stopPropagation();
        this.cb.onCycleGroupMode(grp.id);
      });

      const nCount = counts.get(grp.id) ?? 0;
      const summaryParts = [strings.nodesCount(nCount)];
      if (mode === "miro-pinned" && grp.frameSubLayout) {
        summaryParts.push(strings.subLayoutName(grp.frameSubLayout));
      } else if (grp.query.trim()) {
        summaryParts.push(grp.query.trim());
      }
      info.createDiv({
        cls: "gmg-group-sub",
        text: summaryParts.join(" · "),
      });

      if (mode === "organic" && grp.anchorMode === "manual") {
        const unpinBtn = item.createEl("button", {
          cls: "gmg-icon-btn",
          attr: { title: strings.resetAnchor },
        });
        setIcon(unpinBtn, "rotate-ccw");
        unpinBtn.addEventListener("click", (evt) => {
          evt.stopPropagation();
          this.cb.onResetGroupAnchor(grp.id);
        });
      }

      const editBtn = item.createEl("button", {
        cls: "gmg-icon-btn",
        attr: { title: strings.editGroup },
      });
      setIcon(editBtn, "sliders-horizontal");
      editBtn.addEventListener("click", (evt) => {
        evt.stopPropagation();
        this.cb.onEditGroup(grp);
      });

      const delBtn = item.createEl("button", {
        cls: "gmg-icon-btn",
        attr: { title: strings.deleteGroup },
      });
      setIcon(delBtn, "trash-2");
      delBtn.addEventListener("click", (evt) => {
        evt.stopPropagation();
        this.cb.onDeleteGroup(grp.id);
      });
    }
  }

  private buildToggleRow(
    parent: HTMLElement,
    label: string,
    value: boolean,
    onChange: (val: boolean) => void
  ): void {
    const row = parent.createDiv({ cls: "gmg-row" });
    row.createSpan({ text: label });
    const cb = row.createEl("input", { type: "checkbox" });
    cb.checked = value;
    cb.addEventListener("change", () => onChange(cb.checked));
  }

  private buildSliderRow(
    parent: HTMLElement,
    label: string,
    tooltip: string,
    value: number,
    min: number,
    max: number,
    step: number,
    format: (v: number) => string,
    onChange: (val: number) => void
  ): void {
    const block = parent.createDiv({
      cls: "gmg-slider-block",
      attr: { title: tooltip },
    });
    const top = block.createDiv({ cls: "gmg-slider-top" });
    top.createSpan({ text: label });
    const valSpan = top.createSpan({
      cls: "gmg-slider-val",
      text: format(value),
    });
    const slider = block.createEl("input", {
      type: "range",
      attr: {
        min: String(min),
        max: String(max),
        step: String(step),
      },
    });
    slider.value = String(value);
    slider.addEventListener("input", () => {
      const num = parseFloat(slider.value);
      valSpan.setText(format(num));
      onChange(num);
    });
  }

  destroy(): void {
    this.rootEl.remove();
    this.floatingBarEl.remove();
  }
}
