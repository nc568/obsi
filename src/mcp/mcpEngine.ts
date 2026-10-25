import {
  computeDefaultMiroFrame,
  createGroupId,
  MIRO_HEADER_HEIGHT,
  MIRO_MIN_HEIGHT,
  MIRO_MIN_WIDTH,
} from "../physicsEngine";
import {
  DEFAULT_GROUP_COLORS,
  GroupLayoutMode,
  MagneticGroup,
  MiroSubLayout,
} from "../types";
import {
  ArrangeMiroBoardItemInput,
  VaultGraphAdapter,
} from "./adapterTypes";

export interface JsonRpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}

export interface JsonRpcResponse {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, unknown>;
    required?: string[];
  };
  annotations?: {
    title?: string;
    readOnlyHint?: boolean;
    destructiveHint?: boolean;
    idempotentHint?: boolean;
    openWorldHint?: boolean;
  };
}

const SUPPORTED_PROTOCOL_VERSIONS = [
  "2025-06-18",
  "2025-03-26",
  "2024-11-05",
];

export const MCP_TOOLS: McpToolDefinition[] = [
  /* ==================== VAULT & NOTES TOOLS (1..10) ==================== */
  {
    name: "vault_info",
    description:
      "Get an overview of the Obsidian vault (note count, folders, top tags) plus live Graph View & Magnetic Groups / Miro-Board status.",
    inputSchema: {
      type: "object",
      properties: {},
    },
    annotations: { title: "Vault & Graph Overview", readOnlyHint: true },
  },
  {
    name: "list_notes",
    description:
      "List markdown notes in the Obsidian vault, optionally filtered by folder, tag, or Obsidian search query.",
    inputSchema: {
      type: "object",
      properties: {
        folder: {
          type: "string",
          description: "Optional folder prefix (e.g. 'Projects/' or 'Notes')",
        },
        tag: {
          type: "string",
          description: "Optional tag filter (e.g. '#architecture' or 'sprint')",
        },
        query: {
          type: "string",
          description:
            "Optional Obsidian-style filter (e.g. 'tag:#ai OR path:Research/')",
        },
        limit: {
          type: "number",
          description: "Maximum number of notes to return (default 100)",
        },
      },
    },
    annotations: { title: "List Vault Notes", readOnlyHint: true },
  },
  {
    name: "read_note",
    description:
      "Read a note's full markdown content, YAML frontmatter, tags, outgoing [[wikilinks]], and incoming backlinks.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description:
            "Note path in vault (e.g. 'Folder/Note.md' or 'Note')",
        },
      },
      required: ["path"],
    },
    annotations: { title: "Read Note", readOnlyHint: true },
  },
  {
    name: "create_or_update_note",
    description:
      "Create a new markdown note or update an existing note in the Obsidian vault. Parent folders are created automatically. Include [[Note Name]] wikilinks or #tags in content to connect it on the live Graph View.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Target note path (e.g. 'Architecture/API Gateway.md')",
        },
        content: {
          type: "string",
          description: "Full markdown content (may include YAML frontmatter, #tags, and [[wikilinks]])",
        },
        mode: {
          type: "string",
          enum: ["overwrite", "create-only", "append", "prepend"],
          description: "Write mode (default 'overwrite')",
        },
      },
      required: ["path", "content"],
    },
    annotations: { title: "Create or Update Note", destructiveHint: false },
  },
  {
    name: "append_to_note",
    description:
      "Append markdown text, sections, or [[wikilinks]] to the end of an existing note.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Existing note path",
        },
        content: {
          type: "string",
          description: "Markdown text to append",
        },
      },
      required: ["path", "content"],
    },
    annotations: { title: "Append to Note", destructiveHint: false },
  },
  {
    name: "delete_note",
    description: "Delete (move to trash) a markdown note from the Obsidian vault.",
    inputSchema: {
      type: "object",
      properties: {
        path: {
          type: "string",
          description: "Note path to delete",
        },
      },
      required: ["path"],
    },
    annotations: { title: "Delete Note", destructiveHint: true },
  },
  {
    name: "move_or_rename_note",
    description:
      "Move or rename a note in the vault (updating internal [[wikilinks]] automatically when running inside Obsidian).",
    inputSchema: {
      type: "object",
      properties: {
        fromPath: { type: "string", description: "Current note path" },
        toPath: { type: "string", description: "New note path" },
      },
      required: ["fromPath", "toPath"],
    },
    annotations: { title: "Move or Rename Note", destructiveHint: false },
  },
  {
    name: "search_vault",
    description:
      "Search notes across the Obsidian vault by full-text keywords and/or Obsidian query expressions (tag:#..., path:..., [prop:val]), returning ranked snippets.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search keywords or query expression",
        },
        limit: {
          type: "number",
          description: "Maximum matches to return (default 25)",
        },
      },
      required: ["query"],
    },
    annotations: { title: "Search Vault", readOnlyHint: true },
  },
  {
    name: "get_graph_topology",
    description:
      "Inspect the Obsidian knowledge graph: nodes, links, degree hubs, orphan notes, live (x, y) Graph View coordinates, hard-pinned status, and group/Miro-frame memberships.",
    inputSchema: {
      type: "object",
      properties: {
        includeNodes: {
          type: "boolean",
          description: "Include full node list (default true)",
        },
        includeLinks: {
          type: "boolean",
          description: "Include full edge list (default true)",
        },
      },
    },
    annotations: { title: "Inspect Graph Topology", readOnlyHint: true },
  },
  {
    name: "open_note_or_graph",
    description:
      "Open/focus the Obsidian Graph View and optionally zoom the camera onto a specific Miro Frame, group, or note.",
    inputSchema: {
      type: "object",
      properties: {
        openGraphIfClosed: {
          type: "boolean",
          description: "Open Global Graph View if not currently open (default true)",
        },
        groupId: {
          type: "string",
          description: "Optional group/frame ID or name to focus camera on",
        },
        notePath: {
          type: "string",
          description: "Optional note path to focus or open",
        },
      },
    },
    annotations: { title: "Focus Graph or Note", readOnlyHint: false },
  },

  /* ======== GRAPH MAGNETIC GROUPS & MIRO-BOARD TOOLS (11..20) ======== */
  {
    name: "graph_list_groups",
    description:
      "List all Graph Magnetic Groups and Miro-Board Frames, including their mode ('organic' | 'miro-free' | 'miro-pinned'), frame geometry, matched notes, and individually pinned nodes.",
    inputSchema: {
      type: "object",
      properties: {},
    },
    annotations: { title: "List Graph Groups & Miro Frames", readOnlyHint: true },
  },
  {
    name: "graph_create_group",
    description:
      "Create a new Magnetic Group or Miro-Board Frame on Obsidian's Graph View. Choose mode='organic' for a soft lobe hugging the main dynamic cluster without tearing, mode='miro-free' for a fixed Miro rectangle with dynamic nodes inside, or mode='miro-pinned' to hard-lock nodes like cards on a Miro board while the rest of the graph remains dynamic!",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Group or Miro Frame title" },
        mode: {
          type: "string",
          enum: ["organic", "miro-free", "miro-pinned"],
          description:
            "'organic' = soft cluster lobe; 'miro-free' = fixed Miro frame with live dynamic nodes inside; 'miro-pinned' = hard-pinned Miro board frame",
        },
        color: {
          type: "string",
          description: "Hex color (e.g. '#7c5cff', '#2ec4b6', '#ff6b6b')",
        },
        query: {
          type: "string",
          description:
            "Optional Obsidian query rule (e.g. 'tag:#backend OR path:API/')",
        },
        nodeIds: {
          type: "array",
          items: { type: "string" },
          description: "Explicit list of note paths / node IDs to include",
        },
        strength: {
          type: "number",
          description: "Group attraction strength multiplier (0.2 to 2.0, default 1.0)",
        },
        colorNodes: {
          type: "boolean",
          description: "Tint member nodes with the group color (default true)",
        },
        frameX: {
          type: "number",
          description: "Miro Frame top-left X coordinate in graph world space",
        },
        frameY: {
          type: "number",
          description: "Miro Frame top-left Y coordinate in graph world space",
        },
        frameW: {
          type: "number",
          description: "Miro Frame width in graph world space (min 210)",
        },
        frameH: {
          type: "number",
          description: "Miro Frame height in graph world space (min 165)",
        },
        frameSubLayout: {
          type: "string",
          enum: ["grid", "column", "row", "circle", "freeform"],
          description:
            "How cards are arranged inside a 'miro-pinned' frame (default 'grid')",
        },
      },
      required: ["name"],
    },
    annotations: { title: "Create Magnetic Group or Miro Frame" },
  },
  {
    name: "graph_update_group",
    description:
      "Update an existing Magnetic Group or Miro Frame (by groupId or name): rename, recolor, edit query, switch between 'organic' / 'miro-free' / 'miro-pinned', move or resize the Miro Frame (frameX, frameY, frameW, frameH), or re-tidy cards ('grid' | 'column' | 'row' | 'circle').",
    inputSchema: {
      type: "object",
      properties: {
        groupId: {
          type: "string",
          description: "Group ID or exact group name",
        },
        name: { type: "string" },
        color: { type: "string" },
        enabled: { type: "boolean" },
        query: { type: "string" },
        strength: { type: "number" },
        colorNodes: { type: "boolean" },
        mode: {
          type: "string",
          enum: ["organic", "miro-free", "miro-pinned"],
        },
        frameX: { type: "number" },
        frameY: { type: "number" },
        frameW: { type: "number" },
        frameH: { type: "number" },
        frameSubLayout: {
          type: "string",
          enum: ["grid", "column", "row", "circle", "freeform"],
        },
        anchorMode: { type: "string", enum: ["auto", "manual"] },
        anchorX: { type: "number" },
        anchorY: { type: "number" },
      },
      required: ["groupId"],
    },
    annotations: { title: "Update Group or Miro Frame" },
  },
  {
    name: "graph_delete_group",
    description:
      "Delete a Magnetic Group or Miro Frame (by ID or name). Any nodes hard-pinned by that Miro Frame are immediately released back into the dynamic graph.",
    inputSchema: {
      type: "object",
      properties: {
        groupId: {
          type: "string",
          description: "Group ID or exact group name to delete",
        },
      },
      required: ["groupId"],
    },
    annotations: { title: "Delete Group or Miro Frame", destructiveHint: true },
  },
  {
    name: "graph_manage_group_nodes",
    description:
      "Add, remove, or exclude specific notes in a Magnetic Group or Miro Frame.",
    inputSchema: {
      type: "object",
      properties: {
        groupId: {
          type: "string",
          description: "Group ID or exact group name",
        },
        addNodeIds: {
          type: "array",
          items: { type: "string" },
          description: "Note paths to add to the group",
        },
        removeNodeIds: {
          type: "array",
          items: { type: "string" },
          description: "Note paths to remove from manual selection",
        },
        excludeNodeIds: {
          type: "array",
          items: { type: "string" },
          description: "Note paths to explicitly exclude even if matched by query",
        },
      },
      required: ["groupId"],
    },
    annotations: { title: "Add/Remove Notes in Group" },
  },
  {
    name: "graph_pin_nodes",
    description:
      "Hard-pin individual nodes on the Graph View board (like sticky notes on Miro) while keeping all other nodes and links live and dynamic. Supports explicit {id, x, y} coordinates OR auto-arranging a list of nodeIds into a 'grid' / 'row' / 'column' / 'circle' around (centerX, centerY).",
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
              y: { type: "number" },
            },
            required: ["id", "x", "y"],
          },
        },
        nodeIds: {
          type: "array",
          items: { type: "string" },
          description:
            "Alternatively, pass nodeIds to pin in a neat pattern or at their current positions",
        },
        pattern: {
          type: "string",
          enum: ["current", "grid", "row", "column", "circle"],
          description: "Arrangement pattern when nodeIds is provided (default 'grid')",
        },
        centerX: { type: "number", description: "Center X for pattern (default 0)" },
        centerY: { type: "number", description: "Center Y for pattern (default 0)" },
        spacing: { type: "number", description: "Spacing between pinned nodes (default 95)" },
      },
    },
    annotations: { title: "Hard-Pin Individual Nodes on Board" },
  },
  {
    name: "graph_unpin_nodes",
    description:
      "Unpin specific individually-pinned nodes (or all individually-pinned nodes) so they become free-floating dynamic nodes again.",
    inputSchema: {
      type: "object",
      properties: {
        nodeIds: {
          type: "array",
          items: { type: "string" },
          description: "Node IDs to unpin",
        },
        unpinAll: {
          type: "boolean",
          description: "Set true to unpin all individually-pinned nodes",
        },
      },
    },
    annotations: { title: "Unpin Individual Nodes" },
  },
  {
    name: "graph_arrange_miro_board",
    description:
      "High-level AI Board Architect tool: arrange multiple groups (existing or newly defined) into a clean, non-overlapping Miro Board on the Graph View ('columns' = Kanban columns, 'quadrants' = 2x2 matrix, 'timeline' = horizontal row, 'ring' = Miro frames arranged around a central dynamic hub cluster!).",
    inputSchema: {
      type: "object",
      properties: {
        boardStyle: {
          type: "string",
          enum: ["columns", "quadrants", "timeline", "ring"],
          description:
            "'columns' = side-by-side Kanban boards; 'quadrants' = 2x2 matrix; 'timeline' = horizontal sequence; 'ring' = frames surrounding the live central dynamic cluster",
        },
        items: {
          type: "array",
          description:
            "Frames to arrange. Omit items to automatically arrange all currently enabled groups!",
          items: {
            type: "object",
            properties: {
              groupIdOrName: {
                type: "string",
                description: "Existing group ID or name (omit to create a new frame)",
              },
              name: { type: "string", description: "Frame title" },
              color: { type: "string", description: "Hex color" },
              query: { type: "string", description: "Obsidian query filter" },
              nodeIds: {
                type: "array",
                items: { type: "string" },
                description: "Manual note IDs",
              },
              mode: {
                type: "string",
                enum: ["miro-pinned", "miro-free"],
                description: "Default 'miro-pinned'",
              },
              subLayout: {
                type: "string",
                enum: ["grid", "column", "row", "circle"],
              },
            },
          },
        },
        centerX: {
          type: "number",
          description: "Board center X in graph world coordinates (default 0)",
        },
        centerY: {
          type: "number",
          description: "Board center Y in graph world coordinates (default 0)",
        },
        gap: {
          type: "number",
          description: "Gap between Miro Frames in world units (default 90)",
        },
        showBoardGrid: {
          type: "boolean",
          description: "Turn on the Miro dot-grid background (default true)",
        },
      },
    },
    annotations: { title: "Arrange Multi-Frame Miro Board" },
  },
  {
    name: "graph_configure_physics",
    description:
      "Configure global Graph Magnetic Groups & Miro-Board physics and visual settings (attractionStrength, clusterTether, groupCompactness, showBoardGrid, repelOutsidersFromFrames, showGroupZones, showGroupLabels).",
    inputSchema: {
      type: "object",
      properties: {
        enabled: { type: "boolean" },
        attractionStrength: {
          type: "number",
          description: "0.0 to 1.0 (default 0.62)",
        },
        clusterTether: {
          type: "number",
          description: "0.0 to 1.0 anti-tear tether to main cluster (default 0.78)",
        },
        groupCompactness: {
          type: "number",
          description: "0.2 to 1.0 (default 0.58)",
        },
        syncNativeColorGroups: { type: "boolean" },
        showGroupZones: { type: "boolean" },
        showGroupLabels: { type: "boolean" },
        showBoardGrid: { type: "boolean" },
        repelOutsidersFromFrames: { type: "boolean" },
        zoneOpacity: { type: "number", description: "0.04 to 0.35" },
      },
    },
    annotations: { title: "Configure Graph Physics & Board Visuals" },
  },
  {
    name: "graph_reset_layout",
    description:
      "Reheat/relax the dynamic graph simulation, optionally converting all Miro Frames back to soft organic groups and/or unpinning all individual nodes.",
    inputSchema: {
      type: "object",
      properties: {
        convertAllFramesToOrganic: {
          type: "boolean",
          description: "Switch all Miro Frames back to 'organic' cluster lobes",
        },
        resetManualAnchors: {
          type: "boolean",
          description: "Reset manual organic group anchors back to auto",
        },
        unpinAllIndividualNodes: {
          type: "boolean",
          description: "Release all individually-pinned nodes",
        },
      },
    },
    annotations: { title: "Reset / Reheat Graph Layout" },
  },
];

export class ObsidianMcpEngine {
  private adapter: VaultGraphAdapter;
  public stats = {
    totalRequests: 0,
    totalToolCalls: 0,
    lastToolName: "",
    lastCallTimestamp: 0,
  };

  constructor(adapter: VaultGraphAdapter) {
    this.adapter = adapter;
  }

  public async handleJsonRpcMessage(
    msg: JsonRpcRequest
  ): Promise<JsonRpcResponse | null> {
    this.stats.totalRequests++;

    if (!msg || msg.jsonrpc !== "2.0" || typeof msg.method !== "string") {
      return {
        jsonrpc: "2.0",
        id: msg?.id ?? null,
        error: { code: -32600, message: "Invalid JSON-RPC 2.0 request" },
      };
    }

    // Notifications (no id property) must return null per JSON-RPC 2.0 & MCP spec
    const isNotification = msg.id === undefined;

    try {
      const result = await this.dispatchMethod(msg.method, msg.params || {});
      if (isNotification) return null;
      return {
        jsonrpc: "2.0",
        id: msg.id ?? null,
        result,
      };
    } catch (err: unknown) {
      if (isNotification) return null;
      const code =
        typeof (err as { rpcCode?: number })?.rpcCode === "number"
          ? (err as { rpcCode: number }).rpcCode
          : -32603;
      const message =
        err instanceof Error ? err.message : String(err || "Internal error");
      return {
        jsonrpc: "2.0",
        id: msg.id ?? null,
        error: { code, message },
      };
    }
  }

  private async dispatchMethod(
    method: string,
    params: Record<string, unknown>
  ): Promise<unknown> {
    switch (method) {
      case "initialize": {
        const clientProto =
          typeof params.protocolVersion === "string"
            ? params.protocolVersion
            : "2025-03-26";
        const negotiated = SUPPORTED_PROTOCOL_VERSIONS.includes(clientProto)
          ? clientProto
          : SUPPORTED_PROTOCOL_VERSIONS[0];

        return {
          protocolVersion: negotiated,
          capabilities: {
            tools: { listChanged: false },
            resources: { subscribe: false, listChanged: false },
            prompts: { listChanged: false },
          },
          serverInfo: {
            name: "obsidian-magnetic-miro-mcp",
            version: "2.0.0",
          },
          instructions:
            "Obsidian Vault + Graph Magnetic Groups & Miro-Board MCP Server. " +
            "You can read/search/create/link markdown notes AND organize Obsidian's live Graph View using three group modes: " +
            "'organic' (soft magnetic lobe attached to the main cluster without tearing), " +
            "'miro-free' (hard-fixed rectangular Miro Frame with live dynamic nodes inside), and " +
            "'miro-pinned' (hard-fixed Miro Board Frame locking cards in a clean grid/column/row/circle while surrounding notes remain a live dynamic graph). " +
            "Use graph_arrange_miro_board to lay out multi-frame Kanban/Quadrant/Ring boards in one call.",
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
        const args =
          params.arguments && typeof params.arguments === "object"
            ? (params.arguments as Record<string, unknown>)
            : {};
        this.stats.totalToolCalls++;
        this.stats.lastToolName = name;
        this.stats.lastCallTimestamp = Date.now();

        try {
          const data = await this.executeTool(name, args);
          return {
            content: [
              {
                type: "text",
                text:
                  typeof data === "string"
                    ? data
                    : JSON.stringify(data, null, 2),
              },
            ],
            isError: false,
          };
        } catch (toolErr: unknown) {
          const errMsg =
            toolErr instanceof Error ? toolErr.message : String(toolErr);
          return {
            content: [{ type: "text", text: `Error: ${errMsg}` }],
            isError: true,
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
              mimeType: "application/json",
            },
            {
              uri: "obsidian://graph/groups",
              name: "Graph Magnetic Groups & Miro Frames",
              description: "Current configuration and matched notes of all groups and Miro frames",
              mimeType: "application/json",
            },
            {
              uri: "obsidian://graph/topology",
              name: "Vault Link Graph Topology",
              description: "Nodes, links, hubs, orphans, and live coordinates",
              mimeType: "application/json",
            },
          ],
        };

      case "resources/read": {
        const uri = String(params.uri || "");
        let payload: unknown;
        if (uri === "obsidian://vault/summary") {
          payload = await this.adapter.getVaultInfo();
        } else if (uri === "obsidian://graph/groups") {
          payload = await this.executeTool("graph_list_groups", {});
        } else if (uri === "obsidian://graph/topology") {
          payload = await this.adapter.getGraphTopology();
        } else {
          throw Object.assign(new Error(`Unknown resource URI: ${uri}`), {
            rpcCode: -32602,
          });
        }
        return {
          contents: [
            {
              uri,
              mimeType: "application/json",
              text: JSON.stringify(payload, null, 2),
            },
          ],
        };
      }

      case "prompts/list":
        return {
          prompts: [
            {
              name: "organize-miro-graph",
              description:
                "Inspect the Obsidian vault and organize key topics into clean Miro-Board Frames around the live dynamic graph",
              arguments: [
                {
                  name: "style",
                  description: "Board layout style: columns, quadrants, timeline, or ring",
                  required: false,
                },
              ],
            },
          ],
        };

      case "prompts/get": {
        const pName = String(params.name || "");
        if (pName !== "organize-miro-graph") {
          throw Object.assign(new Error(`Unknown prompt: ${pName}`), {
            rpcCode: -32602,
          });
        }
        const style = String(
          (params.arguments as Record<string, unknown> | undefined)?.style ||
            "ring"
        );
        return {
          description: "Organize Obsidian Graph View into Miro Frames + dynamic cluster",
          messages: [
            {
              role: "user",
              content: {
                type: "text",
                text:
                  `Inspect my Obsidian vault using vault_info and list_notes, identify the main thematic clusters, ` +
                  `and arrange them onto the Graph View using graph_arrange_miro_board with boardStyle="${style}" ` +
                  `while leaving general/hub notes free and dynamic so links flow naturally between frames.`,
              },
            },
          ],
        };
      }

      default:
        throw Object.assign(new Error(`Method not found: ${method}`), {
          rpcCode: -32601,
        });
    }
  }

  /* =========================================================================
   * Tool Implementations
   * ========================================================================= */

  private async executeTool(
    name: string,
    args: Record<string, unknown>
  ): Promise<unknown> {
    switch (name) {
      case "vault_info":
        return await this.adapter.getVaultInfo();

      case "list_notes":
        return await this.adapter.listNotes({
          folder: optStr(args.folder),
          tag: optStr(args.tag),
          query: optStr(args.query),
          limit: optNum(args.limit),
        });

      case "read_note": {
        const p = reqStr(args.path, "path");
        return await this.adapter.readNote(p);
      }

      case "create_or_update_note": {
        const path = reqStr(args.path, "path");
        const content =
          typeof args.content === "string" ? args.content : "";
        const mode = (optStr(args.mode) as
          | "overwrite"
          | "create-only"
          | "append"
          | "prepend") || "overwrite";
        return await this.adapter.writeNote({ path, content, mode });
      }

      case "append_to_note": {
        const path = reqStr(args.path, "path");
        const content = reqStr(args.content, "content");
        return await this.adapter.writeNote({
          path,
          content,
          mode: "append",
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
          limit: optNum(args.limit),
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
          nodes: args.includeNodes === false ? undefined : snap.nodes,
          links: args.includeLinks === false ? undefined : snap.links,
        };
      }

      case "open_note_or_graph": {
        return await this.adapter.focusGraphTarget({
          openGraphIfClosed: args.openGraphIfClosed !== false,
          groupId: optStr(args.groupId),
          notePath: optStr(args.notePath),
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
            matchedNodeIds: matched,
          });
        }
        return {
          enabled: settings.enabled,
          physics: {
            attractionStrength: settings.attractionStrength,
            clusterTether: settings.clusterTether,
            groupCompactness: settings.groupCompactness,
            showBoardGrid: settings.showBoardGrid,
            repelOutsidersFromFrames: settings.repelOutsidersFromFrames,
          },
          groups: enriched,
          pinnedNodes: settings.pinnedNodes || {},
        };
      }

      case "graph_create_group": {
        const settings = await this.adapter.getPluginSettings();
        const title = reqStr(args.name, "name");
        const mode = validMode(args.mode) || "organic";
        const subLayout = validSubLayout(args.frameSubLayout) || "grid";
        const color =
          optStr(args.color) ||
          DEFAULT_GROUP_COLORS[
            settings.groups.length % DEFAULT_GROUP_COLORS.length
          ];
        const query = optStr(args.query) || "";
        const nodeIds = strArray(args.nodeIds);

        const matchedIds = await this.adapter.resolveMatchingNodeIds({
          query,
          nodeIds,
          excludedNodeIds: [],
        });

        let frameX = optNum(args.frameX);
        let frameY = optNum(args.frameY);
        let frameW = optNum(args.frameW);
        let frameH = optNum(args.frameH);

        if (
          (mode === "miro-pinned" || mode === "miro-free") &&
          (frameX === undefined ||
            frameY === undefined ||
            frameW === undefined ||
            frameH === undefined)
        ) {
          const topo = await this.adapter.getGraphTopology();
          const pts = topo.nodes
            .filter(
              (n) =>
                matchedIds.includes(n.id) &&
                typeof n.x === "number" &&
                typeof n.y === "number"
            )
            .map((n) => ({ id: n.id, x: n.x!, y: n.y! }));
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

        const created: MagneticGroup = {
          id: createGroupId(),
          name: title,
          color,
          enabled: true,
          query,
          nodeIds,
          excludedNodeIds: [],
          strength: optNum(args.strength) ?? 1.0,
          colorNodes: args.colorNodes !== false,
          mode,
          anchorMode: "auto",
          frameX,
          frameY,
          frameW,
          frameH,
          frameSubLayout: subLayout,
        };

        await this.adapter.saveGroups([...settings.groups, created], true);
        return {
          created,
          matchedCount: matchedIds.length,
          matchedNodeIds: matchedIds,
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
        const nextSub =
          validSubLayout(args.frameSubLayout) ??
          target.frameSubLayout ??
          "grid";

        const updated: MagneticGroup = {
          ...target,
          name: optStr(args.name) ?? target.name,
          color: optStr(args.color) ?? target.color,
          enabled:
            typeof args.enabled === "boolean" ? args.enabled : target.enabled,
          query: typeof args.query === "string" ? args.query : target.query,
          strength: optNum(args.strength) ?? target.strength,
          colorNodes:
            typeof args.colorNodes === "boolean"
              ? args.colorNodes
              : target.colorNodes,
          mode: nextMode,
          frameSubLayout: nextSub,
          frameX: optNum(args.frameX) ?? target.frameX,
          frameY: optNum(args.frameY) ?? target.frameY,
          frameW: optNum(args.frameW) ?? target.frameW,
          frameH: optNum(args.frameH) ?? target.frameH,
          anchorMode:
            args.anchorMode === "auto" || args.anchorMode === "manual"
              ? args.anchorMode
              : target.anchorMode,
          anchorX: optNum(args.anchorX) ?? target.anchorX,
          anchorY: optNum(args.anchorY) ?? target.anchorY,
        };

        if (
          (updated.mode === "miro-pinned" || updated.mode === "miro-free") &&
          (updated.frameX === undefined ||
            updated.frameY === undefined ||
            updated.frameW === undefined ||
            updated.frameH === undefined)
        ) {
          const matchedIds = await this.adapter.resolveMatchingNodeIds(updated);
          const topo = await this.adapter.getGraphTopology();
          const pts = topo.nodes
            .filter(
              (n) =>
                matchedIds.includes(n.id) &&
                typeof n.x === "number" &&
                typeof n.y === "number"
            )
            .map((n) => ({ id: n.id, x: n.x!, y: n.y! }));
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

        // Clear custom freeform offsets if agent explicitly requested an ordered subLayout
        if (
          args.frameSubLayout &&
          args.frameSubLayout !== "freeform"
        ) {
          updated.customOffsets = {};
        }

        const nextGroups = settings.groups.map((g) =>
          g.id === target.id ? updated : g
        );
        await this.adapter.saveGroups(nextGroups, true);
        const matched = await this.adapter.resolveMatchingNodeIds(updated);
        return {
          updated,
          matchedCount: matched.length,
          matchedNodeIds: matched,
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

        const updated: MagneticGroup = {
          ...target,
          nodeIds: Array.from(manualSet),
          excludedNodeIds: Array.from(exclSet),
        };
        await this.adapter.saveGroups(
          settings.groups.map((g) => (g.id === target.id ? updated : g)),
          true
        );
        const matched = await this.adapter.resolveMatchingNodeIds(updated);
        return {
          groupId: updated.id,
          name: updated.name,
          matchedCount: matched.length,
          matchedNodeIds: matched,
        };
      }

      case "graph_pin_nodes": {
        const settings = await this.adapter.getPluginSettings();
        const nextPins = { ...(settings.pinnedNodes || {}) };

        if (Array.isArray(args.pins)) {
          for (const item of args.pins) {
            if (
              item &&
              typeof item === "object" &&
              typeof (item as { id?: unknown }).id === "string" &&
              typeof (item as { x?: unknown }).x === "number" &&
              typeof (item as { y?: unknown }).y === "number"
            ) {
              const p = item as { id: string; x: number; y: number };
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
            topo.nodes.map((n) => [n.id, { x: n.x ?? cx, y: n.y ?? cy }])
          );

          const n = nodeIds.length;
          const cols =
            pattern === "column"
              ? 1
              : pattern === "row"
              ? n
              : Math.max(1, Math.ceil(Math.sqrt(n)));
          const rows = Math.max(1, Math.ceil(n / cols));

          nodeIds.forEach((id, i) => {
            if (pattern === "current") {
              const cur = posById.get(id) || { x: cx, y: cy };
              nextPins[id] = { x: cur.x, y: cur.y };
            } else if (pattern === "circle") {
              const r = n <= 1 ? 0 : Math.max(spacing * 0.8, (n * spacing) / (2 * Math.PI));
              const ang = -Math.PI / 2 + (2 * Math.PI * i) / Math.max(1, n);
              nextPins[id] = {
                x: Math.round((cx + Math.cos(ang) * r) * 10) / 10,
                y: Math.round((cy + Math.sin(ang) * r) * 10) / 10,
              };
            } else {
              const c = i % cols;
              const r = Math.floor(i / cols);
              nextPins[id] = {
                x: Math.round((cx + (c - (cols - 1) / 2) * spacing) * 10) / 10,
                y: Math.round((cy + (r - (rows - 1) / 2) * spacing) * 10) / 10,
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
          pinnedNodes: updated.pinnedNodes,
        };
      }

      case "graph_unpin_nodes": {
        const settings = await this.adapter.getPluginSettings();
        if (args.unpinAll === true) {
          await this.adapter.updatePluginSettings({ pinnedNodes: {} }, true);
          return { pinnedCount: 0, pinnedNodes: {} };
        }
        const ids = strArray(args.nodeIds);
        const nextPins = { ...(settings.pinnedNodes || {}) };
        for (const id of ids) delete nextPins[id];
        const updated = await this.adapter.updatePluginSettings(
          { pinnedNodes: nextPins },
          true
        );
        return {
          pinnedCount: Object.keys(updated.pinnedNodes).length,
          pinnedNodes: updated.pinnedNodes,
        };
      }

      case "graph_arrange_miro_board": {
        return await this.arrangeMiroBoard(args);
      }

      case "graph_configure_physics": {
        const patch: Record<string, unknown> = {};
        const boolKeys = [
          "enabled",
          "syncNativeColorGroups",
          "showGroupZones",
          "showGroupLabels",
          "showBoardGrid",
          "repelOutsidersFromFrames",
        ] as const;
        for (const k of boolKeys) {
          if (typeof args[k] === "boolean") patch[k] = args[k];
        }
        const numKeys = [
          "attractionStrength",
          "clusterTether",
          "groupCompactness",
          "zoneOpacity",
        ] as const;
        for (const k of numKeys) {
          if (typeof args[k] === "number" && Number.isFinite(args[k] as number)) {
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
          zoneOpacity: updated.zoneOpacity,
        };
      }

      case "graph_reset_layout": {
        const settings = await this.adapter.getPluginSettings();
        let nextGroups = settings.groups.map((g) => ({ ...g }));
        if (args.convertAllFramesToOrganic === true) {
          nextGroups = nextGroups.map((g) => ({
            ...g,
            mode: "organic" as const,
          }));
        }
        if (args.resetManualAnchors === true) {
          nextGroups = nextGroups.map((g) => ({
            ...g,
            anchorMode: "auto" as const,
            anchorX: undefined,
            anchorY: undefined,
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
          groupsCount: nextGroups.length,
        };
      }

      default:
        throw new Error(`Unknown tool: "${name}"`);
    }
  }

  /**
   * Multi-frame Miro Board layout architect ("columns", "quadrants", "timeline", "ring").
   */
  private async arrangeMiroBoard(
    args: Record<string, unknown>
  ): Promise<unknown> {
    const settings = await this.adapter.getPluginSettings();
    const style =
      (optStr(args.boardStyle) as
        | "columns"
        | "quadrants"
        | "timeline"
        | "ring") || "columns";
    const centerX = optNum(args.centerX) ?? 0;
    const centerY = optNum(args.centerY) ?? 0;
    const gap = Math.max(40, optNum(args.gap) ?? 95);

    const groupsCopy = settings.groups.map((g) => ({ ...g }));
    const rawItems = Array.isArray(args.items)
      ? (args.items as ArrangeMiroBoardItemInput[])
      : [];

    const targetGroups: MagneticGroup[] = [];

    if (rawItems.length === 0) {
      for (const g of groupsCopy) {
        if (g.enabled) targetGroups.push(g);
      }
    } else {
      for (let i = 0; i < rawItems.length; i++) {
        const spec = rawItems[i];
        let grp = spec.groupIdOrName
          ? findGroupByIdOrName(groupsCopy, spec.groupIdOrName)
          : undefined;
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
          grp.frameSubLayout =
            validSubLayout(spec.subLayout) ||
            (style === "columns" ? "column" : "grid");
          grp.customOffsets = {};
          targetGroups.push(grp);
        } else {
          const created: MagneticGroup = {
            id: createGroupId(),
            name: spec.name || `Miro ${groupsCopy.length + 1}`,
            color:
              spec.color ||
              DEFAULT_GROUP_COLORS[
                groupsCopy.length % DEFAULT_GROUP_COLORS.length
              ],
            enabled: true,
            query: spec.query || "",
            nodeIds: Array.isArray(spec.nodeIds) ? spec.nodeIds : [],
            excludedNodeIds: [],
            strength: 1.0,
            colorNodes: true,
            mode: validMode(spec.mode) || "miro-pinned",
            anchorMode: "auto",
            frameSubLayout:
              validSubLayout(spec.subLayout) ||
              (style === "columns" ? "column" : "grid"),
          };
          groupsCopy.push(created);
          targetGroups.push(created);
        }
      }
    }

    // Measure appropriate width & height for each frame based on matched note count
    const sizedFrames: Array<{
      grp: MagneticGroup;
      matchedIds: string[];
      w: number;
      h: number;
    }> = [];

    for (const grp of targetGroups) {
      if (grp.mode === "organic") grp.mode = "miro-pinned";
      if (!grp.frameSubLayout || grp.frameSubLayout === "freeform") {
        grp.frameSubLayout = style === "columns" ? "column" : "grid";
      }
      grp.customOffsets = {};
      const matched = await this.adapter.resolveMatchingNodeIds(grp);
      const count = Math.max(1, matched.length);

      let w: number;
      let h: number;
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
        const totalW =
          sizedFrames.reduce((s, f) => s + f.w, 0) + gap * (total - 1);
        let cursorX = centerX - totalW / 2;
        const maxH = Math.max(...sizedFrames.map((f) => f.h));
        for (const f of sizedFrames) {
          f.grp.frameX = Math.round(cursorX);
          f.grp.frameY =
            style === "columns"
              ? Math.round(centerY - maxH / 2)
              : Math.round(centerY - f.h / 2);
          f.grp.frameW = Math.round(f.w);
          f.grp.frameH =
            style === "columns" ? Math.round(maxH) : Math.round(f.h);
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
        // style === "ring": Arrange Miro Frames around a spacious central area where dynamic hub notes live!
        const maxDim = Math.max(
          ...sizedFrames.map((f) => Math.hypot(f.w, f.h))
        );
        const ringRadius = Math.max(
          340,
          (total * (maxDim * 0.72 + gap)) / (2 * Math.PI) + 150
        );
        sizedFrames.forEach((f, idx) => {
          const ang = -Math.PI / 2 + (2 * Math.PI * idx) / total;
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
        matchedCount: f.matchedIds.length,
      })),
    };
  }
}

/* =========================================================================
 * Validation Helpers
 * ========================================================================= */

function findGroupByIdOrName(
  groups: MagneticGroup[],
  key: string
): MagneticGroup | undefined {
  const norm = key.trim().toLowerCase();
  return (
    groups.find((g) => g.id === key) ||
    groups.find((g) => g.name.trim().toLowerCase() === norm)
  );
}

function reqStr(v: unknown, field: string): string {
  if (typeof v !== "string" || !v.trim()) {
    throw new Error(`Missing required string parameter "${field}"`);
  }
  return v.trim();
}

function optStr(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}

function optNum(v: unknown): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

function strArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string" && x.trim().length > 0);
}

function validMode(v: unknown): GroupLayoutMode | undefined {
  return v === "organic" || v === "miro-free" || v === "miro-pinned"
    ? v
    : undefined;
}

function validSubLayout(v: unknown): MiroSubLayout | undefined {
  return v === "grid" ||
    v === "column" ||
    v === "row" ||
    v === "circle" ||
    v === "freeform"
    ? v
    : undefined;
}
