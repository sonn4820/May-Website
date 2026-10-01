// ---------- Opening hours logic (published hours + special dates) ----------
const noteText = (entry, lang = state.lang) => (entry.note[lang] || "").trim() || entry.note.en;

function dayInfo(d) {
  const sp = state.dates.find((x) => x.date === isoDate(d));
  if (sp) return sp.type === "closed" ? { open: false, special: sp } : { open: true, from: sp.from, to: sp.to, special: sp };
  const h = state.pub.hours[DAY_KEYS[d.getDay()]];
  return h.open ? { open: true, from: h.from, to: h.to, special: null } : { open: false, special: null };
}

function statusNow(now = new Date()) {
  const info = dayInfo(now);
  const mins = now.getHours() * 60 + now.getMinutes();
  if (info.open && mins >= toMin(info.from) && mins < toMin(info.to)) return { open: true, key: "status_open", t: fmtTime(info.to) };
  if (info.open && mins < toMin(info.from)) return { open: false, key: "status_opens_today", t: fmtTime(info.from) };
  for (let i = 1; i <= 21; i++) {
    const d = addDays(now, i);
    const next = dayInfo(d);
    if (next.open) return { open: false, key: "status_opens_next", d: fmtDayInSentence(d), t: fmtTime(next.from) };
  }
  return { open: false, key: "status_closed" };
}

function todayText() {
  const info = dayInfo(new Date());
  if (!info.open) return t("closed_today") + (info.special ? " · " + noteText(info.special) : "");
  return fmtRange(info.from, info.to) + (info.special ? " · " + t("special_hours") : "");
}

function upcomingDates(days = 120) {
  const from = isoDate(new Date()), to = isoDate(addDays(new Date(), days));
  return state.dates.filter((d) => d.date >= from && d.date <= to).sort((a, b) => a.date.localeCompare(b.date));
}

function renderStatus() {
  const s = statusNow();
  const text = t(s.key, { t: s.t, d: s.d });
  $$("[data-status]").forEach((el) => {
    el.classList.toggle("is-open", s.open);
    el.classList.toggle("is-closed", !s.open);
    $(".status-text", el).textContent = text;
  });
  $("#apptDay").textContent = cap(fmtDateLong(new Date()));
  $("#apptHours").textContent = todayText();
  $("#quickHours").textContent = todayText();
}

function renderHours() {
  const body = $("#hoursBody");
  body.innerHTML = "";
  const now = new Date();
  const todayKey = DAY_KEYS[now.getDay()];
  WEEK_ORDER.forEach((k) => {
    const isToday = k === todayKey;
    const h = state.pub.hours[k];
    const info = isToday ? dayInfo(now) : h.open ? { open: true, from: h.from, to: h.to } : { open: false };
    const tr = document.createElement("tr");
    if (isToday) tr.className = "is-today";
    if (state.flashDays && state.flashDays.includes(k)) tr.classList.add("is-changed");
    const th = document.createElement("th");
    th.scope = "row";
    th.textContent = weekdayName(k);
    if (isToday) { const chip = document.createElement("span"); chip.className = "today-chip"; chip.textContent = t("today_chip"); th.appendChild(chip); }
    const td = document.createElement("td");
    if (info.open) td.textContent = fmtRange(info.from, info.to);
    else { td.textContent = t("hours_closed"); td.classList.add("is-closed"); }
    if (isToday && info.special) {
      const note = document.createElement("span");
      note.className = "day-note";
      note.textContent = (info.special.type === "special" ? t("special_hours") + " · " : "") + noteText(info.special);
      td.appendChild(note);
    }
    tr.append(th, td);
    body.appendChild(tr);
  });
  // Keep the "just changed" flash until the website is actually on screen
  if (state.view === "site") state.flashDays = null;
}

function renderChanges() {
  const list = upcomingDates().slice(0, 4);
  $("#changesBox").hidden = list.length === 0;
  const ul = $("#changesList");
  ul.innerHTML = "";
  list.forEach((d) => {
    const li = document.createElement("li");
    const strong = document.createElement("strong");
    strong.textContent = cap(fmtDateLong(fromIso(d.date)));
    const span = document.createElement("span");
    span.textContent = (d.type === "closed" ? t("hours_closed") : t("special_hours") + ": " + fmtRange(d.from, d.to)) + " · " + noteText(d);
    li.append(strong, span);
    ul.appendChild(li);
  });
}

const noticeText = (n, lang = state.lang) => (n.text[lang] || "").trim() || n.text.en;
function noticeVisible(n) {
  if (!n || !n.active || !(n.text.en || "").trim()) return false;
  const today = isoDate(new Date());
  return (!n.from || n.from <= today) && (!n.to || n.to >= today);
}
function renderNotice() {
  const show = noticeVisible(state.notice) && !state.noticeDismissed;
  $("#siteNotice").hidden = !show;
  if (show) $("#noticeText").textContent = noticeText(state.notice);
}

function renderDayChips() {
  const box = $("#schDays");
  const checked = new Set($$("input", box).filter((i) => i.checked).map((i) => i.value));
  box.innerHTML = "";
  WEEK_ORDER.filter((k) => state.pub.hours[k].open).forEach((k) => {
    const label = document.createElement("label");
    label.className = "choice";
    const input = document.createElement("input");
    input.type = "checkbox"; input.name = "days"; input.value = k; input.id = "sch-day-" + k; input.checked = checked.has(k);
    const span = document.createElement("span");
    span.textContent = weekdayName(k);
    label.append(input, span);
    box.appendChild(label);
  });
}

function renderMonthSelect() {
  const sel = $("#np-dob-m");
  const v = sel.value;
  sel.innerHTML = "";
  sel.appendChild(new Option(t("f_choose"), ""));
  for (let m = 0; m < 12; m++) sel.appendChild(new Option(cap(new Intl.DateTimeFormat(LOCALE[state.lang], { month: "long" }).format(new Date(2000, m, 1))), String(m + 1)));
  sel.value = v;
}

function renderSite() {
  renderNotice();
  renderStatus();
  renderHours();
  renderChanges();
  renderDayChips();
  renderMonthSelect();
  renderStepText();
  ["#sch-lang", "#np-lang"].forEach((s) => { const el = $(s); if (!el.dataset.touched) el.value = state.lang; });
  if (!$("#schOk").hidden && state.lastSchPhone) $("#schOkBody").textContent = t("sch_ok_body", { phone: state.lastSchPhone });
}

// ---------- Navigation, menu, dropdown ----------
const scroller = () => (state.device === "phone" ? $("#screen") : window);
const reducedMotion = () => !document.documentElement.classList.contains("motion-full") && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
function setMotion(mode) {
  state.motion = mode;
  store.set("motion", mode);
  document.documentElement.classList.toggle("motion-full", mode === "full");
  $$("[data-motion]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.motion === mode)));
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
function scrollTopNow() { const s = scroller(); if (s === window) window.scrollTo(0, 0); else s.scrollTop = 0; }

// Smooth scrolling we control ourselves (ease-in-out), so every browser animates the same way.
// Any wheel, touch or key input from the person cancels it.
let scrollRaf = 0;
function cancelScroll() { if (scrollRaf) { cancelAnimationFrame(scrollRaf); scrollRaf = 0; } }
function animateScrollTo(y) {
  cancelScroll();
  const s = scroller(), isWin = s === window;
  const start = isWin ? window.scrollY : s.scrollTop;
  const max = isWin ? document.documentElement.scrollHeight - window.innerHeight : s.scrollHeight - s.clientHeight;
  const to = Math.max(0, Math.min(Math.round(y), Math.max(0, max)));
  const dist = to - start;
  if (Math.abs(dist) < 2) return Promise.resolve();
  const dur = reducedMotion() ? 300 : Math.min(1200, Math.max(600, Math.abs(dist) * 0.5));
  const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
  return new Promise((resolve) => {
    const t0 = performance.now();
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      const pos = start + dist * ease(p);
      if (isWin) window.scrollTo(0, pos); else s.scrollTop = pos;
      if (p < 1) scrollRaf = requestAnimationFrame(step); else { scrollRaf = 0; resolve(); }
    };
    scrollRaf = requestAnimationFrame(step);
  });
}
function sectionTop(el) {
  const s = scroller();
  const offset = (state.device === "phone" ? 0 : $("#protoBar").offsetHeight) + $("#siteHeader").offsetHeight + 12;
  const top = el.getBoundingClientRect().top;
  return s === window ? window.scrollY + top - offset : s.scrollTop + top - s.getBoundingClientRect().top - offset;
}
function arrive(el) {
  el.setAttribute("tabindex", "-1");
  el.focus({ preventScroll: true });
  el.classList.add("is-arrived");
  setTimeout(() => el.classList.remove("is-arrived"), 1800);
}
async function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  await animateScrollTo(sectionTop(el));
  if (el.tagName === "SECTION") arrive(el);
}

let pageToken = 0;
async function goPage(page, scrollId) {
  closeMenu();
  toggleDropdown(false);
  const token = ++pageToken;
  if (state.page !== page) {
    const old = $("#page-" + state.page);
    if (booted) {
      old.classList.add("is-leaving");
      await wait(reducedMotion() ? 120 : 260);
      if (token !== pageToken) return;
      old.classList.remove("is-leaving");
    }
    state.page = page;
    $$("[data-page]").forEach((p) => { p.hidden = p.dataset.page !== page; });
    const el = $("#page-" + page);
    el.classList.remove("is-entering"); void el.offsetWidth; el.classList.add("is-entering");
    $$(".nav__link[data-route]").forEach((a) => a.removeAttribute("aria-current"));
    const cur = $('.nav__link[data-route="' + page + '"]:not([data-scroll])');
    if (cur) cur.setAttribute("aria-current", "page");
    scrollTopNow();
    $("#main").focus({ preventScroll: true });
    refreshReveal();
    if (scrollId && scrollId !== "top") { await wait(220); if (token === pageToken) await scrollToSection(scrollId); }
    return;
  }
  if (scrollId === "top") return animateScrollTo(0);
  if (scrollId) return scrollToSection(scrollId);
}

// Animate a container's height while its content changes (form steps, success messages, panels)
function animateHeight(el, mutate) {
  const h1 = el.offsetHeight;
  mutate();
  const h2 = el.offsetHeight;
  if (!h1 || !h2 || Math.abs(h1 - h2) < 2) return;
  el.style.height = h1 + "px";
  el.style.overflow = "hidden";
  void el.offsetHeight;
  el.style.transition = "height .5s cubic-bezier(.65, 0, .35, 1)";
  el.style.height = h2 + "px";
  let finished = false;
  const done = () => { if (finished) return; finished = true; el.style.height = ""; el.style.overflow = ""; el.style.transition = ""; };
  el.addEventListener("transitionend", function te(ev) { if (ev.target === el) { el.removeEventListener("transitionend", te); done(); } });
  setTimeout(done, 650);
}

function setCollapse(el, open) {
  el.classList.toggle("is-open", open);
  el.setAttribute("aria-hidden", String(!open));
}

function closeNotice() {
  const n = $("#siteNotice");
  if (n.hidden || n.classList.contains("is-closing")) return;
  n.style.height = n.offsetHeight + "px";
  void n.offsetHeight;
  n.classList.add("is-closing");
  n.style.height = "0px";
  setTimeout(() => {
    state.noticeDismissed = true;
    n.hidden = true;
    n.classList.remove("is-closing");
    n.style.height = "";
  }, reducedMotion() ? 200 : 470);
}

let menuReturnFocus = null;
function openMenu() {
  const m = $("#mobileMenu");
  menuReturnFocus = document.activeElement;
  m.inert = false;
  m.classList.add("is-open");
  $("#device").classList.add("menu-open");
  if (state.device !== "phone") document.body.classList.add("menu-open");
  $("#menuBtn").setAttribute("aria-expanded", "true");
  setTimeout(() => $("#menuClose").focus(), 60);
}
function closeMenu() {
  const m = $("#mobileMenu");
  if (!m || !m.classList.contains("is-open")) return;
  m.classList.remove("is-open");
  m.inert = true;
  $("#device").classList.remove("menu-open");
  document.body.classList.remove("menu-open");
  $("#menuBtn").setAttribute("aria-expanded", "false");
  if (menuReturnFocus && document.contains(menuReturnFocus) && menuReturnFocus.offsetParent) menuReturnFocus.focus({ preventScroll: true });
}
function trapMenuFocus(e) {
  const m = $("#mobileMenu");
  if (e.key !== "Tab" || !m.classList.contains("is-open")) return;
  const f = $$("a, button", $(".mmenu__panel")).filter((x) => x.offsetParent !== null);
  if (!f.length) return;
  const first = f[0], last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
}

function toggleDropdown(force) {
  const btn = $("#servicesToggle"), dd = $("#servicesMenu");
  const open = force !== undefined ? force : btn.getAttribute("aria-expanded") !== "true";
  btn.setAttribute("aria-expanded", String(open));
  dd.classList.toggle("is-open", open);
}

let scrollQueued = false;
function onSiteScroll() {
  if (scrollQueued) return;
  scrollQueued = true;
  requestAnimationFrame(() => {
    scrollQueued = false;
    const hdr = $("#siteHeader"), nav = $("#navStrip");
    if (!hdr.offsetParent) return;
    const navGone = !nav.offsetParent || nav.getBoundingClientRect().bottom <= hdr.getBoundingClientRect().bottom + 1;
    hdr.classList.toggle("show-menu", navGone);
    const s = scroller();
    hdr.classList.toggle("is-stuck", (s === window ? window.scrollY : s.scrollTop) > 40);
  });
}

// ---------- Fade-in on scroll ----------
let revealObserver = null;
function setupReveal() {
  document.documentElement.classList.add("js");
  $$(".cards, .steps, .cols3, .np-grid, .faq").forEach((grid) => {
    $$(":scope > .reveal", grid).forEach((el, i) => el.style.setProperty("--d", Math.min(i * 110, 440) + "ms"));
  });
  $$(".dropdown a").forEach((a, i) => a.style.setProperty("--i", i));
  if (!("IntersectionObserver" in window)) { $$(".reveal").forEach((el) => el.classList.add("is-in")); return; }
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); revealObserver.unobserve(en.target); } });
  }, { threshold: 0.12 });
  refreshReveal();
}
function refreshReveal() {
  if (!revealObserver) return;
  $$(".reveal:not(.is-in)").forEach((el) => { if (el.offsetParent !== null) revealObserver.observe(el); });
}

// ---------- Form helpers ----------
function fieldOf(ctl) { return ctl.closest(".field"); }
function clearFieldError(field) {
  if (!field) return;
  field.classList.remove("has-error");
  const p = $(".error-msg", field);
  if (!p) return;
  $$("input, select, textarea", field).forEach((ctl) => {
    ctl.removeAttribute("aria-invalid");
    const ids = (ctl.getAttribute("aria-describedby") || "").split(" ").filter((x) => x && x !== p.id);
    if (ids.length) ctl.setAttribute("aria-describedby", ids.join(" ")); else ctl.removeAttribute("aria-describedby");
  });
  p.remove();
}
let errSeq = 0;
function setFieldError(field, key) {
  clearFieldError(field);
  field.classList.add("has-error");
  const p = document.createElement("p");
  p.className = "error-msg";
  p.id = "err-" + ++errSeq;
  p.innerHTML = '<svg class="ic"><use href="#i-info"/></svg>';
  const s = document.createElement("span");
  s.dataset.i18n = key;
  s.textContent = t(key);
  p.appendChild(s);
  const anchor = Array.from(field.children).find((c) => c.matches("input, select, textarea, .choices, .dob, .choice") || $("input, select, textarea", c));
  field.insertBefore(p, anchor || null);
  $$("input, select, textarea", field).forEach((ctl) => {
    ctl.setAttribute("aria-invalid", "true");
    const ids = (ctl.getAttribute("aria-describedby") || "").split(" ").filter(Boolean);
    ids.push(p.id);
    ctl.setAttribute("aria-describedby", ids.join(" "));
  });
}
// Visible "Sending…" feedback on the submit button (the real API call goes here)
function withSending(btn, done) {
  const html = btn.innerHTML;
  btn.disabled = true;
  btn.setAttribute("aria-busy", "true");
  btn.innerHTML = '<span class="spinner" aria-hidden="true"></span><span></span>';
  btn.lastChild.textContent = t("sending");
  setTimeout(() => { btn.disabled = false; btn.removeAttribute("aria-busy"); btn.innerHTML = html; applyI18n(btn); done(); }, 700);
}
const digits = (s) => s.replace(/\D/g, "");
const validEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
function check(list) {
  // list of [ok, controlOrField, errorKey]; returns the first control to focus, or null
  let first = null;
  list.forEach(([ok, ctl, key]) => {
    const field = ctl.classList && ctl.classList.contains("field") ? ctl : fieldOf(ctl);
    if (ok) clearFieldError(field);
    else { setFieldError(field, key); if (!first) first = $("input, select, textarea", field) || ctl; }
  });
  return first;
}

// ---------- Schedule form ----------
function onSchSubmit(e) {
  e.preventDefault();
  const name = $("#sch-name").value.trim(), phone = $("#sch-phone").value.trim(), email = $("#sch-email").value.trim();
  const newpt = ($('input[name="newpt"]:checked', e.target) || {}).value;
  const bad = check([
    [name.length >= 2, $("#sch-name"), "err_name"],
    [digits(phone).length >= 10, $("#sch-phone"), "err_phone"],
    [!email || validEmail(email), $("#sch-email"), "err_email"],
    [!!newpt, $('[data-field="newpt"]'), "err_choose"]
  ]);
  if (bad) { bad.focus(); return; }
  const row = {
    received: new Date(), name, phone, email, newpt,
    days: $$('input[name="days"]:checked').map((i) => i.value),
    tod: $('input[name="tod"]:checked').value,
    reason: $("#sch-reason").value.trim(), lang: $("#sch-lang").value, status: "new", isNew: true
  };
  withSending($('button[type="submit"]', e.target), () => {
    state.subs.appt.push(row);
    state.lastSchPhone = phone;
    $("#schOkBody").textContent = t("sch_ok_body", { phone });
    swapCard($("#schCard"), e.target, $("#schOk"));
    updateSubsCount();
  });
}
// Swap form <-> thank-you message inside a card: the card height glides, then we bring it into view
function swapCard(card, hide, show) {
  animateHeight(card, () => { hide.hidden = true; show.hidden = false; });
  show.focus({ preventScroll: true });
  if (card.getBoundingClientRect().top < 0) animateScrollTo(sectionTop(card));
}
function resetSch() {
  const f = $("#schForm");
  f.reset();
  $$(".field", f).forEach(clearFieldError);
  delete $("#sch-lang").dataset.touched;
  $("#sch-lang").value = state.lang;
  swapCard($("#schCard"), $("#schOk"), f);
  $("#sch-name").focus({ preventScroll: true });
}

// ---------- New patient form (3 steps) ----------
let npStep = 1;
function renderStepText() { $("#npStepText").textContent = t("step_of", { n: npStep, name: t("npf_step" + npStep) }); }
function showNpStep(n, focus, instant) {
  const dir = instant ? "" : n > npStep ? "enter-next" : n < npStep ? "enter-back" : "";
  const run = instant ? (el, fn) => fn() : animateHeight;
  run($("#npCard"), () => {
    npStep = n;
    $$("#npForm .form-step").forEach((s) => {
      const on = Number(s.dataset.step) === n;
      s.hidden = !on;
      s.classList.remove("enter-next", "enter-back");
      if (on && dir) { void s.offsetWidth; s.classList.add(dir); }
    });
    $$("#npStepper li").forEach((li, i) => { li.classList.toggle("is-current", i + 1 === n); li.classList.toggle("is-done", i + 1 < n); });
    $("#npBack").hidden = n === 1;
    $("#npNext").hidden = n === 3;
    $("#npSubmit").hidden = n !== 3;
    renderStepText();
  });
  const card = $("#npCard");
  if (dir && card.getBoundingClientRect().top < 0) animateScrollTo(sectionTop(card));
  if (focus) { const first = $('#npForm .form-step[data-step="' + n + '"] input, #npForm .form-step[data-step="' + n + '"] select'); if (first) first.focus({ preventScroll: true }); }
}
function validateNpStep(n) {
  if (n === 1) {
    const d = Number($("#np-dob-d").value), y = Number($("#np-dob-y").value), m = $("#np-dob-m").value;
    return check([
      [$("#np-first").value.trim().length >= 1, $("#np-first"), "err_first"],
      [$("#np-last").value.trim().length >= 1, $("#np-last"), "err_last"],
      [!!m && d >= 1 && d <= 31 && y >= 1900 && y <= new Date().getFullYear(), $('[data-field="dob"]'), "err_dob"]
    ]);
  }
  if (n === 2) {
    const email = $("#np-email").value.trim();
    const hasins = ($('input[name="hasins"]:checked') || {}).value;
    const list = [
      [digits($("#np-phone").value).length >= 10, $("#np-phone"), "err_phone"],
      [!email || validEmail(email), $("#np-email"), "err_email"],
      [!!hasins, $('[data-field="hasins"]'), "err_choose"]
    ];
    if (hasins === "yes") list.push([$("#np-insco").value.trim().length >= 2, $("#np-insco"), "err_insco"]);
    else clearFieldError(fieldOf($("#np-insco")));
    return check(list);
  }
  return check([[$("#np-consent").checked, $('[data-field="consent"]'), "err_consent"]]);
}
function onNpSubmit(e) {
  e.preventDefault();
  if (npStep !== 3) { const bad = validateNpStep(npStep); if (bad) bad.focus(); else showNpStep(npStep + 1, true); return; }
  for (const n of [1, 2, 3]) { const bad = validateNpStep(n); if (bad) { showNpStep(n); bad.focus(); return; } }
  const hasins = $('input[name="hasins"]:checked').value;
  const row = {
    received: new Date(),
    name: $("#np-first").value.trim() + " " + $("#np-last").value.trim(),
    dob: $("#np-dob-y").value + "-" + pad($("#np-dob-m").value) + "-" + pad($("#np-dob-d").value),
    lang: $("#np-lang").value, phone: $("#np-phone").value.trim(), email: $("#np-email").value.trim(),
    address: $("#np-address").value.trim(),
    insurance: hasins === "yes" ? $("#np-insco").value.trim() : "None", member: hasins === "yes" ? $("#np-member").value.trim() : "",
    meds: $("#np-meds").value.trim(), allergies: $("#np-allergies").value.trim(), notes: $("#np-notes").value.trim(),
    status: "new", doc: "", isNew: true
  };
  withSending($("#npSubmit"), () => {
    state.subs.np.push(row);
    swapCard($("#npCard"), $("#npForm"), $("#npOk"));
    updateSubsCount();
  });
}
function resetNp() {
  const f = $("#npForm");
  f.reset();
  $$(".field", f).forEach(clearFieldError);
  setCollapse($("#npInsFields"), false);
  delete $("#np-lang").dataset.touched;
  $("#np-lang").value = state.lang;
  showNpStep(1, false, true);
  swapCard($("#npCard"), $("#npOk"), f);
  $("#np-first").focus({ preventScroll: true });
}
