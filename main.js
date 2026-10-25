/* Graph Magnetic Groups & Miro + MCP — Obsidian Plugin (generated bundle) */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/main.ts
var main_exports = {};
__export(main_exports, {
  default: () => GraphMagneticGroupsPlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian7 = require("obsidian");

// src/graphController.ts
var import_obsidian4 = require("obsidian");

// src/i18n.ts
var STRINGS = {
  ru: {
    pluginTitle: "\u041C\u0430\u0433\u043D\u0438\u0442\u043D\u044B\u0435 \u0433\u0440\u0443\u043F\u043F\u044B \u0438 Miro",
    enableMagnetic: "\u0410\u043A\u0442\u0438\u0432\u043D\u043E\u0441\u0442\u044C \u0433\u0440\u0443\u043F\u043F \u0438 \u0434\u043E\u0441\u043A\u0438",
    lassoBtn: "\u041B\u0430\u0441\u0441\u043E: \u043E\u0431\u0432\u0435\u0441\u0442\u0438 \u043D\u043E\u0434\u044B \u0432 \u0433\u0440\u0443\u043F\u043F\u0443 \u0438\u043B\u0438 \u0437\u0430\u043A\u0440\u0435\u043F\u0438\u0442\u044C",
    lassoActiveHint: "\u041E\u0431\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u043E\u0434\u044B \u043C\u044B\u0448\u043A\u043E\u0439 \u043D\u0430 \u0433\u0440\u0430\u0444\u0435: \u043E\u0431\u044A\u0435\u0434\u0438\u043D\u0438\u0442\u044C \u0432 \u0433\u0440\u0443\u043F\u043F\u0443 / \u0440\u0430\u043C\u043A\u0443 Miro / \u0437\u0430\u043A\u0440\u0435\u043F\u0438\u0442\u044C (Esc \u2014 \u043E\u0442\u043C\u0435\u043D\u0430)",
    reheatBtn: "\u041F\u0435\u0440\u0435\u0441\u043E\u0431\u0440\u0430\u0442\u044C \u0434\u0438\u043D\u0430\u043C\u0438\u0447\u0435\u0441\u043A\u0443\u044E \u0443\u043A\u043B\u0430\u0434\u043A\u0443",
    addGroupBtn: "+ \u0413\u0440\u0443\u043F\u043F\u0430",
    addMiroFrameBtn: "+ \u0420\u0430\u043C\u043A\u0430 Miro",
    boardGridBtn: "\u0421\u0435\u0442\u043A\u0430 \u0434\u043E\u0441\u043A\u0438 Miro",
    attractionLabel: "\u0421\u0438\u043B\u0430 \u043F\u0440\u0438\u0442\u044F\u0436\u0435\u043D\u0438\u044F",
    attractionDesc: "\u041D\u0430\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0430\u043A\u0442\u0438\u0432\u043D\u043E \u043D\u043E\u0434\u044B \u0441\u043E\u0431\u0438\u0440\u0430\u044E\u0442\u0441\u044F \u0432\u043D\u0443\u0442\u0440\u0438 \u043E\u0440\u0433\u0430\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0445 \u0433\u0440\u0443\u043F\u043F",
    tetherLabel: "\u0421\u0432\u044F\u0437\u044C \u0441 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u043A\u0443\u0447\u0435\u0439",
    tetherDesc: "\u0423\u0434\u0435\u0440\u0436\u0438\u0432\u0430\u0435\u0442 \u043E\u0440\u0433\u0430\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0435 \u0433\u0440\u0443\u043F\u043F\u044B \u0440\u044F\u0434\u043E\u043C \u0441\u043E \u0441\u0432\u044F\u0437\u0430\u043D\u043D\u044B\u043C\u0438 \u0437\u0430\u043C\u0435\u0442\u043A\u0430\u043C\u0438 \u0431\u0435\u0437 \u0440\u0430\u0437\u0440\u044B\u0432\u0430 \u0433\u0440\u0430\u0444\u0430",
    compactnessLabel: "\u041F\u043B\u043E\u0442\u043D\u043E\u0441\u0442\u044C \u0433\u0440\u0443\u043F\u043F\u044B",
    compactnessDesc: "\u041D\u0430\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u043A\u043E\u043C\u043F\u0430\u043A\u0442\u043D\u043E \u043D\u043E\u0434\u044B \u0440\u0430\u0441\u043F\u043E\u043B\u0430\u0433\u0430\u044E\u0442\u0441\u044F \u0432\u043D\u0443\u0442\u0440\u0438 \u0437\u043E\u043D\u044B",
    syncNativeLabel: "\u041F\u0440\u0438\u0442\u044F\u0433\u0438\u0432\u0430\u0442\u044C \u0446\u0432\u0435\u0442\u043D\u044B\u0435 \u0433\u0440\u0443\u043F\u043F\u044B \u0433\u0440\u0430\u0444\u0430",
    syncNativeDesc: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u043F\u0440\u0438\u043C\u0435\u043D\u044F\u0442\u044C \u043F\u0440\u0438\u0442\u044F\u0436\u0435\u043D\u0438\u0435 \u043A \u0441\u0442\u0430\u043D\u0434\u0430\u0440\u0442\u043D\u044B\u043C \xAB\u0413\u0440\u0443\u043F\u043F\u0430\u043C\xBB Obsidian",
    showZonesLabel: "\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C \u0437\u043E\u043D\u044B \u0438 \u0440\u0430\u043C\u043A\u0438 Miro",
    showLabelsLabel: "\u0417\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u0438 \u0433\u0440\u0443\u043F\u043F \u0438 \u0440\u0430\u043C\u043E\u043A",
    repelOutsidersLabel: "\u0412\u044B\u0442\u0430\u043B\u043A\u0438\u0432\u0430\u0442\u044C \u0447\u0443\u0436\u0438\u0435 \u043D\u043E\u0434\u044B \u0438\u0437 \u0440\u0430\u043C\u043E\u043A Miro",
    emptyGroupsHint: "\u0421\u043E\u0437\u0434\u0430\u0439\u0442\u0435 \u043C\u044F\u0433\u043A\u0443\u044E \u0433\u0440\u0443\u043F\u043F\u0443, \u0436\u0451\u0441\u0442\u043A\u0443\u044E \u0440\u0430\u043C\u043A\u0443 Miro \u0438\u043B\u0438 \u043E\u0431\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u043E\u0434\u044B \u0447\u0435\u0440\u0435\u0437 \xAB\u041B\u0430\u0441\u0441\u043E\xBB \u043F\u0440\u044F\u043C\u043E \u043D\u0430 \u0433\u0440\u0430\u0444\u0435.",
    nativeBadge: "\u0438\u0437 \u0433\u0440\u0430\u0444\u0430",
    manualAnchorBadge: "\u044F\u043A\u043E\u0440\u044C",
    modeShort: (m) => m === "miro-pinned" ? "\u{1F4CC} \u0414\u043E\u0441\u043A\u0430 Miro" : m === "miro-free" ? "\u{1F4CB} \u0420\u0430\u043C\u043A\u0430 Miro" : "\u{1F9F2} \u0423 \u043A\u0443\u0447\u0438",
    modeDesc: (m) => m === "miro-pinned" ? "\u0416\u0451\u0441\u0442\u043A\u0430\u044F \u0440\u0430\u043C\u043A\u0430 Miro: \u0438 \u0440\u0430\u043C\u043A\u0430, \u0438 \u043D\u043E\u0434\u044B \u0437\u0430\u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u044B \u043D\u0430 \u0434\u043E\u0441\u043A\u0435, \u0430 \u0432\u043D\u0435\u0448\u043D\u0438\u0439 \u0433\u0440\u0430\u0444 \u0436\u0438\u0432\u043E\u0439" : m === "miro-free" ? "\u0416\u0438\u0432\u0430\u044F \u0440\u0430\u043C\u043A\u0430 Miro: \u0440\u0430\u043C\u043A\u0430 \u0437\u0430\u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u043D\u0430 \u043D\u0430 \u0434\u043E\u0441\u043A\u0435, \u0430 \u043D\u043E\u0434\u044B \u0432\u043D\u0443\u0442\u0440\u0438 \u043D\u0435\u0451 \u043E\u0441\u0442\u0430\u044E\u0442\u0441\u044F \u0434\u0438\u043D\u0430\u043C\u0438\u0447\u0435\u0441\u043A\u0438\u043C\u0438" : "\u041E\u0440\u0433\u0430\u043D\u0438\u0447\u0435\u0441\u043A\u0438\u0439 \u043B\u0435\u043F\u0435\u0441\u0442\u043E\u043A: \u043C\u044F\u0433\u043A\u043E \u043F\u0440\u0438\u0442\u044F\u0433\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u043A \u0433\u0440\u0443\u043F\u043F\u0435, \u043D\u0435 \u043E\u0442\u0440\u044B\u0432\u0430\u044F\u0441\u044C \u043E\u0442 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u043A\u0443\u0447\u0438",
    subLayoutName: (s) => s === "grid" ? "\u0421\u0435\u0442\u043A\u0430 \u043A\u0430\u0440\u0442\u043E\u0447\u0435\u043A" : s === "column" ? "\u041A\u043E\u043B\u043E\u043D\u043A\u0430 (\u041A\u0430\u043D\u0431\u0430\u043D)" : s === "row" ? "\u0421\u0442\u0440\u043E\u043A\u0430 (\u0422\u0430\u0439\u043C\u043B\u0430\u0439\u043D)" : s === "circle" ? "\u041A\u0440\u0443\u0433" : "\u0421\u0432\u043E\u0431\u043E\u0434\u043D\u043E \u0432\u0440\u0443\u0447\u043D\u0443\u044E",
    nodesCount: (n) => `${n} ${pluralRu(n, "\u043D\u043E\u0434\u0430", "\u043D\u043E\u0434\u044B", "\u043D\u043E\u0434")}`,
    pinnedNodesSummary: (n) => `\u0417\u0430\u043A\u0440\u0435\u043F\u043B\u0435\u043D\u043E \u043E\u0442\u0434\u0435\u043B\u044C\u043D\u044B\u0445 \u043D\u043E\u0434: ${n}`,
    unpinAllBtn: "\u041E\u0442\u043A\u0440\u0435\u043F\u0438\u0442\u044C \u0432\u0441\u0435",
    badgeTooltip: "\u0422\u044F\u043D\u0438\u0442\u0435 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043E\u043A \u0434\u043B\u044F \u043F\u0435\u0440\u0435\u043C\u0435\u0449\u0435\u043D\u0438\u044F \xB7 \u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u043D\u0430 \u0440\u0435\u0436\u0438\u043C (\u{1F9F2} / \u{1F4CB} / \u{1F4CC}), \u0447\u0442\u043E\u0431\u044B \u043F\u0435\u0440\u0435\u043A\u043B\u044E\u0447\u0430\u0442\u044C \u043C\u0435\u0436\u0434\u0443 \u043C\u044F\u0433\u043A\u043E\u0439 \u0433\u0440\u0443\u043F\u043F\u043E\u0439 \u0438 \u0434\u043E\u0441\u043A\u043E\u0439 Miro \xB7 \u041F\u041A\u041C \u2014 \u043C\u0435\u043D\u044E",
    frameResizeTooltip: "\u041F\u043E\u0442\u044F\u043D\u0438\u0442\u0435 \u0437\u0430 \u0443\u0433\u043E\u043B, \u0447\u0442\u043E\u0431\u044B \u0438\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u0440\u0430\u0437\u043C\u0435\u0440 \u0440\u0430\u043C\u043A\u0438 Miro",
    editGroup: "\u041D\u0430\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u0433\u0440\u0443\u043F\u043F\u0443 / \u0440\u0430\u043C\u043A\u0443",
    switchToMiroPinned: "\u{1F4CC} \u0417\u0430\u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u043A\u0430\u043A \u0434\u043E\u0441\u043A\u0443 Miro (\u0436\u0451\u0441\u0442\u043A\u043E)",
    switchToMiroFree: "\u{1F4CB} \u0421\u0434\u0435\u043B\u0430\u0442\u044C \u0436\u0438\u0432\u043E\u0439 \u0440\u0430\u043C\u043A\u043E\u0439 Miro (\u043D\u043E\u0434\u044B \u0434\u0438\u043D\u0430\u043C\u0438\u0447\u0435\u0441\u043A\u0438\u0435)",
    switchToOrganic: "\u{1F9F2} \u0412\u0435\u0440\u043D\u0443\u0442\u044C \u0432 \u043C\u044F\u0433\u043A\u0443\u044E \u0433\u0440\u0443\u043F\u043F\u0443 \u0443 \u043A\u0443\u0447\u0438",
    tidyGrid: "\u25A6 \u0412\u044B\u0440\u043E\u0432\u043D\u044F\u0442\u044C \u043D\u043E\u0434\u044B \u043F\u043E \u0441\u0435\u0442\u043A\u0435",
    tidyColumn: "\u25A4 \u0412\u044B\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u0432 \u043A\u043E\u043B\u043E\u043D\u043A\u0443",
    tidyCircle: "\u25EF \u0412\u044B\u0441\u0442\u0440\u043E\u0438\u0442\u044C \u043F\u043E \u043A\u0440\u0443\u0433\u0443",
    resetAnchor: "\u0412\u0435\u0440\u043D\u0443\u0442\u044C \u0430\u0432\u0442\u043E-\u043F\u043E\u0437\u0438\u0446\u0438\u044E \u0443 \u043A\u0443\u0447\u0438",
    toggleGroup: "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C / \u0432\u044B\u043A\u043B\u044E\u0447\u0438\u0442\u044C",
    deleteGroup: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0433\u0440\u0443\u043F\u043F\u0443",
    modalCreateTitle: "\u041D\u043E\u0432\u0430\u044F \u0433\u0440\u0443\u043F\u043F\u0430 / \u0440\u0430\u043C\u043A\u0430 Miro",
    modalEditTitle: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0430 \u0433\u0440\u0443\u043F\u043F\u044B / \u0440\u0430\u043C\u043A\u0438 Miro",
    groupNameLabel: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435",
    groupNamePlaceholder: "\u041D\u0430\u043F\u0440\u0438\u043C\u0435\u0440: \u0421\u043F\u0440\u0438\u043D\u0442 1, \u0410\u0440\u0445\u0438\u0442\u0435\u043A\u0442\u0443\u0440\u0430, \u0418\u0434\u0435\u0438",
    groupModeLabel: "\u0420\u0435\u0436\u0438\u043C \u0440\u0430\u0431\u043E\u0442\u044B \u043D\u0430 \u0433\u0440\u0430\u0444\u0435",
    groupSubLayoutLabel: "\u0420\u0430\u0441\u043A\u043B\u0430\u0434\u043A\u0430 \u043D\u043E\u0434 \u0432\u043D\u0443\u0442\u0440\u0438 \u0440\u0430\u043C\u043A\u0438 Miro",
    groupColorLabel: "\u0426\u0432\u0435\u0442",
    groupQueryLabel: "\u041F\u0440\u0430\u0432\u0438\u043B\u043E \u043E\u0442\u0431\u043E\u0440\u0430 (\u043D\u0435\u043E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E)",
    groupQueryDesc: "\u0417\u0430\u043F\u0440\u043E\u0441\u044B \u043A\u0430\u043A \u0432 Obsidian: tag:#\u0442\u0435\u0433, path:\u041F\u0430\u043F\u043A\u0430/, file:\u0438\u043C\u044F, [\u0441\u0432\u043E\u0439\u0441\u0442\u0432\u043E:\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435], OR, -\u0438\u0441\u043A\u043B\u044E\u0447\u0438\u0442\u044C",
    groupQueryPlaceholder: "tag:#\u043F\u0440\u043E\u0435\u043A\u0442 OR path:\u0417\u0430\u043C\u0435\u0442\u043A\u0438/",
    groupStrengthLabel: "\u0418\u043D\u0434\u0438\u0432\u0438\u0434\u0443\u0430\u043B\u044C\u043D\u0430\u044F \u0441\u0438\u043B\u0430",
    groupColorNodesLabel: "\u041E\u043A\u0440\u0430\u0448\u0438\u0432\u0430\u0442\u044C \u043D\u043E\u0434\u044B \u0432 \u0446\u0432\u0435\u0442 \u0433\u0440\u0443\u043F\u043F\u044B",
    manualNodesHeader: "\u0420\u0443\u0447\u043D\u043E\u0439 \u0432\u044B\u0431\u043E\u0440 \u043D\u043E\u0434",
    manualNodesSearchPlaceholder: "\u041F\u043E\u0438\u0441\u043A \u0437\u0430\u043C\u0435\u0442\u043E\u043A \u0438\u043B\u0438 \u0442\u0435\u0433\u043E\u0432 \u043D\u0430 \u0433\u0440\u0430\u0444\u0435...",
    selectedCount: (n) => `\u0412\u044B\u0431\u0440\u0430\u043D\u043E \u0432\u0440\u0443\u0447\u043D\u0443\u044E: ${n}`,
    clearManualBtn: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u0441\u043F\u0438\u0441\u043E\u043A",
    saveBtn: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C",
    cancelBtn: "\u041E\u0442\u043C\u0435\u043D\u0430",
    lassoMenuTitle: (n) => `\u0412\u044B\u0434\u0435\u043B\u0435\u043D\u043E: ${n} ${pluralRu(n, "\u043D\u043E\u0434\u0430", "\u043D\u043E\u0434\u044B", "\u043D\u043E\u0434")}`,
    lassoCreateNew: (n) => `\u{1F9F2} \u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043C\u044F\u0433\u043A\u0443\u044E \u0433\u0440\u0443\u043F\u043F\u0443 \u0443 \u043A\u0443\u0447\u0438 (${n})`,
    lassoCreateMiroPinned: (n) => `\u{1F4CC} \u0417\u0430\u0444\u0438\u043A\u0441\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0432 \u0440\u0430\u043C\u043A\u0443 Miro (${n})`,
    lassoCreateMiroFree: (n) => `\u{1F4CB} \u0421\u043E\u0431\u0440\u0430\u0442\u044C \u0432 \u0436\u0438\u0432\u0443\u044E \u0440\u0430\u043C\u043A\u0443 Miro (${n})`,
    lassoPinIndividual: (n) => `\u{1F4CD} \u0416\u0451\u0441\u0442\u043A\u043E \u043F\u0440\u0438\u043A\u043E\u043B\u043E\u0442\u044C \u043D\u043E\u0434\u044B \u043D\u0430 \u0438\u0445 \u043C\u0435\u0441\u0442\u0430\u0445 (${n})`,
    lassoUnpinIndividual: "\u{1F513} \u041E\u0442\u043A\u0440\u0435\u043F\u0438\u0442\u044C \u0432\u044B\u0434\u0435\u043B\u0435\u043D\u043D\u044B\u0435 \u043D\u043E\u0434\u044B",
    lassoAddTo: (name) => `\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0432 \xAB${name}\xBB`,
    lassoRemoveFromAll: "\u0423\u0431\u0440\u0430\u0442\u044C \u0438\u0437 \u0432\u0441\u0435\u0445 \u0440\u0443\u0447\u043D\u044B\u0445 \u0433\u0440\u0443\u043F\u043F",
    defaultNewGroupName: (idx) => `\u0413\u0440\u0443\u043F\u043F\u0430 ${idx}`,
    defaultNewFrameName: (idx) => `\u0414\u043E\u0441\u043A\u0430 ${idx}`,
    ctxMenuHeader: "\u041C\u0430\u0433\u043D\u0438\u0442\u043D\u044B\u0435 \u0433\u0440\u0443\u043F\u043F\u044B \u0438 Miro",
    ctxPinNodeHere: "\u{1F4CD} \u0416\u0451\u0441\u0442\u043A\u043E \u0437\u0430\u043A\u0440\u0435\u043F\u0438\u0442\u044C \u043D\u043E\u0434\u0443 \u043D\u0430 \u044D\u0442\u043E\u043C \u043C\u0435\u0441\u0442\u0435",
    ctxUnpinNode: "\u{1F513} \u041E\u0442\u043A\u0440\u0435\u043F\u0438\u0442\u044C \u043D\u043E\u0434\u0443 (\u0441\u0434\u0435\u043B\u0430\u0442\u044C \u0434\u0438\u043D\u0430\u043C\u0438\u0447\u0435\u0441\u043A\u043E\u0439)",
    ctxCreateWithNode: "\u{1F9F2} \u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043C\u044F\u0433\u043A\u0443\u044E \u0433\u0440\u0443\u043F\u043F\u0443 \u0441 \u044D\u0442\u043E\u0439 \u043D\u043E\u0434\u043E\u0439",
    ctxCreateMiroWithNeighbors: "\u{1F4CC} \u0421\u043E\u0431\u0440\u0430\u0442\u044C \u043D\u043E\u0434\u0443 \u0438 \u0441\u043E\u0441\u0435\u0434\u0435\u0439 \u0432 \u0440\u0430\u043C\u043A\u0443 Miro",
    ctxCreateWithNeighbors: "\u{1F9F2} \u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0433\u0440\u0443\u043F\u043F\u0443: \u043D\u043E\u0434\u0430 + \u0435\u0451 \u0441\u043E\u0441\u0435\u0434\u0438",
    ctxAddToGroup: (name) => `\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0432 \xAB${name}\xBB`,
    ctxRemoveFromGroup: (name) => `\u0423\u0431\u0440\u0430\u0442\u044C \u0438\u0437 \xAB${name}\xBB`,
    noticeCreatedGroup: (name, count) => `\u0421\u043E\u0437\u0434\u0430\u043D\u0430 \xAB${name}\xBB (${count} ${pluralRu(count, "\u043D\u043E\u0434\u0430", "\u043D\u043E\u0434\u044B", "\u043D\u043E\u0434")})`,
    noticeAddedToGroup: (name, count) => `\u0412 \xAB${name}\xBB \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E: ${count}`,
    noticePinnedNodes: (count) => `\u0417\u0430\u043A\u0440\u0435\u043F\u043B\u0435\u043D\u043E \u043D\u0430 \u0434\u043E\u0441\u043A\u0435: ${count} ${pluralRu(count, "\u043D\u043E\u0434\u0430", "\u043D\u043E\u0434\u044B", "\u043D\u043E\u0434")}`,
    noticeUnpinnedNodes: "\u041D\u043E\u0434\u044B \u0441\u043D\u043E\u0432\u0430 \u0441\u0432\u043E\u0431\u043E\u0434\u043D\u044B \u0438 \u0434\u0438\u043D\u0430\u043C\u0438\u0447\u043D\u044B",
    noticeNoGraphOpen: "\u041E\u0442\u043A\u0440\u043E\u0439\u0442\u0435 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443 \u0433\u0440\u0430\u0444\u0430 (Graph View)",
    noticeCopied: "\u0421\u0441\u044B\u043B\u043A\u0430 \u0441\u043A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u043D\u0430 \u0432 \u0431\u0443\u0444\u0435\u0440 \u043E\u0431\u043C\u0435\u043D\u0430!",
    cmdToggleLasso: "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0440\u0435\u0436\u0438\u043C \u041B\u0430\u0441\u0441\u043E \u043D\u0430 \u0433\u0440\u0430\u0444\u0435",
    cmdCreateGroupModal: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u043C\u0430\u0433\u043D\u0438\u0442\u043D\u0443\u044E \u0433\u0440\u0443\u043F\u043F\u0443 \u0438\u043B\u0438 \u0440\u0430\u043C\u043A\u0443 Miro",
    cmdReheat: "\u041F\u0435\u0440\u0435\u0441\u0447\u0438\u0442\u0430\u0442\u044C \u0434\u0438\u043D\u0430\u043C\u0438\u0447\u0435\u0441\u043A\u043E\u0435 \u043F\u0440\u0438\u0442\u044F\u0436\u0435\u043D\u0438\u0435 \u0433\u0440\u0443\u043F\u043F",
    cmdResetAllAnchors: "\u0421\u0431\u0440\u043E\u0441\u0438\u0442\u044C \u0432\u0441\u0435 \u0440\u0443\u0447\u043D\u044B\u0435 \u044F\u043A\u043E\u0440\u044F \u0438 \u043E\u0442\u043A\u0440\u0435\u043F\u0438\u0442\u044C \u043E\u0434\u0438\u043D\u043E\u0447\u043D\u044B\u0435 \u043D\u043E\u0434\u044B",
    settingsHeader: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 Graph Magnetic Groups & Miro + MCP",
    settingsLang: "\u042F\u0437\u044B\u043A \u0438\u043D\u0442\u0435\u0440\u0444\u0435\u0439\u0441\u0430 / Language",
    settingsLocalGraph: "\u0420\u0430\u0431\u043E\u0442\u0430\u0442\u044C \u0442\u0430\u043A\u0436\u0435 \u0432 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E\u043C \u0433\u0440\u0430\u0444\u0435 (Local Graph)",
    settingsLocalGraphDesc: "\u041F\u0440\u0438\u043C\u0435\u043D\u044F\u0442\u044C \u0433\u0440\u0443\u043F\u043F\u044B \u0438 \u0440\u0430\u043C\u043A\u0438 Miro \u0432 \u0433\u043B\u043E\u0431\u0430\u043B\u044C\u043D\u043E\u043C \u0438 \u043B\u043E\u043A\u0430\u043B\u044C\u043D\u043E\u043C \u0433\u0440\u0430\u0444\u0430\u0445",
    settingsShiftLasso: "\u0412\u044B\u0434\u0435\u043B\u0435\u043D\u0438\u0435 \u043B\u0430\u0441\u0441\u043E \u0447\u0435\u0440\u0435\u0437 Shift + \u043F\u0435\u0440\u0435\u0442\u0430\u0441\u043A\u0438\u0432\u0430\u043D\u0438\u0435",
    settingsShiftLassoDesc: "\u0417\u0430\u0436\u043C\u0438\u0442\u0435 Shift \u0438 \u043E\u0431\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u043E\u0434\u044B \u043D\u0430 \u043F\u0443\u0441\u0442\u043E\u043C \u043C\u0435\u0441\u0442\u0435 \u0433\u0440\u0430\u0444\u0430",
    settingsBoardGrid: "\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C \u0442\u043E\u0447\u0435\u0447\u043D\u0443\u044E \u0441\u0435\u0442\u043A\u0443 \u0434\u043E\u0441\u043A\u0438 Miro \u043D\u0430 \u0444\u043E\u043D\u0435 \u0433\u0440\u0430\u0444\u0430",
    settingsZoneOpacity: "\u041F\u0440\u043E\u0437\u0440\u0430\u0447\u043D\u043E\u0441\u0442\u044C \u0437\u0430\u043B\u0438\u0432\u043A\u0438 \u0437\u043E\u043D \u0438 \u0440\u0430\u043C\u043E\u043A",
    settingsTetherLines: "\u041F\u043E\u043A\u0430\u0437\u044B\u0432\u0430\u0442\u044C \u043B\u0438\u043D\u0438\u0438 \u0441\u0432\u044F\u0437\u0438 \u0441 \u043E\u0441\u043D\u043E\u0432\u043D\u043E\u0439 \u043A\u0443\u0447\u0435\u0439 \u043F\u0440\u0438 \u043D\u0430\u0432\u0435\u0434\u0435\u043D\u0438\u0438",
    mcpSectionHeader: "\u2601\uFE0F MCP-\u0441\u0435\u0440\u0432\u0435\u0440 \u0434\u043B\u044F Obsidian \u0438 Cloudflare Quick Tunnels",
    mcpSectionDesc: "\u0412\u0441\u0442\u0440\u043E\u0435\u043D\u043D\u044B\u0439 MCP-\u0441\u0435\u0440\u0432\u0435\u0440 \u043F\u043E\u0437\u0432\u043E\u043B\u044F\u0435\u0442 \u043E\u0431\u043B\u0430\u0447\u043D\u044B\u043C \u0418\u0418-\u0430\u0433\u0435\u043D\u0442\u0430\u043C (Claude, ChatGPT, n8n, LangGraph, Cursor \u0438 \u0434\u0440.) \u0447\u0438\u0442\u0430\u0442\u044C/\u0441\u043E\u0437\u0434\u0430\u0432\u0430\u0442\u044C \u0437\u0430\u043C\u0435\u0442\u043A\u0438 \u0438 \u0443\u043F\u0440\u0430\u0432\u043B\u044F\u0442\u044C \u0433\u0440\u0443\u043F\u043F\u0430\u043C\u0438 \u0438 \u0440\u0430\u043C\u043A\u0430\u043C\u0438 Miro \u043F\u0440\u044F\u043C\u043E \u043D\u0430 \u0436\u0438\u0432\u043E\u043C \u0433\u0440\u0430\u0444\u0435.",
    mcpEnableLabel: "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0432\u0441\u0442\u0440\u043E\u0435\u043D\u043D\u044B\u0439 MCP-\u0441\u0435\u0440\u0432\u0435\u0440 \u0432 Obsidian",
    mcpPortLabel: "\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 \u043F\u043E\u0440\u0442 MCP-\u0441\u0435\u0440\u0432\u0435\u0440\u0430",
    mcpTokenToggleLabel: "\u0417\u0430\u0449\u0438\u0442\u0430 \u0441\u0435\u043A\u0440\u0435\u0442\u043D\u044B\u043C \u0442\u043E\u043A\u0435\u043D\u043E\u043C \u0432 URL",
    mcpTokenToggleDesc: "\u0422\u043E\u043A\u0435\u043D \u0432\u0448\u0438\u0432\u0430\u0435\u0442\u0441\u044F \u043F\u0440\u044F\u043C\u043E \u0432 \u043F\u0443\u0442\u044C \u0441\u0441\u044B\u043B\u043A\u0438 (/t/<\u0442\u043E\u043A\u0435\u043D>/mcp), \u0447\u0442\u043E\u0431\u044B \u043E\u0431\u043B\u0430\u0447\u043D\u044B\u0435 \u0430\u0433\u0435\u043D\u0442\u044B \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0430\u043B\u0438\u0441\u044C \u0432 1 \u043A\u043B\u0438\u043A \u0431\u0435\u0437 \u0441\u043B\u043E\u0436\u043D\u043E\u0439 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u043E\u0432 \u0438 OAuth",
    mcpTokenValueLabel: "\u0421\u0435\u043A\u0440\u0435\u0442\u043D\u044B\u0439 \u0442\u043E\u043A\u0435\u043D",
    mcpRegenerateBtn: "\u041D\u043E\u0432\u044B\u0439 \u0442\u043E\u043A\u0435\u043D",
    mcpStatusRunning: (url) => `\u041B\u043E\u043A\u0430\u043B\u044C\u043D\u044B\u0439 MCP \u0437\u0430\u043F\u0443\u0449\u0435\u043D: ${url}`,
    mcpStatusStopped: "MCP-\u0441\u0435\u0440\u0432\u0435\u0440 \u043E\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D",
    mcpTunnelTitle: "Cloudflare Quick Tunnel (\u043F\u0443\u0431\u043B\u0438\u0447\u043D\u044B\u0439 HTTPS \u0434\u043B\u044F \u043E\u0431\u043B\u0430\u0447\u043D\u044B\u0445 \u0430\u0433\u0435\u043D\u0442\u043E\u0432)",
    mcpTunnelStartBtn: "\u2601\uFE0F \u0417\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C Quick Tunnel",
    mcpTunnelStopBtn: "\u23F9 \u041E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0442\u0443\u043D\u043D\u0435\u043B\u044C",
    mcpAutoTunnelLabel: "\u0410\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u043F\u043E\u0434\u043D\u0438\u043C\u0430\u0442\u044C Quick Tunnel \u043F\u0440\u0438 \u0437\u0430\u043F\u0443\u0441\u043A\u0435 Obsidian",
    mcpCloudflaredPathLabel: "\u041F\u0443\u0442\u044C \u043A cloudflared (\u043E\u0441\u0442\u0430\u0432\u044C\u0442\u0435 \u043F\u0443\u0441\u0442\u044B\u043C \u0434\u043B\u044F \u0430\u0432\u0442\u043E\u043F\u043E\u0438\u0441\u043A\u0430)",
    mcpCopyHttpUrl: "\u{1F4CB} \u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C MCP URL (Streamable HTTP)",
    mcpCopySseUrl: "\u{1F4CB} \u041A\u043E\u043F\u0438\u0440\u043E\u0432\u0430\u0442\u044C SSE URL (\u0434\u043B\u044F \u0441\u0442\u0430\u0440\u044B\u0445 \u0430\u0433\u0435\u043D\u0442\u043E\u0432)"
  },
  en: {
    pluginTitle: "Magnetic Groups & Miro",
    enableMagnetic: "Enable groups & board",
    lassoBtn: "Lasso: circle nodes to group or pin",
    lassoActiveHint: "Circle nodes on graph: group / Miro frame / hard-pin (Esc to cancel)",
    reheatBtn: "Refresh dynamic layout",
    addGroupBtn: "+ Group",
    addMiroFrameBtn: "+ Miro Frame",
    boardGridBtn: "Miro board dot-grid",
    attractionLabel: "Attraction strength",
    attractionDesc: "How strongly nodes gather inside organic groups",
    tetherLabel: "Main cluster tether",
    tetherDesc: "Keeps organic groups organically attached to linked notes without tearing",
    compactnessLabel: "Group compactness",
    compactnessDesc: "How tightly nodes pack inside each zone",
    syncNativeLabel: "Attract native graph color groups",
    syncNativeDesc: "Automatically apply magnetic cohesion to Obsidian's built-in Graph Groups",
    showZonesLabel: "Show zones & Miro frames",
    showLabelsLabel: "Group & frame headers",
    repelOutsidersLabel: "Keep ungrouped nodes out of Miro frames",
    emptyGroupsHint: "Create an organic group, a hard-fixed Miro frame, or use Lasso right on the graph.",
    nativeBadge: "native",
    manualAnchorBadge: "pinned",
    modeShort: (m) => m === "miro-pinned" ? "\u{1F4CC} Miro Pin" : m === "miro-free" ? "\u{1F4CB} Miro Live" : "\u{1F9F2} Organic",
    modeDesc: (m) => m === "miro-pinned" ? "Hard Miro Board Frame: frame & nodes locked on board while surrounding graph stays dynamic" : m === "miro-free" ? "Live Miro Frame: frame fixed on board, member nodes move dynamically inside its walls" : "Organic Lobe: soft attraction hugging the main cluster without tearing",
    subLayoutName: (s) => s === "grid" ? "Card Grid" : s === "column" ? "Kanban Column" : s === "row" ? "Timeline Row" : s === "circle" ? "Circle" : "Freeform Manual",
    nodesCount: (n) => `${n} node${n === 1 ? "" : "s"}`,
    pinnedNodesSummary: (n) => `Pinned individual nodes: ${n}`,
    unpinAllBtn: "Unpin all",
    badgeTooltip: "Drag header to move \xB7 Click mode pill (\u{1F9F2} / \u{1F4CB} / \u{1F4CC}) to switch between soft cluster & Miro frame \xB7 Right-click for menu",
    frameResizeTooltip: "Drag corner to resize Miro frame",
    editGroup: "Edit group / frame",
    switchToMiroPinned: "\u{1F4CC} Lock as Miro Board Frame (hard pin)",
    switchToMiroFree: "\u{1F4CB} Switch to Live Miro Frame (dynamic inside)",
    switchToOrganic: "\u{1F9F2} Return to Organic Cluster Lobe",
    tidyGrid: "\u25A6 Arrange nodes in Grid",
    tidyColumn: "\u25A4 Arrange in Column",
    tidyCircle: "\u25EF Arrange in Circle",
    resetAnchor: "Reset to auto cluster pocket",
    toggleGroup: "Enable / disable",
    deleteGroup: "Delete group",
    modalCreateTitle: "New Group / Miro Frame",
    modalEditTitle: "Edit Group / Miro Frame",
    groupNameLabel: "Name",
    groupNamePlaceholder: "e.g. Sprint 1, Architecture, Ideas",
    groupModeLabel: "Graph behavior mode",
    groupSubLayoutLabel: "Miro frame card layout",
    groupColorLabel: "Color",
    groupQueryLabel: "Filter query (optional)",
    groupQueryDesc: "Obsidian queries: tag:#tag, path:Folder/, file:name, [prop:val], OR, -exclude",
    groupQueryPlaceholder: "tag:#project OR path:Notes/",
    groupStrengthLabel: "Strength multiplier",
    groupColorNodesLabel: "Tint nodes with group color",
    manualNodesHeader: "Manual node selection",
    manualNodesSearchPlaceholder: "Search notes or tags...",
    selectedCount: (n) => `Manually selected: ${n}`,
    clearManualBtn: "Clear list",
    saveBtn: "Save",
    cancelBtn: "Cancel",
    lassoMenuTitle: (n) => `Selected: ${n} node${n === 1 ? "" : "s"}`,
    lassoCreateNew: (n) => `\u{1F9F2} Create organic group (${n})`,
    lassoCreateMiroPinned: (n) => `\u{1F4CC} Lock into Miro Board Frame (${n})`,
    lassoCreateMiroFree: (n) => `\u{1F4CB} Gather in Live Miro Frame (${n})`,
    lassoPinIndividual: (n) => `\u{1F4CD} Hard-pin nodes in place (${n})`,
    lassoUnpinIndividual: "\u{1F513} Unpin selected nodes",
    lassoAddTo: (name) => `Add to "${name}"`,
    lassoRemoveFromAll: "Remove from manual groups",
    defaultNewGroupName: (idx) => `Group ${idx}`,
    defaultNewFrameName: (idx) => `Frame ${idx}`,
    ctxMenuHeader: "Magnetic Groups & Miro",
    ctxPinNodeHere: "\u{1F4CD} Hard-pin node right here",
    ctxUnpinNode: "\u{1F513} Unpin node (make dynamic)",
    ctxCreateWithNode: "\u{1F9F2} Create organic group with this node",
    ctxCreateMiroWithNeighbors: "\u{1F4CC} Lock node + neighbors into Miro Frame",
    ctxCreateWithNeighbors: "\u{1F9F2} Create group: node + neighbors",
    ctxAddToGroup: (name) => `Add to "${name}"`,
    ctxRemoveFromGroup: (name) => `Remove from "${name}"`,
    noticeCreatedGroup: (name, count) => `Created "${name}" (${count} node${count === 1 ? "" : "s"})`,
    noticeAddedToGroup: (name, count) => `Added ${count} node${count === 1 ? "" : "s"} to "${name}"`,
    noticePinnedNodes: (count) => `Hard-pinned ${count} node${count === 1 ? "" : "s"} on board`,
    noticeUnpinnedNodes: "Nodes unpinned and dynamic again",
    noticeNoGraphOpen: "Open a Graph View first",
    noticeCopied: "URL copied to clipboard!",
    cmdToggleLasso: "Toggle Lasso mode on graph",
    cmdCreateGroupModal: "Create magnetic group or Miro frame",
    cmdReheat: "Recalculate dynamic group layout",
    cmdResetAllAnchors: "Reset all manual anchors & unpin individual nodes",
    settingsHeader: "Graph Magnetic Groups & Miro + MCP Settings",
    settingsLang: "Interface Language / \u042F\u0437\u044B\u043A",
    settingsLocalGraph: "Enable in Local Graph too",
    settingsLocalGraphDesc: "Apply groups and Miro frames in both Global and Local Graph views",
    settingsShiftLasso: "Lasso selection via Shift + Drag",
    settingsShiftLassoDesc: "Hold Shift and drag on empty graph space",
    settingsBoardGrid: "Show Miro dot-grid background on graph",
    settingsZoneOpacity: "Zone & frame fill opacity",
    settingsTetherLines: "Show elastic tether lines on hover",
    mcpSectionHeader: "\u2601\uFE0F Obsidian MCP Server & Cloudflare Quick Tunnels",
    mcpSectionDesc: "Built-in MCP server lets cloud AI agents (Claude, ChatGPT, n8n, LangGraph, Cursor, etc.) read/write vault notes and orchestrate groups & Miro frames live on your graph.",
    mcpEnableLabel: "Enable embedded MCP server in Obsidian",
    mcpPortLabel: "Local MCP server port",
    mcpTokenToggleLabel: "Protect with secret URL token",
    mcpTokenToggleDesc: "Embeds secret token directly in URL path (/t/<token>/mcp) so cloud agents connect in 1 click without custom headers or OAuth setup",
    mcpTokenValueLabel: "Secret token",
    mcpRegenerateBtn: "Regenerate",
    mcpStatusRunning: (url) => `Local MCP running: ${url}`,
    mcpStatusStopped: "MCP server stopped",
    mcpTunnelTitle: "Cloudflare Quick Tunnel (Public HTTPS for Cloud Agents)",
    mcpTunnelStartBtn: "\u2601\uFE0F Start Quick Tunnel",
    mcpTunnelStopBtn: "\u23F9 Stop Tunnel",
    mcpAutoTunnelLabel: "Auto-start Quick Tunnel when Obsidian launches",
    mcpCloudflaredPathLabel: "Custom cloudflared binary path (leave blank for auto-detect)",
    mcpCopyHttpUrl: "\u{1F4CB} Copy MCP URL (Streamable HTTP)",
    mcpCopySseUrl: "\u{1F4CB} Copy SSE URL (legacy clients)"
  }
};
function pluralRu(n, one, few, many) {
  const abs = Math.abs(n) % 100;
  const n1 = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (n1 > 1 && n1 < 5) return few;
  if (n1 === 1) return one;
  return many;
}
function t(lang) {
  return STRINGS[lang] || STRINGS.ru;
}

// src/physicsEngine.ts
var MIRO_HEADER_HEIGHT = 38;
var MIRO_FRAME_PADDING = 30;
var MIRO_MIN_WIDTH = 210;
var MIRO_MIN_HEIGHT = 165;
function computeDefaultMiroFrame(memberPositions, fallbackCenter, subLayout = "grid") {
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
    const customOffsets = {};
    for (const p of memberPositions) {
      customOffsets[p.id] = {
        dx: p.x - fx,
        dy: p.y - fy
      };
    }
    return {
      frameX: Math.round(fx),
      frameY: Math.round(fy),
      frameW: Math.round(w),
      frameH: Math.round(h),
      customOffsets
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
      customOffsets: {}
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
    customOffsets: {}
  };
}
function computeMiroFrameNodeTargets(frameX, frameY, frameW, frameH, memberNodes, subLayout = "grid", customOffsets) {
  const targets = /* @__PURE__ */ new Map();
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
      let dx;
      let dy;
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
    const innerH2 = Math.max(80, h - topInset - bottomInset);
    const cx = frameX + w / 2;
    const cy = frameY + topInset + innerH2 / 2;
    if (n === 1) {
      targets.set(sorted[0].id, { x: cx, y: cy });
      return { targets, effectiveW: w, effectiveH: h };
    }
    const rx = Math.max(32, innerW / 2 - 18);
    const ry = Math.max(32, innerH2 / 2 - 18);
    for (let i = 0; i < n; i++) {
      const angle = -Math.PI / 2 + 2 * Math.PI * i / n;
      targets.set(sorted[i].id, {
        x: cx + Math.cos(angle) * rx,
        y: cy + Math.sin(angle) * ry
      });
    }
    return { targets, effectiveW: w, effectiveH: h };
  }
  let cols;
  if (subLayout === "column") {
    cols = 1;
  } else if (subLayout === "row") {
    cols = n;
  } else {
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
    let x;
    if (itemsInThisRow <= 1) {
      x = frameX + w / 2;
    } else {
      const rowSpanW = innerW * (itemsInThisRow / cols);
      const rowStartX = frameX + (w - rowSpanW) / 2;
      const stepX = cols > 1 ? innerW / (cols - 1) : 0;
      x = itemsInThisRow === cols ? frameX + padX + col * stepX : rowStartX + col / (itemsInThisRow - 1) * rowSpanW;
    }
    const y = rows <= 1 ? frameY + topInset + innerH / 2 : frameY + topInset + row / (rows - 1) * innerH;
    targets.set(sorted[i].id, { x, y });
  }
  return { targets, effectiveW: w, effectiveH: h };
}
function computeMagneticStep(nodes, edges, groups, config) {
  const displacements = /* @__PURE__ */ new Map();
  const hardPinnedTargets = /* @__PURE__ */ new Map();
  const zones = [];
  if (nodes.length === 0) {
    return {
      displacements,
      hardPinnedTargets,
      zones,
      globalCenter: { x: 0, y: 0 }
    };
  }
  const nodeMap = /* @__PURE__ */ new Map();
  let sumAllX = 0;
  let sumAllY = 0;
  for (const n of nodes) {
    nodeMap.set(n.id, n);
    sumAllX += n.x;
    sumAllY += n.y;
  }
  const globalCenter = {
    x: sumAllX / nodes.length,
    y: sumAllY / nodes.length
  };
  const neighbors = /* @__PURE__ */ new Map();
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
  if (config.pinnedNodes) {
    for (const [nodeId, pos] of Object.entries(config.pinnedNodes)) {
      if (nodeMap.has(nodeId) && Number.isFinite(pos.x) && Number.isFinite(pos.y)) {
        hardPinnedTargets.set(nodeId, { x: pos.x, y: pos.y });
      }
    }
  }
  const accum = /* @__PURE__ */ new Map();
  const linkDist = Math.max(60, config.nativeLinkDistance || 140);
  const tether = clamp(config.clusterTether, 0, 1);
  const compact = clamp(config.groupCompactness, 0.15, 1);
  const globalAttract = clamp(config.attractionStrength, 0, 1);
  const activeMiroFrames = [];
  const organicPocketTrackers = [];
  for (const group of groups) {
    const mode = group.mode || "organic";
    const memberNodes = [];
    for (const id of group.memberIds) {
      const pt = nodeMap.get(id);
      if (pt) memberNodes.push(pt);
    }
    const isMiro = mode === "miro-pinned" || mode === "miro-free";
    if (memberNodes.length === 0 && !isMiro) continue;
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
    const externalLinkCountByMember = /* @__PURE__ */ new Map();
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
    if (isMiro) {
      const subLayout = group.frameSubLayout || "grid";
      const defaults = group.frameX !== void 0 && group.frameY !== void 0 && group.frameW !== void 0 && group.frameH !== void 0 ? {
        frameX: group.frameX,
        frameY: group.frameY,
        frameW: group.frameW,
        frameH: group.frameH,
        customOffsets: group.customOffsets || {}
      } : computeDefaultMiroFrame(memberNodes, { x: gx, y: gy }, subLayout);
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
            sourceGroupId: group.id
          });
        }
      } else {
        const pad = 28;
        const minInX = fx + pad;
        const maxInX = fx + fw - pad;
        const minInY = fy + MIRO_HEADER_HEIGHT + pad;
        const maxInY = fy + fh - pad;
        const innerCenterX = (minInX + maxInX) / 2;
        const innerCenterY = (minInY + maxInY) / 2;
        const comfortDist = Math.max(
          42,
          Math.min(90, Math.sqrt((maxInX - minInX) * (maxInY - minInY) / Math.max(1, memberNodes.length)) * 0.72)
        );
        for (const m of memberNodes) {
          if (m.pinned || hardPinnedTargets.has(m.id)) continue;
          let stepX = 0;
          let stepY = 0;
          if (m.x < minInX) stepX += (minInX - m.x) * 0.42;
          else if (m.x > maxInX) stepX += (maxInX - m.x) * 0.42;
          if (m.y < minInY) stepY += (minInY - m.y) * 0.42;
          else if (m.y > maxInY) stepY += (maxInY - m.y) * 0.42;
          stepX += (innerCenterX - m.x) * 0.095 * clamp(group.strength, 0.2, 2);
          stepY += (innerCenterY - m.y) * 0.095 * clamp(group.strength, 0.2, 2);
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
              const rep = (comfortDist - rd) / comfortDist * 4.5;
              stepX += rx / rd * rep;
              stepY += ry / rd * rep;
            }
          }
          const stepMag = Math.hypot(stepX, stepY);
          const maxStep = 28;
          if (stepMag > maxStep) {
            stepX = stepX / stepMag * maxStep;
            stepY = stepY / stepMag * maxStep;
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
        h: fh
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
          { x: fx, y: fy + fh }
        ],
        radius: Math.hypot(fw, fh) / 2,
        frameRect: {
          x: fx,
          y: fy,
          w: fw,
          h: fh,
          subLayout
        }
      });
      continue;
    }
    const nonMemberCount = nodes.length - memberNodes.length;
    let outDirX;
    let outDirY;
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
    const lobeOffset = hasBridge ? linkDist * (0.45 + (1 - tether) * 1.15) : linkDist * (0.65 + (1 - tether) * 0.9);
    let pocketX;
    let pocketY;
    if (group.anchorMode === "manual" && typeof group.anchorX === "number" && typeof group.anchorY === "number") {
      const anchorOriginX = hasBridge ? bridgeX : globalCenter.x;
      const anchorOriginY = hasBridge ? bridgeY : globalCenter.y;
      const rawDx = group.anchorX - anchorOriginX;
      const rawDy = group.anchorY - anchorOriginY;
      const rawDist = Math.hypot(rawDx, rawDy);
      const maxLeash = linkDist * (1.2 + (1 - tether) * 4.2) + desiredRadius * 0.6;
      if (tether > 0.03 && rawDist > maxLeash && rawDist > 0) {
        const excess = rawDist - maxLeash;
        const dampedDist = maxLeash + Math.log1p(excess / 90) * 90 * (1 - tether * 0.78);
        pocketX = anchorOriginX + rawDx / rawDist * dampedDist;
        pocketY = anchorOriginY + rawDy / rawDist * dampedDist;
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
        pocketX = globalCenter.x + (gx - globalCenter.x) / distFromGlobal * maxFloatDist;
        pocketY = globalCenter.y + (gy - globalCenter.y) / distFromGlobal * maxFloatDist;
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
      radius: Math.max(desiredRadius, estimateClusterRadius(memberNodes, gx, gy) + 22)
    });
    organicPocketTrackers.push({
      spec: group,
      zoneIndex: zoneIdx,
      memberNodes,
      desiredRadius,
      maxLeashDist: linkDist * (1.25 + (1 - tether) * 3.8) + desiredRadius * 0.6,
      leashOriginX: hasBridge ? bridgeX : globalCenter.x,
      leashOriginY: hasBridge ? bridgeY : globalCenter.y
    });
  }
  if (organicPocketTrackers.length >= 1) {
    for (let iter = 0; iter < 2; iter++) {
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
            z.pocketX = p.leashOriginX + rdx / rdist * p.maxLeashDist;
            z.pocketY = p.leashOriginY + rdy / rdist * p.maxLeashDist;
          }
        }
      }
    }
  }
  if (globalAttract > 1e-3) {
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
        const bridgeDamping = extCount > 0 ? 1 / (1 + extCount * 0.26 * tether) : 1.08;
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
      dx = dx / mag * maxStepPerFrame;
      dy = dy / mag * maxStepPerFrame;
    }
    if (Math.abs(dx) > 0.04 || Math.abs(dy) > 0.04) {
      displacements.set(id, { dx, dy });
    }
  }
  return { displacements, hardPinnedTargets, zones, globalCenter };
}
function computePaddedConvexHull(points, pad) {
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
    const out = [];
    for (let i = 0; i <= 6; i++) {
      const ang = Math.PI * i / 6;
      out.push({
        x: a.x - ux * Math.sin(ang) * r + nx * Math.cos(ang) * r,
        y: a.y - uy * Math.sin(ang) * r + ny * Math.cos(ang) * r
      });
    }
    for (let i = 0; i <= 6; i++) {
      const ang = Math.PI * i / 6;
      out.push({
        x: b.x + ux * Math.sin(ang) * r - nx * Math.cos(ang) * r,
        y: b.y + uy * Math.sin(ang) * r - ny * Math.cos(ang) * r
      });
    }
    return out;
  }
  const sorted = [...points].sort((p, q) => p.x === q.x ? p.y - q.y : p.x - q.x);
  const lower = [];
  for (const p of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper = [];
  for (let i = sorted.length - 1; i >= 0; i--) {
    const p = sorted[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  const hull = lower.concat(upper);
  if (hull.length < 3) {
    const cx2 = points.reduce((s, p) => s + p.x, 0) / points.length;
    const cy2 = points.reduce((s, p) => s + p.y, 0) / points.length;
    return circlePolygon(cx2, cy2, pad + 16, 12);
  }
  const cx = hull.reduce((s, p) => s + p.x, 0) / hull.length;
  const cy = hull.reduce((s, p) => s + p.y, 0) / hull.length;
  return hull.map((p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return {
      x: p.x + dx / len * pad,
      y: p.y + dy / len * pad
    };
  });
}
function circlePolygon(cx, cy, r, steps) {
  const pts = [];
  for (let i = 0; i < steps; i++) {
    const a = 2 * Math.PI * i / steps;
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  return pts;
}
function estimateClusterRadius(pts, cx, cy) {
  let maxD = 0;
  for (const p of pts) {
    const d = Math.hypot(p.x - cx, p.y - cy);
    if (d > maxD) maxD = d;
  }
  return maxD;
}
function cross(o, a, b) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}
function deterministicAngle(seed) {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % 3600 * (2 * Math.PI / 3600);
}
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
function createGroupId() {
  return "gmg-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
}

// src/queryMatcher.ts
var import_obsidian = require("obsidian");
function createObsidianMetadataProvider(app) {
  return {
    getTagsForNode(nodeId, nodeType) {
      if (nodeType === "tag" || nodeId.startsWith("#")) {
        return [nodeId.startsWith("#") ? nodeId.toLowerCase() : `#${nodeId.toLowerCase()}`];
      }
      const abstractFile = app.vault.getAbstractFileByPath(nodeId);
      if (abstractFile && abstractFile instanceof import_obsidian.TFile) {
        const cache = app.metadataCache.getFileCache(abstractFile);
        if (!cache) return [];
        const raw = (0, import_obsidian.getAllTags)(cache) || [];
        return raw.map((t2) => t2.startsWith("#") ? t2.toLowerCase() : `#${t2.toLowerCase()}`);
      }
      return [];
    },
    getFrontmatterForNode(nodeId) {
      const abstractFile = app.vault.getAbstractFileByPath(nodeId);
      if (abstractFile && abstractFile instanceof import_obsidian.TFile) {
        return app.metadataCache.getFileCache(abstractFile)?.frontmatter;
      }
      return void 0;
    }
  };
}
function tokenizeQuery(query) {
  const tokens = [];
  let i = 0;
  const n = query.length;
  while (i < n) {
    while (i < n && /\s/.test(query[i])) i++;
    if (i >= n) break;
    let token = "";
    let inQuotes = false;
    let bracketDepth = 0;
    while (i < n) {
      const ch = query[i];
      if (ch === '"' && bracketDepth === 0) {
        inQuotes = !inQuotes;
        i++;
        continue;
      }
      if (!inQuotes) {
        if (ch === "[") bracketDepth++;
        else if (ch === "]" && bracketDepth > 0) bracketDepth--;
        else if (/\s/.test(ch) && bracketDepth === 0) break;
      }
      token += ch;
      i++;
    }
    if (token.length > 0) {
      tokens.push(token);
    }
  }
  return tokens;
}
function getBasename(nodeId) {
  const slashIdx = nodeId.lastIndexOf("/");
  const filePart = slashIdx >= 0 ? nodeId.slice(slashIdx + 1) : nodeId;
  return filePart.endsWith(".md") ? filePart.slice(0, -3) : filePart;
}
function matchesSingleAtom(atom, nodeId, nodeType, meta) {
  let negated = false;
  let expr = atom.trim();
  if (expr.startsWith("-") && expr.length > 1) {
    negated = true;
    expr = expr.slice(1).trim();
  }
  const result = evaluatePositiveAtom(expr, nodeId, nodeType, meta);
  return negated ? !result : result;
}
function evaluatePositiveAtom(expr, nodeId, nodeType, meta) {
  if (!expr) return false;
  const lowerExpr = expr.toLowerCase();
  const lowerId = nodeId.toLowerCase();
  const basename = getBasename(nodeId).toLowerCase();
  if (expr.startsWith("[") && expr.endsWith("]")) {
    const inner = expr.slice(1, -1).trim();
    const fm = meta.getFrontmatterForNode(nodeId);
    if (!fm) return false;
    const colonIdx = inner.indexOf(":");
    if (colonIdx < 0) {
      const key2 = inner.trim().toLowerCase();
      return Object.keys(fm).some((k) => k.toLowerCase() === key2 && fm[k] != null && fm[k] !== "");
    }
    const key = inner.slice(0, colonIdx).trim().toLowerCase();
    const val = inner.slice(colonIdx + 1).trim().replace(/^["']|["']$/g, "").toLowerCase();
    for (const [k, rawVal] of Object.entries(fm)) {
      if (k.toLowerCase() !== key) continue;
      if (Array.isArray(rawVal)) {
        return rawVal.some((item) => String(item).toLowerCase().includes(val));
      }
      if (rawVal != null) {
        return String(rawVal).toLowerCase().includes(val);
      }
    }
    return false;
  }
  if (lowerExpr.startsWith("tag:") || lowerExpr.startsWith("#")) {
    const rawTag = lowerExpr.startsWith("tag:") ? lowerExpr.slice(4).trim() : lowerExpr;
    const targetTag = rawTag.startsWith("#") ? rawTag : `#${rawTag}`;
    const tags2 = meta.getTagsForNode(nodeId, nodeType);
    return tags2.some((t2) => t2 === targetTag || t2.startsWith(`${targetTag}/`));
  }
  if (lowerExpr.startsWith("path:")) {
    const pathNeedle = lowerExpr.slice(5).trim().replace(/^\/+/, "");
    if (!pathNeedle) return false;
    return lowerId.includes(pathNeedle);
  }
  if (lowerExpr.startsWith("file:")) {
    const fileNeedle = lowerExpr.slice(5).trim();
    if (!fileNeedle) return false;
    return basename.includes(fileNeedle) || lowerId.endsWith(`/${fileNeedle}.md`);
  }
  if (basename.includes(lowerExpr) || lowerId.includes(lowerExpr)) {
    return true;
  }
  const tags = meta.getTagsForNode(nodeId, nodeType);
  return tags.some((t2) => t2.includes(lowerExpr));
}
function matchesGroupQuery(query, nodeId, nodeType, meta) {
  const trimmed = query.trim();
  if (!trimmed) return false;
  const tokens = tokenizeQuery(trimmed);
  if (tokens.length === 0) return false;
  const orBranches = [[]];
  for (const tok of tokens) {
    if (tok.toUpperCase() === "OR") {
      if (orBranches[orBranches.length - 1].length > 0) {
        orBranches.push([]);
      }
    } else {
      orBranches[orBranches.length - 1].push(tok);
    }
  }
  for (const andClause of orBranches) {
    if (andClause.length === 0) continue;
    const allMatch = andClause.every(
      (atom) => matchesSingleAtom(atom, nodeId, nodeType, meta)
    );
    if (allMatch) return true;
  }
  return false;
}
function buildMetadataResolver(app) {
  const provider = createObsidianMetadataProvider(app);
  return (nodeId, nodeType) => ({
    id: nodeId,
    basename: getBasename(nodeId),
    path: nodeId,
    tags: provider.getTagsForNode(nodeId, nodeType),
    frontmatter: provider.getFrontmatterForNode(nodeId) || {},
    isTagNode: nodeType === "tag" || nodeId.startsWith("#")
  });
}
function parseGroupQuery(query) {
  return {
    matches(meta) {
      const adapter = {
        getTagsForNode: () => meta.tags.map(
          (t2) => t2.startsWith("#") ? t2.toLowerCase() : `#${t2.toLowerCase()}`
        ),
        getFrontmatterForNode: () => {
          if (meta.frontmatter instanceof Map) {
            const obj = {};
            for (const [k, v] of meta.frontmatter.entries()) {
              obj[k] = v;
            }
            return obj;
          }
          return meta.frontmatter;
        }
      };
      return matchesGroupQuery(
        query,
        meta.id,
        meta.isTagNode ? "tag" : "file",
        adapter
      );
    }
  };
}

// src/types.ts
var DEFAULT_GROUP_COLORS = [
  "#7c5cff",
  "#ff6b6b",
  "#2ec4b6",
  "#ffbe0b",
  "#3a86ff",
  "#ff70a6",
  "#06d6a0",
  "#fb8500"
];
function generateRandomToken() {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let out = "obs_";
  for (let i = 0; i < 24; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}
var DEFAULT_SETTINGS = {
  enabled: true,
  enableLocalGraph: true,
  syncNativeColorGroups: true,
  attractionStrength: 0.62,
  clusterTether: 0.78,
  groupCompactness: 0.58,
  showGroupZones: true,
  showGroupLabels: true,
  showTetherLines: true,
  showBoardGrid: false,
  repelOutsidersFromFrames: true,
  zoneOpacity: 0.13,
  shiftDragLasso: true,
  sectionCollapsed: false,
  language: "ru",
  groups: [],
  pinnedNodes: {},
  mcpEnabled: true,
  mcpPort: 27125,
  mcpHost: "127.0.0.1",
  mcpUseAuthToken: true,
  mcpAuthToken: "",
  mcpAutoStartTunnel: false,
  mcpCloudflaredPath: ""
};

// src/ui/controlsPanel.ts
var import_obsidian2 = require("obsidian");
var GraphControlsSection = class {
  constructor(graphControlsEl, canvasParentEl, cb) {
    this.groupListEl = null;
    this.pinnedRowEl = null;
    this.lassoToolBtn = null;
    this.gridToolBtn = null;
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
  render() {
    const settings = this.cb.getSettings();
    const strings = t(settings.language);
    this.floatingBarEl.empty();
    const powerBtn = this.floatingBarEl.createEl("button", {
      cls: "gmg-tool-btn" + (settings.enabled ? " is-active" : ""),
      attr: { title: strings.enableMagnetic }
    });
    const powerIcon = powerBtn.createSpan();
    (0, import_obsidian2.setIcon)(powerIcon, "magnet");
    powerBtn.createSpan({ text: strings.pluginTitle });
    powerBtn.addEventListener("click", () => {
      this.cb.onUpdateSettings({ enabled: !settings.enabled }, true);
      this.render();
    });
    this.lassoToolBtn = this.floatingBarEl.createEl("button", {
      cls: "gmg-tool-btn" + (this.cb.isLassoActive() ? " is-active" : ""),
      attr: { title: strings.lassoBtn }
    });
    const lassoIcon = this.lassoToolBtn.createSpan();
    (0, import_obsidian2.setIcon)(lassoIcon, "lasso");
    this.lassoToolBtn.createSpan({
      text: settings.language === "ru" ? "\u041B\u0430\u0441\u0441\u043E" : "Lasso"
    });
    this.lassoToolBtn.addEventListener("click", () => {
      this.cb.onToggleLasso();
      this.syncLassoState();
    });
    const addGroupQuickBtn = this.floatingBarEl.createEl("button", {
      cls: "gmg-tool-btn",
      attr: { title: strings.addGroupBtn }
    });
    const plusIcon = addGroupQuickBtn.createSpan();
    (0, import_obsidian2.setIcon)(plusIcon, "plus");
    addGroupQuickBtn.createSpan({ text: strings.addGroupBtn });
    addGroupQuickBtn.addEventListener(
      "click",
      () => this.cb.onCreateGroup("organic")
    );
    const addMiroQuickBtn = this.floatingBarEl.createEl("button", {
      cls: "gmg-tool-btn",
      attr: { title: strings.addMiroFrameBtn }
    });
    const frameIcon = addMiroQuickBtn.createSpan();
    (0, import_obsidian2.setIcon)(frameIcon, "layout-grid");
    addMiroQuickBtn.createSpan({ text: strings.addMiroFrameBtn });
    addMiroQuickBtn.addEventListener(
      "click",
      () => this.cb.onCreateGroup("miro-pinned")
    );
    this.gridToolBtn = this.floatingBarEl.createEl("button", {
      cls: "gmg-tool-btn" + (settings.showBoardGrid ? " is-active" : ""),
      attr: { title: strings.boardGridBtn }
    });
    const gridIcon = this.gridToolBtn.createSpan();
    (0, import_obsidian2.setIcon)(gridIcon, "grid");
    this.gridToolBtn.addEventListener("click", () => {
      this.cb.onUpdateSettings(
        { showBoardGrid: !this.cb.getSettings().showBoardGrid },
        false
      );
      this.render();
    });
    const reheatQuickBtn = this.floatingBarEl.createEl("button", {
      cls: "gmg-tool-btn",
      attr: { title: strings.reheatBtn }
    });
    const refreshIcon = reheatQuickBtn.createSpan();
    (0, import_obsidian2.setIcon)(refreshIcon, "refresh-cw");
    reheatQuickBtn.addEventListener("click", () => this.cb.onReheat());
    this.rootEl.empty();
    this.rootEl.toggleClass("is-collapsed", settings.sectionCollapsed);
    const header = this.rootEl.createDiv({ cls: "gmg-section-header" });
    const titleWrap = header.createDiv({ cls: "gmg-section-title" });
    const chev = titleWrap.createSpan();
    (0, import_obsidian2.setIcon)(chev, settings.sectionCollapsed ? "chevron-right" : "chevron-down");
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
    this.buildToggleRow(
      body,
      strings.showZonesLabel,
      settings.showGroupZones,
      (v) => this.cb.onUpdateSettings({ showGroupZones: v }, false)
    );
    this.buildToggleRow(
      body,
      strings.showLabelsLabel,
      settings.showGroupLabels,
      (v) => this.cb.onUpdateSettings({ showGroupLabels: v }, false)
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
      text: strings.addGroupBtn
    });
    createBtn.addEventListener("click", () => this.cb.onCreateGroup("organic"));
    const createMiroBtn = actions.createEl("button", {
      text: strings.addMiroFrameBtn
    });
    createMiroBtn.addEventListener(
      "click",
      () => this.cb.onCreateGroup("miro-pinned")
    );
    this.pinnedRowEl = body.createDiv();
    this.groupListEl = body.createDiv({ cls: "gmg-group-list" });
    this.refreshGroupList();
  }
  syncLassoState() {
    if (this.lassoToolBtn) {
      this.lassoToolBtn.toggleClass("is-active", this.cb.isLassoActive());
    }
  }
  refreshGroupList() {
    const settings = this.cb.getSettings();
    const strings = t(settings.language);
    if (this.pinnedRowEl) {
      this.pinnedRowEl.empty();
      const pinCount = Object.keys(settings.pinnedNodes || {}).length;
      if (pinCount > 0) {
        const pinBar = this.pinnedRowEl.createDiv({ cls: "gmg-group-item" });
        pinBar.createSpan({ text: "\u{1F4CD} " + strings.pinnedNodesSummary(pinCount) });
        const spacer = pinBar.createSpan();
        spacer.style.flex = "1";
        const unpinBtn = pinBar.createEl("button", {
          cls: "gmg-mini-tag",
          text: strings.unpinAllBtn
        });
        unpinBtn.addEventListener(
          "click",
          () => this.cb.onUnpinAllIndividualNodes()
        );
      }
    }
    if (!this.groupListEl) return;
    this.groupListEl.empty();
    const counts = this.cb.getGroupNodeCounts();
    if (settings.groups.length === 0) {
      this.groupListEl.createDiv({
        cls: "gmg-empty-hint",
        text: strings.emptyGroupsHint
      });
      return;
    }
    for (const grp of settings.groups) {
      const mode = grp.mode || "organic";
      const item = this.groupListEl.createDiv({
        cls: "gmg-group-item" + (grp.enabled ? "" : " is-disabled")
      });
      const swatch = item.createDiv({ cls: "gmg-color-swatch" });
      swatch.style.backgroundColor = grp.color;
      swatch.addEventListener("click", () => this.cb.onToggleGroup(grp.id));
      const info = item.createDiv({ cls: "gmg-group-info" });
      info.addEventListener("click", () => this.cb.onEditGroup(grp));
      const nameLine = info.createDiv({ cls: "gmg-group-name-line" });
      nameLine.createSpan({ text: grp.name });
      const modeTag = nameLine.createSpan({
        cls: "gmg-mini-tag",
        text: strings.modeShort(mode),
        attr: { title: strings.modeDesc(mode) }
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
        text: summaryParts.join(" \xB7 ")
      });
      if (mode === "organic" && grp.anchorMode === "manual") {
        const unpinBtn = item.createEl("button", {
          cls: "gmg-icon-btn",
          attr: { title: strings.resetAnchor }
        });
        (0, import_obsidian2.setIcon)(unpinBtn, "rotate-ccw");
        unpinBtn.addEventListener("click", (evt) => {
          evt.stopPropagation();
          this.cb.onResetGroupAnchor(grp.id);
        });
      }
      const editBtn = item.createEl("button", {
        cls: "gmg-icon-btn",
        attr: { title: strings.editGroup }
      });
      (0, import_obsidian2.setIcon)(editBtn, "sliders-horizontal");
      editBtn.addEventListener("click", (evt) => {
        evt.stopPropagation();
        this.cb.onEditGroup(grp);
      });
      const delBtn = item.createEl("button", {
        cls: "gmg-icon-btn",
        attr: { title: strings.deleteGroup }
      });
      (0, import_obsidian2.setIcon)(delBtn, "trash-2");
      delBtn.addEventListener("click", (evt) => {
        evt.stopPropagation();
        this.cb.onDeleteGroup(grp.id);
      });
    }
  }
  buildToggleRow(parent, label, value, onChange) {
    const row = parent.createDiv({ cls: "gmg-row" });
    row.createSpan({ text: label });
    const cb = row.createEl("input", { type: "checkbox" });
    cb.checked = value;
    cb.addEventListener("change", () => onChange(cb.checked));
  }
  buildSliderRow(parent, label, tooltip, value, min, max, step, format, onChange) {
    const block = parent.createDiv({
      cls: "gmg-slider-block",
      attr: { title: tooltip }
    });
    const top = block.createDiv({ cls: "gmg-slider-top" });
    top.createSpan({ text: label });
    const valSpan = top.createSpan({
      cls: "gmg-slider-val",
      text: format(value)
    });
    const slider = block.createEl("input", {
      type: "range",
      attr: {
        min: String(min),
        max: String(max),
        step: String(step)
      }
    });
    slider.value = String(value);
    slider.addEventListener("input", () => {
      const num = parseFloat(slider.value);
      valSpan.setText(format(num));
      onChange(num);
    });
  }
  destroy() {
    this.rootEl.remove();
    this.floatingBarEl.remove();
  }
};

// src/ui/groupModal.ts
var import_obsidian3 = require("obsidian");
var GroupEditorModal = class extends import_obsidian3.Modal {
  constructor(app, opts) {
    super(app);
    this.searchFilter = "";
    this.listContainerEl = null;
    this.countEl = null;
    this.subLayoutRowEl = null;
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
        excludedNodeIds: [...opts.existing.excludedNodeIds || []],
        customOffsets: opts.existing.customOffsets ? { ...opts.existing.customOffsets } : void 0
      };
    } else {
      const idx = (opts.defaultColorIndex ?? 0) + 1;
      this.draft = {
        id: createGroupId(),
        name: initMode === "organic" ? strings.defaultNewGroupName(idx) : strings.defaultNewFrameName(idx),
        color: DEFAULT_GROUP_COLORS[colorIdx],
        enabled: true,
        query: "",
        nodeIds: [...opts.initialNodeIds || []],
        excludedNodeIds: [],
        strength: 1,
        colorNodes: true,
        mode: initMode,
        anchorMode: "auto",
        frameSubLayout: "grid"
      };
    }
    this.selectedSet = new Set(this.draft.nodeIds);
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    const strings = t(this.lang);
    contentEl.createEl("h3", {
      text: this.isNew ? strings.modalCreateTitle : strings.modalEditTitle
    });
    new import_obsidian3.Setting(contentEl).setName(strings.groupNameLabel).addText((txt) => {
      txt.setPlaceholder(strings.groupNamePlaceholder).setValue(this.draft.name).onChange((v) => {
        this.draft.name = v.trim() || this.draft.name;
      });
      setTimeout(() => txt.inputEl.focus(), 30);
    });
    new import_obsidian3.Setting(contentEl).setName(strings.groupModeLabel).setDesc(strings.modeDesc(this.draft.mode)).addDropdown((dd) => {
      dd.addOption("organic", strings.modeShort("organic"));
      dd.addOption("miro-pinned", strings.modeShort("miro-pinned"));
      dd.addOption("miro-free", strings.modeShort("miro-free"));
      dd.setValue(this.draft.mode);
      dd.onChange((val) => {
        this.draft.mode = val;
        this.updateSubLayoutVisibility();
      });
    });
    const subLayoutSetting = new import_obsidian3.Setting(contentEl).setName(strings.groupSubLayoutLabel).addDropdown((dd) => {
      const layouts = ["grid", "column", "row", "circle", "freeform"];
      for (const l of layouts) {
        dd.addOption(l, strings.subLayoutName(l));
      }
      dd.setValue(this.draft.frameSubLayout || "grid");
      dd.onChange((val) => {
        this.draft.frameSubLayout = val;
      });
    });
    this.subLayoutRowEl = subLayoutSetting.settingEl;
    this.updateSubLayoutVisibility();
    const colorSetting = new import_obsidian3.Setting(contentEl).setName(strings.groupColorLabel);
    const presetsWrap = colorSetting.controlEl.createDiv({ cls: "gmg-color-presets" });
    let setPickerValue = null;
    const presetEls = [];
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
    new import_obsidian3.Setting(contentEl).setName(strings.groupQueryLabel).setDesc(strings.groupQueryDesc).addText((txt) => {
      txt.setPlaceholder(strings.groupQueryPlaceholder).setValue(this.draft.query).onChange((v) => {
        this.draft.query = v;
      });
      txt.inputEl.style.width = "240px";
    });
    new import_obsidian3.Setting(contentEl).setName(strings.groupStrengthLabel + ` (${Math.round(this.draft.strength * 100)}%)`).addSlider((sl) => {
      sl.setLimits(0.2, 2, 0.05).setValue(this.draft.strength).setDynamicTooltip().onChange((v) => {
        this.draft.strength = v;
      });
    });
    new import_obsidian3.Setting(contentEl).setName(strings.groupColorNodesLabel).addToggle((tg) => {
      tg.setValue(this.draft.colorNodes).onChange((v) => {
        this.draft.colorNodes = v;
      });
    });
    const manualHeader = contentEl.createDiv({ cls: "gmg-row" });
    manualHeader.style.marginTop = "10px";
    manualHeader.createEl("strong", { text: strings.manualNodesHeader });
    this.countEl = manualHeader.createSpan({
      cls: "gmg-slider-val",
      text: strings.selectedCount(this.selectedSet.size)
    });
    const searchRow = contentEl.createDiv({ cls: "gmg-row" });
    searchRow.style.marginTop = "6px";
    const searchInput = searchRow.createEl("input", {
      type: "search",
      placeholder: strings.manualNodesSearchPlaceholder
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
    const footer = new import_obsidian3.Setting(contentEl);
    footer.addButton(
      (btn) => btn.setButtonText(strings.cancelBtn).onClick(() => {
        this.close();
      })
    );
    footer.addButton(
      (btn) => btn.setButtonText(strings.saveBtn).setCta().onClick(() => {
        this.draft.nodeIds = Array.from(this.selectedSet);
        this.onSave(this.draft);
        this.close();
      })
    );
  }
  updateSubLayoutVisibility() {
    if (!this.subLayoutRowEl) return;
    this.subLayoutRowEl.style.display = this.draft.mode === "miro-pinned" ? "" : "none";
  }
  updateCountText() {
    if (this.countEl) {
      this.countEl.setText(t(this.lang).selectedCount(this.selectedSet.size));
    }
  }
  renderCandidateList() {
    if (!this.listContainerEl) return;
    this.listContainerEl.empty();
    const filtered = this.candidates.filter((c) => {
      if (!this.searchFilter) return true;
      return c.label.toLowerCase().includes(this.searchFilter) || c.id.toLowerCase().includes(this.searchFilter);
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
          cls: "gmg-group-sub"
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
  onClose() {
    this.contentEl.empty();
  }
};

// src/graphController.ts
var GraphViewController = class {
  constructor(view, host) {
    this.overlayCanvas = null;
    this.badgeLayerEl = null;
    this.lassoBannerEl = null;
    this.controlsSection = null;
    this.origRenderCallback = null;
    this.origSetData = null;
    this.origOnNodeRightClick = null;
    this.origWorkerPostMessage = null;
    this.badgeMap = /* @__PURE__ */ new Map();
    this.hoveredGroupId = null;
    this.draggingGroupId = null;
    this.resizingGroupId = null;
    this.cachedSpecs = [];
    this.groupCounts = /* @__PURE__ */ new Map();
    this.membershipDirty = true;
    this.lastNativeGroupSig = "";
    this.lastKnownNodeCount = 0;
    this.boostFramesRemaining = 90;
    this.lastZones = [];
    /** Tracks exact worker forceNode pins currently enforced by our plugin */
    this.enforcedPins = /* @__PURE__ */ new Map();
    this.lastDraggedPos = /* @__PURE__ */ new Map();
    // Lasso state
    this.lassoArmed = false;
    this.lassoDrawing = false;
    this.lassoPointsCss = [];
    this.cleanupFns = [];
    this.destroyed = false;
    this.view = view;
    this.host = host;
    this.attach();
  }
  get renderer() {
    return this.view?.renderer;
  }
  get engine() {
    return this.view?.dataEngine || this.view?.engine;
  }
  rawPostToWorker(msg) {
    if (this.origWorkerPostMessage) {
      this.origWorkerPostMessage(msg);
    } else {
      this.renderer?.worker?.postMessage(msg);
    }
  }
  attach() {
    const renderer = this.renderer;
    if (!renderer || !renderer.interactiveEl) return;
    const canvasParent = renderer.interactiveEl.parentElement || renderer.containerEl;
    if (!canvasParent) return;
    const pos = getComputedStyle(canvasParent).position;
    if (pos === "static") {
      canvasParent.style.position = "relative";
    }
    this.overlayCanvas = document.createElement("canvas");
    this.overlayCanvas.className = "gmg-overlay-canvas";
    canvasParent.insertBefore(
      this.overlayCanvas,
      renderer.interactiveEl.nextSibling
    );
    this.badgeLayerEl = document.createElement("div");
    this.badgeLayerEl.className = "gmg-badge-layer";
    canvasParent.appendChild(this.badgeLayerEl);
    const graphControlsEl = this.engine?.controlsEl || this.view.contentEl.querySelector(".graph-controls");
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
        onCreateGroup: (initialMode) => this.openGroupModal(void 0, void 0, initialMode),
        onEditGroup: (grp) => this.openGroupModal(grp),
        onToggleGroup: (id) => void this.toggleGroup(id),
        onCycleGroupMode: (id) => void this.cycleGroupMode(id),
        onResetGroupAnchor: (id) => void this.resetGroupAnchor(id),
        onDeleteGroup: (id) => void this.deleteGroup(id),
        onUnpinAllIndividualNodes: () => void this.unpinAllIndividualNodes(),
        onToggleLasso: () => this.setLassoArmed(!this.lassoArmed),
        onReheat: () => this.reheatSimulation(120)
      }
    );
    this.wrapWorker(renderer);
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
      renderer.setData = (data) => {
        if (this.origSetData) {
          this.origSetData(data);
        }
        this.enforcedPins.clear();
        this.markDirtyAndReheat(85);
      };
    }
    if (typeof renderer.onNodeRightClick === "function") {
      this.origOnNodeRightClick = renderer.onNodeRightClick.bind(renderer);
      renderer.onNodeRightClick = (evt, id, type) => {
        if (this.origOnNodeRightClick) {
          this.origOnNodeRightClick(evt, id, type);
        }
        setTimeout(() => this.showNodeQuickMenu(evt, id), 20);
      };
    } else {
      const onCtx = (evt) => {
        const hit = this.findNodeAtCssPoint(evt);
        if (hit && (evt.shiftKey || evt.altKey)) {
          evt.preventDefault();
          evt.stopPropagation();
          this.showNodeQuickMenu(evt, hit.id);
        }
      };
      renderer.interactiveEl.addEventListener("contextmenu", onCtx);
      this.cleanupFns.push(
        () => renderer.interactiveEl.removeEventListener("contextmenu", onCtx)
      );
    }
    this.setupLassoEvents(renderer.interactiveEl, canvasParent);
    this.markDirtyAndReheat(100);
  }
  wrapWorker(renderer) {
    if (!renderer.worker || typeof renderer.worker.postMessage !== "function") {
      return;
    }
    const rawPost = renderer.worker.postMessage.bind(renderer.worker);
    this.origWorkerPostMessage = rawPost;
    renderer.worker.postMessage = (msg) => {
      if (!this.destroyed && msg && typeof msg === "object" && "forceNode" in msg) {
        const fn = msg.forceNode;
        if (fn && typeof fn.id === "string") {
          if (typeof fn.x === "number" && typeof fn.y === "number") {
            this.lastDraggedPos.set(fn.id, { x: fn.x, y: fn.y });
            rawPost(msg);
            return;
          }
          if (fn.x === null && fn.y === null) {
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
  handlePinnedNodeDragRelease(nodeId) {
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
          const nextOffsets = {
            ...grp.customOffsets || {}
          };
          for (const memberId of spec.memberIds) {
            const existingPin = this.enforcedPins.get(memberId);
            const mNode = this.findRendererNode(memberId);
            const mx = existingPin?.x ?? mNode?.x ?? rect.x + rect.w / 2;
            const my = existingPin?.y ?? mNode?.y ?? rect.y + rect.h / 2;
            nextOffsets[memberId] = {
              dx: mx - rect.x,
              dy: my - rect.y
            };
          }
          nextOffsets[nodeId] = {
            dx: clampedX - rect.x,
            dy: clampedY - rect.y
          };
          const updatedGroups = settings.groups.map(
            (g) => g.id === grp.id ? {
              ...g,
              frameX: rect.x,
              frameY: rect.y,
              frameW: rect.w,
              frameH: rect.h,
              frameSubLayout: "freeform",
              customOffsets: nextOffsets
            } : g
          );
          if (nodeObj) {
            nodeObj.x = clampedX;
            nodeObj.y = clampedY;
            nodeObj.fx = clampedX;
            nodeObj.fy = clampedY;
          }
          this.enforcedPins.set(nodeId, { x: clampedX, y: clampedY });
          this.rawPostToWorker({
            forceNode: { id: nodeId, x: clampedX, y: clampedY }
          });
          this.membershipDirty = true;
          void this.host.saveGroups(updatedGroups, false);
          this.reheatSimulation(45);
          return true;
        }
      }
    }
    if (settings.pinnedNodes && settings.pinnedNodes[nodeId]) {
      const nextPins = {
        ...settings.pinnedNodes,
        [nodeId]: { x: Math.round(finalX * 10) / 10, y: Math.round(finalY * 10) / 10 }
      };
      if (nodeObj) {
        nodeObj.x = finalX;
        nodeObj.y = finalY;
        nodeObj.fx = finalX;
        nodeObj.fy = finalY;
      }
      this.enforcedPins.set(nodeId, { x: finalX, y: finalY });
      this.rawPostToWorker({
        forceNode: { id: nodeId, x: finalX, y: finalY }
      });
      void this.host.updateSettings({ pinnedNodes: nextPins }, false);
      this.reheatSimulation(45);
      return true;
    }
    return false;
  }
  findRendererNode(id) {
    const r = this.renderer;
    if (!r) return void 0;
    if (r.nodeLookup && r.nodeLookup[id]) return r.nodeLookup[id];
    return r.nodes?.find((n) => n.id === id);
  }
  markDirtyAndReheat(boostFrames = 90) {
    this.membershipDirty = true;
    this.reheatSimulation(boostFrames);
    this.controlsSection?.render();
  }
  reheatSimulation(boostFrames = 90) {
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
    }
    renderer.changed();
  }
  /**
   * Main per-frame hook invoked right after Obsidian renders the WebGL/Pixi graph.
   */
  onFrame() {
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
    const nativeSig = settings.syncNativeColorGroups ? this.readNativeGroupsSignature() : "";
    if (this.membershipDirty || nodes.length !== this.lastKnownNodeCount || nativeSig !== this.lastNativeGroupSig) {
      this.rebuildEffectiveGroups(nodes, settings);
      this.lastKnownNodeCount = nodes.length;
      this.lastNativeGroupSig = nativeSig;
      this.membershipDirty = false;
      this.controlsSection?.refreshGroupList();
    }
    this.applyNodeColors(nodes, settings);
    const draggedId = renderer.dragNode?.id || null;
    const simNodes = nodes.map((n) => ({
      id: n.id,
      x: Number.isFinite(n.x) ? n.x : 0,
      y: Number.isFinite(n.y) ? n.y : 0,
      pinned: n.id === draggedId
    }));
    const simEdges = (renderer.links || []).filter((l) => l.source && l.target).map((l) => ({
      source: l.source.id,
      target: l.target.id
    }));
    const linkDist = this.readNativeLinkDistance();
    const step = computeMagneticStep(
      simNodes,
      simEdges,
      this.cachedSpecs,
      {
        attractionStrength: settings.attractionStrength,
        clusterTether: settings.clusterTether,
        groupCompactness: settings.groupCompactness,
        nativeLinkDistance: linkDist,
        repelOutsidersFromFrames: settings.repelOutsidersFromFrames,
        pinnedNodes: settings.pinnedNodes
      }
    );
    this.lastZones = step.zones;
    this.syncWorkerHardPins(nodes, step.hardPinnedTargets, draggedId);
    const simIsActive = (renderer.idleFrames ?? 0) < 55 || this.boostFramesRemaining > 0 || this.draggingGroupId !== null || this.resizingGroupId !== null || draggedId !== null;
    if (simIsActive && step.displacements.size > 0 && nodes.length > 0) {
      const damping = this.boostFramesRemaining > 0 || this.draggingGroupId !== null || this.resizingGroupId !== null ? 1 : Math.max(0.2, 1 - (renderer.idleFrames ?? 0) / 60);
      const workerNodesPayload = {};
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
        }
        if (this.boostFramesRemaining > 0 || this.draggingGroupId !== null || this.resizingGroupId !== null) {
          renderer.idleFrames = 0;
          renderer.changed();
        }
      }
    }
    if (this.boostFramesRemaining > 0) {
      this.boostFramesRemaining--;
    }
    this.drawOverlay(step.zones, nodes, settings);
    if (settings.showGroupLabels) {
      this.syncBadges(step.zones);
    } else {
      this.syncBadges([]);
    }
  }
  syncWorkerHardPins(nodes, hardPinnedTargets, draggedId) {
    const nodeById = /* @__PURE__ */ new Map();
    for (const n of nodes) nodeById.set(n.id, n);
    let changedAny = false;
    for (const prevId of Array.from(this.enforcedPins.keys())) {
      if (!hardPinnedTargets.has(prevId)) {
        const n = nodeById.get(prevId);
        if (n) {
          n.fx = null;
          n.fy = null;
        }
        try {
          this.rawPostToWorker({
            forceNode: { id: prevId, x: null, y: null }
          });
        } catch {
        }
        this.enforcedPins.delete(prevId);
        changedAny = true;
      }
    }
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
      if (!prev || Math.hypot(prev.x - target.x, prev.y - target.y) > 0.2 || driftFromTarget > 0.5) {
        try {
          this.rawPostToWorker({
            forceNode: { id, x: target.x, y: target.y }
          });
        } catch {
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
  releaseAllEnforcedPins() {
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
      }
    }
    this.enforcedPins.clear();
    if (renderer) {
      renderer.idleFrames = 0;
      renderer.changed();
    }
  }
  rebuildEffectiveGroups(nodes, settings) {
    const resolver = buildMetadataResolver(this.host.app);
    const specs = [];
    this.groupCounts.clear();
    for (const grp of settings.groups) {
      const compiled = grp.query.trim() ? parseGroupQuery(grp.query) : null;
      const manualSet = new Set(grp.nodeIds || []);
      const excludedSet = new Set(grp.excludedNodeIds || []);
      const matched = /* @__PURE__ */ new Set();
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
          isNative: false
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
        const matched = /* @__PURE__ */ new Set();
        for (const n of nodes) {
          if (compiled.matches(resolver(n.id, n.type || ""))) {
            matched.add(n.id);
          }
        }
        if (matched.size >= 2) {
          const hex = rgbIntToHex(ng.color?.rgb ?? 8150271);
          specs.push({
            id: `native-${idx}-${q}`,
            name: q.length > 22 ? q.slice(0, 20) + "\u2026" : q,
            color: hex,
            memberIds: matched,
            strength: 0.85,
            mode: "organic",
            anchorMode: "auto",
            isNative: true
          });
        }
      });
    }
    this.cachedSpecs = specs;
  }
  applyNodeColors(nodes, settings) {
    const colorByNode = /* @__PURE__ */ new Map();
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
  restoreNodeColors(nodes) {
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
  getTransformParams() {
    const r = this.renderer;
    const win = r.interactiveEl?.win || window;
    const dpr = r.px?.renderer?.resolution || win.devicePixelRatio || 1;
    const wt = r.hanger?.worldTransform;
    if (wt && Number.isFinite(wt.a) && wt.a !== 0) {
      return {
        scaleX: wt.a / dpr,
        scaleY: wt.d / dpr,
        tx: wt.tx / dpr,
        ty: wt.ty / dpr
      };
    }
    return {
      scaleX: (r.scale || 1) / dpr,
      scaleY: (r.scale || 1) / dpr,
      tx: (r.panX || 0) / dpr,
      ty: (r.panY || 0) / dpr
    };
  }
  worldToCss(wx, wy) {
    const { scaleX, scaleY, tx, ty } = this.getTransformParams();
    return {
      x: wx * scaleX + tx,
      y: wy * scaleY + ty
    };
  }
  cssToWorld(cx, cy) {
    const { scaleX, scaleY, tx, ty } = this.getTransformParams();
    return {
      x: (cx - tx) / (scaleX || 1),
      y: (cy - ty) / (scaleY || 1)
    };
  }
  /* =========================================================================
   * Canvas Overlay Rendering (Miro Grid + Miro Frames + Hulls + Pins + Lasso)
   * ========================================================================= */
  clearOverlay() {
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
  drawOverlay(zones, nodes, settings) {
    const canvas = this.overlayCanvas;
    const renderer = this.renderer;
    if (!canvas || !renderer) return;
    const win = renderer.interactiveEl?.win || window;
    const dpr = win.devicePixelRatio || 1;
    const cssW = renderer.interactiveEl.clientWidth || canvas.parentElement?.clientWidth || 0;
    const cssH = renderer.interactiveEl.clientHeight || canvas.parentElement?.clientHeight || 0;
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
    if (settings.showBoardGrid) {
      this.drawMiroBoardGrid(ctx, cssW, cssH);
    }
    if (settings.showGroupZones) {
      for (const z of zones) {
        const isHighlighted = this.hoveredGroupId === z.id || this.draggingGroupId === z.id || this.resizingGroupId === z.id;
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
        if (settings.showTetherLines && z.hasBridge && (isHighlighted || z.mode === "organic" && z.anchorMode === "manual")) {
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
        ctx.beginPath();
        ctx.arc(pt.x + r * 0.68, pt.y - r * 0.68, 3, 0, Math.PI * 2);
        ctx.fillStyle = "#ffbe0b";
        ctx.fill();
      }
    }
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
  drawMiroBoardGrid(ctx, cssW, cssH) {
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
  drawMiroFrame(ctx, z, isHighlighted, zoneOpacity) {
    const rect = z.frameRect;
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
    ctx.save();
    drawRoundedRect(ctx, x, y, w, h, radius);
    ctx.clip();
    ctx.fillStyle = hexToRgba(z.color, isHardPinned ? 0.24 : 0.15);
    ctx.fillRect(x, y, w, headerH);
    if (isHardPinned && w > 120 && h > 90) {
      ctx.strokeStyle = hexToRgba(z.color, 0.14);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y + headerH);
      ctx.lineTo(x + w, y + headerH);
      ctx.stroke();
    }
    ctx.restore();
    drawRoundedRect(ctx, x, y, w, h, radius);
    ctx.lineWidth = isHighlighted ? 2.6 : isHardPinned ? 2 : 1.7;
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
  syncBadges(zones) {
    const layer = this.badgeLayerEl;
    const renderer = this.renderer;
    if (!layer || !renderer) return;
    const settings = this.host.getSettings();
    const strings = t(settings.language);
    const activeIds = /* @__PURE__ */ new Set();
    const cssW = renderer.interactiveEl.clientWidth || 800;
    const cssH = renderer.interactiveEl.clientHeight || 600;
    for (const z of zones) {
      const desiredKind = z.mode === "miro-pinned" || z.mode === "miro-free" ? "miro" : "organic";
      activeIds.add(z.id);
      let rec = this.badgeMap.get(z.id);
      if (rec && rec.kind !== desiredKind) {
        rec.el.remove();
        rec.resizerEl?.remove();
        this.badgeMap.delete(z.id);
        rec = void 0;
      }
      if (!rec) {
        rec = desiredKind === "miro" ? this.createMiroHeaderDom(z) : this.createOrganicBadgeDom(z);
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
        const visible = br.x > -40 && tl.x < cssW + 40 && br.y > -40 && tl.y < cssH + 40;
        rec.el.style.display = visible ? "inline-flex" : "none";
        if (visible) {
          const hx = clamp(tl.x + 6, 4, Math.max(4, cssW - 140));
          const hy = clamp(tl.y - 13, 4, Math.max(4, cssH - 28));
          rec.el.style.transform = `translate3d(${hx.toFixed(1)}px, ${hy.toFixed(1)}px, 0)`;
        }
        if (rec.resizerEl) {
          rec.resizerEl.style.setProperty("--gmg-color", z.color);
          const rVis = br.x > 10 && br.x < cssW + 10 && br.y > 10 && br.y < cssH + 10;
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
          rec.pinSpan.textContent = z.anchorMode === "manual" ? "\u{1F4CC}" : "\u{1F9F2}";
        }
        const topWorldY = this.getZoneTopWorldY(z);
        const anchorCss = this.worldToCss(z.centroidX, topWorldY);
        const bx = anchorCss.x;
        const by = anchorCss.y - 14;
        const visible = bx > -120 && bx < cssW + 120 && by > -60 && by < cssH + 60;
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
  getZoneTopWorldY(z) {
    if (z.hull.length === 0) return z.centroidY - z.radius;
    let minY = Infinity;
    for (const p of z.hull) {
      if (p.y < minY) minY = p.y;
    }
    return minY;
  }
  createOrganicBadgeDom(z) {
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
    pinSpan.textContent = "\u{1F9F2}";
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
        const grp = this.host.getSettings().groups.find((g) => g.id === z.id);
        if (grp) this.openGroupModal(grp);
      }
    });
    return { el, kind: "organic", nameSpan, countSpan, pinSpan };
  }
  createMiroHeaderDom(z) {
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
    tidyBtn.textContent = "\u25A6";
    tidyBtn.title = strings.tidyGrid;
    tidyBtn.addEventListener("pointerdown", (e) => e.stopPropagation());
    tidyBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      void this.setMiroSubLayout(z.id, "grid");
    });
    el.appendChild(tidyBtn);
    const menuBtn = document.createElement("button");
    menuBtn.className = "gmg-miro-mini-btn";
    menuBtn.textContent = "\u22EF";
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
    const resizerEl = document.createElement("div");
    resizerEl.className = "gmg-miro-resizer";
    resizerEl.textContent = "\u25E2";
    resizerEl.title = strings.frameResizeTooltip;
    this.attachMiroResizeBehavior(resizerEl, z.id);
    return {
      el,
      kind: "miro",
      nameSpan,
      countSpan,
      modeChipEl,
      resizerEl
    };
  }
  attachGroupDragBehavior(el, groupId, kind) {
    let startClientX = 0;
    let startClientY = 0;
    let startFrameX = 0;
    let startFrameY = 0;
    let moved = false;
    const onPointerMove = (evt) => {
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
          y: Math.round(startFrameY + worldDy)
        });
      } else {
        const localX = evt.clientX - parentRect.left;
        const localY = evt.clientY - parentRect.top;
        const worldPos = this.cssToWorld(localX, localY);
        this.setLiveGroupAnchor(groupId, worldPos.x, worldPos.y);
      }
      this.reheatSimulation(35);
    };
    const onPointerUp = (evt) => {
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
    el.addEventListener("pointerdown", (evt) => {
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
  attachMiroResizeBehavior(resizerEl, groupId) {
    let startClientX = 0;
    let startClientY = 0;
    let startW = 280;
    let startH = 220;
    let startX = 0;
    let startY = 0;
    const onPointerMove = (evt) => {
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
        h: nextH
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
    resizerEl.addEventListener("pointerdown", (evt) => {
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
  setLiveMiroFrameRect(groupId, patch) {
    const spec = this.cachedSpecs.find((s) => s.id === groupId);
    const zone = this.lastZones.find((z) => z.id === groupId);
    if (!spec) return;
    if (spec.frameX === void 0 && zone?.frameRect) {
      spec.frameX = zone.frameRect.x;
      spec.frameY = zone.frameRect.y;
      spec.frameW = zone.frameRect.w;
      spec.frameH = zone.frameRect.h;
    }
    if (patch.x !== void 0) spec.frameX = patch.x;
    if (patch.y !== void 0) spec.frameY = patch.y;
    if (patch.w !== void 0) spec.frameW = patch.w;
    if (patch.h !== void 0) spec.frameH = patch.h;
  }
  async persistLiveMiroFrame(groupId) {
    const spec = this.cachedSpecs.find((s) => s.id === groupId);
    if (!spec) return;
    const settings = this.host.getSettings();
    const groups = settings.groups.map(
      (g) => g.id === groupId ? {
        ...g,
        frameX: spec.frameX,
        frameY: spec.frameY,
        frameW: spec.frameW,
        frameH: spec.frameH
      } : g
    );
    await this.host.saveGroups(groups, false);
    this.controlsSection?.refreshGroupList();
  }
  setLiveGroupAnchor(groupId, wx, wy) {
    const spec = this.cachedSpecs.find((s) => s.id === groupId);
    if (spec) {
      spec.anchorMode = "manual";
      spec.anchorX = wx;
      spec.anchorY = wy;
    }
  }
  async persistLiveGroupAnchor(groupId) {
    const spec = this.cachedSpecs.find((s) => s.id === groupId);
    if (!spec) return;
    const settings = this.host.getSettings();
    if (spec.isNative) {
      const idx = settings.groups.length + 1;
      const promoted = {
        id: createGroupId(),
        name: spec.name || t(settings.language).defaultNewGroupName(idx),
        color: spec.color,
        enabled: true,
        query: spec.name,
        nodeIds: Array.from(spec.memberIds),
        excludedNodeIds: [],
        strength: 1,
        colorNodes: false,
        mode: "organic",
        anchorMode: "manual",
        anchorX: spec.anchorX,
        anchorY: spec.anchorY
      };
      await this.host.saveGroups([...settings.groups, promoted], true);
      return;
    }
    const groups = settings.groups.map(
      (g) => g.id === groupId ? {
        ...g,
        anchorMode: "manual",
        anchorX: spec.anchorX,
        anchorY: spec.anchorY
      } : g
    );
    await this.host.saveGroups(groups, false);
    this.controlsSection?.refreshGroupList();
  }
  /* =========================================================================
   * Lasso Tool (Shift + Drag OR Toolbar Button)
   * ========================================================================= */
  setLassoArmed(armed) {
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
  setupLassoEvents(interactiveEl, _parent) {
    const onPointerDown = (evt) => {
      if (evt.button !== 0) return;
      const settings = this.host.getSettings();
      const shiftTrigger = settings.shiftDragLasso && evt.shiftKey && !this.findNodeAtCssPoint(evt);
      if (!this.lassoArmed && !shiftTrigger) return;
      evt.preventDefault();
      evt.stopPropagation();
      evt.stopImmediatePropagation();
      const rect = interactiveEl.getBoundingClientRect();
      this.lassoDrawing = true;
      this.lassoPointsCss = [
        { x: evt.clientX - rect.left, y: evt.clientY - rect.top }
      ];
      this.renderer?.changed();
    };
    const onPointerMove = (evt) => {
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
    const onPointerUp = (evt) => {
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
    const onKeyDown = (evt) => {
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
  findNodesInsideCssPolygon(poly) {
    const nodes = this.renderer?.nodes || [];
    const hit = [];
    for (const n of nodes) {
      const p = this.worldToCss(n.x, n.y);
      if (pointInPolygon(p.x, p.y, poly)) {
        hit.push(n.id);
      }
    }
    return hit;
  }
  findNodeAtCssPoint(evt) {
    const r = this.renderer;
    if (!r) return null;
    if (r.highlightNode) return r.highlightNode;
    const rect = r.interactiveEl.getBoundingClientRect();
    const cx = evt.clientX - rect.left;
    const cy = evt.clientY - rect.top;
    let best = null;
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
  showLassoActionMenu(evt, nodeIds) {
    const settings = this.host.getSettings();
    const strings = t(settings.language);
    const menu = new import_obsidian4.Menu();
    menu.addItem(
      (item) => item.setTitle(strings.lassoMenuTitle(nodeIds.length)).setDisabled(true)
    );
    menu.addSeparator();
    menu.addItem(
      (item) => item.setTitle(strings.lassoCreateMiroPinned(nodeIds.length)).setIcon("layout-grid").onClick(() => {
        void this.quickCreateGroupWithNodes(nodeIds, "miro-pinned");
      })
    );
    menu.addItem(
      (item) => item.setTitle(strings.lassoCreateMiroFree(nodeIds.length)).setIcon("square-dashed").onClick(() => {
        void this.quickCreateGroupWithNodes(nodeIds, "miro-free");
      })
    );
    menu.addItem(
      (item) => item.setTitle(strings.lassoCreateNew(nodeIds.length)).setIcon("magnet").onClick(() => {
        void this.quickCreateGroupWithNodes(nodeIds, "organic");
      })
    );
    menu.addSeparator();
    menu.addItem(
      (item) => item.setTitle(strings.lassoPinIndividual(nodeIds.length)).setIcon("pin").onClick(() => {
        void this.pinNodesAtCurrentPositions(nodeIds);
      })
    );
    const anyPinned = nodeIds.some((id) => Boolean(settings.pinnedNodes?.[id]));
    if (anyPinned) {
      menu.addItem(
        (item) => item.setTitle(strings.lassoUnpinIndividual).setIcon("pin-off").onClick(() => {
          void this.unpinIndividualNodes(nodeIds);
        })
      );
    }
    if (settings.groups.length > 0) {
      menu.addSeparator();
      for (const grp of settings.groups) {
        menu.addItem(
          (item) => item.setTitle(strings.lassoAddTo(grp.name)).setIcon("magnet").onClick(() => {
            void this.addNodesToGroup(grp.id, nodeIds);
          })
        );
      }
      menu.addSeparator();
      menu.addItem(
        (item) => item.setTitle(strings.lassoRemoveFromAll).setIcon("x").onClick(() => {
          void this.removeNodesFromAllGroups(nodeIds);
        })
      );
    }
    menu.showAtMouseEvent(evt);
  }
  showNodeQuickMenu(evt, nodeId) {
    const settings = this.host.getSettings();
    const strings = t(settings.language);
    const menu = new import_obsidian4.Menu();
    menu.addItem(
      (item) => item.setTitle(`\u{1F9F2} ${strings.ctxMenuHeader}`).setDisabled(true)
    );
    const isIndividuallyPinned = Boolean(settings.pinnedNodes?.[nodeId]);
    if (isIndividuallyPinned) {
      menu.addItem(
        (item) => item.setTitle(strings.ctxUnpinNode).setIcon("pin-off").onClick(() => void this.unpinIndividualNodes([nodeId]))
      );
    } else {
      menu.addItem(
        (item) => item.setTitle(strings.ctxPinNodeHere).setIcon("pin").onClick(() => void this.pinNodesAtCurrentPositions([nodeId]))
      );
    }
    const neighborIds = this.collectNodeWithNeighbors(nodeId);
    if (neighborIds.length > 1) {
      menu.addItem(
        (item) => item.setTitle(
          `${strings.ctxCreateMiroWithNeighbors} (${neighborIds.length})`
        ).setIcon("layout-grid").onClick(
          () => void this.quickCreateGroupWithNodes(neighborIds, "miro-pinned")
        )
      );
      menu.addItem(
        (item) => item.setTitle(`${strings.ctxCreateWithNeighbors} (${neighborIds.length})`).setIcon("git-Fork").onClick(
          () => void this.quickCreateGroupWithNodes(neighborIds, "organic")
        )
      );
    }
    menu.addItem(
      (item) => item.setTitle(strings.ctxCreateWithNode).setIcon("plus-circle").onClick(() => this.openGroupModal(void 0, [nodeId], "organic"))
    );
    if (settings.groups.length > 0) {
      menu.addSeparator();
      for (const grp of settings.groups) {
        const inManual = grp.nodeIds.includes(nodeId);
        if (inManual) {
          menu.addItem(
            (item) => item.setTitle(strings.ctxRemoveFromGroup(grp.name)).setIcon("minus-circle").onClick(() => void this.removeNodesFromGroup(grp.id, [nodeId]))
          );
        } else {
          menu.addItem(
            (item) => item.setTitle(strings.ctxAddToGroup(grp.name)).setIcon("magnet").onClick(() => void this.addNodesToGroup(grp.id, [nodeId]))
          );
        }
      }
    }
    menu.showAtMouseEvent(evt);
  }
  showBadgeContextMenu(evt, groupId, isNative) {
    if (isNative) {
      const settings2 = this.host.getSettings();
      const strings2 = t(settings2.language);
      const menu2 = new import_obsidian4.Menu();
      menu2.addItem(
        (i) => i.setTitle(strings2.switchToMiroPinned).setIcon("layout-grid").onClick(() => this.promoteNativeGroupAndCycle(groupId, "miro-pinned"))
      );
      menu2.showAtMouseEvent(evt);
      return;
    }
    const settings = this.host.getSettings();
    const strings = t(settings.language);
    const grp = settings.groups.find((g) => g.id === groupId);
    if (!grp) return;
    const mode = grp.mode || "organic";
    const menu = new import_obsidian4.Menu();
    menu.addItem(
      (i) => i.setTitle(strings.editGroup).setIcon("sliders-horizontal").onClick(() => this.openGroupModal(grp))
    );
    menu.addSeparator();
    if (mode !== "miro-pinned") {
      menu.addItem(
        (i) => i.setTitle(strings.switchToMiroPinned).setIcon("pin").onClick(() => void this.setGroupMode(groupId, "miro-pinned", "grid"))
      );
    }
    if (mode !== "miro-free") {
      menu.addItem(
        (i) => i.setTitle(strings.switchToMiroFree).setIcon("layout-grid").onClick(() => void this.setGroupMode(groupId, "miro-free"))
      );
    }
    if (mode !== "organic") {
      menu.addItem(
        (i) => i.setTitle(strings.switchToOrganic).setIcon("magnet").onClick(() => void this.setGroupMode(groupId, "organic"))
      );
    }
    if (mode === "miro-pinned") {
      menu.addSeparator();
      menu.addItem(
        (i) => i.setTitle(strings.tidyGrid).onClick(() => void this.setMiroSubLayout(groupId, "grid"))
      );
      menu.addItem(
        (i) => i.setTitle(strings.tidyColumn).onClick(() => void this.setMiroSubLayout(groupId, "column"))
      );
      menu.addItem(
        (i) => i.setTitle(strings.tidyCircle).onClick(() => void this.setMiroSubLayout(groupId, "circle"))
      );
    }
    if (mode === "organic" && grp.anchorMode === "manual") {
      menu.addItem(
        (i) => i.setTitle(strings.resetAnchor).setIcon("rotate-ccw").onClick(() => void this.resetGroupAnchor(grp.id))
      );
    }
    menu.addSeparator();
    menu.addItem(
      (i) => i.setTitle(strings.toggleGroup).setIcon(grp.enabled ? "eye-off" : "eye").onClick(() => void this.toggleGroup(grp.id))
    );
    menu.addItem(
      (i) => i.setTitle(strings.deleteGroup).setIcon("trash-2").onClick(() => void this.deleteGroup(grp.id))
    );
    menu.showAtMouseEvent(evt);
  }
  collectNodeWithNeighbors(nodeId) {
    const out = /* @__PURE__ */ new Set([nodeId]);
    for (const l of this.renderer?.links || []) {
      if (l.source?.id === nodeId && l.target?.id) out.add(l.target.id);
      if (l.target?.id === nodeId && l.source?.id) out.add(l.source.id);
    }
    return Array.from(out);
  }
  openGroupModal(existing, initialNodeIds, initialMode = "organic") {
    const settings = this.host.getSettings();
    const candidates = (this.renderer?.nodes || []).map(
      (n) => ({
        id: n.id,
        label: typeof n.getDisplayText === "function" ? n.getDisplayText() : n.id.replace(/\.md$/i, ""),
        type: n.type || ""
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
        if ((saved.mode === "miro-pinned" || saved.mode === "miro-free") && saved.frameX === void 0) {
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
        const next = exists ? curr.map((g) => g.id === saved.id ? saved : g) : [...curr, saved];
        void this.host.saveGroups(next, true);
      }
    });
    modal.open();
  }
  getViewportCenterWorld() {
    const r = this.renderer;
    if (!r) return { x: 0, y: 0 };
    const w = r.interactiveEl?.clientWidth || 800;
    const h = r.interactiveEl?.clientHeight || 600;
    return this.cssToWorld(w / 2, h / 2);
  }
  getMemberPositionsForGroupDraft(grp) {
    const nodes = this.renderer?.nodes || [];
    const resolver = buildMetadataResolver(this.host.app);
    const compiled = grp.query.trim() ? parseGroupQuery(grp.query) : null;
    const manualSet = new Set(grp.nodeIds || []);
    const excludedSet = new Set(grp.excludedNodeIds || []);
    const pts = [];
    for (const n of nodes) {
      if (excludedSet.has(n.id)) continue;
      if (manualSet.has(n.id) || compiled && compiled.matches(resolver(n.id, n.type || ""))) {
        pts.push({ id: n.id, x: n.x || 0, y: n.y || 0 });
      }
    }
    return pts;
  }
  promoteNativeGroupAndCycle(nativeId, targetMode) {
    const spec = this.cachedSpecs.find((s) => s.id === nativeId);
    if (!spec) return;
    const settings = this.host.getSettings();
    const memberPts = Array.from(spec.memberIds).map((id) => this.findRendererNode(id)).filter((n) => Boolean(n)).map((n) => ({ id: n.id, x: n.x, y: n.y }));
    const frameDef = computeDefaultMiroFrame(
      memberPts,
      this.getViewportCenterWorld(),
      "grid"
    );
    const promoted = {
      id: createGroupId(),
      name: spec.name,
      color: spec.color,
      enabled: true,
      query: spec.name,
      nodeIds: Array.from(spec.memberIds),
      excludedNodeIds: [],
      strength: 1,
      colorNodes: true,
      mode: targetMode,
      anchorMode: "auto",
      frameX: frameDef.frameX,
      frameY: frameDef.frameY,
      frameW: frameDef.frameW,
      frameH: frameDef.frameH,
      frameSubLayout: "grid"
    };
    void this.host.saveGroups([...settings.groups, promoted], true);
  }
  async cycleGroupMode(groupId) {
    const grp = this.host.getSettings().groups.find((g) => g.id === groupId);
    if (!grp) return;
    const curr = grp.mode || "organic";
    const next = curr === "organic" ? "miro-pinned" : curr === "miro-pinned" ? "miro-free" : "organic";
    await this.setGroupMode(groupId, next);
  }
  async setGroupMode(groupId, nextMode, subLayout) {
    const settings = this.host.getSettings();
    const grp = settings.groups.find((g) => g.id === groupId);
    if (!grp) return;
    let framePatch = {};
    if ((nextMode === "miro-pinned" || nextMode === "miro-free") && grp.frameX === void 0) {
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
        frameH: def.frameH
      };
    }
    const nextGroups = settings.groups.map(
      (g) => g.id === groupId ? {
        ...g,
        ...framePatch,
        mode: nextMode,
        frameSubLayout: subLayout || g.frameSubLayout || "grid"
      } : g
    );
    await this.host.saveGroups(nextGroups, true);
  }
  async setMiroSubLayout(groupId, subLayout) {
    const settings = this.host.getSettings();
    const groups = settings.groups.map(
      (g) => g.id === groupId ? {
        ...g,
        mode: "miro-pinned",
        frameSubLayout: subLayout,
        customOffsets: subLayout === "freeform" ? g.customOffsets : {}
      } : g
    );
    await this.host.saveGroups(groups, true);
  }
  async quickCreateGroupWithNodes(nodeIds, mode = "organic") {
    const settings = this.host.getSettings();
    const strings = t(settings.language);
    const idx = settings.groups.length + 1;
    const color = DEFAULT_GROUP_COLORS[(idx - 1) % DEFAULT_GROUP_COLORS.length];
    const memberPts = nodeIds.map((id) => this.findRendererNode(id)).filter((n) => Boolean(n)).map((n) => ({ id: n.id, x: n.x, y: n.y }));
    const frameDef = mode === "miro-pinned" || mode === "miro-free" ? computeDefaultMiroFrame(
      memberPts,
      this.getViewportCenterWorld(),
      "grid"
    ) : void 0;
    const newGroup = {
      id: createGroupId(),
      name: mode === "organic" ? strings.defaultNewGroupName(idx) : strings.defaultNewFrameName(idx),
      color,
      enabled: true,
      query: "",
      nodeIds: Array.from(new Set(nodeIds)),
      excludedNodeIds: [],
      strength: 1,
      colorNodes: true,
      mode,
      anchorMode: "auto",
      frameX: frameDef?.frameX,
      frameY: frameDef?.frameY,
      frameW: frameDef?.frameW,
      frameH: frameDef?.frameH,
      frameSubLayout: "grid"
    };
    await this.host.saveGroups([...settings.groups, newGroup], true);
    new import_obsidian4.Notice(strings.noticeCreatedGroup(newGroup.name, nodeIds.length));
    return newGroup;
  }
  async pinNodesAtCurrentPositions(nodeIds) {
    const settings = this.host.getSettings();
    const strings = t(settings.language);
    const nextPins = { ...settings.pinnedNodes || {} };
    let count = 0;
    for (const id of nodeIds) {
      const n = this.findRendererNode(id);
      if (n) {
        nextPins[id] = {
          x: Math.round(n.x * 10) / 10,
          y: Math.round(n.y * 10) / 10
        };
        count++;
      }
    }
    if (count > 0) {
      await this.host.updateSettings({ pinnedNodes: nextPins }, true);
      new import_obsidian4.Notice(strings.noticePinnedNodes(count));
    }
  }
  async unpinIndividualNodes(nodeIds) {
    const settings = this.host.getSettings();
    const strings = t(settings.language);
    const nextPins = { ...settings.pinnedNodes || {} };
    for (const id of nodeIds) {
      delete nextPins[id];
    }
    await this.host.updateSettings({ pinnedNodes: nextPins }, true);
    new import_obsidian4.Notice(strings.noticeUnpinnedNodes);
  }
  async unpinAllIndividualNodes() {
    const strings = t(this.host.getSettings().language);
    await this.host.updateSettings({ pinnedNodes: {} }, true);
    new import_obsidian4.Notice(strings.noticeUnpinnedNodes);
  }
  async addNodesToGroup(groupId, nodeIds) {
    const settings = this.host.getSettings();
    const strings = t(settings.language);
    let targetName = "";
    const next = settings.groups.map((g) => {
      if (g.id !== groupId) return g;
      targetName = g.name;
      const merged = /* @__PURE__ */ new Set([...g.nodeIds, ...nodeIds]);
      const excl = (g.excludedNodeIds || []).filter(
        (id) => !nodeIds.includes(id)
      );
      return { ...g, nodeIds: Array.from(merged), excludedNodeIds: excl };
    });
    await this.host.saveGroups(next, true);
    if (targetName) {
      new import_obsidian4.Notice(strings.noticeAddedToGroup(targetName, nodeIds.length));
    }
  }
  async removeNodesFromGroup(groupId, nodeIds) {
    const settings = this.host.getSettings();
    const removeSet = new Set(nodeIds);
    const next = settings.groups.map((g) => {
      if (g.id !== groupId) return g;
      return {
        ...g,
        nodeIds: g.nodeIds.filter((id) => !removeSet.has(id))
      };
    });
    await this.host.saveGroups(next, true);
  }
  async removeNodesFromAllGroups(nodeIds) {
    const settings = this.host.getSettings();
    const removeSet = new Set(nodeIds);
    const next = settings.groups.map((g) => ({
      ...g,
      nodeIds: g.nodeIds.filter((id) => !removeSet.has(id))
    }));
    await this.host.saveGroups(next, true);
  }
  async toggleGroup(groupId) {
    const settings = this.host.getSettings();
    const next = settings.groups.map(
      (g) => g.id === groupId ? { ...g, enabled: !g.enabled } : g
    );
    await this.host.saveGroups(next, true);
  }
  async resetGroupAnchor(groupId) {
    const settings = this.host.getSettings();
    const next = settings.groups.map(
      (g) => g.id === groupId ? {
        ...g,
        anchorMode: "auto",
        anchorX: void 0,
        anchorY: void 0
      } : g
    );
    await this.host.saveGroups(next, true);
  }
  async deleteGroup(groupId) {
    const settings = this.host.getSettings();
    const next = settings.groups.filter((g) => g.id !== groupId);
    await this.host.saveGroups(next, true);
  }
  /* =========================================================================
   * Live Graph Inspection & Camera Helpers (Used by MCP Server!)
   * ========================================================================= */
  getLiveGraphSnapshot() {
    const r = this.renderer;
    const nodes = (r?.nodes || []).map((n) => {
      const memberOf = [];
      for (const s of this.cachedSpecs) {
        if (s.memberIds.has(n.id)) memberOf.push(s.id);
      }
      return {
        id: n.id,
        label: typeof n.getDisplayText === "function" ? n.getDisplayText() : n.id.replace(/\.md$/i, ""),
        type: n.type || "file",
        x: Math.round((n.x || 0) * 10) / 10,
        y: Math.round((n.y || 0) * 10) / 10,
        hardPinned: this.enforcedPins.has(n.id),
        groups: memberOf
      };
    });
    const links = (r?.links || []).filter((l) => l.source && l.target).map((l) => ({ source: l.source.id, target: l.target.id }));
    return {
      viewType: this.view.getViewType(),
      nodes,
      links,
      zones: this.lastZones
    };
  }
  focusWorldRect(wx, wy, ww, wh) {
    const r = this.renderer;
    if (!r) return;
    const win = r.interactiveEl?.win || window;
    const dpr = r.px?.renderer?.resolution || win.devicePixelRatio || 1;
    const viewW = (r.interactiveEl?.clientWidth || 900) * dpr;
    const viewH = (r.interactiveEl?.clientHeight || 650) * dpr;
    const padFactor = 1.35;
    const desiredScale = clamp(
      Math.min(
        viewW / Math.max(120, ww * padFactor),
        viewH / Math.max(120, wh * padFactor)
      ),
      0.2,
      2.2
    );
    const centerX = wx + ww / 2;
    const centerY = wy + wh / 2;
    const targetPanX = viewW / 2 - centerX * desiredScale;
    const targetPanY = viewH / 2 - centerY * desiredScale;
    r.scale = desiredScale;
    if (typeof r.targetScale === "number") r.targetScale = desiredScale;
    r.panX = targetPanX;
    r.panY = targetPanY;
    if (typeof r.setScale === "function") r.setScale(desiredScale);
    if (typeof r.setPan === "function") r.setPan(targetPanX, targetPanY);
    r.changed();
  }
  /* =========================================================================
   * Native Obsidian Graph Engine Helpers & Cleanup
   * ========================================================================= */
  readNativeColorGroups() {
    const eng = this.engine;
    if (!eng) return [];
    const fromGetter = typeof eng.getOptions === "function" ? eng.getOptions()?.colorGroups : void 0;
    return fromGetter || eng.options?.colorGroups || eng.searchQueries || [];
  }
  readNativeGroupsSignature() {
    const list = this.readNativeColorGroups();
    if (!list.length) return "";
    return list.map((g) => `${g.query}:${g.color?.rgb ?? 0}`).join("|");
  }
  readNativeLinkDistance() {
    const eng = this.engine;
    if (!eng) return 140;
    const d = (typeof eng.getOptions === "function" ? eng.getOptions()?.linkDistance : void 0) ?? eng.options?.linkDistance;
    return typeof d === "number" && d > 20 ? d : 140;
  }
  destroy() {
    this.destroyed = true;
    for (const fn of this.cleanupFns) {
      try {
        fn();
      } catch {
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
};
function drawRoundedRect(ctx, x, y, w, h, r) {
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
function drawSmoothClosedCurve(ctx, pts) {
  const n = pts.length;
  if (n < 3) return;
  const firstMid = {
    x: (pts[n - 1].x + pts[0].x) / 2,
    y: (pts[n - 1].y + pts[0].y) / 2
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
function pointInPolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    const intersect = yi > y !== yj > y && x < (xj - xi) * (y - yi) / (yj - yi + 1e-9) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
function hexToRgbInt(hex) {
  const clean = hex.replace(/^#/, "").trim();
  if (clean.length === 3) {
    const r = parseInt(clean[0] + clean[0], 16);
    const g = parseInt(clean[1] + clean[1], 16);
    const b = parseInt(clean[2] + clean[2], 16);
    return r << 16 | g << 8 | b;
  }
  const parsed = parseInt(clean.slice(0, 6), 16);
  return Number.isFinite(parsed) ? parsed : 8150271;
}
function rgbIntToHex(rgb) {
  const clamped = Math.max(0, Math.min(16777215, rgb | 0));
  return "#" + clamped.toString(16).padStart(6, "0");
}
function hexToRgba(hex, alpha) {
  const rgb = hexToRgbInt(hex);
  const r = rgb >> 16 & 255;
  const g = rgb >> 8 & 255;
  const b = rgb & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
}

// src/mcp/cloudflareTunnel.ts
async function loadChildProcessAndFs() {
  try {
    const req = globalThis.require || (typeof window !== "undefined" ? window.require : void 0);
    if (typeof req === "function") {
      return {
        cp: req("child_process"),
        fs: req("fs")
      };
    }
  } catch {
  }
  try {
    const cpMod = "node:child_process";
    const fsMod = "node:fs";
    const [cp, fs] = await Promise.all([import(cpMod), import(fsMod)]);
    return { cp, fs };
  } catch {
    return null;
  }
}
var CloudflareQuickTunnelManager = class {
  constructor() {
    this.proc = null;
    this.status = {
      state: "stopped",
      publicBaseUrl: null,
      error: null,
      logsTail: []
    };
    this.listeners = /* @__PURE__ */ new Set();
  }
  getStatus() {
    return { ...this.status, logsTail: [...this.status.logsTail] };
  }
  onStatusChange(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
  emit() {
    const snap = this.getStatus();
    for (const cb of this.listeners) {
      try {
        cb(snap);
      } catch {
      }
    }
  }
  appendLog(line) {
    const trimmed = line.trim();
    if (!trimmed) return;
    this.status.logsTail.push(trimmed);
    if (this.status.logsTail.length > 30) {
      this.status.logsTail.shift();
    }
  }
  async start(localPort, customBinaryPath) {
    if (this.proc && this.status.state === "running" && this.status.publicBaseUrl) {
      return this.status.publicBaseUrl;
    }
    await this.stop();
    const mods = await loadChildProcessAndFs();
    if (!mods) {
      const msg = "child_process unavailable (desktop Obsidian or Node.js required)";
      this.status = {
        state: "error",
        publicBaseUrl: null,
        error: msg,
        logsTail: []
      };
      this.emit();
      throw new Error(msg);
    }
    const bin = this.resolveCloudflaredBinary(mods.fs, customBinaryPath);
    const targetUrl = `http://127.0.0.1:${localPort}`;
    this.status = {
      state: "starting",
      publicBaseUrl: null,
      error: null,
      logsTail: [`Launching: ${bin} tunnel --url ${targetUrl} --no-autoupdate`]
    };
    this.emit();
    return await new Promise((resolve, reject) => {
      let settled = false;
      const proc = mods.cp.spawn(
        bin,
        ["tunnel", "--url", targetUrl, "--no-autoupdate"],
        {
          stdio: ["ignore", "pipe", "pipe"],
          windowsHide: true
        }
      );
      this.proc = proc;
      const timeout = setTimeout(() => {
        if (!settled) {
          settled = true;
          const errMsg = "Timed out waiting for trycloudflare.com URL (check internet connection)";
          this.status.state = "error";
          this.status.error = errMsg;
          this.emit();
          reject(new Error(errMsg));
        }
      }, 25e3);
      const handleChunk = (chunk) => {
        const text = chunk.toString();
        for (const line of text.split(/\r?\n/)) {
          this.appendLog(line);
        }
        const match = text.match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/i);
        if (match && !this.status.publicBaseUrl) {
          this.status.publicBaseUrl = match[0];
          this.status.state = "running";
          this.status.error = null;
          this.emit();
          if (!settled) {
            settled = true;
            clearTimeout(timeout);
            resolve(match[0]);
          }
        }
      };
      proc.stdout?.on("data", handleChunk);
      proc.stderr?.on("data", handleChunk);
      proc.on("error", (err) => {
        clearTimeout(timeout);
        this.proc = null;
        const friendly = err.code === "ENOENT" ? "cloudflared \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D. \u0423\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u0435: brew install cloudflared (macOS) \u0438\u043B\u0438 winget install Cloudflare.cloudflared (Windows)" : err.message;
        this.status.state = "error";
        this.status.error = friendly;
        this.status.publicBaseUrl = null;
        this.emit();
        if (!settled) {
          settled = true;
          reject(new Error(friendly));
        }
      });
      proc.on("exit", (code) => {
        clearTimeout(timeout);
        if (this.proc === proc) {
          this.proc = null;
        }
        if (this.status.state !== "stopped") {
          const msg = code === 0 ? null : `cloudflared exited with code ${code ?? "unknown"}`;
          this.status.state = msg ? "error" : "stopped";
          this.status.error = msg;
          this.status.publicBaseUrl = null;
          this.emit();
          if (!settled) {
            settled = true;
            reject(new Error(msg || "cloudflared exited"));
          }
        }
      });
    });
  }
  async stop() {
    const p = this.proc;
    this.proc = null;
    this.status = {
      state: "stopped",
      publicBaseUrl: null,
      error: null,
      logsTail: this.status.logsTail
    };
    this.emit();
    if (!p) return;
    await new Promise((resolve) => {
      const killTimer = setTimeout(() => {
        try {
          p.kill("SIGKILL");
        } catch {
        }
        resolve();
      }, 1500);
      p.once("exit", () => {
        clearTimeout(killTimer);
        resolve();
      });
      try {
        p.kill("SIGTERM");
      } catch {
        clearTimeout(killTimer);
        resolve();
      }
    });
  }
  resolveCloudflaredBinary(fs, customPath) {
    if (customPath && customPath.trim()) {
      return customPath.trim();
    }
    const envObj = typeof process !== "undefined" && process.env ? process.env : {};
    const home = envObj.HOME || envObj.USERPROFILE || "";
    const localAppData = envObj.LOCALAPPDATA || "";
    const candidates = [
      "/opt/homebrew/bin/cloudflared",
      "/usr/local/bin/cloudflared",
      "/usr/bin/cloudflared",
      home ? `${home}/.local/bin/cloudflared` : "",
      "C:\\Program Files (x86)\\cloudflared\\cloudflared.exe",
      "C:\\Program Files\\cloudflared\\cloudflared.exe",
      localAppData ? `${localAppData}\\Microsoft\\WinGet\\Links\\cloudflared.exe` : ""
    ].filter(Boolean);
    for (const c of candidates) {
      try {
        if (fs.existsSync(c)) return c;
      } catch {
      }
    }
    return "cloudflared";
  }
};

// src/mcp/mcpEngine.ts
var SUPPORTED_PROTOCOL_VERSIONS = [
  "2025-06-18",
  "2025-03-26",
  "2024-11-05"
];
var MCP_TOOLS = [
  /* ==================== VAULT & NOTES TOOLS (1..10) ==================== */
  {
    name: "vault_info",
    description: "Get an overview of the Obsidian vault (note count, folders, top tags) plus live Graph View & Magnetic Groups / Miro-Board status.",
    inputSchema: {
      type: "object",
      properties: {}
    },
    annotations: { title: "Vault & Graph Overview", readOnlyHint: true }
  },
  {
    name: "list_notes",
    description: "List markdown notes in the Obsidian vault, optionally filtered by folder, tag, or Obsidian search query.",
    inputSchema: {
      type: "object",
      properties: {
        folder: {
          type: "string",
          description: "Optional folder prefix (e.g. 'Projects/' or 'Notes')"
        },
        tag: {
          type: "string",
          description: "Optional tag filter (e.g. '#architecture' or 'sprint')"
        },
        query: {
          type: "string",
          description: "Optional Obsidian-style filter (e.g. 'tag:#ai OR path:Research/')"
        },
        limit: {
          type: "number",
          description: "Maximum number of notes to return (default 100)"
        }
      }
    },
    annotations: { title: "List Vault Notes", readOnlyHint: true }
  },
  {
    name: "read_note",
    description: "Read a note's full markdown content, YAML frontmatter, tags, outgoing [[wikilinks]], and incoming backlinks.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Note path in vault (e.g. 'Folder/Note.md' or 'Note')"
        }
      },
      required: ["path"]
    },
    annotations: { title: "Read Note", readOnlyHint: true }
  },
  {
    name: "create_or_update_note",
    description: "Create a new markdown note or update an existing note in the Obsidian vault. Parent folders are created automatically. Include [[Note Name]] wikilinks or #tags in content to connect it on the live Graph View.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Target note path (e.g. 'Architecture/API Gateway.md')"
        },
        content: {
          type: "string",
          description: "Full markdown content (may include YAML frontmatter, #tags, and [[wikilinks]])"
        },
        mode: {
          type: "string",
          enum: ["overwrite", "create-only", "append", "prepend"],
          description: "Write mode (default 'overwrite')"
        }
      },
      required: ["path", "content"]
    },
    annotations: { title: "Create or Update Note", destructiveHint: false }
  },
  {
    name: "append_to_note",
    description: "Append markdown text, sections, or [[wikilinks]] to the end of an existing note.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Existing note path"
        },
        content: {
          type: "string",
          description: "Markdown text to append"
        }
      },
      required: ["path", "content"]
    },
    annotations: { title: "Append to Note", destructiveHint: false }
  },
  {
    name: "delete_note",
    description: "Delete (move to trash) a markdown note from the Obsidian vault.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Note path to delete"
        }
      },
      required: ["path"]
    },
    annotations: { title: "Delete Note", destructiveHint: true }
  },
  {
    name: "move_or_rename_note",
    description: "Move or rename a note in the vault (updating internal [[wikilinks]] automatically when running inside Obsidian).",
    inputSchema: {
      type: "object",
      properties: {
        fromPath: { type: "string", description: "Current note path" },
        toPath: { type: "string", description: "New note path" }
      },
      required: ["fromPath", "toPath"]
    },
    annotations: { title: "Move or Rename Note", destructiveHint: false }
  },
  {
    name: "search_vault",
    description: "Search notes across the Obsidian vault by full-text keywords and/or Obsidian query expressions (tag:#..., path:..., [prop:val]), returning ranked snippets.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search keywords or query expression"
        },
        limit: {
          type: "number",
          description: "Maximum matches to return (default 25)"
        }
      },
      required: ["query"]
    },
    annotations: { title: "Search Vault", readOnlyHint: true }
  },
  {
    name: "get_graph_topology",
    description: "Inspect the Obsidian knowledge graph: nodes, links, degree hubs, orphan notes, live (x, y) Graph View coordinates, hard-pinned status, and group/Miro-frame memberships.",
    inputSchema: {
      type: "object",
      properties: {
        includeNodes: {
          type: "boolean",
          description: "Include full node list (default true)"
        },
        includeLinks: {
          type: "boolean",
          description: "Include full edge list (default true)"
        }
      }
    },
    annotations: { title: "Inspect Graph Topology", readOnlyHint: true }
  },
  {
    name: "open_note_or_graph",
    description: "Open/focus the Obsidian Graph View and optionally zoom the camera onto a specific Miro Frame, group, or note.",
    inputSchema: {
      type: "object",
      properties: {
        openGraphIfClosed: {
          type: "boolean",
          description: "Open Global Graph View if not currently open (default true)"
        },
        groupId: {
          type: "string",
          description: "Optional group/frame ID or name to focus camera on"
        },
        notePath: {
          type: "string",
          description: "Optional note path to focus or open"
        }
      }
    },
    annotations: { title: "Focus Graph or Note", readOnlyHint: false }
  },
  /* ======== GRAPH MAGNETIC GROUPS & MIRO-BOARD TOOLS (11..20) ======== */
  {
    name: "graph_list_groups",
    description: "List all Graph Magnetic Groups and Miro-Board Frames, including their mode ('organic' | 'miro-free' | 'miro-pinned'), frame geometry, matched notes, and individually pinned nodes.",
    inputSchema: {
      type: "object",
      properties: {}
    },
    annotations: { title: "List Graph Groups & Miro Frames", readOnlyHint: true }
  },
  {
    name: "graph_create_group",
    description: "Create a new Magnetic Group or Miro-Board Frame on Obsidian's Graph View. Choose mode='organic' for a soft lobe hugging the main dynamic cluster without tearing, mode='miro-free' for a fixed Miro rectangle with dynamic nodes inside, or mode='miro-pinned' to hard-lock nodes like cards on a Miro board while the rest of the graph remains dynamic!",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Group or Miro Frame title" },
        mode: {
          type: "string",
          enum: ["organic", "miro-free", "miro-pinned"],
          description: "'organic' = soft cluster lobe; 'miro-free' = fixed Miro frame with live dynamic nodes inside; 'miro-pinned' = hard-pinned Miro board frame"
        },
        color: {
          type: "string",
          description: "Hex color (e.g. '#7c5cff', '#2ec4b6', '#ff6b6b')"
        },
        query: {
          type: "string",
          description: "Optional Obsidian query rule (e.g. 'tag:#backend OR path:API/')"
        },
        nodeIds: {
          type: "array",
          items: { type: "string" },
          description: "Explicit list of note paths / node IDs to include"
        },
        strength: {
          type: "number",
          description: "Group attraction strength multiplier (0.2 to 2.0, default 1.0)"
        },
        colorNodes: {
          type: "boolean",
          description: "Tint member nodes with the group color (default true)"
        },
        frameX: {
          type: "number",
          description: "Miro Frame top-left X coordinate in graph world space"
        },
        frameY: {
          type: "number",
          description: "Miro Frame top-left Y coordinate in graph world space"
        },
        frameW: {
          type: "number",
          description: "Miro Frame width in graph world space (min 210)"
        },
        frameH: {
          type: "number",
          description: "Miro Frame height in graph world space (min 165)"
        },
        frameSubLayout: {
          type: "string",
          enum: ["grid", "column", "row", "circle", "freeform"],
          description: "How cards are arranged inside a 'miro-pinned' frame (default 'grid')"
        }
      },
      required: ["name"]
    },
    annotations: { title: "Create Magnetic Group or Miro Frame" }
  },
  {
    name: "graph_update_group",
    description: "Update an existing Magnetic Group or Miro Frame (by groupId or name): rename, recolor, edit query, switch between 'organic' / 'miro-free' / 'miro-pinned', move or resize the Miro Frame (frameX, frameY, frameW, frameH), or re-tidy cards ('grid' | 'column' | 'row' | 'circle').",
    inputSchema: {
      type: "object",
      properties: {
        groupId: {
          type: "string",
          description: "Group ID or exact group name"
        },
        name: { type: "string" },
        color: { type: "string" },
        enabled: { type: "boolean" },
        query: { type: "string" },
        strength: { type: "number" },
        colorNodes: { type: "boolean" },
        mode: {
          type: "string",
          enum: ["organic", "miro-free", "miro-pinned"]
        },
        frameX: { type: "number" },
        frameY: { type: "number" },
        frameW: { type: "number" },
        frameH: { type: "number" },
        frameSubLayout: {
          type: "string",
          enum: ["grid", "column", "row", "circle", "freeform"]
        },
        anchorMode: { type: "string", enum: ["auto", "manual"] },
        anchorX: { type: "number" },
        anchorY: { type: "number" }
      },
      required: ["groupId"]
    },
    annotations: { title: "Update Group or Miro Frame" }
  },
  {
    name: "graph_delete_group",
    description: "Delete a Magnetic Group or Miro Frame (by ID or name). Any nodes hard-pinned by that Miro Frame are immediately released back into the dynamic graph.",
    inputSchema: {
      type: "object",
      properties: {
        groupId: {
          type: "string",
          description: "Group ID or exact group name to delete"
        }
      },
      required: ["groupId"]
    },
    annotations: { title: "Delete Group or Miro Frame", destructiveHint: true }
  },
  {
    name: "graph_manage_group_nodes",
    description: "Add, remove, or exclude specific notes in a Magnetic Group or Miro Frame.",
    inputSchema: {
      type: "object",
      properties: {
        groupId: {
          type: "string",
          description: "Group ID or exact group name"
        },
        addNodeIds: {
          type: "array",
          items: { type: "string" },
          description: "Note paths to add to the group"
        },
        removeNodeIds: {
          type: "array",
          items: { type: "string" },
          description: "Note paths to remove from manual selection"
        },
        excludeNodeIds: {
          type: "array",
          items: { type: "string" },
          description: "Note paths to explicitly exclude even if matched by query"
        }
      },
      required: ["groupId"]
    },
    annotations: { title: "Add/Remove Notes in Group" }
  },
  {
    name: "graph_pin_nodes",
    description: "Hard-pin individual nodes on the Graph View board (like sticky notes on Miro) while keeping all other nodes and links live and dynamic. Supports explicit {id, x, y} coordinates OR auto-arranging a list of nodeIds into a 'grid' / 'row' / 'column' / 'circle' around (centerX, centerY).",
    inputSchema: {
      type: "object",
      properties: {
        pins: {
          type: "array",
          description: "Explicit coordinates for specific nodes",
          items: {
            type: "object",
            properties: {
              id: { type: "string" },
              x: { type: "number" },
              y: { type: "number" }
            },
            required: ["id", "x", "y"]
          }
        },
        nodeIds: {
          type: "array",
          items: { type: "string" },
          description: "Alternatively, pass nodeIds to pin in a neat pattern or at their current positions"
        },
        pattern: {
          type: "string",
          enum: ["current", "grid", "row", "column", "circle"],
          description: "Arrangement pattern when nodeIds is provided (default 'grid')"
        },
        centerX: { type: "number", description: "Center X for pattern (default 0)" },
        centerY: { type: "number", description: "Center Y for pattern (default 0)" },
        spacing: { type: "number", description: "Spacing between pinned nodes (default 95)" }
      }
    },
    annotations: { title: "Hard-Pin Individual Nodes on Board" }
  },
  {
    name: "graph_unpin_nodes",
    description: "Unpin specific individually-pinned nodes (or all individually-pinned nodes) so they become free-floating dynamic nodes again.",
    inputSchema: {
      type: "object",
      properties: {
        nodeIds: {
          type: "array",
          items: { type: "string" },
          description: "Node IDs to unpin"
        },
        unpinAll: {
          type: "boolean",
          description: "Set true to unpin all individually-pinned nodes"
        }
      }
    },
    annotations: { title: "Unpin Individual Nodes" }
  },
  {
    name: "graph_arrange_miro_board",
    description: "High-level AI Board Architect tool: arrange multiple groups (existing or newly defined) into a clean, non-overlapping Miro Board on the Graph View ('columns' = Kanban columns, 'quadrants' = 2x2 matrix, 'timeline' = horizontal row, 'ring' = Miro frames arranged around a central dynamic hub cluster!).",
    inputSchema: {
      type: "object",
      properties: {
        boardStyle: {
          type: "string",
          enum: ["columns", "quadrants", "timeline", "ring"],
          description: "'columns' = side-by-side Kanban boards; 'quadrants' = 2x2 matrix; 'timeline' = horizontal sequence; 'ring' = frames surrounding the live central dynamic cluster"
        },
        items: {
          type: "array",
          description: "Frames to arrange. Omit items to automatically arrange all currently enabled groups!",
          items: {
            type: "object",
            properties: {
              groupIdOrName: {
                type: "string",
                description: "Existing group ID or name (omit to create a new frame)"
              },
              name: { type: "string", description: "Frame title" },
              color: { type: "string", description: "Hex color" },
              query: { type: "string", description: "Obsidian query filter" },
              nodeIds: {
                type: "array",
                items: { type: "string" },
                description: "Manual note IDs"
              },
              mode: {
                type: "string",
                enum: ["miro-pinned", "miro-free"],
                description: "Default 'miro-pinned'"
              },
              subLayout: {
                type: "string",
                enum: ["grid", "column", "row", "circle"]
              }
            }
          }
        },
        centerX: {
          type: "number",
          description: "Board center X in graph world coordinates (default 0)"
        },
        centerY: {
          type: "number",
          description: "Board center Y in graph world coordinates (default 0)"
        },
        gap: {
          type: "number",
          description: "Gap between Miro Frames in world units (default 90)"
        },
        showBoardGrid: {
          type: "boolean",
          description: "Turn on the Miro dot-grid background (default true)"
        }
      }
    },
    annotations: { title: "Arrange Multi-Frame Miro Board" }
  },
  {
    name: "graph_configure_physics",
    description: "Configure global Graph Magnetic Groups & Miro-Board physics and visual settings (attractionStrength, clusterTether, groupCompactness, showBoardGrid, repelOutsidersFromFrames, showGroupZones, showGroupLabels).",
    inputSchema: {
      type: "object",
      properties: {
        enabled: { type: "boolean" },
        attractionStrength: {
          type: "number",
          description: "0.0 to 1.0 (default 0.62)"
        },
        clusterTether: {
          type: "number",
          description: "0.0 to 1.0 anti-tear tether to main cluster (default 0.78)"
        },
        groupCompactness: {
          type: "number",
          description: "0.2 to 1.0 (default 0.58)"
        },
        syncNativeColorGroups: { type: "boolean" },
        showGroupZones: { type: "boolean" },
        showGroupLabels: { type: "boolean" },
        showBoardGrid: { type: "boolean" },
        repelOutsidersFromFrames: { type: "boolean" },
        zoneOpacity: { type: "number", description: "0.04 to 0.35" }
      }
    },
    annotations: { title: "Configure Graph Physics & Board Visuals" }
  },
  {
    name: "graph_reset_layout",
    description: "Reheat/relax the dynamic graph simulation, optionally converting all Miro Frames back to soft organic groups and/or unpinning all individual nodes.",
    inputSchema: {
      type: "object",
      properties: {
        convertAllFramesToOrganic: {
          type: "boolean",
          description: "Switch all Miro Frames back to 'organic' cluster lobes"
        },
        resetManualAnchors: {
          type: "boolean",
          description: "Reset manual organic group anchors back to auto"
        },
        unpinAllIndividualNodes: {
          type: "boolean",
          description: "Release all individually-pinned nodes"
        }
      }
    },
    annotations: { title: "Reset / Reheat Graph Layout" }
  }
];
var ObsidianMcpEngine = class {
  constructor(adapter) {
    this.stats = {
      totalRequests: 0,
      totalToolCalls: 0,
      lastToolName: "",
      lastCallTimestamp: 0
    };
    this.adapter = adapter;
  }
  async handleJsonRpcMessage(msg) {
    this.stats.totalRequests++;
    if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
      return {
        jsonrpc: "2.0",
        id: msg?.id ?? null,
        error: { code: -32600, message: "Invalid JSON-RPC 2.0 request" }
      };
    }
    const isNotification = msg.id === void 0;
    try {
      const result = await this.dispatchMethod(msg.method, msg.params || {});
      if (isNotification) return null;
      return {
        jsonrpc: "2.0",
        id: msg.id ?? null,
        result
      };
    } catch (err) {
      if (isNotification) return null;
      const code = typeof err?.rpcCode === "number" ? err.rpcCode : -32603;
      const message = err instanceof Error ? err.message : String(err || "Internal error");
      return {
        jsonrpc: "2.0",
        id: msg.id ?? null,
        error: { code, message }
      };
    }
  }
  async dispatchMethod(method, params) {
    switch (method) {
      case "initialize": {
        const clientProto = typeof params.protocolVersion === "string" ? params.protocolVersion : "2025-03-26";
        const negotiated = SUPPORTED_PROTOCOL_VERSIONS.includes(clientProto) ? clientProto : SUPPORTED_PROTOCOL_VERSIONS[0];
        return {
          protocolVersion: negotiated,
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
            prompts: { listChanged: false }
          },
          serverInfo: {
            name: "obsidian-magnetic-miro-mcp",
            version: "2.0.0"
          },
          instructions: "Obsidian Vault + Graph Magnetic Groups & Miro-Board MCP Server. You can read/search/create/link markdown notes AND organize Obsidian's live Graph View using three group modes: 'organic' (soft magnetic lobe attached to the main cluster without tearing), 'miro-free' (hard-fixed rectangular Miro Frame with live dynamic nodes inside), and 'miro-pinned' (hard-fixed Miro Board Frame locking cards in a clean grid/column/row/circle while surrounding notes remain a live dynamic graph). Use graph_arrange_miro_board to lay out multi-frame Kanban/Quadrant/Ring boards in one call."
        };
      }
      case "notifications/initialized":
      case "notifications/cancelled":
      case "notifications/roots/list_changed":
        return {};
      case "ping":
        return {};
      case "tools/list":
        return { tools: MCP_TOOLS };
      case "tools/call": {
        const name = String(params.name || "");
        const args = params.arguments && typeof params.arguments === "object" ? params.arguments : {};
        this.stats.totalToolCalls++;
        this.stats.lastToolName = name;
        this.stats.lastCallTimestamp = Date.now();
        try {
          const data = await this.executeTool(name, args);
          return {
            content: [
              {
                type: "text",
                text: typeof data === "string" ? data : JSON.stringify(data, null, 2)
              }
            ],
            isError: false
          };
        } catch (toolErr) {
          const errMsg = toolErr instanceof Error ? toolErr.message : String(toolErr);
          return {
            content: [{ type: "text", text: `Error: ${errMsg}` }],
            isError: true
          };
        }
      }
      case "resources/list":
        return {
          resources: [
            {
              uri: "obsidian://vault/summary",
              name: "Obsidian Vault & Graph Summary",
              description: "Overview of vault notes, tags, folders, and active graph groups/frames",
              mimeType: "application/json"
            },
            {
              uri: "obsidian://graph/groups",
              name: "Graph Magnetic Groups & Miro Frames",
              description: "Current configuration and matched notes of all groups and Miro frames",
              mimeType: "application/json"
            },
            {
              uri: "obsidian://graph/topology",
              name: "Vault Link Graph Topology",
              description: "Nodes, links, hubs, orphans, and live coordinates",
              mimeType: "application/json"
            }
          ]
        };
      case "resources/read": {
        const uri = String(params.uri || "");
        let payload;
        if (uri === "obsidian://vault/summary") {
          payload = await this.adapter.getVaultInfo();
        } else if (uri === "obsidian://graph/groups") {
          payload = await this.executeTool("graph_list_groups", {});
        } else if (uri === "obsidian://graph/topology") {
          payload = await this.adapter.getGraphTopology();
        } else {
          throw Object.assign(new Error(`Unknown resource URI: ${uri}`), {
            rpcCode: -32602
          });
        }
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(payload, null, 2)
            }
          ]
        };
      }
      case "prompts/list":
        return {
          prompts: [
            {
              name: "organize-miro-graph",
              description: "Inspect the Obsidian vault and organize key topics into clean Miro-Board Frames around the live dynamic graph",
              arguments: [
                {
                  name: "style",
                  description: "Board layout style: columns, quadrants, timeline, or ring",
                  required: false
                }
              ]
            }
          ]
        };
      case "prompts/get": {
        const pName = String(params.name || "");
        if (pName !== "organize-miro-graph") {
          throw Object.assign(new Error(`Unknown prompt: ${pName}`), {
            rpcCode: -32602
          });
        }
        const style = String(
          params.arguments?.style || "ring"
        );
        return {
          description: "Organize Obsidian Graph View into Miro Frames + dynamic cluster",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text: `Inspect my Obsidian vault using vault_info and list_notes, identify the main thematic clusters, and arrange them onto the Graph View using graph_arrange_miro_board with boardStyle="${style}" while leaving general/hub notes free and dynamic so links flow naturally between frames.`
              }
            }
          ]
        };
      }
      default:
        throw Object.assign(new Error(`Method not found: ${method}`), {
          rpcCode: -32601
        });
    }
  }
  /* =========================================================================
   * Tool Implementations
   * ========================================================================= */
  async executeTool(name, args) {
    switch (name) {
      case "vault_info":
        return await this.adapter.getVaultInfo();
      case "list_notes":
        return await this.adapter.listNotes({
          folder: optStr(args.folder),
          tag: optStr(args.tag),
          query: optStr(args.query),
          limit: optNum(args.limit)
        });
      case "read_note": {
        const p = reqStr(args.path, "path");
        return await this.adapter.readNote(p);
      }
      case "create_or_update_note": {
        const path = reqStr(args.path, "path");
        const content = typeof args.content === "string" ? args.content : "";
        const mode = optStr(args.mode) || "overwrite";
        return await this.adapter.writeNote({ path, content, mode });
      }
      case "append_to_note": {
        const path = reqStr(args.path, "path");
        const content = reqStr(args.content, "content");
        return await this.adapter.writeNote({
          path,
          content,
          mode: "append"
        });
      }
      case "delete_note": {
        const path = reqStr(args.path, "path");
        return await this.adapter.deleteNote(path);
      }
      case "move_or_rename_note": {
        const fromPath = reqStr(args.fromPath, "fromPath");
        const toPath = reqStr(args.toPath, "toPath");
        return await this.adapter.moveNote(fromPath, toPath);
      }
      case "search_vault": {
        const query = reqStr(args.query, "query");
        return await this.adapter.searchVault({
          query,
          limit: optNum(args.limit)
        });
      }
      case "get_graph_topology": {
        const snap = await this.adapter.getGraphTopology();
        return {
          isLiveGraphOpen: snap.isLiveGraphOpen,
          totalNotes: snap.totalNotes,
          totalLinks: snap.totalLinks,
          topHubs: snap.topHubs,
          orphanNotes: snap.orphanNotes,
          nodes: args.includeNodes === false ? void 0 : snap.nodes,
          links: args.includeLinks === false ? void 0 : snap.links
        };
      }
      case "open_note_or_graph": {
        return await this.adapter.focusGraphTarget({
          openGraphIfClosed: args.openGraphIfClosed !== false,
          groupId: optStr(args.groupId),
          notePath: optStr(args.notePath)
        });
      }
      case "graph_list_groups": {
        const settings = await this.adapter.getPluginSettings();
        const enriched = [];
        for (const g of settings.groups) {
          const matched = await this.adapter.resolveMatchingNodeIds(g);
          enriched.push({
            ...g,
            mode: g.mode || "organic",
            matchedCount: matched.length,
            matchedNodeIds: matched
          });
        }
        return {
          enabled: settings.enabled,
          physics: {
            attractionStrength: settings.attractionStrength,
            clusterTether: settings.clusterTether,
            groupCompactness: settings.groupCompactness,
            showBoardGrid: settings.showBoardGrid,
            repelOutsidersFromFrames: settings.repelOutsidersFromFrames
          },
          groups: enriched,
          pinnedNodes: settings.pinnedNodes || {}
        };
      }
      case "graph_create_group": {
        const settings = await this.adapter.getPluginSettings();
        const title = reqStr(args.name, "name");
        const mode = validMode(args.mode) || "organic";
        const subLayout = validSubLayout(args.frameSubLayout) || "grid";
        const color = optStr(args.color) || DEFAULT_GROUP_COLORS[settings.groups.length % DEFAULT_GROUP_COLORS.length];
        const query = optStr(args.query) || "";
        const nodeIds = strArray(args.nodeIds);
        const matchedIds = await this.adapter.resolveMatchingNodeIds({
          query,
          nodeIds,
          excludedNodeIds: []
        });
        let frameX = optNum(args.frameX);
        let frameY = optNum(args.frameY);
        let frameW = optNum(args.frameW);
        let frameH = optNum(args.frameH);
        if ((mode === "miro-pinned" || mode === "miro-free") && (frameX === void 0 || frameY === void 0 || frameW === void 0 || frameH === void 0)) {
          const topo = await this.adapter.getGraphTopology();
          const pts = topo.nodes.filter(
            (n) => matchedIds.includes(n.id) && typeof n.x === "number" && typeof n.y === "number"
          ).map((n) => ({ id: n.id, x: n.x, y: n.y }));
          const def = computeDefaultMiroFrame(
            pts,
            { x: frameX ?? 0, y: frameY ?? 0 },
            subLayout
          );
          frameX = frameX ?? def.frameX;
          frameY = frameY ?? def.frameY;
          frameW = frameW ?? def.frameW;
          frameH = frameH ?? def.frameH;
        }
        const created = {
          id: createGroupId(),
          name: title,
          color,
          enabled: true,
          query,
          nodeIds,
          excludedNodeIds: [],
          strength: optNum(args.strength) ?? 1,
          colorNodes: args.colorNodes !== false,
          mode,
          anchorMode: "auto",
          frameX,
          frameY,
          frameW,
          frameH,
          frameSubLayout: subLayout
        };
        await this.adapter.saveGroups([...settings.groups, created], true);
        return {
          created,
          matchedCount: matchedIds.length,
          matchedNodeIds: matchedIds
        };
      }
      case "graph_update_group": {
        const settings = await this.adapter.getPluginSettings();
        const key = reqStr(args.groupId, "groupId");
        const target = findGroupByIdOrName(settings.groups, key);
        if (!target) {
          throw new Error(`Group not found: "${key}"`);
        }
        const nextMode = validMode(args.mode) ?? target.mode ?? "organic";
        const nextSub = validSubLayout(args.frameSubLayout) ?? target.frameSubLayout ?? "grid";
        const updated = {
          ...target,
          name: optStr(args.name) ?? target.name,
          color: optStr(args.color) ?? target.color,
          enabled: typeof args.enabled === "boolean" ? args.enabled : target.enabled,
          query: typeof args.query === "string" ? args.query : target.query,
          strength: optNum(args.strength) ?? target.strength,
          colorNodes: typeof args.colorNodes === "boolean" ? args.colorNodes : target.colorNodes,
          mode: nextMode,
          frameSubLayout: nextSub,
          frameX: optNum(args.frameX) ?? target.frameX,
          frameY: optNum(args.frameY) ?? target.frameY,
          frameW: optNum(args.frameW) ?? target.frameW,
          frameH: optNum(args.frameH) ?? target.frameH,
          anchorMode: args.anchorMode === "auto" || args.anchorMode === "manual" ? args.anchorMode : target.anchorMode,
          anchorX: optNum(args.anchorX) ?? target.anchorX,
          anchorY: optNum(args.anchorY) ?? target.anchorY
        };
        if ((updated.mode === "miro-pinned" || updated.mode === "miro-free") && (updated.frameX === void 0 || updated.frameY === void 0 || updated.frameW === void 0 || updated.frameH === void 0)) {
          const matchedIds = await this.adapter.resolveMatchingNodeIds(updated);
          const topo = await this.adapter.getGraphTopology();
          const pts = topo.nodes.filter(
            (n) => matchedIds.includes(n.id) && typeof n.x === "number" && typeof n.y === "number"
          ).map((n) => ({ id: n.id, x: n.x, y: n.y }));
          const def = computeDefaultMiroFrame(
            pts,
            { x: 0, y: 0 },
            updated.frameSubLayout
          );
          updated.frameX = updated.frameX ?? def.frameX;
          updated.frameY = updated.frameY ?? def.frameY;
          updated.frameW = updated.frameW ?? def.frameW;
          updated.frameH = updated.frameH ?? def.frameH;
        }
        if (args.frameSubLayout && args.frameSubLayout !== "freeform") {
          updated.customOffsets = {};
        }
        const nextGroups = settings.groups.map(
          (g) => g.id === target.id ? updated : g
        );
        await this.adapter.saveGroups(nextGroups, true);
        const matched = await this.adapter.resolveMatchingNodeIds(updated);
        return {
          updated,
          matchedCount: matched.length,
          matchedNodeIds: matched
        };
      }
      case "graph_delete_group": {
        const settings = await this.adapter.getPluginSettings();
        const key = reqStr(args.groupId, "groupId");
        const target = findGroupByIdOrName(settings.groups, key);
        if (!target) {
          throw new Error(`Group not found: "${key}"`);
        }
        const nextGroups = settings.groups.filter((g) => g.id !== target.id);
        await this.adapter.saveGroups(nextGroups, true);
        return { deletedGroupId: target.id, deletedName: target.name };
      }
      case "graph_manage_group_nodes": {
        const settings = await this.adapter.getPluginSettings();
        const key = reqStr(args.groupId, "groupId");
        const target = findGroupByIdOrName(settings.groups, key);
        if (!target) {
          throw new Error(`Group not found: "${key}"`);
        }
        const toAdd = strArray(args.addNodeIds);
        const toRemove = new Set(strArray(args.removeNodeIds));
        const toExclude = strArray(args.excludeNodeIds);
        const manualSet = new Set(target.nodeIds);
        for (const id of toAdd) manualSet.add(id);
        for (const id of toRemove) manualSet.delete(id);
        const exclSet = new Set(target.excludedNodeIds || []);
        for (const id of toAdd) exclSet.delete(id);
        for (const id of toExclude) {
          exclSet.add(id);
          manualSet.delete(id);
        }
        const updated = {
          ...target,
          nodeIds: Array.from(manualSet),
          excludedNodeIds: Array.from(exclSet)
        };
        await this.adapter.saveGroups(
          settings.groups.map((g) => g.id === target.id ? updated : g),
          true
        );
        const matched = await this.adapter.resolveMatchingNodeIds(updated);
        return {
          groupId: updated.id,
          name: updated.name,
          matchedCount: matched.length,
          matchedNodeIds: matched
        };
      }
      case "graph_pin_nodes": {
        const settings = await this.adapter.getPluginSettings();
        const nextPins = { ...settings.pinnedNodes || {} };
        if (Array.isArray(args.pins)) {
          for (const item of args.pins) {
            if (item && typeof item === "object" && typeof item.id === "string" && typeof item.x === "number" && typeof item.y === "number") {
              const p = item;
              nextPins[p.id] = { x: p.x, y: p.y };
            }
          }
        }
        const nodeIds = strArray(args.nodeIds);
        if (nodeIds.length > 0) {
          const pattern = optStr(args.pattern) || "grid";
          const cx = optNum(args.centerX) ?? 0;
          const cy = optNum(args.centerY) ?? 0;
          const spacing = Math.max(40, optNum(args.spacing) ?? 95);
          const topo = await this.adapter.getGraphTopology();
          const posById = new Map(
            topo.nodes.map((n2) => [n2.id, { x: n2.x ?? cx, y: n2.y ?? cy }])
          );
          const n = nodeIds.length;
          const cols = pattern === "column" ? 1 : pattern === "row" ? n : Math.max(1, Math.ceil(Math.sqrt(n)));
          const rows = Math.max(1, Math.ceil(n / cols));
          nodeIds.forEach((id, i) => {
            if (pattern === "current") {
              const cur = posById.get(id) || { x: cx, y: cy };
              nextPins[id] = { x: cur.x, y: cur.y };
            } else if (pattern === "circle") {
              const r = n <= 1 ? 0 : Math.max(spacing * 0.8, n * spacing / (2 * Math.PI));
              const ang = -Math.PI / 2 + 2 * Math.PI * i / Math.max(1, n);
              nextPins[id] = {
                x: Math.round((cx + Math.cos(ang) * r) * 10) / 10,
                y: Math.round((cy + Math.sin(ang) * r) * 10) / 10
              };
            } else {
              const c = i % cols;
              const r = Math.floor(i / cols);
              nextPins[id] = {
                x: Math.round((cx + (c - (cols - 1) / 2) * spacing) * 10) / 10,
                y: Math.round((cy + (r - (rows - 1) / 2) * spacing) * 10) / 10
              };
            }
          });
        }
        const updated = await this.adapter.updatePluginSettings(
          { pinnedNodes: nextPins },
          true
        );
        return {
          pinnedCount: Object.keys(updated.pinnedNodes).length,
          pinnedNodes: updated.pinnedNodes
        };
      }
      case "graph_unpin_nodes": {
        const settings = await this.adapter.getPluginSettings();
        if (args.unpinAll === true) {
          await this.adapter.updatePluginSettings({ pinnedNodes: {} }, true);
          return { pinnedCount: 0, pinnedNodes: {} };
        }
        const ids = strArray(args.nodeIds);
        const nextPins = { ...settings.pinnedNodes || {} };
        for (const id of ids) delete nextPins[id];
        const updated = await this.adapter.updatePluginSettings(
          { pinnedNodes: nextPins },
          true
        );
        return {
          pinnedCount: Object.keys(updated.pinnedNodes).length,
          pinnedNodes: updated.pinnedNodes
        };
      }
      case "graph_arrange_miro_board": {
        return await this.arrangeMiroBoard(args);
      }
      case "graph_configure_physics": {
        const patch = {};
        const boolKeys = [
          "enabled",
          "syncNativeColorGroups",
          "showGroupZones",
          "showGroupLabels",
          "showBoardGrid",
          "repelOutsidersFromFrames"
        ];
        for (const k of boolKeys) {
          if (typeof args[k] === "boolean") patch[k] = args[k];
        }
        const numKeys = [
          "attractionStrength",
          "clusterTether",
          "groupCompactness",
          "zoneOpacity"
        ];
        for (const k of numKeys) {
          if (typeof args[k] === "number" && Number.isFinite(args[k])) {
            patch[k] = args[k];
          }
        }
        const updated = await this.adapter.updatePluginSettings(patch, true);
        return {
          enabled: updated.enabled,
          attractionStrength: updated.attractionStrength,
          clusterTether: updated.clusterTether,
          groupCompactness: updated.groupCompactness,
          syncNativeColorGroups: updated.syncNativeColorGroups,
          showGroupZones: updated.showGroupZones,
          showGroupLabels: updated.showGroupLabels,
          showBoardGrid: updated.showBoardGrid,
          repelOutsidersFromFrames: updated.repelOutsidersFromFrames,
          zoneOpacity: updated.zoneOpacity
        };
      }
      case "graph_reset_layout": {
        const settings = await this.adapter.getPluginSettings();
        let nextGroups = settings.groups.map((g) => ({ ...g }));
        if (args.convertAllFramesToOrganic === true) {
          nextGroups = nextGroups.map((g) => ({
            ...g,
            mode: "organic"
          }));
        }
        if (args.resetManualAnchors === true) {
          nextGroups = nextGroups.map((g) => ({
            ...g,
            anchorMode: "auto",
            anchorX: void 0,
            anchorY: void 0
          }));
        }
        await this.adapter.saveGroups(nextGroups, true);
        if (args.unpinAllIndividualNodes === true) {
          await this.adapter.updatePluginSettings({ pinnedNodes: {} }, true);
        } else {
          await this.adapter.updatePluginSettings({}, true);
        }
        return {
          status: "reheated",
          groupsCount: nextGroups.length
        };
      }
      default:
        throw new Error(`Unknown tool: "${name}"`);
    }
  }
  /**
   * Multi-frame Miro Board layout architect ("columns", "quadrants", "timeline", "ring").
   */
  async arrangeMiroBoard(args) {
    const settings = await this.adapter.getPluginSettings();
    const style = optStr(args.boardStyle) || "columns";
    const centerX = optNum(args.centerX) ?? 0;
    const centerY = optNum(args.centerY) ?? 0;
    const gap = Math.max(40, optNum(args.gap) ?? 95);
    const groupsCopy = settings.groups.map((g) => ({ ...g }));
    const rawItems = Array.isArray(args.items) ? args.items : [];
    const targetGroups = [];
    if (rawItems.length === 0) {
      for (const g of groupsCopy) {
        if (g.enabled) targetGroups.push(g);
      }
    } else {
      for (let i = 0; i < rawItems.length; i++) {
        const spec = rawItems[i];
        let grp = spec.groupIdOrName ? findGroupByIdOrName(groupsCopy, spec.groupIdOrName) : void 0;
        if (!grp && spec.name) {
          grp = findGroupByIdOrName(groupsCopy, spec.name);
        }
        if (grp) {
          if (spec.name) grp.name = spec.name;
          if (spec.color) grp.color = spec.color;
          if (typeof spec.query === "string") grp.query = spec.query;
          if (Array.isArray(spec.nodeIds)) grp.nodeIds = spec.nodeIds;
          grp.enabled = true;
          grp.mode = validMode(spec.mode) || "miro-pinned";
          grp.frameSubLayout = validSubLayout(spec.subLayout) || (style === "columns" ? "column" : "grid");
          grp.customOffsets = {};
          targetGroups.push(grp);
        } else {
          const created = {
            id: createGroupId(),
            name: spec.name || `Miro ${groupsCopy.length + 1}`,
            color: spec.color || DEFAULT_GROUP_COLORS[groupsCopy.length % DEFAULT_GROUP_COLORS.length],
            enabled: true,
            query: spec.query || "",
            nodeIds: Array.isArray(spec.nodeIds) ? spec.nodeIds : [],
            excludedNodeIds: [],
            strength: 1,
            colorNodes: true,
            mode: validMode(spec.mode) || "miro-pinned",
            anchorMode: "auto",
            frameSubLayout: validSubLayout(spec.subLayout) || (style === "columns" ? "column" : "grid")
          };
          groupsCopy.push(created);
          targetGroups.push(created);
        }
      }
    }
    const sizedFrames = [];
    for (const grp of targetGroups) {
      if (grp.mode === "organic") grp.mode = "miro-pinned";
      if (!grp.frameSubLayout || grp.frameSubLayout === "freeform") {
        grp.frameSubLayout = style === "columns" ? "column" : "grid";
      }
      grp.customOffsets = {};
      const matched = await this.adapter.resolveMatchingNodeIds(grp);
      const count = Math.max(1, matched.length);
      let w;
      let h;
      if (grp.frameSubLayout === "column") {
        w = 240;
        h = Math.max(
          220,
          MIRO_HEADER_HEIGHT + 60 + Math.max(0, count - 1) * 56
        );
      } else {
        const cols = Math.max(2, Math.ceil(Math.sqrt(count * 1.2)));
        const rows = Math.max(1, Math.ceil(count / cols));
        w = Math.max(MIRO_MIN_WIDTH, cols * 105 + 60);
        h = Math.max(
          MIRO_MIN_HEIGHT,
          MIRO_HEADER_HEIGHT + rows * 68 + 56
        );
      }
      sizedFrames.push({ grp, matchedIds: matched, w, h });
    }
    const total = sizedFrames.length;
    if (total > 0) {
      if (style === "columns" || style === "timeline") {
        const totalW = sizedFrames.reduce((s, f) => s + f.w, 0) + gap * (total - 1);
        let cursorX = centerX - totalW / 2;
        const maxH = Math.max(...sizedFrames.map((f) => f.h));
        for (const f of sizedFrames) {
          f.grp.frameX = Math.round(cursorX);
          f.grp.frameY = style === "columns" ? Math.round(centerY - maxH / 2) : Math.round(centerY - f.h / 2);
          f.grp.frameW = Math.round(f.w);
          f.grp.frameH = style === "columns" ? Math.round(maxH) : Math.round(f.h);
          cursorX += f.w + gap;
        }
      } else if (style === "quadrants") {
        const cols = 2;
        const rows = Math.ceil(total / cols);
        const colW = Math.max(...sizedFrames.map((f) => f.w));
        const rowH = Math.max(...sizedFrames.map((f) => f.h));
        const totalW = cols * colW + (cols - 1) * gap;
        const totalH = rows * rowH + (rows - 1) * gap;
        sizedFrames.forEach((f, idx) => {
          const c = idx % cols;
          const r = Math.floor(idx / cols);
          f.grp.frameX = Math.round(centerX - totalW / 2 + c * (colW + gap));
          f.grp.frameY = Math.round(centerY - totalH / 2 + r * (rowH + gap));
          f.grp.frameW = Math.round(colW);
          f.grp.frameH = Math.round(rowH);
        });
      } else {
        const maxDim = Math.max(
          ...sizedFrames.map((f) => Math.hypot(f.w, f.h))
        );
        const ringRadius = Math.max(
          340,
          total * (maxDim * 0.72 + gap) / (2 * Math.PI) + 150
        );
        sizedFrames.forEach((f, idx) => {
          const ang = -Math.PI / 2 + 2 * Math.PI * idx / total;
          const cx = centerX + Math.cos(ang) * ringRadius;
          const cy = centerY + Math.sin(ang) * ringRadius;
          f.grp.frameX = Math.round(cx - f.w / 2);
          f.grp.frameY = Math.round(cy - f.h / 2);
          f.grp.frameW = Math.round(f.w);
          f.grp.frameH = Math.round(f.h);
        });
      }
    }
    await this.adapter.saveGroups(groupsCopy, true);
    if (args.showBoardGrid !== false) {
      await this.adapter.updatePluginSettings({ showBoardGrid: true }, false);
    }
    return {
      boardStyle: style,
      arrangedCount: sizedFrames.length,
      frames: sizedFrames.map((f) => ({
        id: f.grp.id,
        name: f.grp.name,
        mode: f.grp.mode,
        subLayout: f.grp.frameSubLayout,
        frameX: f.grp.frameX,
        frameY: f.grp.frameY,
        frameW: f.grp.frameW,
        frameH: f.grp.frameH,
        matchedCount: f.matchedIds.length
      }))
    };
  }
};
function findGroupByIdOrName(groups, key) {
  const norm = key.trim().toLowerCase();
  return groups.find((g) => g.id === key) || groups.find((g) => g.name.trim().toLowerCase() === norm);
}
function reqStr(v, field) {
  if (typeof v !== "string" || !v.trim()) {
    throw new Error(`Missing required string parameter "${field}"`);
  }
  return v.trim();
}
function optStr(v) {
  return typeof v === "string" && v.trim() ? v.trim() : void 0;
}
function optNum(v) {
  return typeof v === "number" && Number.isFinite(v) ? v : void 0;
}
function strArray(v) {
  if (!Array.isArray(v)) return [];
  return v.filter((x) => typeof x === "string" && x.trim().length > 0);
}
function validMode(v) {
  return v === "organic" || v === "miro-free" || v === "miro-pinned" ? v : void 0;
}
function validSubLayout(v) {
  return v === "grid" || v === "column" || v === "row" || v === "circle" || v === "freeform" ? v : void 0;
}

// src/mcp/mcpHttpServer.ts
async function loadNodeHttp() {
  try {
    const req = globalThis.require || (typeof window !== "undefined" ? window.require : void 0);
    if (typeof req === "function") {
      return req("http");
    }
  } catch {
  }
  try {
    const modName = "node:http";
    return await import(modName);
  } catch {
    return null;
  }
}
var EmbeddedMcpHttpServer = class {
  constructor(engine, opts) {
    this.server = null;
    this.sseSessions = /* @__PURE__ */ new Map();
    this.streamableGetStreams = /* @__PURE__ */ new Set();
    this.listeningPort = null;
    this.engine = engine;
    this.opts = { ...opts };
  }
  updateOptions(patch) {
    this.opts = { ...this.opts, ...patch };
  }
  isRunning() {
    return this.server !== null && this.listeningPort !== null;
  }
  getListeningPort() {
    return this.listeningPort;
  }
  getLocalEndpoints() {
    if (!this.listeningPort) return null;
    const base = `http://${this.opts.host || "127.0.0.1"}:${this.listeningPort}`;
    const tokenSeg = this.opts.requireToken && this.opts.authToken ? `/t/${encodeURIComponent(this.opts.authToken)}` : "";
    return {
      baseUrl: base,
      mcpUrl: `${base}${tokenSeg}/mcp`,
      sseUrl: `${base}${tokenSeg}/sse`
    };
  }
  buildPublicEndpoints(tunnelBaseUrl) {
    const clean = tunnelBaseUrl.replace(/\/+$/, "");
    const tokenSeg = this.opts.requireToken && this.opts.authToken ? `/t/${encodeURIComponent(this.opts.authToken)}` : "";
    return {
      mcpUrl: `${clean}${tokenSeg}/mcp`,
      sseUrl: `${clean}${tokenSeg}/sse`
    };
  }
  async start() {
    if (this.server && this.listeningPort) {
      return this.listeningPort;
    }
    const httpMod = await loadNodeHttp();
    if (!httpMod) {
      throw new Error(
        "Node.js http module is unavailable in this environment (desktop Obsidian or Node.js required)"
      );
    }
    const server = httpMod.createServer((req, res) => {
      void this.handleHttpRequest(req, res);
    });
    server.keepAliveTimeout = 65e3;
    server.headersTimeout = 7e4;
    return await new Promise((resolve, reject) => {
      const onError = (err) => {
        server.removeListener("error", onError);
        reject(err);
      };
      server.once("error", onError);
      server.listen(this.opts.port, this.opts.host || "127.0.0.1", () => {
        server.removeListener("error", onError);
        const addr = server.address();
        const actualPort = addr && typeof addr === "object" ? addr.port : this.opts.port;
        this.server = server;
        this.listeningPort = actualPort;
        resolve(actualPort);
      });
    });
  }
  async stop() {
    for (const sess of this.sseSessions.values()) {
      clearInterval(sess.heartbeat);
      try {
        sess.res.end();
      } catch {
      }
    }
    this.sseSessions.clear();
    for (const s of this.streamableGetStreams) {
      clearInterval(s.heartbeat);
      try {
        s.res.end();
      } catch {
      }
    }
    this.streamableGetStreams.clear();
    if (!this.server) {
      this.listeningPort = null;
      return;
    }
    const srv = this.server;
    this.server = null;
    this.listeningPort = null;
    await new Promise((resolve) => {
      srv.close(() => resolve());
    });
  }
  /* =========================================================================
   * HTTP Request Router (Cloudflare Quick Tunnel + Streamable HTTP + SSE)
   * ========================================================================= */
  setCorsHeaders(res) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, DELETE, OPTIONS"
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Accept, Authorization, X-API-Key, Mcp-Session-Id, MCP-Protocol-Version, Last-Event-ID"
    );
    res.setHeader(
      "Access-Control-Expose-Headers",
      "Mcp-Session-Id, MCP-Protocol-Version"
    );
  }
  async handleHttpRequest(req, res) {
    this.setCorsHeaders(res);
    const method = (req.method || "GET").toUpperCase();
    if (method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    const rawUrl = req.url || "/";
    const parsedUrl = new URL(rawUrl, "http://localhost");
    let pathname = parsedUrl.pathname;
    if (pathname.startsWith("/.well-known/")) {
      res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "oauth_not_configured" }));
      return;
    }
    let pathToken = null;
    let routePrefix = "";
    const pathTokenMatch = pathname.match(/^\/t\/([^/]+)(\/.*)?$/);
    if (pathTokenMatch) {
      pathToken = decodeURIComponent(pathTokenMatch[1]);
      routePrefix = `/t/${pathTokenMatch[1]}`;
      pathname = pathTokenMatch[2] || "/";
    }
    if (method === "GET" && pathname === "/health") {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(
        JSON.stringify({
          ok: true,
          service: "obsidian-magnetic-miro-mcp",
          version: "2.0.0",
          transports: ["streamable-http", "sse"],
          authRequired: Boolean(this.opts.requireToken && this.opts.authToken),
          stats: this.engine.stats
        })
      );
      return;
    }
    if (this.opts.requireToken && this.opts.authToken) {
      const provided = this.extractProvidedToken(req, parsedUrl, pathToken);
      if (provided !== this.opts.authToken) {
        res.writeHead(401, {
          "Content-Type": "application/json; charset=utf-8"
        });
        res.end(
          JSON.stringify({
            jsonrpc: "2.0",
            id: null,
            error: {
              code: -32001,
              message: "Unauthorized: include valid token via /t/<token>/mcp URL path, ?token=<token>, or Authorization: Bearer <token>."
            }
          })
        );
        return;
      }
    }
    if (method === "GET" && pathname === "/sse") {
      this.handleLegacySseConnect(res, routePrefix, parsedUrl);
      return;
    }
    if (method === "POST" && pathname === "/messages") {
      await this.handleLegacySseMessage(req, res, parsedUrl);
      return;
    }
    if (pathname === "/mcp" || pathname === "/") {
      if (method === "POST") {
        await this.handleStreamablePost(req, res);
        return;
      }
      if (method === "DELETE") {
        res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        res.end(JSON.stringify({ closed: true }));
        return;
      }
      if (method === "GET") {
        const accept = String(req.headers["accept"] || "");
        if (accept.includes("text/event-stream")) {
          this.handleStreamableGetSse(req, res);
          return;
        }
        this.handleBrowserStatusPage(req, res, routePrefix);
        return;
      }
    }
    res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
    res.end(
      JSON.stringify({
        error: "Not Found",
        hint: "Connect your MCP client to /mcp (Streamable HTTP) or /sse (HTTP+SSE)."
      })
    );
  }
  extractProvidedToken(req, parsedUrl, pathToken) {
    if (pathToken) return pathToken;
    const queryToken = parsedUrl.searchParams.get("token");
    if (queryToken) return queryToken;
    const authHeader = String(req.headers["authorization"] || "");
    if (authHeader.toLowerCase().startsWith("bearer ")) {
      return authHeader.slice(7).trim();
    }
    const apiKey = req.headers["x-api-key"];
    if (typeof apiKey === "string" && apiKey.trim()) {
      return apiKey.trim();
    }
    return null;
  }
  /* =========================================================================
   * Modern Streamable HTTP Transport (`POST /mcp`, `GET /mcp`)
   * Works both Statefully (`Mcp-Session-Id`) AND Statelessly for Cloud Agents!
   * ========================================================================= */
  async handleStreamablePost(req, res) {
    let rawBody = "";
    try {
      rawBody = await readRequestBody(req);
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(
        JSON.stringify({
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: String(err) }
        })
      );
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(
        JSON.stringify({
          jsonrpc: "2.0",
          id: null,
          error: { code: -32700, message: "Parse error: invalid JSON" }
        })
      );
      return;
    }
    const incomingSessionId = typeof req.headers["mcp-session-id"] === "string" ? req.headers["mcp-session-id"] : generateSessionId();
    res.setHeader("Mcp-Session-Id", incomingSessionId);
    if (Array.isArray(parsed)) {
      const responses = [];
      for (const item of parsed) {
        const out = await this.engine.handleJsonRpcMessage(
          item
        );
        if (out) responses.push(out);
      }
      if (responses.length === 0) {
        res.writeHead(202);
        res.end();
        return;
      }
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify(responses));
      return;
    }
    const single = parsed;
    const response = await this.engine.handleJsonRpcMessage(single);
    if (response === null) {
      res.writeHead(202);
      res.end();
      return;
    }
    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(response));
  }
  handleStreamableGetSse(req, res) {
    const sid = typeof req.headers["mcp-session-id"] === "string" ? req.headers["mcp-session-id"] : generateSessionId();
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
      "Mcp-Session-Id": sid
    });
    res.write(": connected\n\n");
    const heartbeat = setInterval(() => {
      try {
        res.write(": keepalive\n\n");
      } catch {
        clearInterval(heartbeat);
      }
    }, 15e3);
    const entry = { res, heartbeat };
    this.streamableGetStreams.add(entry);
    req.on("close", () => {
      clearInterval(heartbeat);
      this.streamableGetStreams.delete(entry);
    });
  }
  /* =========================================================================
   * Legacy HTTP + SSE Transport (`GET /sse` + `POST /messages`)
   * ========================================================================= */
  handleLegacySseConnect(res, routePrefix, parsedUrl) {
    const sessionId = generateSessionId();
    const queryToken = parsedUrl.searchParams.get("token");
    const tokenParam = !routePrefix && queryToken ? `&token=${encodeURIComponent(queryToken)}` : "";
    const messagesEndpoint = `${routePrefix}/messages?sessionId=${encodeURIComponent(
      sessionId
    )}${tokenParam}`;
    res.writeHead(200, {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    });
    res.write(`event: endpoint
data: ${messagesEndpoint}

`);
    const heartbeat = setInterval(() => {
      try {
        res.write(": keepalive\n\n");
      } catch {
        clearInterval(heartbeat);
      }
    }, 15e3);
    const session = { id: sessionId, res, heartbeat };
    this.sseSessions.set(sessionId, session);
    res.on("close", () => {
      clearInterval(heartbeat);
      this.sseSessions.delete(sessionId);
    });
  }
  async handleLegacySseMessage(req, res, parsedUrl) {
    const sessionId = parsedUrl.searchParams.get("sessionId") || "";
    const session = this.sseSessions.get(sessionId);
    if (!session) {
      res.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "Unknown or expired SSE sessionId" }));
      return;
    }
    let rawBody = "";
    try {
      rawBody = await readRequestBody(req);
    } catch (err) {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: String(err) }));
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(rawBody);
    } catch {
      res.writeHead(400, { "Content-Type": "application/json; charset=utf-8" });
      res.end(JSON.stringify({ error: "Invalid JSON" }));
      return;
    }
    res.writeHead(202, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Accepted");
    const items = Array.isArray(parsed) ? parsed : [parsed];
    for (const item of items) {
      const rpcRes = await this.engine.handleJsonRpcMessage(
        item
      );
      if (rpcRes !== null) {
        try {
          session.res.write(
            `event: message
data: ${JSON.stringify(rpcRes)}

`
          );
        } catch {
        }
      }
    }
  }
  /* =========================================================================
   * Friendly Status Page when User Visits Tunnel URL in Browser
   * ========================================================================= */
  handleBrowserStatusPage(req, res, routePrefix) {
    const proto = String(req.headers["x-forwarded-proto"] || "http");
    const host = String(
      req.headers["x-forwarded-host"] || req.headers["host"] || "127.0.0.1"
    );
    const base = `${proto}://${host}${routePrefix}`;
    const accept = String(req.headers["accept"] || "");
    if (!accept.includes("text/html")) {
      res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      res.end(
        JSON.stringify({
          service: "obsidian-magnetic-miro-mcp",
          status: "online",
          streamableHttpEndpoint: `${base}/mcp`,
          sseEndpoint: `${base}/sse`,
          stats: this.engine.stats
        })
      );
      return;
    }
    const html = `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8" />
  <title>Obsidian Magnetic Groups & Miro \u2014 MCP Server</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #13151d; color: #e8eaf2; max-width: 680px; margin: 48px auto; padding: 0 20px; line-height: 1.55; }
    .card { background: #1c1f2b; border: 1px solid #2e3348; border-radius: 14px; padding: 24px; box-shadow: 0 12px 32px rgba(0,0,0,0.35); }
    .ok { display: inline-block; padding: 3px 10px; border-radius: 999px; background: rgba(6,214,160,0.16); color: #06d6a0; font-size: 12px; font-weight: 600; }
    code { display: block; background: #11131a; border: 1px solid #2b3044; padding: 10px 12px; border-radius: 8px; color: #a892ff; margin: 6px 0 14px; word-break: break-all; }
  </style>
</head>
<body>
  <div class="card">
    <span class="ok">\u25CF MCP-\u0441\u0435\u0440\u0432\u0435\u0440 \u0430\u043A\u0442\u0438\u0432\u0435\u043D</span>
    <h2 style="margin:12px 0 6px;">Obsidian Graph Magnetic Groups & Miro MCP</h2>
    <p style="color:#9ba1b8;margin-top:0;">\u0413\u043E\u0442\u043E\u0432 \u043A \u043F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u044E \u043E\u0431\u043B\u0430\u0447\u043D\u044B\u0445 \u0418\u0418-\u0430\u0433\u0435\u043D\u0442\u043E\u0432 (Claude, ChatGPT, n8n, LangGraph, Cursor \u0438 \u0434\u0440.).</p>
    <strong>Streamable HTTP URL (\u0440\u0435\u043A\u043E\u043C\u0435\u043D\u0434\u0443\u0435\u0442\u0441\u044F):</strong>
    <code>${base}/mcp</code>
    <strong>Legacy SSE URL (\u0434\u043B\u044F \u0441\u0442\u0430\u0440\u044B\u0445 \u043A\u043B\u0438\u0435\u043D\u0442\u043E\u0432):</strong>
    <code>${base}/sse</code>
    <p style="font-size:13px;color:#9ba1b8;margin-bottom:0;">\u0412\u044B\u0437\u043E\u0432\u043E\u0432 \u0438\u043D\u0441\u0442\u0440\u0443\u043C\u0435\u043D\u0442\u043E\u0432 \u0437\u0430 \u0441\u0435\u0441\u0441\u0438\u044E: <b>${this.engine.stats.totalToolCalls}</b></p>
  </div>
</body>
</html>`;
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(html);
  }
};
function readRequestBody(req, maxBytes = 4 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let total = 0;
    req.on("data", (chunk) => {
      total += chunk.length;
      if (total > maxBytes) {
        reject(new Error("Request body too large"));
        req.destroy();
        return;
      }
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString("utf8"));
    });
    req.on("error", reject);
  });
}
function generateSessionId() {
  return "mcp-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

// src/mcp/obsidianLiveAdapter.ts
var import_obsidian5 = require("obsidian");
var ObsidianLiveVaultAdapter = class {
  constructor(host) {
    this.host = host;
  }
  get app() {
    return this.host.app;
  }
  async getVaultInfo() {
    const mdFiles = this.app.vault.getMarkdownFiles();
    const allLoaded = this.app.vault.getAllLoadedFiles ? this.app.vault.getAllLoadedFiles() : mdFiles;
    const folders = allLoaded.filter((f) => f instanceof import_obsidian5.TFolder && f.path !== "/").map((f) => f.path).sort();
    const tagCounts = /* @__PURE__ */ new Map();
    for (const file of mdFiles) {
      for (const tg of this.extractFileTags(file)) {
        tagCounts.set(tg, (tagCounts.get(tg) || 0) + 1);
      }
    }
    const tags = Array.from(tagCounts.entries()).map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count).slice(0, 50);
    const settings = this.host.getSettings();
    const miroCount = settings.groups.filter(
      (g) => g.enabled && (g.mode === "miro-pinned" || g.mode === "miro-free")
    ).length;
    return {
      vaultName: typeof this.app.vault.getName === "function" ? this.app.vault.getName() : "Obsidian Vault",
      adapterMode: "obsidian-live",
      noteCount: mdFiles.length,
      folderCount: folders.length,
      folders,
      tags,
      liveGraphViewsOpen: this.host.getActiveControllers().length,
      activeGroupsCount: settings.groups.filter((g) => g.enabled).length,
      miroFramesCount: miroCount,
      pinnedNodesCount: Object.keys(settings.pinnedNodes || {}).length
    };
  }
  async listNotes(opts) {
    const mdFiles = this.app.vault.getMarkdownFiles();
    const resolvedLinks = this.app.metadataCache.resolvedLinks || {};
    const backlinkCounts = /* @__PURE__ */ new Map();
    for (const targets of Object.values(resolvedLinks)) {
      for (const targetPath of Object.keys(targets || {})) {
        backlinkCounts.set(
          targetPath,
          (backlinkCounts.get(targetPath) || 0) + 1
        );
      }
    }
    const resolver = buildMetadataResolver(this.app);
    const compiled = opts?.query ? parseGroupQuery(opts.query) : null;
    const normFolder = opts?.folder ? opts.folder.replace(/^\/+|\/+$/g, "").toLowerCase() : null;
    const normTag = opts?.tag ? ("#" + opts.tag.replace(/^#+/, "")).toLowerCase() : null;
    const limit = Math.max(1, Math.min(1e3, opts?.limit ?? 100));
    const results = [];
    for (const file of mdFiles) {
      if (normFolder && !file.path.toLowerCase().startsWith(normFolder)) {
        continue;
      }
      const tags = this.extractFileTags(file);
      if (normTag && !tags.some((t2) => t2 === normTag || t2.startsWith(normTag + "/"))) {
        continue;
      }
      if (compiled && !compiled.matches(resolver(file.path, "file"))) {
        continue;
      }
      const outgoing = Object.keys(resolvedLinks[file.path] || {});
      results.push({
        path: file.path,
        title: file.basename,
        folder: file.parent?.path || "",
        tags,
        outgoingLinks: outgoing,
        backlinksCount: backlinkCounts.get(file.path) || 0,
        sizeBytes: file.stat?.size,
        mtimeMs: file.stat?.mtime
      });
      if (results.length >= limit) break;
    }
    return results;
  }
  async readNote(notePath) {
    const file = this.resolveNoteFile(notePath);
    if (!file) {
      throw new Error(`Note not found: "${notePath}"`);
    }
    const content = await this.app.vault.cachedRead(file);
    const cache = this.app.metadataCache.getFileCache(file);
    const fm = {};
    if (cache?.frontmatter) {
      for (const [k, v] of Object.entries(cache.frontmatter)) {
        if (k !== "position") fm[k] = v;
      }
    }
    const resolvedLinks = this.app.metadataCache.resolvedLinks || {};
    const outgoing = Object.keys(resolvedLinks[file.path] || {});
    const backlinks = [];
    for (const [src, targets] of Object.entries(resolvedLinks)) {
      if (targets && targets[file.path]) {
        backlinks.push(src);
      }
    }
    return {
      path: file.path,
      title: file.basename,
      folder: file.parent?.path || "",
      tags: this.extractFileTags(file),
      outgoingLinks: outgoing,
      backlinksCount: backlinks.length,
      backlinks,
      frontmatter: fm,
      content,
      sizeBytes: file.stat?.size,
      mtimeMs: file.stat?.mtime
    };
  }
  async writeNote(opts) {
    const cleanPath = normalizeMdPath(opts.path);
    await this.ensureParentFolders(cleanPath);
    const existing = this.app.vault.getAbstractFileByPath(cleanPath);
    const mode = opts.mode || "overwrite";
    if (existing instanceof import_obsidian5.TFile) {
      if (mode === "create-only") {
        throw new Error(`Note already exists: "${cleanPath}"`);
      }
      let nextContent = opts.content;
      if (mode === "append") {
        const prev = await this.app.vault.read(existing);
        nextContent = prev.endsWith("\n") ? prev + opts.content : prev + "\n" + opts.content;
      } else if (mode === "prepend") {
        const prev = await this.app.vault.read(existing);
        nextContent = opts.content + "\n" + prev;
      }
      await this.app.vault.modify(existing, nextContent);
      return {
        path: cleanPath,
        created: false,
        bytes: nextContent.length
      };
    }
    await this.app.vault.create(cleanPath, opts.content);
    return {
      path: cleanPath,
      created: true,
      bytes: opts.content.length
    };
  }
  async deleteNote(notePath) {
    const file = this.resolveNoteFile(notePath);
    if (!file) {
      throw new Error(`Note not found: "${notePath}"`);
    }
    await this.app.vault.trash(file, true);
    return { deleted: true, path: file.path };
  }
  async moveNote(fromPath, toPath) {
    const file = this.resolveNoteFile(fromPath);
    if (!file) {
      throw new Error(`Source note not found: "${fromPath}"`);
    }
    const cleanTo = normalizeMdPath(toPath);
    await this.ensureParentFolders(cleanTo);
    await this.app.fileManager.renameFile(file, cleanTo);
    return { from: fromPath, to: cleanTo };
  }
  async searchVault(opts) {
    const q = opts.query.trim();
    const limit = Math.max(1, Math.min(200, opts.limit ?? 25));
    const mdFiles = this.app.vault.getMarkdownFiles();
    const resolver = buildMetadataResolver(this.app);
    const hasStructuredSyntax = /(?:^|\s)(?:tag:|path:|file:|\[|-|OR\s)/i.test(q);
    const compiled = hasStructuredSyntax ? parseGroupQuery(q) : null;
    const terms = q.toLowerCase().split(/\s+/).filter((w) => w.length >= 2 && !w.startsWith("tag:") && !w.startsWith("path:"));
    const hits = [];
    for (const file of mdFiles) {
      if (compiled && !compiled.matches(resolver(file.path, "file"))) {
        continue;
      }
      const content = await this.app.vault.cachedRead(file);
      const lower = content.toLowerCase();
      const titleLower = file.basename.toLowerCase();
      let score = compiled ? 5 : 0;
      const snippets = [];
      for (const term of terms) {
        if (titleLower.includes(term)) score += 10;
        let idx = lower.indexOf(term);
        let occ = 0;
        while (idx !== -1 && occ < 3) {
          score += 3;
          if (snippets.length < 2) {
            const start = Math.max(0, idx - 45);
            const end = Math.min(content.length, idx + term.length + 65);
            snippets.push(content.slice(start, end).replace(/\s+/g, " ").trim());
          }
          occ++;
          idx = lower.indexOf(term, idx + term.length);
        }
      }
      if (score > 0) {
        hits.push({
          path: file.path,
          title: file.basename,
          tags: this.extractFileTags(file),
          score,
          snippets
        });
      }
    }
    hits.sort((a, b) => b.score - a.score);
    return hits.slice(0, limit);
  }
  async getGraphTopology() {
    const ctrls = this.host.getActiveControllers();
    const primaryCtrl = ctrls[0];
    const liveSnap = primaryCtrl ? primaryCtrl.getLiveGraphSnapshot() : null;
    const liveById = new Map(
      (liveSnap?.nodes || []).map((n) => [n.id, n])
    );
    const mdFiles = this.app.vault.getMarkdownFiles();
    const resolvedLinks = this.app.metadataCache.resolvedLinks || {};
    const degree = /* @__PURE__ */ new Map();
    const links = [];
    for (const f of mdFiles) degree.set(f.path, 0);
    for (const [src, targets] of Object.entries(resolvedLinks)) {
      for (const dst of Object.keys(targets || {})) {
        links.push({ source: src, target: dst });
        degree.set(src, (degree.get(src) || 0) + 1);
        degree.set(dst, (degree.get(dst) || 0) + 1);
      }
    }
    const settings = this.host.getSettings();
    const nodes = mdFiles.map((f) => {
      const live = liveById.get(f.path);
      return {
        id: f.path,
        label: f.basename,
        type: "file",
        tags: this.extractFileTags(f),
        degree: degree.get(f.path) || 0,
        x: live?.x,
        y: live?.y,
        hardPinned: live?.hardPinned ?? Boolean(settings.pinnedNodes?.[f.path]),
        groups: live?.groups || []
      };
    });
    const sortedByDeg = [...nodes].sort((a, b) => b.degree - a.degree);
    const topHubs = sortedByDeg.slice(0, 12).map((n) => ({ id: n.id, degree: n.degree }));
    const orphanNotes = nodes.filter((n) => n.degree === 0).map((n) => n.id);
    return {
      isLiveGraphOpen: Boolean(primaryCtrl),
      totalNotes: mdFiles.length,
      totalLinks: links.length,
      nodes,
      links,
      topHubs,
      orphanNotes
    };
  }
  async focusGraphTarget(opts) {
    let ctrls = this.host.getActiveControllers();
    if (ctrls.length === 0 && opts.openGraphIfClosed !== false) {
      const leaf = this.app.workspace.getLeaf(false);
      if (leaf && typeof leaf.setViewState === "function") {
        await leaf.setViewState({ type: "graph", active: true });
      }
      ctrls = this.host.getActiveControllers();
    }
    const ctrl = ctrls[0];
    if (!ctrl) {
      return {
        focused: false,
        message: "No Graph View is currently open in Obsidian"
      };
    }
    if (opts.groupId) {
      const snap = ctrl.getLiveGraphSnapshot();
      const zone = snap.zones.find(
        (z) => z.id === opts.groupId || z.name.toLowerCase() === opts.groupId.toLowerCase()
      );
      if (zone) {
        if (zone.frameRect) {
          ctrl.focusWorldRect(
            zone.frameRect.x,
            zone.frameRect.y,
            zone.frameRect.w,
            zone.frameRect.h
          );
        } else {
          ctrl.focusWorldRect(
            zone.centroidX - zone.radius,
            zone.centroidY - zone.radius,
            zone.radius * 2,
            zone.radius * 2
          );
        }
        return {
          focused: true,
          message: `Focused Graph View on "${zone.name}"`
        };
      }
    }
    if (opts.notePath) {
      const file = this.resolveNoteFile(opts.notePath);
      const targetId = file?.path || opts.notePath;
      const snap = ctrl.getLiveGraphSnapshot();
      const node = snap.nodes.find((n) => n.id === targetId);
      if (node) {
        ctrl.focusWorldRect(node.x - 160, node.y - 120, 320, 240);
        return { focused: true, message: `Focused Graph View on "${targetId}"` };
      }
    }
    return { focused: true, message: "Graph View is active" };
  }
  async getPluginSettings() {
    return this.host.getSettings();
  }
  async updatePluginSettings(patch, reheat = true) {
    await this.host.updateSettings(patch, reheat);
    return this.host.getSettings();
  }
  async saveGroups(groups, reheat = true) {
    await this.host.saveGroups(groups, reheat);
    return this.host.getSettings().groups;
  }
  async resolveMatchingNodeIds(group) {
    const resolver = buildMetadataResolver(this.app);
    const compiled = group.query?.trim() ? parseGroupQuery(group.query) : null;
    const manual = new Set(group.nodeIds || []);
    const excluded = new Set(group.excludedNodeIds || []);
    const candidateIds = /* @__PURE__ */ new Set();
    for (const f of this.app.vault.getMarkdownFiles()) {
      candidateIds.add(f.path);
    }
    const ctrls = this.host.getActiveControllers();
    if (ctrls[0]) {
      for (const n of ctrls[0].getLiveGraphSnapshot().nodes) {
        candidateIds.add(n.id);
      }
    }
    const matched = [];
    for (const id of candidateIds) {
      if (excluded.has(id)) continue;
      if (manual.has(id)) {
        matched.push(id);
        continue;
      }
      if (compiled) {
        const type = id.startsWith("#") ? "tag" : "file";
        if (compiled.matches(resolver(id, type))) {
          matched.push(id);
        }
      }
    }
    return matched.sort();
  }
  extractFileTags(file) {
    const cache = this.app.metadataCache.getFileCache(file);
    if (!cache) return [];
    const raw = (0, import_obsidian5.getAllTags)(cache) || [];
    return Array.from(new Set(raw.map((t2) => t2.toLowerCase())));
  }
  resolveNoteFile(notePath) {
    const exact = this.app.vault.getAbstractFileByPath(notePath);
    if (exact instanceof import_obsidian5.TFile) return exact;
    const withMd = normalizeMdPath(notePath);
    const byMd = this.app.vault.getAbstractFileByPath(withMd);
    if (byMd instanceof import_obsidian5.TFile) return byMd;
    const byLink = this.app.metadataCache.getFirstLinkpathDest(
      notePath.replace(/\.md$/i, ""),
      ""
    );
    return byLink instanceof import_obsidian5.TFile ? byLink : null;
  }
  async ensureParentFolders(filePath) {
    const parts = filePath.split("/");
    parts.pop();
    if (parts.length === 0) return;
    let cur = "";
    for (const p of parts) {
      cur = cur ? `${cur}/${p}` : p;
      const existing = this.app.vault.getAbstractFileByPath(cur);
      if (!existing && typeof this.app.vault.createFolder === "function") {
        try {
          await this.app.vault.createFolder(cur);
        } catch {
        }
      }
    }
  }
};
function normalizeMdPath(raw) {
  const clean = raw.replace(/\\/g, "/").replace(/^\/+/, "").trim();
  return /\.md$/i.test(clean) ? clean : `${clean}.md`;
}

// src/styles-inline.ts
var INLINE_PLUGIN_STYLES = `
.gmg-overlay-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}
.gmg-badge-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 4;
}
.gmg-group-badge {
  position: absolute;
  left: 0;
  top: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 3px 9px 3px 7px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--text-normal);
  background: color-mix(in srgb, var(--background-primary) 86%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1.5px solid var(--gmg-color, var(--interactive-accent));
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.22);
  pointer-events: auto;
  cursor: grab;
  user-select: none;
  white-space: nowrap;
  transition: box-shadow 120ms ease, background-color 120ms ease;
  will-change: transform;
}
.gmg-group-badge:hover {
  background: var(--background-primary);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.34);
}
.gmg-group-badge.is-dragging {
  cursor: grabbing;
  box-shadow: 0 6px 22px rgba(0, 0, 0, 0.44);
  z-index: 10;
}
.gmg-group-badge.is-pinned {
  border-style: solid;
  box-shadow: 0 0 0 2px color-mix(in srgb, var(--gmg-color, #7c5cff) 32%, transparent),
    0 3px 12px rgba(0, 0, 0, 0.28);
}
.gmg-miro-header {
  position: absolute;
  left: 0;
  top: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 11.5px;
  font-weight: 600;
  line-height: 1.25;
  color: var(--text-normal);
  background: color-mix(in srgb, var(--background-primary) 92%, var(--gmg-color, #7c5cff) 8%);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1.5px solid var(--gmg-color, var(--interactive-accent));
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.28);
  pointer-events: auto;
  cursor: grab;
  user-select: none;
  white-space: nowrap;
  will-change: transform;
}
.gmg-miro-header.is-dragging {
  cursor: grabbing;
  z-index: 12;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45);
}
.gmg-miro-mode-chip {
  display: inline-flex;
  align-items: center;
  padding: 1px 6px;
  border-radius: 5px;
  font-size: 10px;
  font-weight: 600;
  background: color-mix(in srgb, var(--gmg-color, #7c5cff) 22%, transparent);
  color: var(--text-normal);
  cursor: pointer;
  border: 1px solid color-mix(in srgb, var(--gmg-color, #7c5cff) 45%, transparent);
}
.gmg-miro-mode-chip:hover {
  background: color-mix(in srgb, var(--gmg-color, #7c5cff) 38%, transparent);
}
.gmg-miro-mini-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 18px;
  padding: 0;
  border-radius: 4px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 11px;
  cursor: pointer;
}
.gmg-miro-mini-btn:hover {
  background: var(--background-modifier-hover);
  color: var(--text-normal);
}
.gmg-miro-resizer {
  position: absolute;
  left: 0;
  top: 0;
  width: 18px;
  height: 18px;
  border-radius: 5px;
  border: 1.5px solid var(--gmg-color, #7c5cff);
  background: color-mix(in srgb, var(--background-primary) 90%, var(--gmg-color, #7c5cff) 10%);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  line-height: 1;
  cursor: nwse-resize;
  pointer-events: auto;
  user-select: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
  will-change: transform;
}
.gmg-miro-resizer:hover,
.gmg-miro-resizer.is-resizing {
  background: var(--gmg-color, #7c5cff);
  color: #fff;
}
.gmg-badge-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--gmg-color, var(--interactive-accent));
  flex-shrink: 0;
}
.gmg-badge-count {
  font-size: 10px;
  font-weight: 500;
  color: var(--text-muted);
  padding-left: 2px;
}
.gmg-badge-pin {
  font-size: 10px;
  color: var(--text-accent);
  margin-left: 1px;
}
.gmg-lasso-banner {
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 12;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-on-accent);
  background: var(--interactive-accent);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.3);
  pointer-events: auto;
}
.gmg-lasso-mode {
  cursor: crosshair !important;
}
.gmg-floating-toolbar {
  position: absolute;
  bottom: 14px;
  left: 14px;
  z-index: 6;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--background-secondary) 88%, transparent);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--background-modifier-border);
  box-shadow: 0 3px 14px rgba(0, 0, 0, 0.2);
}
.gmg-tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 9px;
  border-radius: 6px;
  font-size: 11.5px;
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 120ms ease;
}
.gmg-tool-btn:hover {
  color: var(--text-normal);
  background: var(--background-modifier-hover);
}
.gmg-tool-btn.is-active {
  color: var(--text-on-accent);
  background: var(--interactive-accent);
}
.gmg-tool-btn svg {
  width: 14px;
  height: 14px;
}
.gmg-controls-section {
  border-top: 1px solid var(--background-modifier-border);
  padding-top: 6px;
  margin-top: 6px;
}
.gmg-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  cursor: pointer;
  user-select: none;
  border-radius: 6px;
}
.gmg-section-header:hover {
  background: var(--background-modifier-hover);
}
.gmg-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--text-normal);
}
.gmg-section-body {
  padding: 6px 8px 10px 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.gmg-controls-section.is-collapsed .gmg-section-body {
  display: none;
}
.gmg-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
  color: var(--text-normal);
}
.gmg-slider-block {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.gmg-slider-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 11.5px;
  color: var(--text-muted);
}
.gmg-slider-val {
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  color: var(--text-normal);
}
.gmg-slider-block input[type="range"] {
  width: 100%;
}
.gmg-group-list {
  display: flex;
  flex-direction: column;
  gap: 5px;
  margin-top: 2px;
}
.gmg-group-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 5px 7px;
  border-radius: 7px;
  background: var(--background-primary-alt);
  border: 1px solid var(--background-modifier-border);
  font-size: 12px;
}
.gmg-group-item.is-disabled {
  opacity: 0.52;
}
.gmg-color-swatch {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.28);
}
.gmg-group-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}
.gmg-group-name-line {
  display: flex;
  align-items: center;
  gap: 5px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gmg-group-sub {
  font-size: 10.5px;
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.gmg-mini-tag {
  font-size: 9.5px;
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--background-modifier-hover);
  color: var(--text-muted);
  cursor: pointer;
}
.gmg-mini-tag:hover {
  background: var(--interactive-accent);
  color: var(--text-on-accent);
}
.gmg-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border-radius: 5px;
  background: transparent;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
}
.gmg-icon-btn:hover {
  color: var(--text-normal);
  background: var(--background-modifier-hover);
}
.gmg-icon-btn svg {
  width: 13px;
  height: 13px;
}
.gmg-actions-bar {
  display: flex;
  gap: 6px;
  margin-top: 2px;
  flex-wrap: wrap;
}
.gmg-actions-bar button {
  flex: 1;
  font-size: 11.5px;
  padding: 4px 8px;
  cursor: pointer;
}
.gmg-empty-hint {
  font-size: 11.5px;
  line-height: 1.4;
  color: var(--text-muted);
  padding: 6px 4px;
}
.gmg-node-picker {
  max-height: 210px;
  overflow-y: auto;
  border: 1px solid var(--background-modifier-border);
  border-radius: 7px;
  padding: 4px;
  margin-top: 6px;
  background: var(--background-primary-alt);
}
.gmg-node-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 7px;
  border-radius: 5px;
  font-size: 12px;
  cursor: pointer;
}
.gmg-node-option:hover {
  background: var(--background-modifier-hover);
}
.gmg-color-presets {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.gmg-color-preset {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  cursor: pointer;
  border: 2px solid transparent;
  transition: transform 100ms ease;
}
.gmg-color-preset.is-selected {
  border-color: var(--text-normal);
  transform: scale(1.14);
}
.gmg-mcp-card {
  margin-top: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--background-secondary);
  border: 1px solid var(--background-modifier-border);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.gmg-mcp-url-box {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border-radius: 7px;
  background: var(--background-primary);
  border: 1px solid var(--background-modifier-border);
  font-family: var(--font-monospace);
  font-size: 11.5px;
  overflow-x: auto;
  color: var(--text-accent);
}
`;

// src/ui/settingsTab.ts
var import_obsidian6 = require("obsidian");
var MagneticGroupsSettingTab = class extends import_obsidian6.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.unsubscribeTunnel = null;
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    if (this.unsubscribeTunnel) {
      this.unsubscribeTunnel();
      this.unsubscribeTunnel = null;
    }
    const s = this.plugin.settings;
    const strings = t(s.language);
    containerEl.createEl("h2", { text: strings.settingsHeader });
    new import_obsidian6.Setting(containerEl).setName(strings.settingsLang).addDropdown((dd) => {
      dd.addOption("ru", "\u0420\u0443\u0441\u0441\u043A\u0438\u0439").addOption("en", "English").setValue(s.language).onChange(async (val) => {
        await this.plugin.updateSettings(
          { language: val },
          false
        );
        this.display();
      });
    });
    new import_obsidian6.Setting(containerEl).setName(strings.enableMagnetic).addToggle(
      (tg) => tg.setValue(s.enabled).onChange(async (v) => {
        await this.plugin.updateSettings({ enabled: v }, true);
      })
    );
    new import_obsidian6.Setting(containerEl).setName(strings.settingsLocalGraph).setDesc(strings.settingsLocalGraphDesc).addToggle(
      (tg) => tg.setValue(s.enableLocalGraph).onChange(async (v) => {
        await this.plugin.updateSettings({ enableLocalGraph: v }, false);
        this.plugin.refreshAllGraphLeaves();
      })
    );
    new import_obsidian6.Setting(containerEl).setName(strings.syncNativeLabel).setDesc(strings.syncNativeDesc).addToggle(
      (tg) => tg.setValue(s.syncNativeColorGroups).onChange(async (v) => {
        await this.plugin.updateSettings({ syncNativeColorGroups: v }, true);
      })
    );
    new import_obsidian6.Setting(containerEl).setName(strings.attractionLabel).setDesc(strings.attractionDesc).addSlider(
      (sl) => sl.setLimits(0, 1, 0.02).setValue(s.attractionStrength).setDynamicTooltip().onChange(async (v) => {
        await this.plugin.updateSettings({ attractionStrength: v }, true);
      })
    );
    new import_obsidian6.Setting(containerEl).setName(strings.tetherLabel).setDesc(strings.tetherDesc).addSlider(
      (sl) => sl.setLimits(0, 1, 0.02).setValue(s.clusterTether).setDynamicTooltip().onChange(async (v) => {
        await this.plugin.updateSettings({ clusterTether: v }, true);
      })
    );
    new import_obsidian6.Setting(containerEl).setName(strings.compactnessLabel).setDesc(strings.compactnessDesc).addSlider(
      (sl) => sl.setLimits(0.2, 1, 0.02).setValue(s.groupCompactness).setDynamicTooltip().onChange(async (v) => {
        await this.plugin.updateSettings({ groupCompactness: v }, true);
      })
    );
    new import_obsidian6.Setting(containerEl).setName(strings.repelOutsidersLabel).addToggle(
      (tg) => tg.setValue(s.repelOutsidersFromFrames).onChange(async (v) => {
        await this.plugin.updateSettings(
          { repelOutsidersFromFrames: v },
          true
        );
      })
    );
    new import_obsidian6.Setting(containerEl).setName(strings.settingsBoardGrid).addToggle(
      (tg) => tg.setValue(s.showBoardGrid).onChange(async (v) => {
        await this.plugin.updateSettings({ showBoardGrid: v }, false);
      })
    );
    new import_obsidian6.Setting(containerEl).setName(strings.settingsShiftLasso).setDesc(strings.settingsShiftLassoDesc).addToggle(
      (tg) => tg.setValue(s.shiftDragLasso).onChange(async (v) => {
        await this.plugin.updateSettings({ shiftDragLasso: v }, false);
      })
    );
    new import_obsidian6.Setting(containerEl).setName(strings.settingsZoneOpacity).addSlider(
      (sl) => sl.setLimits(0.04, 0.35, 0.01).setValue(s.zoneOpacity).setDynamicTooltip().onChange(async (v) => {
        await this.plugin.updateSettings({ zoneOpacity: v }, false);
      })
    );
    new import_obsidian6.Setting(containerEl).setName(strings.settingsTetherLines).addToggle(
      (tg) => tg.setValue(s.showTetherLines).onChange(async (v) => {
        await this.plugin.updateSettings({ showTetherLines: v }, false);
      })
    );
    containerEl.createEl("h3", {
      text: strings.mcpSectionHeader
    });
    containerEl.createEl("p", {
      text: strings.mcpSectionDesc,
      cls: "setting-item-description"
    });
    new import_obsidian6.Setting(containerEl).setName(strings.mcpEnableLabel).addToggle(
      (tg) => tg.setValue(s.mcpEnabled).onChange(async (v) => {
        await this.plugin.updateSettings({ mcpEnabled: v }, false);
        await this.plugin.syncMcpServerLifecycle();
        this.display();
      })
    );
    new import_obsidian6.Setting(containerEl).setName(strings.mcpPortLabel).addText((txt) => {
      txt.setPlaceholder("27125").setValue(String(s.mcpPort || 27125)).onChange(async (val) => {
        const parsed = parseInt(val.trim(), 10);
        if (parsed >= 1024 && parsed <= 65535) {
          await this.plugin.updateSettings({ mcpPort: parsed }, false);
          await this.plugin.restartMcpServer();
        }
      });
    });
    new import_obsidian6.Setting(containerEl).setName(strings.mcpTokenToggleLabel).setDesc(strings.mcpTokenToggleDesc).addToggle(
      (tg) => tg.setValue(s.mcpUseAuthToken).onChange(async (v) => {
        await this.plugin.updateSettings({ mcpUseAuthToken: v }, false);
        this.plugin.refreshMcpAuthOptions();
        this.display();
      })
    );
    if (s.mcpUseAuthToken) {
      new import_obsidian6.Setting(containerEl).setName(strings.mcpTokenValueLabel).addText((txt) => {
        txt.setValue(s.mcpAuthToken).onChange(async (val) => {
          await this.plugin.updateSettings(
            { mcpAuthToken: val.trim() },
            false
          );
          this.plugin.refreshMcpAuthOptions();
        });
        txt.inputEl.style.width = "240px";
      }).addButton(
        (btn) => btn.setButtonText(strings.mcpRegenerateBtn).onClick(async () => {
          await this.plugin.updateSettings(
            { mcpAuthToken: generateRandomToken() },
            false
          );
          this.plugin.refreshMcpAuthOptions();
          this.display();
        })
      );
    }
    const card = containerEl.createDiv({ cls: "gmg-mcp-card" });
    const localUrls = this.plugin.mcpServer?.getLocalEndpoints();
    if (localUrls) {
      card.createEl("strong", {
        text: "\u{1F7E2} " + strings.mcpStatusRunning(localUrls.baseUrl)
      });
      this.renderCopyableUrlRow(
        card,
        "Local Streamable HTTP:",
        localUrls.mcpUrl,
        strings.noticeCopied
      );
    } else {
      card.createEl("strong", {
        text: "\u26AA " + (this.plugin.lastMcpError ? `${strings.mcpStatusStopped} (${this.plugin.lastMcpError})` : strings.mcpStatusStopped)
      });
    }
    const tunnelHeader = card.createDiv({ cls: "gmg-row" });
    tunnelHeader.style.marginTop = "6px";
    tunnelHeader.createEl("strong", { text: strings.mcpTunnelTitle });
    const tunnelStatus = this.plugin.tunnelManager.getStatus();
    const isTunnelActive = tunnelStatus.state === "running" || tunnelStatus.state === "starting";
    const tunnelBtn = tunnelHeader.createEl("button", {
      cls: isTunnelActive ? "" : "mod-cta",
      text: isTunnelActive ? strings.mcpTunnelStopBtn : strings.mcpTunnelStartBtn
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
          const port = this.plugin.mcpServer?.getListeningPort() || s.mcpPort || 27125;
          await this.plugin.tunnelManager.start(port, s.mcpCloudflaredPath);
          this.display();
        } catch (err) {
          new import_obsidian6.Notice(err instanceof Error ? err.message : String(err));
          this.display();
        }
      }
    });
    if (tunnelStatus.state === "running" && tunnelStatus.publicBaseUrl && this.plugin.mcpServer) {
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
        text: "\u23F3 \u041F\u043E\u0434\u043A\u043B\u044E\u0447\u0435\u043D\u0438\u0435 \u043A Cloudflare Quick Tunnel (trycloudflare.com)..."
      });
    } else if (tunnelStatus.error) {
      card.createDiv({
        cls: "gmg-group-sub",
        text: `\u26A0\uFE0F ${tunnelStatus.error}`
      });
    }
    const manualPort = this.plugin.mcpServer?.getListeningPort() || s.mcpPort || 27125;
    card.createDiv({
      cls: "gmg-group-sub",
      text: s.language === "ru" ? `\u041A\u043E\u043C\u0430\u043D\u0434\u0430 \u0434\u043B\u044F \u0440\u0443\u0447\u043D\u043E\u0433\u043E \u0437\u0430\u043F\u0443\u0441\u043A\u0430 \u0432 \u0442\u0435\u0440\u043C\u0438\u043D\u0430\u043B\u0435: cloudflared tunnel --url http://127.0.0.1:${manualPort}` : `Manual terminal command: cloudflared tunnel --url http://127.0.0.1:${manualPort}`
    });
    new import_obsidian6.Setting(containerEl).setName(strings.mcpAutoTunnelLabel).addToggle(
      (tg) => tg.setValue(s.mcpAutoStartTunnel).onChange(async (v) => {
        await this.plugin.updateSettings({ mcpAutoStartTunnel: v }, false);
      })
    );
    new import_obsidian6.Setting(containerEl).setName(strings.mcpCloudflaredPathLabel).addText((txt) => {
      txt.setPlaceholder("cloudflared").setValue(s.mcpCloudflaredPath || "").onChange(async (val) => {
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
  renderCopyableUrlRow(parent, label, url, copiedText) {
    const wrap = parent.createDiv();
    wrap.createDiv({ cls: "gmg-group-sub", text: label });
    const box = wrap.createDiv({ cls: "gmg-mcp-url-box" });
    const codeSpan = box.createSpan({ text: url });
    codeSpan.style.flex = "1";
    const copyBtn = box.createEl("button", {
      cls: "gmg-mini-tag",
      text: "\u{1F4CB} Copy"
    });
    copyBtn.addEventListener("click", () => {
      if (navigator?.clipboard?.writeText) {
        void navigator.clipboard.writeText(url);
      }
      new import_obsidian6.Notice(copiedText);
    });
  }
  hide() {
    if (this.unsubscribeTunnel) {
      this.unsubscribeTunnel();
      this.unsubscribeTunnel = null;
    }
  }
};

// src/main.ts
var GraphMagneticGroupsPlugin = class extends import_obsidian7.Plugin {
  constructor() {
    super(...arguments);
    this.settings = { ...DEFAULT_SETTINGS };
    this.mcpServer = null;
    this.tunnelManager = new CloudflareQuickTunnelManager();
    this.lastMcpError = null;
    this.controllers = /* @__PURE__ */ new Map();
    this.fallbackStyleEl = null;
  }
  async onload() {
    await this.loadSettings();
    this.ensureStylesLoaded();
    const liveAdapter = new ObsidianLiveVaultAdapter({
      app: this.app,
      getSettings: () => this.settings,
      updateSettings: (patch, reheat) => this.updateSettings(patch, reheat),
      saveGroups: (groups, reheat) => this.saveGroups(groups, reheat),
      getActiveControllers: () => Array.from(this.controllers.values())
    });
    this.mcpEngine = new ObsidianMcpEngine(liveAdapter);
    this.addSettingTab(new MagneticGroupsSettingTab(this.app, this));
    this.registerCommands();
    void this.syncMcpServerLifecycle().then(() => {
      if (this.settings.mcpEnabled && this.settings.mcpAutoStartTunnel && this.mcpServer?.isRunning()) {
        const port = this.mcpServer.getListeningPort() || this.settings.mcpPort;
        void this.tunnelManager.start(port, this.settings.mcpCloudflaredPath).catch(() => {
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
  onunload() {
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
  async syncMcpServerLifecycle() {
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
      getPublicTunnelUrl: () => this.tunnelManager.getStatus().publicBaseUrl
    });
    try {
      await this.mcpServer.start();
      this.lastMcpError = null;
    } catch (err) {
      this.lastMcpError = err instanceof Error ? err.message : String(err);
      this.mcpServer = null;
    }
  }
  async restartMcpServer() {
    if (this.mcpServer) {
      await this.mcpServer.stop();
      this.mcpServer = null;
    }
    await this.syncMcpServerLifecycle();
  }
  refreshMcpAuthOptions() {
    this.mcpServer?.updateOptions({
      requireToken: this.settings.mcpUseAuthToken,
      authToken: this.settings.mcpAuthToken
    });
  }
  ensureStylesLoaded() {
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
  registerCommands() {
    const getStrings = () => t(this.settings.language);
    this.addCommand({
      id: "toggle-lasso-mode",
      name: getStrings().cmdToggleLasso,
      callback: () => {
        const ctrl = this.getActiveOrFirstGraphController();
        if (!ctrl) {
          new import_obsidian7.Notice(getStrings().noticeNoGraphOpen);
          return;
        }
        ctrl.setLassoArmed(true);
      }
    });
    this.addCommand({
      id: "create-magnetic-group",
      name: getStrings().cmdCreateGroupModal,
      callback: () => {
        const ctrl = this.getActiveOrFirstGraphController();
        if (!ctrl) {
          new import_obsidian7.Notice(getStrings().noticeNoGraphOpen);
          return;
        }
        ctrl.openGroupModal();
      }
    });
    this.addCommand({
      id: "reheat-magnetic-groups",
      name: getStrings().cmdReheat,
      callback: () => {
        const ctrl = this.getActiveOrFirstGraphController();
        if (!ctrl) {
          new import_obsidian7.Notice(getStrings().noticeNoGraphOpen);
          return;
        }
        ctrl.markDirtyAndReheat(120);
      }
    });
    this.addCommand({
      id: "reset-manual-anchors",
      name: getStrings().cmdResetAllAnchors,
      callback: async () => {
        const next = this.settings.groups.map((g) => ({
          ...g,
          anchorMode: "auto",
          anchorX: void 0,
          anchorY: void 0
        }));
        await this.saveGroups(next, true);
        await this.updateSettings({ pinnedNodes: {} }, true);
      }
    });
  }
  getActiveOrFirstGraphController() {
    const activeLeaf = this.app.workspace.activeLeaf;
    if (activeLeaf && this.controllers.has(activeLeaf)) {
      return this.controllers.get(activeLeaf);
    }
    const first = this.controllers.values().next();
    return first.done ? null : first.value;
  }
  refreshAllGraphLeaves() {
    const validLeaves = /* @__PURE__ */ new Set();
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
      const view = leaf.view;
      if (view && view.renderer && view.renderer.interactiveEl) {
        const ctrl = new GraphViewController(view, {
          app: this.app,
          getSettings: () => this.settings,
          updateSettings: (patch, reheat) => this.updateSettings(patch, reheat),
          saveGroups: (groups, reheat) => this.saveGroups(groups, reheat)
        });
        this.controllers.set(leaf, ctrl);
      }
    }
  }
  ensureAttachedControllersHealthy() {
    this.refreshAllGraphLeaves();
  }
  async loadSettings() {
    const saved = await this.loadData();
    this.settings = Object.assign({}, DEFAULT_SETTINGS, saved || {});
    if (!Array.isArray(this.settings.groups)) {
      this.settings.groups = [];
    } else {
      this.settings.groups = this.settings.groups.map((g) => ({
        ...g,
        mode: g.mode || "organic",
        anchorMode: g.anchorMode || "auto",
        frameSubLayout: g.frameSubLayout || "grid",
        excludedNodeIds: Array.isArray(g.excludedNodeIds) ? g.excludedNodeIds : []
      }));
    }
    if (!this.settings.pinnedNodes || typeof this.settings.pinnedNodes !== "object") {
      this.settings.pinnedNodes = {};
    }
    if (!this.settings.mcpAuthToken) {
      this.settings.mcpAuthToken = generateRandomToken();
      await this.saveData(this.settings);
    }
  }
  async updateSettings(patch, reheat = true) {
    this.settings = {
      ...this.settings,
      ...patch
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
  async saveGroups(groups, reheat = true) {
    this.settings.groups = groups;
    await this.saveData(this.settings);
    for (const ctrl of this.controllers.values()) {
      ctrl.markDirtyAndReheat(reheat ? 100 : 25);
    }
  }
};
