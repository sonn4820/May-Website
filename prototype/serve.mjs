// Tiny static server for the prototype (no dependencies). Run: node prototype/serve.mjs
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 4321;
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".json": "application/json" };

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (path === "/") path = "/index.html";
  const file = normalize(join(root, path));
  if (!file.startsWith(root + sep)) { res.writeHead(403); res.end("Forbidden"); return; }
  try {
    const data = await readFile(file);
    res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream", "cache-control": "no-store" });
    res.end(data);
  } catch {
    res.writeHead(404); res.end("Not found");
  }
}).listen(port, "127.0.0.1", () => console.log("Prototype running at http://localhost:" + port));
