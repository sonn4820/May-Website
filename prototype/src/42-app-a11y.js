// ---------- Accessibility menu (round button bottom-left) ----------
// Our own version of the UserWay widget on the clinic's current site: no third-party script,
// same look and 3 languages as the site, and every choice is saved on the person's device.
// Tiles with levels cycle Off → level 1 → level 2 → Off on each press. "Bigger text" drives the
// same text size as the A / A+ / A++ buttons, so both always agree.
const A11Y_TOOLS = [
  { key: "contrast", icon: "contrast", levels: ["a11y_contrast_1", "a11y_contrast_2"] },
  { key: "links", icon: "link" },
  { key: "size", icon: "textsize", levels: ["a11y_size_1", "a11y_size_2"] },
  { key: "spacing", icon: "spacing", levels: ["a11y_level_1", "a11y_level_2"] },
  { key: "still", icon: "pause" },
  { key: "img", icon: "noimg" },
  { key: "font", icon: "font" },
  { key: "cursor", icon: "cursor" },
  { key: "lh", icon: "lineheight", levels: ["a11y_level_1", "a11y_level_2"] },
  { key: "sat", icon: "drop", levels: ["a11y_sat_1", "a11y_sat_2"] }
];
const SCALES = [1, 1.15, 1.3];
const a11yTool = (key) => A11Y_TOOLS.find((f) => f.key === key);
const a11yMax = (f) => (f.levels ? f.levels.length : 1);
const a11yIsOpen = () => $("#a11yPanel").classList.contains("is-open");

function loadA11y() {
  const saved = store.get("a11y", {});
  const out = {};
  A11Y_TOOLS.forEach((f) => {
    if (f.key === "size") return;
    const v = saved && typeof saved === "object" ? Number(saved[f.key]) : 0;
    out[f.key] = Number.isInteger(v) && v > 0 && v <= a11yMax(f) ? v : 0;
  });
  return out;
}
const a11yLevel = (key) => (key === "size" ? Math.max(0, SCALES.indexOf(state.scale)) : state.a11y[key] || 0);

function buildA11y() {
  $("#a11yGrid").innerHTML = A11Y_TOOLS.map((f) =>
    '<button type="button" class="a11y-tile" data-a11y="' + f.key + '" aria-pressed="false">' +
      '<span class="a11y-tile__check" aria-hidden="true"><svg class="ic"><use href="#i-check"/></svg></span>' +
      '<svg class="ic a11y-tile__ic" aria-hidden="true"><use href="#i-' + f.icon + '"/></svg>' +
      '<span class="a11y-tile__name" data-i18n="a11y_' + f.key + '"></span>' +
      '<span class="a11y-tile__state"></span>' +
      (f.levels ? '<span class="a11y-tile__steps" aria-hidden="true">' + f.levels.map(() => "<i></i>").join("") + "</span>" : "") +
    "</button>"
  ).join("");
}

function applyA11y() {
  const site = $("#site");
  A11Y_TOOLS.forEach((f) => {
    if (f.key === "size") return;
    const v = state.a11y[f.key];
    if (v) site.setAttribute("data-a11y-" + f.key, String(v));
    else site.removeAttribute("data-a11y-" + f.key);
  });
  renderA11y();
}

// Tile states and the "something is on" dot on the round button
function renderA11y() {
  if (!$("#a11yGrid")) return;
  let any = false;
  $$("#a11yGrid [data-a11y]").forEach((b) => {
    const f = a11yTool(b.dataset.a11y);
    const v = a11yLevel(f.key);
    if (v) any = true;
    b.setAttribute("aria-pressed", String(v > 0));
    b.querySelector(".a11y-tile__state").textContent = v ? (f.levels ? t(f.levels[v - 1]) : t("a11y_on")) : t("a11y_off");
    $$(".a11y-tile__steps i", b).forEach((i, n) => i.classList.toggle("is-on", n < v));
  });
  $("#a11yReset").disabled = !any;
  $("#a11yBtn").classList.toggle("is-active", any);
}

function stepA11y(key) {
  const f = a11yTool(key);
  if (!f) return;
  const next = (a11yLevel(key) + 1) % (a11yMax(f) + 1);
  if (key === "size") { setScale(SCALES[next]); return; }
  state.a11y[key] = next;
  store.set("a11y", state.a11y);
  applyA11y();
}

function resetA11y() {
  A11Y_TOOLS.forEach((f) => { if (f.key !== "size") state.a11y[f.key] = 0; });
  store.set("a11y", state.a11y);
  if (state.scale !== 1) setScale(1);
  applyA11y();
  $("#a11yStatus").textContent = t("a11y_reset_done");
  $("#a11yClose").focus();
}

let a11yReturnFocus = null;
function openA11y() {
  closeMenu();
  const p = $("#a11yPanel");
  a11yReturnFocus = document.activeElement;
  p.inert = false;
  p.classList.add("is-open");
  $("#a11yBtn").setAttribute("aria-expanded", "true");
  $("#a11yStatus").textContent = "";
  setTimeout(() => $("#a11yClose").focus(), 60);
}
function closeA11y(returnFocus = true) {
  const p = $("#a11yPanel");
  if (!p || !p.classList.contains("is-open")) return;
  p.classList.remove("is-open");
  p.inert = true;
  $("#a11yBtn").setAttribute("aria-expanded", "false");
  if (!returnFocus) return;
  const back = a11yReturnFocus && document.contains(a11yReturnFocus) && a11yReturnFocus.offsetParent ? a11yReturnFocus : $("#a11yBtn");
  back.focus({ preventScroll: true });
}
// Tab stays inside the panel while it is open
function trapA11yFocus(e) {
  if (e.key !== "Tab" || !a11yIsOpen()) return;
  const f = $$("button:not(:disabled)", $("#a11yPanel")).filter((x) => x.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (!$("#a11yPanel").contains(document.activeElement)) { e.preventDefault(); first.focus(); }
  else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}
