import esbuild from "esbuild";
import builtins from "node:module";
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const prod = process.argv[2] === "production";
const nodeBuiltins = [
  ...builtins.builtinModules,
  ...builtins.builtinModules.map((m) => `node:${m}`),
];

/**
 * Minimal pure-Node ZIP creator (Deflate, standard PKZIP format)
 * so we generate a ready-to-drop `graph-magnetic-groups.zip` with zero external tools.
 */
function buildZipBuffer(entries) {
  const crcTable = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    crcTable[n] = c >>> 0;
  }
  const crc32 = (buf) => {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
    }
    return (crc ^ 0xffffffff) >>> 0;
  };

  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuf = Buffer.from(entry.name, "utf8");
    const rawBuf = Buffer.isBuffer(entry.data)
      ? entry.data
      : Buffer.from(entry.data, "utf8");
    const compressed = zlib.deflateRawSync(rawBuf, { level: 9 });
    const crc = crc32(rawBuf);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6); // UTF-8 flag
    localHeader.writeUInt16LE(8, 8); // deflate
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0x5541, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressed.length, 18);
    localHeader.writeUInt32LE(rawBuf.length, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(8, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0x5541, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(compressed.length, 20);
    centralHeader.writeUInt32LE(rawBuf.length, 24);
    centralHeader.writeUInt16LE(nameBuf.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);

    localParts.push(localHeader, nameBuf, compressed);
    centralParts.push(centralHeader, nameBuf);
    offset += localHeader.length + nameBuf.length + compressed.length;
  }

  const centralBuf = Buffer.concat(centralParts);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralBuf.length, 12);
  eocd.writeUInt32LE(offset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralBuf, eocd]);
}

function packagePluginArtifacts() {
  const outDir = path.resolve("graph-magnetic-groups");
  const outMcpDir = path.join(outDir, "mcp-server");
  fs.mkdirSync(outMcpDir, { recursive: true });

  const manifest = fs.readFileSync("manifest.json");
  const mainJs = fs.readFileSync("main.js");
  const stylesCss = fs.existsSync("styles.css")
    ? fs.readFileSync("styles.css")
    : null;
  const mcpServerMjs = fs.readFileSync("mcp-server/obsidian-mcp-server.mjs");
  const startSh = fs.readFileSync("mcp-server/start-tunnel.sh");
  const startBat = fs.readFileSync("mcp-server/start-tunnel.bat");

  fs.chmodSync("mcp-server/obsidian-mcp-server.mjs", 0o755);
  fs.chmodSync("mcp-server/start-tunnel.sh", 0o755);

  fs.writeFileSync(path.join(outDir, "manifest.json"), manifest);
  fs.writeFileSync(path.join(outDir, "main.js"), mainJs);
  if (stylesCss) {
    fs.writeFileSync(path.join(outDir, "styles.css"), stylesCss);
  }
  fs.writeFileSync(
    path.join(outMcpDir, "obsidian-mcp-server.mjs"),
    mcpServerMjs
  );
  fs.writeFileSync(path.join(outMcpDir, "start-tunnel.sh"), startSh);
  fs.writeFileSync(path.join(outMcpDir, "start-tunnel.bat"), startBat);

  const zipEntries = [
    { name: "graph-magnetic-groups/manifest.json", data: manifest },
    { name: "graph-magnetic-groups/main.js", data: mainJs },
    {
      name: "graph-magnetic-groups/mcp-server/obsidian-mcp-server.mjs",
      data: mcpServerMjs,
    },
    { name: "graph-magnetic-groups/mcp-server/start-tunnel.sh", data: startSh },
    {
      name: "graph-magnetic-groups/mcp-server/start-tunnel.bat",
      data: startBat,
    },
  ];
  if (stylesCss) {
    zipEntries.push({
      name: "graph-magnetic-groups/styles.css",
      data: stylesCss,
    });
  }
  const zipBuf = buildZipBuffer(zipEntries);
  fs.writeFileSync("graph-magnetic-groups.zip", zipBuf);
}

const pluginContext = await esbuild.context({
  banner: {
    js: "/* Graph Magnetic Groups & Miro + MCP — Obsidian Plugin (generated bundle) */",
  },
  entryPoints: ["src/main.ts"],
  bundle: true,
  external: [
    "obsidian",
    "electron",
    "@codemirror/autocomplete",
    "@codemirror/collab",
    "@codemirror/commands",
    "@codemirror/language",
    "@codemirror/lint",
    "@codemirror/search",
    "@codemirror/state",
    "@codemirror/view",
    "@lezer/common",
    "@lezer/highlight",
    "@lezer/lr",
    ...nodeBuiltins,
  ],
  format: "cjs",
  target: "es2020",
  logLevel: "info",
  sourcemap: prod ? false : "inline",
  treeShaking: true,
  outfile: "main.js",
});

const mcpCliContext = await esbuild.context({
  banner: {
    js: "#!/usr/bin/env node\n/* Obsidian Magnetic Groups & Miro — Standalone MCP Server + Cloudflare Quick Tunnel */",
  },
  entryPoints: ["src/mcp/standaloneCli.ts"],
  bundle: true,
  platform: "node",
  external: [...nodeBuiltins],
  plugins: [
    {
      name: "obsidian-standalone-stub",
      setup(build) {
        build.onResolve({ filter: /^obsidian$/ }, () => ({
          path: "obsidian-stub",
          namespace: "stub",
        }));
        build.onLoad({ filter: /.*/, namespace: "stub" }, () => ({
          contents:
            "export class TFile {} export class TFolder {} export function getAllTags() { return []; }",
          loader: "js",
        }));
      },
    },
  ],
  format: "esm",
  target: "node18",
  logLevel: "info",
  sourcemap: false,
  treeShaking: true,
  outfile: "mcp-server/obsidian-mcp-server.mjs",
});

if (prod) {
  await pluginContext.rebuild();
  await mcpCliContext.rebuild();
  packagePluginArtifacts();
  await pluginContext.dispose();
  await mcpCliContext.dispose();
} else {
  await pluginContext.watch();
  await mcpCliContext.watch();
}
