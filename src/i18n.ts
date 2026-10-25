import { GroupLayoutMode, MiroSubLayout, PluginLanguage } from "./types";

export const STRINGS = {
  ru: {
    pluginTitle: "Магнитные группы и Miro",
    enableMagnetic: "Активность групп и доски",
    lassoBtn: "Лассо: обвести ноды в группу или закрепить",
    lassoActiveHint: "Обведите ноды мышкой на графе: объединить в группу / рамку Miro / закрепить (Esc — отмена)",
    reheatBtn: "Пересобрать динамическую укладку",
    addGroupBtn: "+ Группа",
    addMiroFrameBtn: "+ Рамка Miro",
    boardGridBtn: "Сетка доски Miro",
    attractionLabel: "Сила притяжения",
    attractionDesc: "Насколько активно ноды собираются внутри органических групп",
    tetherLabel: "Связь с основной кучей",
    tetherDesc: "Удерживает органические группы рядом со связанными заметками без разрыва графа",
    compactnessLabel: "Плотность группы",
    compactnessDesc: "Насколько компактно ноды располагаются внутри зоны",
    syncNativeLabel: "Притягивать цветные группы графа",
    syncNativeDesc: "Автоматически применять притяжение к стандартным «Группам» Obsidian",
    showZonesLabel: "Показывать зоны и рамки Miro",
    showLabelsLabel: "Заголовки групп и рамок",
    repelOutsidersLabel: "Выталкивать чужие ноды из рамок Miro",
    emptyGroupsHint:
      "Создайте мягкую группу, жёсткую рамку Miro или обведите ноды через «Лассо» прямо на графе.",
    nativeBadge: "из графа",
    manualAnchorBadge: "якорь",
    modeShort: (m: GroupLayoutMode) =>
      m === "miro-pinned" ? "📌 Доска Miro" : m === "miro-free" ? "📋 Рамка Miro" : "🧲 У кучи",
    modeDesc: (m: GroupLayoutMode) =>
      m === "miro-pinned"
        ? "Жёсткая рамка Miro: и рамка, и ноды зафиксированы на доске, а внешний граф живой"
        : m === "miro-free"
        ? "Живая рамка Miro: рамка зафиксирована на доске, а ноды внутри неё остаются динамическими"
        : "Органический лепесток: мягко притягивается к группе, не отрываясь от основной кучи",
    subLayoutName: (s: MiroSubLayout) =>
      s === "grid"
        ? "Сетка карточек"
        : s === "column"
        ? "Колонка (Канбан)"
        : s === "row"
        ? "Строка (Таймлайн)"
        : s === "circle"
        ? "Круг"
        : "Свободно вручную",
    nodesCount: (n: number) => `${n} ${pluralRu(n, "нода", "ноды", "нод")}`,
    pinnedNodesSummary: (n: number) => `Закреплено отдельных нод: ${n}`,
    unpinAllBtn: "Открепить все",
    badgeTooltip:
      "Тяните заголовок для перемещения · Нажмите на режим (🧲 / 📋 / 📌), чтобы переключать между мягкой группой и доской Miro · ПКМ — меню",
    frameResizeTooltip: "Потяните за угол, чтобы изменить размер рамки Miro",
    editGroup: "Настроить группу / рамку",
    switchToMiroPinned: "📌 Зафиксировать как доску Miro (жёстко)",
    switchToMiroFree: "📋 Сделать живой рамкой Miro (ноды динамические)",
    switchToOrganic: "🧲 Вернуть в мягкую группу у кучи",
    tidyGrid: "▦ Выровнять ноды по сетке",
    tidyColumn: "▤ Выстроить в колонку",
    tidyCircle: "◯ Выстроить по кругу",
    resetAnchor: "Вернуть авто-позицию у кучи",
    toggleGroup: "Включить / выключить",
    deleteGroup: "Удалить группу",
    modalCreateTitle: "Новая группа / рамка Miro",
    modalEditTitle: "Настройка группы / рамки Miro",
    groupNameLabel: "Название",
    groupNamePlaceholder: "Например: Спринт 1, Архитектура, Идеи",
    groupModeLabel: "Режим работы на графе",
    groupSubLayoutLabel: "Раскладка нод внутри рамки Miro",
    groupColorLabel: "Цвет",
    groupQueryLabel: "Правило отбора (необязательно)",
    groupQueryDesc:
      "Запросы как в Obsidian: tag:#тег, path:Папка/, file:имя, [свойство:значение], OR, -исключить",
    groupQueryPlaceholder: "tag:#проект OR path:Заметки/",
    groupStrengthLabel: "Индивидуальная сила",
    groupColorNodesLabel: "Окрашивать ноды в цвет группы",
    manualNodesHeader: "Ручной выбор нод",
    manualNodesSearchPlaceholder: "Поиск заметок или тегов на графе...",
    selectedCount: (n: number) => `Выбрано вручную: ${n}`,
    clearManualBtn: "Очистить список",
    saveBtn: "Сохранить",
    cancelBtn: "Отмена",
    lassoMenuTitle: (n: number) => `Выделено: ${n} ${pluralRu(n, "нода", "ноды", "нод")}`,
    lassoCreateNew: (n: number) => `🧲 Создать мягкую группу у кучи (${n})`,
    lassoCreateMiroPinned: (n: number) => `📌 Зафиксировать в рамку Miro (${n})`,
    lassoCreateMiroFree: (n: number) => `📋 Собрать в живую рамку Miro (${n})`,
    lassoPinIndividual: (n: number) => `📍 Жёстко приколоть ноды на их местах (${n})`,
    lassoUnpinIndividual: "🔓 Открепить выделенные ноды",
    lassoAddTo: (name: string) => `Добавить в «${name}»`,
    lassoRemoveFromAll: "Убрать из всех ручных групп",
    defaultNewGroupName: (idx: number) => `Группа ${idx}`,
    defaultNewFrameName: (idx: number) => `Доска ${idx}`,
    ctxMenuHeader: "Магнитные группы и Miro",
    ctxPinNodeHere: "📍 Жёстко закрепить ноду на этом месте",
    ctxUnpinNode: "🔓 Открепить ноду (сделать динамической)",
    ctxCreateWithNode: "🧲 Создать мягкую группу с этой нодой",
    ctxCreateMiroWithNeighbors: "📌 Собрать ноду и соседей в рамку Miro",
    ctxCreateWithNeighbors: "🧲 Создать группу: нода + её соседи",
    ctxAddToGroup: (name: string) => `Добавить в «${name}»`,
    ctxRemoveFromGroup: (name: string) => `Убрать из «${name}»`,
    noticeCreatedGroup: (name: string, count: number) =>
      `Создана «${name}» (${count} ${pluralRu(count, "нода", "ноды", "нод")})`,
    noticeAddedToGroup: (name: string, count: number) =>
      `В «${name}» добавлено: ${count}`,
    noticePinnedNodes: (count: number) =>
      `Закреплено на доске: ${count} ${pluralRu(count, "нода", "ноды", "нод")}`,
    noticeUnpinnedNodes: "Ноды снова свободны и динамичны",
    noticeNoGraphOpen: "Откройте страницу графа (Graph View)",
    noticeCopied: "Ссылка скопирована в буфер обмена!",
    cmdToggleLasso: "Включить режим Лассо на графе",
    cmdCreateGroupModal: "Создать магнитную группу или рамку Miro",
    cmdReheat: "Пересчитать динамическое притяжение групп",
    cmdResetAllAnchors: "Сбросить все ручные якоря и открепить одиночные ноды",
    settingsHeader: "Настройки Graph Magnetic Groups & Miro + MCP",
    settingsLang: "Язык интерфейса / Language",
    settingsLocalGraph: "Работать также в локальном графе (Local Graph)",
    settingsLocalGraphDesc: "Применять группы и рамки Miro в глобальном и локальном графах",
    settingsShiftLasso: "Выделение лассо через Shift + перетаскивание",
    settingsShiftLassoDesc: "Зажмите Shift и обведите ноды на пустом месте графа",
    settingsBoardGrid: "Показывать точечную сетку доски Miro на фоне графа",
    settingsZoneOpacity: "Прозрачность заливки зон и рамок",
    settingsTetherLines: "Показывать линии связи с основной кучей при наведении",
    mcpSectionHeader: "☁️ MCP-сервер для Obsidian и Cloudflare Quick Tunnels",
    mcpSectionDesc:
      "Встроенный MCP-сервер позволяет облачным ИИ-агентам (Claude, ChatGPT, n8n, LangGraph, Cursor и др.) читать/создавать заметки и управлять группами и рамками Miro прямо на живом графе.",
    mcpEnableLabel: "Включить встроенный MCP-сервер в Obsidian",
    mcpPortLabel: "Локальный порт MCP-сервера",
    mcpTokenToggleLabel: "Защита секретным токеном в URL",
    mcpTokenToggleDesc:
      "Токен вшивается прямо в путь ссылки (/t/<токен>/mcp), чтобы облачные агенты подключались в 1 клик без сложной настройки заголовков и OAuth",
    mcpTokenValueLabel: "Секретный токен",
    mcpRegenerateBtn: "Новый токен",
    mcpStatusRunning: (url: string) => `Локальный MCP запущен: ${url}`,
    mcpStatusStopped: "MCP-сервер остановлен",
    mcpTunnelTitle: "Cloudflare Quick Tunnel (публичный HTTPS для облачных агентов)",
    mcpTunnelStartBtn: "☁️ Запустить Quick Tunnel",
    mcpTunnelStopBtn: "⏹ Остановить туннель",
    mcpAutoTunnelLabel: "Автоматически поднимать Quick Tunnel при запуске Obsidian",
    mcpCloudflaredPathLabel: "Путь к cloudflared (оставьте пустым для автопоиска)",
    mcpCopyHttpUrl: "📋 Копировать MCP URL (Streamable HTTP)",
    mcpCopySseUrl: "📋 Копировать SSE URL (для старых агентов)",
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
    emptyGroupsHint:
      "Create an organic group, a hard-fixed Miro frame, or use Lasso right on the graph.",
    nativeBadge: "native",
    manualAnchorBadge: "pinned",
    modeShort: (m: GroupLayoutMode) =>
      m === "miro-pinned" ? "📌 Miro Pin" : m === "miro-free" ? "📋 Miro Live" : "🧲 Organic",
    modeDesc: (m: GroupLayoutMode) =>
      m === "miro-pinned"
        ? "Hard Miro Board Frame: frame & nodes locked on board while surrounding graph stays dynamic"
        : m === "miro-free"
        ? "Live Miro Frame: frame fixed on board, member nodes move dynamically inside its walls"
        : "Organic Lobe: soft attraction hugging the main cluster without tearing",
    subLayoutName: (s: MiroSubLayout) =>
      s === "grid"
        ? "Card Grid"
        : s === "column"
        ? "Kanban Column"
        : s === "row"
        ? "Timeline Row"
        : s === "circle"
        ? "Circle"
        : "Freeform Manual",
    nodesCount: (n: number) => `${n} node${n === 1 ? "" : "s"}`,
    pinnedNodesSummary: (n: number) => `Pinned individual nodes: ${n}`,
    unpinAllBtn: "Unpin all",
    badgeTooltip:
      "Drag header to move · Click mode pill (🧲 / 📋 / 📌) to switch between soft cluster & Miro frame · Right-click for menu",
    frameResizeTooltip: "Drag corner to resize Miro frame",
    editGroup: "Edit group / frame",
    switchToMiroPinned: "📌 Lock as Miro Board Frame (hard pin)",
    switchToMiroFree: "📋 Switch to Live Miro Frame (dynamic inside)",
    switchToOrganic: "🧲 Return to Organic Cluster Lobe",
    tidyGrid: "▦ Arrange nodes in Grid",
    tidyColumn: "▤ Arrange in Column",
    tidyCircle: "◯ Arrange in Circle",
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
    groupQueryDesc:
      "Obsidian queries: tag:#tag, path:Folder/, file:name, [prop:val], OR, -exclude",
    groupQueryPlaceholder: "tag:#project OR path:Notes/",
    groupStrengthLabel: "Strength multiplier",
    groupColorNodesLabel: "Tint nodes with group color",
    manualNodesHeader: "Manual node selection",
    manualNodesSearchPlaceholder: "Search notes or tags...",
    selectedCount: (n: number) => `Manually selected: ${n}`,
    clearManualBtn: "Clear list",
    saveBtn: "Save",
    cancelBtn: "Cancel",
    lassoMenuTitle: (n: number) => `Selected: ${n} node${n === 1 ? "" : "s"}`,
    lassoCreateNew: (n: number) => `🧲 Create organic group (${n})`,
    lassoCreateMiroPinned: (n: number) => `📌 Lock into Miro Board Frame (${n})`,
    lassoCreateMiroFree: (n: number) => `📋 Gather in Live Miro Frame (${n})`,
    lassoPinIndividual: (n: number) => `📍 Hard-pin nodes in place (${n})`,
    lassoUnpinIndividual: "🔓 Unpin selected nodes",
    lassoAddTo: (name: string) => `Add to "${name}"`,
    lassoRemoveFromAll: "Remove from manual groups",
    defaultNewGroupName: (idx: number) => `Group ${idx}`,
    defaultNewFrameName: (idx: number) => `Frame ${idx}`,
    ctxMenuHeader: "Magnetic Groups & Miro",
    ctxPinNodeHere: "📍 Hard-pin node right here",
    ctxUnpinNode: "🔓 Unpin node (make dynamic)",
    ctxCreateWithNode: "🧲 Create organic group with this node",
    ctxCreateMiroWithNeighbors: "📌 Lock node + neighbors into Miro Frame",
    ctxCreateWithNeighbors: "🧲 Create group: node + neighbors",
    ctxAddToGroup: (name: string) => `Add to "${name}"`,
    ctxRemoveFromGroup: (name: string) => `Remove from "${name}"`,
    noticeCreatedGroup: (name: string, count: number) =>
      `Created "${name}" (${count} node${count === 1 ? "" : "s"})`,
    noticeAddedToGroup: (name: string, count: number) =>
      `Added ${count} node${count === 1 ? "" : "s"} to "${name}"`,
    noticePinnedNodes: (count: number) => `Hard-pinned ${count} node${count === 1 ? "" : "s"} on board`,
    noticeUnpinnedNodes: "Nodes unpinned and dynamic again",
    noticeNoGraphOpen: "Open a Graph View first",
    noticeCopied: "URL copied to clipboard!",
    cmdToggleLasso: "Toggle Lasso mode on graph",
    cmdCreateGroupModal: "Create magnetic group or Miro frame",
    cmdReheat: "Recalculate dynamic group layout",
    cmdResetAllAnchors: "Reset all manual anchors & unpin individual nodes",
    settingsHeader: "Graph Magnetic Groups & Miro + MCP Settings",
    settingsLang: "Interface Language / Язык",
    settingsLocalGraph: "Enable in Local Graph too",
    settingsLocalGraphDesc: "Apply groups and Miro frames in both Global and Local Graph views",
    settingsShiftLasso: "Lasso selection via Shift + Drag",
    settingsShiftLassoDesc: "Hold Shift and drag on empty graph space",
    settingsBoardGrid: "Show Miro dot-grid background on graph",
    settingsZoneOpacity: "Zone & frame fill opacity",
    settingsTetherLines: "Show elastic tether lines on hover",
    mcpSectionHeader: "☁️ Obsidian MCP Server & Cloudflare Quick Tunnels",
    mcpSectionDesc:
      "Built-in MCP server lets cloud AI agents (Claude, ChatGPT, n8n, LangGraph, Cursor, etc.) read/write vault notes and orchestrate groups & Miro frames live on your graph.",
    mcpEnableLabel: "Enable embedded MCP server in Obsidian",
    mcpPortLabel: "Local MCP server port",
    mcpTokenToggleLabel: "Protect with secret URL token",
    mcpTokenToggleDesc:
      "Embeds secret token directly in URL path (/t/<token>/mcp) so cloud agents connect in 1 click without custom headers or OAuth setup",
    mcpTokenValueLabel: "Secret token",
    mcpRegenerateBtn: "Regenerate",
    mcpStatusRunning: (url: string) => `Local MCP running: ${url}`,
    mcpStatusStopped: "MCP server stopped",
    mcpTunnelTitle: "Cloudflare Quick Tunnel (Public HTTPS for Cloud Agents)",
    mcpTunnelStartBtn: "☁️ Start Quick Tunnel",
    mcpTunnelStopBtn: "⏹ Stop Tunnel",
    mcpAutoTunnelLabel: "Auto-start Quick Tunnel when Obsidian launches",
    mcpCloudflaredPathLabel: "Custom cloudflared binary path (leave blank for auto-detect)",
    mcpCopyHttpUrl: "📋 Copy MCP URL (Streamable HTTP)",
    mcpCopySseUrl: "📋 Copy SSE URL (legacy clients)",
  },
};

function pluralRu(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100;
  const n1 = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (n1 > 1 && n1 < 5) return few;
  if (n1 === 1) return one;
  return many;
}

export function t(lang: PluginLanguage) {
  return STRINGS[lang] || STRINGS.ru;
}
