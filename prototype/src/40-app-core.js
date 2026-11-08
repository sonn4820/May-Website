// ---------- Helpers ----------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const clone = (o) => JSON.parse(JSON.stringify(o));
const pad = (n) => String(n).padStart(2, "0");
const isoDate = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const fromIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const store = {
  get(k, d) { try { const v = localStorage.getItem("dentproto:" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("dentproto:" + k, JSON.stringify(v)); } catch (e) { /* storage blocked: keep going */ } }
};

const LANGS = ["en", "vi", "es"];
const LOCALE = { en: "en-US", vi: "vi-VN", es: "es-US" };
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const WEEK_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

// ---------- Clinic hours (from the clinic, Nov 2026; staff change them in the Staff Portal) ----------
function nthWeekday(year, month, weekday, n) { const d = new Date(year, month, 1); const shift = (weekday - d.getDay() + 7) % 7; return new Date(year, month, 1 + shift + (n - 1) * 7); }
function upcoming(builder, today) { let d = builder(today.getFullYear()); if (isoDate(d) < isoDate(today)) d = builder(today.getFullYear() + 1); return d; }

const TODAY = new Date();
const thanksgiving = upcoming((y) => nthWeekday(y, 10, 4, 4), TODAY);
const xmasEve = upcoming((y) => new Date(y, 11, 24), TODAY);
const xmas = upcoming((y) => new Date(y, 11, 25), TODAY);
const newYear = upcoming((y) => new Date(y, 0, 1), TODAY);

const SAMPLE_HOURS = {
  mon: { open: true, from: "10:00", to: "19:00" },
  tue: { open: true, from: "09:00", to: "17:00" },
  wed: { open: true, from: "09:00", to: "17:00" },
  thu: { open: true, from: "09:00", to: "17:00" },
  fri: { open: false, from: "09:00", to: "17:00" },
  sat: { open: true, from: "09:00", to: "14:00" },
  sun: { open: false, from: "09:00", to: "14:00" }
};

const state = {
  lang: LANGS.includes(store.get("lang", "en")) ? store.get("lang", "en") : "en",
  scale: [1, 1.15, 1.3].includes(store.get("scale", 1)) ? store.get("scale", 1) : 1,
  phMode: "token",
  protoCollapsed: false,
  a11y: {},
  device: "desktop",
  view: "site",
  page: "home",
  doc: null,
  pub: { hours: clone(SAMPLE_HOURS), at: null },
  draft: clone(SAMPLE_HOURS),
  dates: [
    { id: 1, date: isoDate(thanksgiving), type: "closed", note: { en: "Thanksgiving", vi: "Lễ Tạ Ơn", es: "Día de Acción de Gracias" } },
    { id: 2, date: isoDate(xmasEve), type: "special", from: "09:00", to: "12:00", note: { en: "Christmas Eve", vi: "Đêm Giáng sinh", es: "Nochebuena" } },
    { id: 3, date: isoDate(xmas), type: "closed", note: { en: "Christmas Day", vi: "Lễ Giáng sinh", es: "Navidad" } },
    { id: 4, date: isoDate(newYear), type: "closed", note: { en: "New Year's Day", vi: "Tết Dương lịch", es: "Año Nuevo" } }
  ],
  notice: null,
  noticeDraft: null,
  noticeDismissed: false,
  subs: { np: [] },
  booked: [],
  signedIn: false,
  stTab: "hours",
  sheetTab: "np"
};

// ---------- Text and formatting ----------
function t(key, vars) {
  let s = (I18N[state.lang] && I18N[state.lang][key]) ?? I18N.en[key] ?? key;
  if (vars) s = s.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
  return s;
}
const fmtTime = (hhmm, lang = state.lang) => { const [h, m] = hhmm.split(":").map(Number); return new Intl.DateTimeFormat(LOCALE[lang], { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, h, m)); };
const fmtRange = (from, to, lang = state.lang) => fmtTime(from, lang) + " – " + fmtTime(to, lang);
const weekdayName = (key, lang = state.lang) => { const base = new Date(2024, 0, 7); return cap(new Intl.DateTimeFormat(LOCALE[lang], { weekday: "long" }).format(addDays(base, DAY_KEYS.indexOf(key)))); };
const weekdayShort = (key, lang = state.lang) => { const base = new Date(2024, 0, 7); return cap(new Intl.DateTimeFormat(LOCALE[lang], { weekday: "short" }).format(addDays(base, DAY_KEYS.indexOf(key)))); };
const fmtDayInSentence = (d, lang = state.lang) => new Intl.DateTimeFormat(LOCALE[lang], { weekday: "long" }).format(d);
const fmtDateLong = (d, lang = state.lang) => { const s = new Intl.DateTimeFormat(LOCALE[lang], { weekday: "long", month: "long", day: "numeric" }).format(d); return lang === "es" ? s.replace(",", "") : s; };
const fmtDateShort = (d, lang = state.lang) => cap(new Intl.DateTimeFormat(LOCALE[lang], { weekday: "short", month: "short", day: "numeric" }).format(d));
const fmtStamp = (d) => new Intl.DateTimeFormat(LOCALE[state.lang], { hour: "numeric", minute: "2-digit", second: "2-digit" }).format(d);

function sampleNotice() {
  const day = thanksgiving;
  let next = addDays(thanksgiving, 1);
  for (let i = 0; i < 14 && !dayInfo(next).open; i++) next = addDays(next, 1);
  return {
    active: true,
    from: isoDate(TODAY),
    to: isoDate(thanksgiving),
    text: {
      en: "We are closed on " + fmtDateLong(day, "en") + " for Thanksgiving. We open again on " + fmtDateLong(next, "en") + ".",
      vi: "Phòng khám nghỉ " + fmtDateLong(day, "vi") + " nhân dịp Lễ Tạ Ơn. Mở cửa lại vào " + fmtDateLong(next, "vi") + ".",
      es: "Cerramos el " + fmtDateLong(day, "es") + " por el Día de Acción de Gracias. Abrimos de nuevo el " + fmtDateLong(next, "es") + "."
    }
  };
}

// {ph:NAME} inside dictionary strings becomes a placeholder chip
const renderStr = (s) => esc(s).replace(/\{ph:([A-Z0-9_]+)\}/g, (m, n) => '<span class="ph" data-ph="' + n + '"></span>');

function applyI18n(root = document) {
  $$("[data-i18n]", root).forEach((el) => { el.innerHTML = renderStr(t(el.dataset.i18n)); });
  $$("[data-i18n-attr]", root).forEach((el) => {
    el.dataset.i18nAttr.split(";").forEach((pair) => { const [attr, key] = pair.split(":"); if (attr && key) el.setAttribute(attr.trim(), t(key.trim())); });
  });
  renderPlaceholders(root);
}

function renderPlaceholders(root = document) {
  $$(".ph[data-ph]", root).forEach((el) => {
    const name = el.dataset.ph;
    const reg = PLACEHOLDERS[name];
    el.textContent = state.phMode === "token" ? phToken(name) : (reg ? reg.label : name);
    el.classList.toggle("is-label", state.phMode === "label");
    el.title = phToken(name);
  });
  $$("[data-info]", root).forEach((el) => { el.textContent = CLINIC_INFO[el.dataset.info]; });
}

// ---------- Prototype chrome ----------
function toast(msg) {
  const box = $("#toasts");
  const el = document.createElement("div");
  el.className = "toast";
  el.innerHTML = '<svg class="ic"><use href="#i-info"/></svg>';
  const span = document.createElement("span");
  span.textContent = msg;
  el.appendChild(span);
  box.appendChild(el);
  while (box.children.length > 3) box.firstElementChild.remove();
  setTimeout(() => { el.classList.add("is-leaving"); setTimeout(() => el.remove(), 250); }, 4200);
}

// Whole-page changes (language, text size, device, view) cross-fade where the browser supports
// View Transitions; elsewhere the changed area fades in. Skipped while the page is booting.
let booted = false;
function smoothUpdate(fn, fallbackEl) {
  if (booted && document.startViewTransition && !state.a11y.still) {
    try {
      const vt = document.startViewTransition(fn);
      // A transition is skipped when another starts right away; the change itself still happens
      [vt.ready, vt.finished].forEach((p) => p && p.catch(() => {}));
      return;
    } catch (e) { /* fall back below */ }
  }
  fn();
  if (booted && fallbackEl) { fallbackEl.classList.remove("is-entering-soft"); void fallbackEl.offsetWidth; fallbackEl.classList.add("is-entering-soft"); }
}

function updateProtoH() { document.documentElement.style.setProperty("--proto-h", $("#protoBar").offsetHeight + "px"); }

function updateBreakpoint() {
  const site = $("#site");
  if (!site || !site.offsetParent) return;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const r = site.getBoundingClientRect().width / rem;
  const val = r < 48 ? "narrow" : r < 72 ? "medium" : "wide";
  const device = $("#device");
  if (device.dataset.w !== val) { device.dataset.w = val; if (val !== "narrow") closeMenu(); }
}

function setView(v) {
  if (v === state.view && booted) return;
  closeA11y(false);
  smoothUpdate(() => {
    state.view = v;
    $$("[data-view]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.view === v)));
    ["site", "staff", "how", "ph"].forEach((x) => { $("#view-" + x).hidden = x !== v; });
    $("#deviceSeg").hidden = v !== "site";
    if (v === "site") { renderSite(); requestAnimationFrame(() => { updateBreakpoint(); refreshReveal(); }); }
    if (v === "staff") renderStaff();
    if (v === "ph") renderPhTable();
    updateProtoH();
    window.scrollTo(0, 0);
  }, $("#view-" + v));
}

function setDevice(d) {
  closeMenu();
  smoothUpdate(() => {
    state.device = d;
    $("#device").classList.toggle("is-phone", d === "phone");
    $$("[data-device]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.device === d)));
    updateBreakpoint();
  }, $("#device"));
  requestAnimationFrame(() => { updateBreakpoint(); refreshReveal(); });
}

// Top-left "Thu gọn / Mở rộng" button: collapses the prototype bar to one slim row
function setProtoCollapsed(c) {
  smoothUpdate(() => {
    state.protoCollapsed = c;
    store.set("protoCollapsed", c);
    $("#protoBar").classList.toggle("is-collapsed", c);
    const btn = $("#protoToggle");
    btn.setAttribute("aria-expanded", String(!c));
    btn.title = c ? "Mở rộng thanh công cụ prototype" : "Thu gọn thanh công cụ prototype";
    btn.querySelector(".proto-toggle__text").textContent = c ? "Mở rộng" : "Thu gọn";
    updateProtoH();
  }, $("#protoBar"));
}

function setPhMode(m) {
  smoothUpdate(() => {
    state.phMode = m;
    $$("[data-phmode]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.phmode === m)));
    renderPlaceholders();
  });
}

function setScale(s) {
  smoothUpdate(() => {
    state.scale = s;
    document.documentElement.style.fontSize = Math.round(s * 100) + "%";
    $$("[data-scale]").forEach((b) => b.setAttribute("aria-pressed", String(Number(b.dataset.scale) === s)));
    store.set("scale", s);
    renderA11y();
    updateBreakpoint();
  }, $("#site"));
}

function setLang(l) {
  if (!LANGS.includes(l)) return;
  smoothUpdate(() => {
    state.lang = l;
    store.set("lang", l);
    $("#site").lang = l;
    $("#view-staff").lang = l;
    $$("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === l)));
    applyI18n();
    renderA11y();
    renderSite();
    if (state.view === "staff") renderStaff();
  }, state.view === "staff" ? $("#view-staff") : $("#site"));
}

// ---------- Placeholder list ----------
function renderPhTable() {
  const counts = {};
  $$(".ph[data-ph]").forEach((el) => { counts[el.dataset.ph] = (counts[el.dataset.ph] || 0) + 1; });
  $$("[data-link]").forEach((el) => { counts[el.dataset.link] = (counts[el.dataset.link] || 0) + 1; });
  const names = Object.keys(PLACEHOLDERS);
  Object.keys(counts).forEach((n) => { if (!names.includes(n)) names.push(n); });
  const body = $("#phBody");
  body.innerHTML = "";
  names.forEach((n) => {
    const reg = PLACEHOLDERS[n] || { need: "Chưa có mô tả", where: "" };
    const tr = document.createElement("tr");
    const used = counts[n] ? " · xuất hiện " + counts[n] + " lần trên trang" : "";
    tr.innerHTML = '<td><span class="ph"></span></td><td></td><td></td>';
    tr.children[0].firstChild.textContent = phToken(n);
    tr.children[1].textContent = reg.need;
    tr.children[2].textContent = reg.where + used;
    body.appendChild(tr);
  });
  $("#phCount").textContent = names.length;
}
