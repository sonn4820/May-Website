// ---------- Helpers ----------
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = (n) => String(n).padStart(2, "0");
const isoDate = (d) => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const fromIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const toMin = (hhmm) => { const [h, m] = hhmm.split(":").map(Number); return h * 60 + m; };
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const store = {
  get(k, d) { try { const v = localStorage.getItem("excelcare:" + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("excelcare:" + k, JSON.stringify(v)); } catch (e) { /* storage blocked: keep going */ } }
};

const LANGS = ["en", "vi", "es"];
const LOCALE = { en: "en-US", vi: "vi-VN", es: "es-US" };
const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const WEEK_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

// ---------- Clinic hours (confirmed by the clinic, Nov 2026) ----------
const CLINIC_HOURS = {
  mon: { open: true, from: "10:00", to: "19:00" },
  tue: { open: true, from: "09:00", to: "17:00" },
  wed: { open: true, from: "09:00", to: "17:00" },
  thu: { open: true, from: "09:00", to: "17:00" },
  fri: { open: false, from: "09:00", to: "17:00" },
  sat: { open: true, from: "09:00", to: "14:00" },
  sun: { open: false, from: "09:00", to: "14:00" }
};
// Holidays and one-off hours. Add only dates the clinic has confirmed; they show under "Upcoming changes"
// and in today's status. Examples:
//   { date: "2026-12-25", type: "closed", note: { en: "Christmas Day", vi: "Lễ Giáng sinh", es: "Navidad" } }
//   { date: "2026-12-24", type: "special", from: "09:00", to: "12:00", note: { en: "Christmas Eve", vi: "Đêm Giáng sinh", es: "Nochebuena" } }
const CLINIC_DATES = [];
// Banner across the top of every page, or null for none. Example:
//   { active: true, from: "2026-11-20", to: "2026-11-26", text: { en: "…", vi: "…", es: "…" } }
const CLINIC_NOTICE = null;

const state = {
  lang: LANGS.includes(store.get("lang", "en")) ? store.get("lang", "en") : "en",
  scale: [1, 1.15, 1.3].includes(store.get("scale", 1)) ? store.get("scale", 1) : 1,
  a11y: {},
  page: "home",
  doc: null,
  hours: CLINIC_HOURS,
  dates: CLINIC_DATES,
  notice: CLINIC_NOTICE,
  noticeDismissed: false,
  booked: []
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

// Keep missing fields out of the rendered text.
const renderStr = (s) => esc(s)
  .replace(/\{ph:[A-Z0-9_]+\}/g, "")
  .replace(/\{info:([A-Z0-9_]+)\}/g, (_, n) => '<span data-info="' + n + '"></span>');

function applyI18n(root = document) {
  $$("[data-i18n]", root).forEach((el) => { el.innerHTML = renderStr(t(el.dataset.i18n)); });
  $$("[data-i18n-attr]", root).forEach((el) => {
    el.dataset.i18nAttr.split(";").forEach((pair) => { const [attr, key] = pair.split(":"); if (attr && key) el.setAttribute(attr.trim(), t(key.trim())); });
  });
  renderPlaceholders(root);
}

function renderPlaceholders(root = document) {
  $$("[data-info]", root).forEach((el) => { el.textContent = CLINIC_INFO[el.dataset.info]; });
  $$("[data-call]", root).forEach((el) => { el.href = "tel:+1-" + CLINIC_INFO.CLINIC_PHONE; });
  // Live map, in the page language. Only reload the frame when the address or language really changes.
  $$("[data-map-embed]", root).forEach((el) => {
    const src = "https://maps.google.com/maps?q=" + encodeURIComponent(CLINIC_INFO.CLINIC_NAME + ", " + CLINIC_INFO.CLINIC_ADDRESS) + "&z=16&hl=" + state.lang + "&output=embed";
    if (el.getAttribute("src") !== src) el.setAttribute("src", src);
  });
  // Google Maps links open in a new tab; screen readers hear that too
  $$("[data-maps]", root).forEach((el) => {
    el.href = el.dataset.maps === "place" ? CLINIC_INFO.CLINIC_MAPS_URL : directionsUrl();
    el.target = "_blank";
    el.rel = "noopener";
    let hint = $(":scope > .newtab", el);
    if (!hint) { hint = document.createElement("span"); hint.className = "sr-only newtab"; el.appendChild(hint); }
    hint.textContent = " " + t("new_tab");
  });
}

// ---------- Page-wide changes ----------
// Whole-page changes (language, text size) cross-fade where the browser supports
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

// Layout width class on #device: the CSS keys its narrow / medium / wide layouts off data-w
function updateBreakpoint() {
  const site = $("#site");
  if (!site || !site.offsetParent) return;
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  const r = site.getBoundingClientRect().width / rem;
  const val = r < 48 ? "narrow" : r < 72 ? "medium" : "wide";
  const device = $("#device");
  if (device.dataset.w !== val) { device.dataset.w = val; if (val !== "narrow") closeMenu(); }
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
    document.documentElement.lang = l;
    $$("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === l)));
    applyI18n();
    renderA11y();
    renderSite();
  }, $("#site"));
}
