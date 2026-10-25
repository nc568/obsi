import { App, Modal, Setting } from "obsidian";
import { t } from "../i18n";
import { createGroupId } from "../physicsEngine";
import {
  DEFAULT_GROUP_COLORS,
  GroupLayoutMode,
  MagneticGroup,
  MiroSubLayout,
  PluginLanguage,
} from "../types";

export interface CandidateGraphNode {
  id: string;
  label: string;
  type: string;
}

export class GroupEditorModal extends Modal {
  private draft: MagneticGroup;
  private isNew: boolean;
  private lang: PluginLanguage;
  private candidates: CandidateGraphNode[];
  private onSave: (group: MagneticGroup) => void;
  private searchFilter = "";
  private selectedSet: Set<string>;
  private listContainerEl: HTMLElement | null = null;
  private countEl: HTMLElement | null = null;
  private subLayoutRowEl: HTMLElement | null = null;

  constructor(
    app: App,
    opts: {
      existing?: MagneticGroup;
      initialNodeIds?: string[];
      initialMode?: GroupLayoutMode;
      defaultColorIndex?: number;
      lang: PluginLanguage;
      candidates: CandidateGraphNode[];
      onSave: (group: MagneticGroup) => void;
    }
  ) {
    super(app);
    this.lang = opts.lang;
    this.candidates = opts.candidates;
    this.onSave = opts.onSave;
    this.isNew = !opts.existing;

    const strings = t(this.lang);
    const colorIdx = (opts.defaultColorIndex ?? 0) % DEFAULT_GROUP_COLORS.length;
    const initMode = opts.initialMode || "organic";

    if (opts.existing) {
      this.draft = {
        ...opts.existing,
        mode: opts.existing.mode || "organic",
        frameSubLayout: opts.existing.frameSubLayout || "grid",
        nodeIds: [...opts.existing.nodeIds],
        excludedNodeIds: [...(opts.existing.excludedNodeIds || [])],
        customOffsets: opts.existing.customOffsets
          ? { ...opts.existing.customOffsets }
          : undefined,
      };
    } else {
      const idx = (opts.defaultColorIndex ?? 0) + 1;
      this.draft = {
        id: createGroupId(),
        name:
          initMode === "organic"
            ? strings.defaultNewGroupName(idx)
            : strings.defaultNewFrameName(idx),
        color: DEFAULT_GROUP_COLORS[colorIdx],
        enabled: true,
        query: "",
        nodeIds: [...(opts.initialNodeIds || [])],
        excludedNodeIds: [],
        strength: 1.0,
        colorNodes: true,
        mode: initMode,
        anchorMode: "auto",
        frameSubLayout: "grid",
      };
    }

    this.selectedSet = new Set(this.draft.nodeIds);
  }

  onOpen(): void {
    const { contentEl } = this;
    contentEl.empty();
    const strings = t(this.lang);

    contentEl.createEl("h3", {
      text: this.isNew ? strings.modalCreateTitle : strings.modalEditTitle,
    });

    new Setting(contentEl).setName(strings.groupNameLabel).addText((txt) => {
      txt
        .setPlaceholder(strings.groupNamePlaceholder)
        .setValue(this.draft.name)
        .onChange((v) => {
          this.draft.name = v.trim() || this.draft.name;
        });
      setTimeout(() => txt.inputEl.focus(), 30);
    });

    // Mode selector: Organic vs Miro Live Frame vs Miro Hard-Pinned Frame
    new Setting(contentEl)
      .setName(strings.groupModeLabel)
      .setDesc(strings.modeDesc(this.draft.mode))
      .addDropdown((dd) => {
        dd.addOption("organic", strings.modeShort("organic"));
        dd.addOption("miro-pinned", strings.modeShort("miro-pinned"));
        dd.addOption("miro-free", strings.modeShort("miro-free"));
        dd.setValue(this.draft.mode);
        dd.onChange((val) => {
          this.draft.mode = val as GroupLayoutMode;
          this.updateSubLayoutVisibility();
        });
      });

    // Sub-layout selector for Miro Pinned Frame
    const subLayoutSetting = new Setting(contentEl)
      .setName(strings.groupSubLayoutLabel)
      .addDropdown((dd) => {
        const layouts: MiroSubLayout[] = ["grid", "column", "row", "circle", "freeform"];
        for (const l of layouts) {
          dd.addOption(l, strings.subLayoutName(l));
        }
        dd.setValue(this.draft.frameSubLayout || "grid");
        dd.onChange((val) => {
          this.draft.frameSubLayout = val as MiroSubLayout;
        });
      });
    this.subLayoutRowEl = subLayoutSetting.settingEl;
    this.updateSubLayoutVisibility();

    // Color picker + presets
    const colorSetting = new Setting(contentEl).setName(strings.groupColorLabel);
    const presetsWrap = colorSetting.controlEl.createDiv({ cls: "gmg-color-presets" });
    let setPickerValue: ((hex: string) => void) | null = null;
    const presetEls: HTMLElement[] = [];

    const refreshActivePreset = () => {
      presetEls.forEach((el) => {
        el.toggleClass(
          "is-selected",
          el.dataset.color?.toLowerCase() === this.draft.color.toLowerCase()
        );
      });
    };

    for (const preset of DEFAULT_GROUP_COLORS) {
      const swatch = presetsWrap.createDiv({ cls: "gmg-color-preset" });
      swatch.style.backgroundColor = preset;
      swatch.dataset.color = preset;
      swatch.addEventListener("click", () => {
        this.draft.color = preset;
        setPickerValue?.(preset);
        refreshActivePreset();
      });
      presetEls.push(swatch);
    }

    colorSetting.addColorPicker((cp) => {
      cp.setValue(this.draft.color).onChange((val) => {
        this.draft.color = val;
        refreshActivePreset();
      });
      setPickerValue = (hex) => cp.setValue(hex);
    });
    refreshActivePreset();

    new Setting(contentEl)
      .setName(strings.groupQueryLabel)
      .setDesc(strings.groupQueryDesc)
      .addText((txt) => {
        txt
          .setPlaceholder(strings.groupQueryPlaceholder)
          .setValue(this.draft.query)
          .onChange((v) => {
            this.draft.query = v;
          });
        txt.inputEl.style.width = "240px";
      });

    new Setting(contentEl)
      .setName(strings.groupStrengthLabel + ` (${Math.round(this.draft.strength * 100)}%)`)
      .addSlider((sl) => {
        sl.setLimits(0.2, 2.0, 0.05)
          .setValue(this.draft.strength)
          .setDynamicTooltip()
          .onChange((v) => {
            this.draft.strength = v;
          });
      });

    new Setting(contentEl).setName(strings.groupColorNodesLabel).addToggle((tg) => {
      tg.setValue(this.draft.colorNodes).onChange((v) => {
        this.draft.colorNodes = v;
      });
    });

    // Manual Node Multi-Selector
    const manualHeader = contentEl.createDiv({ cls: "gmg-row" });
    manualHeader.style.marginTop = "10px";
    manualHeader.createEl("strong", { text: strings.manualNodesHeader });
    this.countEl = manualHeader.createSpan({
      cls: "gmg-slider-val",
      text: strings.selectedCount(this.selectedSet.size),
    });

    const searchRow = contentEl.createDiv({ cls: "gmg-row" });
    searchRow.style.marginTop = "6px";
    const searchInput = searchRow.createEl("input", {
      type: "search",
      placeholder: strings.manualNodesSearchPlaceholder,
    });
    searchInput.style.flex = "1";
    searchInput.addEventListener("input", () => {
      this.searchFilter = searchInput.value.trim().toLowerCase();
      this.renderCandidateList();
    });

    const clearBtn = searchRow.createEl("button", { text: strings.clearManualBtn });
    clearBtn.addEventListener("click", () => {
      this.selectedSet.clear();
      this.updateCountText();
      this.renderCandidateList();
    });

    this.listContainerEl = contentEl.createDiv({ cls: "gmg-node-picker" });
    this.renderCandidateList();

    const footer = new Setting(contentEl);
    footer.addButton((btn) =>
      btn.setButtonText(strings.cancelBtn).onClick(() => {
        this.close();
      })
    );
    footer.addButton((btn) =>
      btn
        .setButtonText(strings.saveBtn)
        .setCta()
        .onClick(() => {
          this.draft.nodeIds = Array.from(this.selectedSet);
          this.onSave(this.draft);
          this.close();
        })
    );
  }

  private updateSubLayoutVisibility(): void {
    if (!this.subLayoutRowEl) return;
    this.subLayoutRowEl.style.display =
      this.draft.mode === "miro-pinned" ? "" : "none";
  }

  private updateCountText(): void {
    if (this.countEl) {
      this.countEl.setText(t(this.lang).selectedCount(this.selectedSet.size));
    }
  }

  private renderCandidateList(): void {
    if (!this.listContainerEl) return;
    this.listContainerEl.empty();

    const filtered = this.candidates.filter((c) => {
      if (!this.searchFilter) return true;
      return (
        c.label.toLowerCase().includes(this.searchFilter) ||
        c.id.toLowerCase().includes(this.searchFilter)
      );
    });

    filtered.sort((a, b) => {
      const aSel = this.selectedSet.has(a.id) ? 0 : 1;
      const bSel = this.selectedSet.has(b.id) ? 0 : 1;
      if (aSel !== bSel) return aSel - bSel;
      return a.label.localeCompare(b.label);
    });

    const shown = filtered.slice(0, 250);
    for (const item of shown) {
      const row = this.listContainerEl.createDiv({ cls: "gmg-node-option" });
      const cb = row.createEl("input", { type: "checkbox" });
      cb.checked = this.selectedSet.has(item.id);

      const labelSpan = row.createSpan({ text: item.label });
      labelSpan.style.flex = "1";
      labelSpan.style.overflow = "hidden";
      labelSpan.style.textOverflow = "ellipsis";

      if (item.id !== item.label) {
        const pathHint = row.createSpan({
          text: item.id,
          cls: "gmg-group-sub",
        });
        pathHint.style.maxWidth = "45%";
      }

      const toggle = () => {
        if (this.selectedSet.has(item.id)) {
          this.selectedSet.delete(item.id);
          cb.checked = false;
        } else {
          this.selectedSet.add(item.id);
          cb.checked = true;
        }
        this.updateCountText();
      };

      row.addEventListener("click", (evt) => {
        if (evt.target !== cb) {
          evt.preventDefault();
          toggle();
        }
      });
      cb.addEventListener("change", () => {
        if (cb.checked) this.selectedSet.add(item.id);
        else this.selectedSet.delete(item.id);
        this.updateCountText();
      });
    }
  }

  onClose(): void {
    this.contentEl.empty();
  }
}
