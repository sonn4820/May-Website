// ---------- Events ----------
function onClick(e) {
  if (a11yIsOpen() && !e.target.closest("#a11yPanel, #a11yBtn")) closeA11y(false);
  if (e.target.closest(".mmenu__backdrop")) return closeMenu();
  const dd = $("#servicesMenu");
  if (dd.classList.contains("is-open") && !e.target.closest(".nav__item")) toggleDropdown(false);
  const el = e.target.closest("button, a");
  if (!el) return;
  const d = el.dataset;
  if (d.maps !== undefined || d.call !== undefined) return; // Let the browser open real links.
  if (el.tagName === "A") e.preventDefault();
  if (d.lang) return setLang(d.lang);
  if (d.scale) return setScale(Number(d.scale));
  if (d.a11y) return stepA11y(d.a11y);
  if (d.date && el.classList.contains("cal__day")) return pickDay(d.date);
  if (d.slot && el.classList.contains("slot")) return pickSlot(d.slot);
  if (d.closeMenu !== undefined) return closeMenu();
  if (d.skip !== undefined) return $("#main").focus();
  if (d.route) return goPage(d.route, d.scroll, d.doc);
  if (el.classList.contains("faq__q")) {
    const open = el.getAttribute("aria-expanded") !== "true";
    el.setAttribute("aria-expanded", String(open));
    return setCollapse($("#" + el.getAttribute("aria-controls")), open);
  }
  switch (el.id) {
    case "menuBtn": return $("#mobileMenu").classList.contains("is-open") ? closeMenu() : openMenu();
    case "a11yBtn": return a11yIsOpen() ? closeA11y() : openA11y();
    case "a11yClose": return closeA11y();
    case "a11yReset": return resetA11y();
    case "servicesToggle": return toggleDropdown();
    case "noticeClose": return closeNotice();
    case "schAgain": return resetSch();
    case "calPrev": return stepMonth(-1);
    case "calNext": return stepMonth(1);
  }
}

function onInput(e) {
  const el = e.target;
  if (el.id === "sch-lang") el.dataset.touched = "1";
  if (el.closest && el.closest(".field.has-error") && e.type === "change") {
    // Re-check gently once the person fixes a field
    const f = el.closest(".field");
    if ((el.type === "radio" || el.type === "checkbox") && el.checked) clearFieldError(f);
  }
}

function onKey(e) {
  if (e.key === "Escape") {
    if (a11yIsOpen()) { closeA11y(); return; }
    if ($("#mobileMenu").classList.contains("is-open")) { closeMenu(); return; }
    if ($("#servicesMenu").classList.contains("is-open")) { toggleDropdown(false); $("#servicesToggle").focus(); }
  }
  trapMenuFocus(e);
  trapA11yFocus(e);
}

// ---------- Start ----------
function init() {
  state.a11y = loadA11y();
  buildA11y();
  applyA11y();
  setScale(state.scale);
  $("#site").lang = state.lang;
  document.documentElement.lang = state.lang;
  $$("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === state.lang)));
  applyI18n();
  renderSite();
  loadAvailability();
  setupReveal();
  updateBreakpoint();

  document.addEventListener("click", onClick);
  document.addEventListener("input", onInput);
  document.addEventListener("change", onInput);
  document.addEventListener("keydown", onKey);
  $("#schForm").addEventListener("submit", onSchSubmit);
  // Back/Forward between pages
  window.addEventListener("popstate", () => routeFromHash(true));
  window.addEventListener("scroll", onSiteScroll, { passive: true });
  window.addEventListener("resize", () => { updateBreakpoint(); onSiteScroll(); });
  if ("ResizeObserver" in window) new ResizeObserver(() => { updateBreakpoint(); onSiteScroll(); }).observe($("#site"));
  ["wheel", "touchstart", "keydown"].forEach((ev) => window.addEventListener(ev, cancelScroll, { passive: true }));
  $$(".collapse").forEach((c) => c.setAttribute("aria-hidden", String(!c.classList.contains("is-open"))));
  setInterval(renderStatus, 60000);
  onSiteScroll();
  openFromHash();
  booted = true;
}

// Links can open a language or a page directly, e.g. #vi, #schedule, #services/dentures
function openFromHash() {
  const h = location.hash.slice(1);
  const actions = {
    vi: () => setLang("vi"), es: () => setLang("es"), en: () => setLang("en"),
    schedule: () => goPage("schedule"), "new-patients": () => goPage("new")
  };
  if (actions[h]) actions[h]();
  else routeFromHash(false);
}
init();
