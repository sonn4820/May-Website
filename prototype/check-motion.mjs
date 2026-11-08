// Confirms in a real browser that motion is animated, not instant: drives headless Chrome/Edge over
// the DevTools protocol, emulates "reduce motion" (like a Windows PC with Animation effects off),
// and samples values while each interaction plays. Run: npm run proto:motion
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const exe = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
].find(existsSync);
if (!exe) { console.error("Chrome or Edge not found"); process.exit(1); }

const port = 9333;
const profile = mkdtempSync(join(tmpdir(), "proto-motion-"));
const chrome = spawn(exe, ["--headless=new", "--disable-gpu", "--no-first-run", "--remote-debugging-port=" + port, "--user-data-dir=" + profile, "--window-size=1280,900", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

let targets = [];
for (let i = 0; i < 60 && !targets.length; i++) {
  try { targets = (await (await fetch("http://127.0.0.1:" + port + "/json/list")).json()).filter((t) => t.type === "page"); } catch { /* not up yet */ }
  if (!targets.length) await sleep(100);
}
const ws = new WebSocket(targets[0].webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let seq = 0;
const pending = new Map();
ws.addEventListener("message", (m) => { const msg = JSON.parse(m.data); if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); } });
const send = (method, params = {}) => new Promise((resolve) => { const id = ++seq; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params })); });
const js = async (expression) => (await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true })).result?.result?.value;
const sample = async (expr, n = 14, every = 70) => { const out = []; for (let i = 0; i < n; i++) { out.push(await js(expr)); await sleep(every); } return out; };
const varied = (arr) => new Set(arr.map((v) => (typeof v === "number" ? Math.round(v * 100) / 100 : v))).size;

const results = [];
const ok = (name, cond, extra = "") => results.push({ name, pass: !!cond, extra });

await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
await send("Page.navigate", { url: pathToFileURL(fileURLToPath(new URL("./index.html", import.meta.url))).href });
await sleep(2500);

ok("prototype defaults to full motion", await js("document.documentElement.classList.contains('motion-full')"));

// Nav link -> smooth scroll down to the section
await js("window.scrollTo(0, 0); document.querySelector('.nav__link[data-scroll=\"doctor\"]').click(); true");
const scrolls = await sample("Math.round(window.scrollY)", 16, 70);
ok("nav click scrolls smoothly (many in-between positions)", varied(scrolls) >= 7, scrolls.join(" "));
await sleep(400);
const gap = await js("Math.round(document.getElementById('doctor').getBoundingClientRect().top - (document.getElementById('protoBar').offsetHeight + document.getElementById('siteHeader').offsetHeight + 12))");
ok("lands right under the sticky header", Math.abs(gap) <= 3, "offset " + gap);
ok("arrival underline on the heading", await js("document.getElementById('doctor').classList.contains('is-arrived')"));

// Content fades and slides in when scrolled to
await js("window.scrollTo(0, document.getElementById('articles').offsetTop - 200); true");
const reveal = await sample("getComputedStyle(document.querySelector('#articles .article')).opacity", 12, 80);
ok("cards fade in gradually", reveal.some((v) => v > 0.05 && v < 0.95), reveal.join(" "));

// Services dropdown glides open
await js("window.scrollTo(0, 0); document.getElementById('servicesToggle').click(); true");
const dd = await sample("getComputedStyle(document.getElementById('servicesMenu')).opacity", 8, 40);
ok("dropdown fades in", dd.some((v) => v > 0.05 && v < 0.95), dd.join(" "));
await js("document.getElementById('servicesToggle').click(); true");

// Page change fades out, then the new page fades in
await sleep(500);
await js("document.querySelector('.nav__link[data-route=\"new\"]').click(); true");
const pageFade = await sample("(() => { const p = document.querySelector('.page:not([hidden])'); return p.id + ':' + Number(getComputedStyle(p).opacity).toFixed(2); })()", 14, 50);
ok("page swap fades instead of jumping", pageFade.some((v) => /:0\.[1-9]/.test(v)), pageFade.join(" "));

// FAQ answer opens by height
await sleep(700);
await js("document.getElementById('faq-q1').scrollIntoView(); document.getElementById('faq-q1').click(); true");
const faq = await sample("Math.round(document.getElementById('faq-a1').getBoundingClientRect().height)", 10, 50);
ok("FAQ answer grows smoothly", varied(faq) >= 4, faq.join(" "));

// "Theo cài đặt máy": travel removed, scroll still eased but short
await js("document.querySelector('[data-motion=\"system\"]').click(); true");
await js("document.querySelector('[data-route=\"home\"][data-scroll=\"top\"]').click(); true");
await sleep(900);
await js("window.scrollTo(0, 0); document.querySelector('.nav__link[data-scroll=\"visit\"]').click(); true");
const short = await sample("Math.round(window.scrollY)", 8, 50);
ok("system mode still eases the scroll (no jump)", varied(short) >= 3, short.join(" "));

const errors = await js("(window.__errors || []).length");
ws.close();
chrome.kill();
await sleep(300);
try { rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome may still hold the folder */ }

results.forEach((r) => console.log((r.pass ? "PASS " : "FAIL ") + r.name + (r.extra ? "  [" + r.extra + "]" : "")));
const failed = results.filter((r) => !r.pass).length;
console.log("\n" + (results.length - failed) + "/" + results.length + " motion checks passed" + (errors ? " (page errors: " + errors + ")" : ""));
process.exitCode = failed ? 1 : 0;
