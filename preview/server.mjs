import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 3000);

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".mjs": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".zip": "application/zip",
};

function sendFile(res, filePath, downloadName = null) {
  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
    return;
  }
  const ext = path.extname(filePath).toLowerCase();
  const headers = {
    "Content-Type": MIME[ext] || "application/octet-stream",
    "Cache-Control": "no-store",
    "Access-Control-Allow-Origin": "*",
  };
  if (downloadName) {
    headers["Content-Disposition"] = `attachment; filename="${downloadName}"`;
  }
  res.writeHead(200, headers);
  fs.createReadStream(filePath).pipe(res);
}

const server = http.createServer((req, res) => {
  const urlPath = (req.url || "/").split("?")[0];

  if (urlPath === "/" || urlPath === "/index.html") {
    return sendFile(res, path.join(__dirname, "index.html"));
  }
  if (urlPath === "/obsidian-shim.js") {
    return sendFile(res, path.join(__dirname, "obsidian-shim.js"));
  }
  if (urlPath === "/main.js") {
    return sendFile(res, path.join(rootDir, "main.js"));
  }
  if (urlPath === "/manifest.json") {
    return sendFile(res, path.join(rootDir, "manifest.json"));
  }
  if (urlPath === "/styles.css") {
    return sendFile(res, path.join(rootDir, "styles.css"));
  }
  if (urlPath === "/vendor/d3-force.js") {
    // Serve d3-force UMD bundle + dependencies bundled via node_modules
    return sendD3Bundle(res);
  }
  if (urlPath === "/download/graph-magnetic-groups.zip") {
    return sendFile(
      res,
      path.join(rootDir, "graph-magnetic-groups.zip"),
      "graph-magnetic-groups.zip"
    );
  }
  if (urlPath === "/download/main.js") {
    return sendFile(res, path.join(rootDir, "main.js"), "main.js");
  }
  if (urlPath === "/download/manifest.json") {
    return sendFile(res, path.join(rootDir, "manifest.json"), "manifest.json");
  }
  if (urlPath === "/download/obsidian-mcp-server.mjs") {
    return sendFile(
      res,
      path.join(rootDir, "mcp-server", "obsidian-mcp-server.mjs"),
      "obsidian-mcp-server.mjs"
    );
  }

  res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Not found");
});

let cachedD3Umd = null;
async function sendD3Bundle(res) {
  if (!cachedD3Umd) {
    const esbuild = await import("esbuild");
    const built = await esbuild.build({
      stdin: {
        contents: `import * as d3Force from "d3-force"; window.d3 = d3Force;`,
        resolveDir: rootDir,
        loader: "js",
      },
      bundle: true,
      format: "iife",
      write: false,
    });
    cachedD3Umd = built.outputFiles[0].text;
  }
  res.writeHead(200, {
    "Content-Type": "application/javascript; charset=utf-8",
    "Cache-Control": "public, max-age=3600",
    "Access-Control-Allow-Origin": "*",
  });
  res.end(cachedD3Umd);
}

server.listen(port, "0.0.0.0", () => {
  console.log(`Obsidian Graph Preview listening on http://0.0.0.0:${port}`);
});
