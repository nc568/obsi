// Browser-side Obsidian runtime shim + exact d3-force Graph View ("sim.js") emulator
// Runs our unmodified compiled `main.js` Obsidian plugin bundle!

(function () {
  function applyDomOpts(el, opts) {
    if (!opts) return el;
    if (typeof opts === "string") {
      el.className = opts;
      return el;
    }
    if (opts.cls) {
      el.className = Array.isArray(opts.cls) ? opts.cls.join(" ") : opts.cls;
    }
    if (opts.text !== undefined) {
      el.textContent = String(opts.text);
    }
    if (opts.type !== undefined) {
      el.type = opts.type;
    }
    if (opts.placeholder !== undefined) {
      el.placeholder = opts.placeholder;
    }
    if (opts.attr) {
      for (const [k, v] of Object.entries(opts.attr)) {
        if (v !== null && v !== undefined) el.setAttribute(k, String(v));
      }
    }
    return el;
  }

  if (!HTMLElement.prototype.empty) {
    HTMLElement.prototype.empty = function () {
      while (this.firstChild) this.removeChild(this.firstChild);
    };
  }
  if (!HTMLElement.prototype.setText) {
    HTMLElement.prototype.setText = function (t) {
      this.textContent = String(t ?? "");
    };
  }
  if (!HTMLElement.prototype.toggleClass) {
    HTMLElement.prototype.toggleClass = function (cls, value) {
      if (value === undefined) this.classList.toggle(cls);
      else this.classList.toggle(cls, Boolean(value));
    };
  }
  if (!HTMLElement.prototype.addClass) {
    HTMLElement.prototype.addClass = function (...classes) {
      this.classList.add(...classes);
    };
  }
  if (!HTMLElement.prototype.removeClass) {
    HTMLElement.prototype.removeClass = function (...classes) {
      this.classList.remove(...classes);
    };
  }
  if (!HTMLElement.prototype.createEl) {
    HTMLElement.prototype.createEl = function (tag, opts) {
      const el = document.createElement(tag);
      applyDomOpts(el, opts);
      this.appendChild(el);
      return el;
    };
  }
  if (!HTMLElement.prototype.createDiv) {
    HTMLElement.prototype.createDiv = function (opts) {
      return this.createEl("div", opts);
    };
  }
  if (!HTMLElement.prototype.createSpan) {
    HTMLElement.prototype.createSpan = function (opts) {
      return this.createEl("span", opts);
    };
  }

  const ICONS = {
    magnet:
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 15-4-4 6.75-6.77a7.79 7.79 0 0 1 11 11L13 22l-4-4 6.39-6.36a2.14 2.14 0 0 0-3-3L6 15"/><path d="m5 8 4 4"/><path d="m12 15 4 4"/></svg>',
    lasso:
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 22a5 5 0 0 1-2-4"/><path d="M3.3 14A6.8 6.8 0 0 1 2 10c0-4.4 4.5-8 10-8s10 3.6 10 8-4.5 8-10 8a12 12 0 0 1-5-1"/><path d="M5 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"/></svg>',
    plus:
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>',
    "plus-circle":
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>',
    "minus-circle":
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>',
    "layout-grid":
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>',
    grid:
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>',
    "square-dashed":
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 3"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>',
    pin:
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 17v5"/><path d="M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16h14v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1 1 1 0 0 1 1 1z"/></svg>',
    "pin-off":
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 2l20 20"/><path d="M12 17v5"/><path d="M9 9v1.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16h11"/></svg>',
    "sliders-horizontal":
      '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><circle cx="12" cy="4" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="14" cy="20" r="2"/></svg>',
    "chevron-down":
      '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>',
    "chevron-right":
      '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>',
    "refresh-cw":
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>',
    "rotate-ccw":
      '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
    "trash-2":
      '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>',
    eye:
      '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
    "eye-off":
      '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M2 2l20 20"/></svg>',
    x:
      '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>',
  };

  function setIcon(el, name) {
    el.innerHTML = ICONS[name] || ICONS.magnet;
    el.style.display = "inline-flex";
    el.style.alignItems = "center";
  }

  class TFolder {
    constructor(path) {
      this.path = path;
      this.name = path.split("/").pop() || path;
    }
  }

  class TFile {
    constructor(path, tags = [], frontmatter = {}, content = "") {
      this.path = path;
      const slash = path.lastIndexOf("/");
      const filePart = slash >= 0 ? path.slice(slash + 1) : path;
      this.name = filePart;
      this.basename = filePart.endsWith(".md") ? filePart.slice(0, -3) : filePart;
      this.extension = "md";
      this.parent = { path: slash >= 0 ? path.slice(0, slash) : "" };
      this._tags = tags;
      this._frontmatter = frontmatter;
      this._content = content || `# ${this.basename}\n${tags.join(" ")}\n`;
      this.stat = { size: this._content.length, mtime: Date.now() };
    }
  }

  function getAllTags(cache) {
    return cache?.tags || [];
  }

  class Notice {
    constructor(message, timeout = 3200) {
      let host = document.querySelector(".obsi-notice-container");
      if (!host) {
        host = document.createElement("div");
        host.className = "obsi-notice-container";
        document.body.appendChild(host);
      }
      const item = document.createElement("div");
      item.className = "obsi-notice";
      item.textContent = message;
      host.appendChild(item);
      setTimeout(() => {
        item.style.opacity = "0";
        setTimeout(() => item.remove(), 250);
      }, timeout);
    }
  }

  class Menu {
    constructor() {
      this.items = [];
    }
    addItem(cb) {
      const item = {
        title: "",
        icon: "",
        disabled: false,
        handler: null,
        setTitle(t) {
          this.title = t;
          return this;
        },
        setIcon(ic) {
          this.icon = ic;
          return this;
        },
        setDisabled(d) {
          this.disabled = Boolean(d);
          return this;
        },
        onClick(fn) {
          this.handler = fn;
          return this;
        },
      };
      cb(item);
      this.items.push({ type: "item", ...item });
      return this;
    }
    addSeparator() {
      this.items.push({ type: "sep" });
      return this;
    }
    showAtMouseEvent(evt) {
      this.showAtPosition({ x: evt.clientX, y: evt.clientY });
    }
    showAtPosition(pos) {
      document.querySelectorAll(".obsi-context-menu").forEach((m) => m.remove());
      if (this.items.length === 0) return;

      const el = document.createElement("div");
      el.className = "obsi-context-menu";
      for (const it of this.items) {
        if (it.type === "sep") {
          const hr = document.createElement("div");
          hr.className = "obsi-menu-sep";
          el.appendChild(hr);
          continue;
        }
        const row = document.createElement("div");
        row.className = "obsi-menu-item";
        if (it.disabled) {
          row.style.opacity = "0.6";
          row.style.fontWeight = "700";
          row.style.pointerEvents = "none";
        }
        if (it.icon) {
          const ic = document.createElement("span");
          setIcon(ic, it.icon);
          row.appendChild(ic);
        }
        const sp = document.createElement("span");
        sp.textContent = it.title;
        row.appendChild(sp);
        if (!it.disabled) {
          row.addEventListener("click", (e) => {
            e.stopPropagation();
            el.remove();
            if (it.handler) it.handler();
          });
        }
        el.appendChild(row);
      }

      document.body.appendChild(el);
      const rect = el.getBoundingClientRect();
      const left = Math.min(pos.x, window.innerWidth - rect.width - 10);
      const top = Math.min(pos.y, window.innerHeight - rect.height - 10);
      el.style.left = `${Math.max(8, left)}px`;
      el.style.top = `${Math.max(8, top)}px`;

      const close = () => {
        el.remove();
        window.removeEventListener("pointerdown", close);
      };
      setTimeout(() => window.addEventListener("pointerdown", close), 10);
    }
  }

  class Modal {
    constructor(app) {
      this.app = app;
      this.backdropEl = null;
      this.modalEl = null;
      this.contentEl = document.createElement("div");
    }
    open() {
      this.backdropEl = document.createElement("div");
      this.backdropEl.className = "obsi-modal-backdrop";
      this.modalEl = document.createElement("div");
      this.modalEl.className = "obsi-modal";
      const closeBtn = document.createElement("button");
      closeBtn.className = "obsi-modal-close";
      closeBtn.textContent = "✕";
      closeBtn.addEventListener("click", () => this.close());
      this.modalEl.appendChild(closeBtn);
      this.modalEl.appendChild(this.contentEl);
      this.backdropEl.appendChild(this.modalEl);
      this.backdropEl.addEventListener("click", (e) => {
        if (e.target === this.backdropEl) this.close();
      });
      document.body.appendChild(this.backdropEl);
      if (this.onOpen) this.onOpen();
    }
    close() {
      if (this.onClose) this.onClose();
      this.backdropEl?.remove();
    }
  }

  class Setting {
    constructor(containerEl) {
      this.settingEl = containerEl.createDiv({ cls: "obsi-setting-item" });
      this.infoEl = this.settingEl.createDiv({ cls: "obsi-setting-info" });
      this.nameEl = this.infoEl.createDiv({ cls: "obsi-setting-name" });
      this.descEl = this.infoEl.createDiv({ cls: "obsi-setting-desc" });
      this.controlEl = this.settingEl.createDiv({ cls: "obsi-setting-control" });
    }
    setName(name) {
      this.nameEl.textContent = name;
      return this;
    }
    setDesc(desc) {
      this.descEl.textContent = desc;
      return this;
    }
    addText(cb) {
      const inputEl = this.controlEl.createEl("input", {
        type: "text",
        cls: "obsi-input",
      });
      const comp = {
        inputEl,
        setPlaceholder(p) {
          inputEl.placeholder = p;
          return this;
        },
        setValue(v) {
          inputEl.value = v ?? "";
          return this;
        },
        onChange(fn) {
          inputEl.addEventListener("input", () => fn(inputEl.value));
          return this;
        },
      };
      cb(comp);
      return this;
    }
    addColorPicker(cb) {
      const colorPickerEl = this.controlEl.createEl("input", { type: "color" });
      const comp = {
        colorPickerEl,
        setValue(v) {
          colorPickerEl.value = v || "#7c5cff";
          return this;
        },
        onChange(fn) {
          colorPickerEl.addEventListener("input", () => fn(colorPickerEl.value));
          return this;
        },
      };
      cb(comp);
      return this;
    }
    addSlider(cb) {
      const inputEl = this.controlEl.createEl("input", { type: "range" });
      const tip = this.controlEl.createSpan({ cls: "gmg-slider-val" });
      const comp = {
        sliderEl: inputEl,
        setLimits(min, max, step) {
          inputEl.min = String(min);
          inputEl.max = String(max);
          inputEl.step = String(step);
          return this;
        },
        setValue(v) {
          inputEl.value = String(v);
          tip.textContent = Number(v).toFixed(2);
          return this;
        },
        setDynamicTooltip() {
          return this;
        },
        onChange(fn) {
          inputEl.addEventListener("input", () => {
            const num = parseFloat(inputEl.value);
            tip.textContent = num.toFixed(2);
            fn(num);
          });
          return this;
        },
      };
      cb(comp);
      return this;
    }
    addToggle(cb) {
      const inputEl = this.controlEl.createEl("input", { type: "checkbox" });
      const comp = {
        toggleEl: inputEl,
        setValue(v) {
          inputEl.checked = Boolean(v);
          return this;
        },
        onChange(fn) {
          inputEl.addEventListener("change", () => fn(inputEl.checked));
          return this;
        },
      };
      cb(comp);
      return this;
    }
    addDropdown(cb) {
      const selectEl = this.controlEl.createEl("select", { cls: "obsi-input" });
      const comp = {
        selectEl,
        addOption(val, label) {
          const o = selectEl.createEl("option", { text: label });
          o.value = val;
          return this;
        },
        setValue(val) {
          selectEl.value = val;
          return this;
        },
        onChange(fn) {
          selectEl.addEventListener("change", () => fn(selectEl.value));
          return this;
        },
      };
      cb(comp);
      return this;
    }
    addButton(cb) {
      const btnEl = this.controlEl.createEl("button");
      const comp = {
        buttonEl: btnEl,
        setButtonText(t) {
          btnEl.textContent = t;
          return this;
        },
        setCta() {
          btnEl.classList.add("mod-cta");
          return this;
        },
        onClick(fn) {
          btnEl.addEventListener("click", (e) => {
            e.preventDefault();
            fn(e);
          });
          return this;
        },
      };
      cb(comp);
      return this;
    }
  }

  class PluginSettingTab {
    constructor(app, plugin) {
      this.app = app;
      this.plugin = plugin;
      this.containerEl = document.createElement("div");
    }
  }

  class Plugin {
    constructor(app, manifest) {
      this.app = app;
      this.manifest = manifest;
      this._intervals = [];
      this._commands = [];
      this._settingTabs = [];
    }
    async loadData() {
      try {
        const saved = localStorage.getItem("obsi_gmg_preview_settings_v2");
        if (saved) return JSON.parse(saved);
      } catch (_) {}
      return window.__DEFAULT_PREVIEW_PLUGIN_DATA || null;
    }
    async saveData(data) {
      try {
        localStorage.setItem(
          "obsi_gmg_preview_settings_v2",
          JSON.stringify(data)
        );
      } catch (_) {}
    }
    addSettingTab(tab) {
      this._settingTabs.push(tab);
    }
    addCommand(cmd) {
      this._commands.push(cmd);
    }
    registerEvent() {}
    registerInterval(id) {
      this._intervals.push(id);
      return id;
    }
  }

  const obsidianModule = {
    Plugin,
    Modal,
    PluginSettingTab,
    Setting,
    Menu,
    Notice,
    TFile,
    TFolder,
    getAllTags,
    setIcon,
  };

  window.__obsidianShim = obsidianModule;
  window.require = function (modName) {
    if (modName === "obsidian") return obsidianModule;
    throw new Error("Node module not available in browser preview: " + modName);
  };
})();
