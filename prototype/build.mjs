// Joins the prototype sources into one self-contained file: prototype/index.html
// Run: node prototype/build.mjs
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = join(here, "src");
const files = readdirSync(src).sort();
const read = (f) => readFileSync(join(src, f), "utf8");
const pick = (ext) => files.filter((f) => f.endsWith(ext) && !f.startsWith("01-"));

const css = pick(".css").map(read).join("\n");
const js = pick(".js").map(read).join("\n");
const head = read("01-head.html").replace("/*__CSS__*/", () => css);
// Images in src/assets are inlined as data: URIs so index.html stays a single file
const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".svg": "image/svg+xml" };
const inlineAssets = (html) => html.replace(/src="assets\/([\w.-]+)"/g, (m, f) => {
  const type = MIME[f.slice(f.lastIndexOf(".")).toLowerCase()];
  if (!type) throw new Error("Unknown asset type: " + f);
  return 'src="data:' + type + ";base64," + readFileSync(join(src, "assets", f)).toString("base64") + '"';
});
const body = inlineAssets(pick(".html").map(read).join("\n")).replace("/*__JS__*/", () => js);

const out = head + body;
writeFileSync(join(here, "index.html"), out, "utf8");
try { new Function(js); console.log("script syntax: OK"); } catch (e) { console.error("script syntax error:", e.message); process.exitCode = 1; }

// PLACEHOLDERS.md at the project root is generated from the registry, so the tracking list never drifts
const reg = new Function(read("33-placeholders.js") + "\nreturn PLACEHOLDERS;")();
const md = [
  "# Thông tin cần bổ sung",
  "",
  "File này tự sinh từ `prototype/src/33-placeholders.js` mỗi lần chạy `npm run proto:build`. Đừng sửa tay.",
  "Khi có thông tin thật, thay token tương ứng. Bản production sẽ bị chặn nếu còn `INPUT_INFO_ABOUT_`.",
  "",
  "| Token | Cần gì | Dùng ở đâu |",
  "|---|---|---|",
  ...Object.entries(reg).map(([n, r]) => "| `INPUT_INFO_ABOUT_" + n + "_HERE` | " + r.need + " | " + r.where + " |"),
  ""
].join("\n");
writeFileSync(join(here, "..", "PLACEHOLDERS.md"), md, "utf8");

const tokens = new Set(out.match(/INPUT_INFO_ABOUT_[A-Z0-9_]+_HERE/g) || []);
const dataPh = new Set([...out.matchAll(/data-(?:ph|link)="([A-Z0-9_]+)"/g)].map((m) => m[1]));
const registry = new Set([...js.matchAll(/^\s{2}([A-Z0-9_]+):\s+\{ label:/gm)].map((m) => m[1]));
const missing = [...dataPh].filter((n) => !registry.has(n));
console.log("index.html:", (out.length / 1024).toFixed(1), "KB");
console.log("placeholders used in markup:", dataPh.size, "| in registry:", registry.size, "| literal tokens:", tokens.size);
if (missing.length) { console.error("Not in registry:", missing.join(", ")); process.exitCode = 1; }
