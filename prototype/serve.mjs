// Tiny static server for the prototype, plus the booking API (server/booking).
// Run: node prototype/serve.mjs
// Booking runs against a mock OpenDental unless BOOKING_MODE=opendental and the OPENDENTAL_* keys are set
// (see server/README.md). Node 24 runs the TypeScript files in server/ directly.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, extname, join, normalize, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createBookingFromEnv } from "../server/booking/index.ts";

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 4321;
const types = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".json": "application/json" };
// The mock allows many test bookings from one computer; the real setting stays at 5 per 10 minutes per IP
const booking = createBookingFromEnv(process.env, process.env.BOOKING_MODE === "opendental" ? {} : { maxBookings: 200 });

// Node request -> web Request, web Response -> Node response
async function toRequest(req) {
  const chunks = [];
  let size = 0;
  for await (const c of req) { size += c.length; if (size > 20_000) break; chunks.push(c); }
  const body = req.method === "GET" || req.method === "HEAD" ? undefined : Buffer.concat(chunks);
  return new Request("http://localhost" + req.url, { method: req.method, headers: req.headers, body });
}
async function send(res, response) {
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
}

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (path === "/api/booking/availability" && req.method === "GET") return send(res, await booking.handlers.availability(await toRequest(req)));
  if (path === "/api/booking") return send(res, await booking.handlers.book(await toRequest(req), req.socket.remoteAddress || "unknown"));
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
}).listen(port, "127.0.0.1", () => console.log("Prototype running at http://localhost:" + port + " · booking: " + (booking.cfg.mode === "opendental" ? "OpenDental API" : "mock OpenDental")));
