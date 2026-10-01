// ---------- Events ----------
const PROTO_MSG = {
  soon: "Trang này sẽ được làm ở giai đoạn tiếp theo, sau khi bạn xác nhận nội dung.",
  call: () => "Trên website thật, nút này gọi ngay số " + phToken("CLINIC_PHONE") + ".",
  maps: () => "Trên website thật, nút này mở Google Maps: " + phToken("GOOGLE_MAPS_LINK") + ".",
  link: (n) => "Trên website thật, link này mở: " + phToken(n) + ".",
  sheet: () => "Prototype: hệ thống thật mở Google Sheet " + phToken("GOOGLE_SHEET_LINK") + ".",
  xlsx: "Prototype: hệ thống thật tải file .xlsx xuất thẳng từ Google Sheet, không cần code thêm.",
  doc: (name) => "Prototype: hệ thống thật tạo Google Doc “New patient – " + name + "” từ mẫu và lưu vào " + phToken("GOOGLE_DRIVE_FOLDER") + ".",
  motionFull: "Đang xem animation đầy đủ như thiết kế.",
  motionSystem: "Đang theo cài đặt máy. Nếu Windows tắt “Animation effects”, website chỉ giữ hiệu ứng mờ dần, bỏ phần di chuyển, như bệnh nhân sẽ thấy.",
  copied: "Đã sao chép danh sách token.",
  copyFail: "Không sao chép được. Danh sách đã được chọn sẵn, bấm Ctrl+C để sao chép."
};

function onClick(e) {
  if (e.target.closest(".mmenu__backdrop")) return closeMenu();
  const dd = $("#servicesMenu");
  if (dd.classList.contains("is-open") && !e.target.closest(".nav__item")) toggleDropdown(false);
  const el = e.target.closest("button, a");
  if (!el) return;
  const d = el.dataset;
  if (el.tagName === "A") e.preventDefault();
  if (d.view) return setView(d.view);
  if (d.device) return setDevice(d.device);
  if (d.phmode) return setPhMode(d.phmode);
  if (d.motion) { setMotion(d.motion); return toast(d.motion === "full" ? PROTO_MSG.motionFull : PROTO_MSG.motionSystem); }
  if (d.lang) return setLang(d.lang);
  if (d.scale) return setScale(Number(d.scale));
  if (d.closeMenu !== undefined) return closeMenu();
  if (d.skip !== undefined) return $("#main").focus();
  if (d.route) return goPage(d.route, d.scroll);
  if (d.soon !== undefined) return toast(PROTO_MSG.soon);
  if (d.call !== undefined) return toast(PROTO_MSG.call());
  if (d.maps !== undefined) return toast(PROTO_MSG.maps());
  if (d.link) return toast(PROTO_MSG.link(d.link));
  if (d.gotoSubs) { state.signedIn = true; state.stTab = "subs"; state.sheetTab = d.gotoSubs; return setView("staff"); }
  if (d.demo) return toast(d.demo === "sheet" ? PROTO_MSG.sheet() : PROTO_MSG.xlsx);
  if (d.st) return setStTab(d.st);
  if (d.sheet) { if (d.sheet !== state.sheetTab) { state.sheetTab = d.sheet; renderSheet(true); } return; }
  if (d.sdtype) {
    state.sdType = d.sdtype;
    $$("[data-sdtype]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.sdtype === d.sdtype)));
    setCollapse($("#stSdTimes"), d.sdtype === "special");
    return;
  }
  if (el.classList.contains("faq__q")) {
    const open = el.getAttribute("aria-expanded") !== "true";
    el.setAttribute("aria-expanded", String(open));
    return setCollapse($("#" + el.getAttribute("aria-controls")), open);
  }
  if (d.plang) { state.prevLang = d.plang; return refreshNoticeMeta(); }
  if (d.del) { state.confirmDelete = Number(d.del); renderStDates(); const no = $("[data-del-no]"); if (no) no.focus(); return; }
  if (d.delNo !== undefined) { state.confirmDelete = null; return renderStDates(); }
  if (d.delYes) return removeStDate(Number(d.delYes));
  if (d.mkdoc !== undefined) {
    const r = state.subs.np[Number(d.mkdoc)];
    if (r) { r.doc = "New patient – " + r.name; renderSheet(); toast(PROTO_MSG.doc(r.name)); }
    return;
  }
  if (el.classList.contains("switch") && el.closest("#stHoursBody")) {
    const k = el.closest("tr").dataset.day;
    state.draft[k].open = !state.draft[k].open;
    renderStHours();
    $('#stHoursBody tr[data-day="' + k + '"] .switch').focus();
    return;
  }
  switch (el.id) {
    case "menuBtn": return $("#mobileMenu").classList.contains("is-open") ? closeMenu() : openMenu();
    case "servicesToggle": return toggleDropdown();
    case "noticeClose": return closeNotice();
    case "schAgain": return resetSch();
    case "npAgain": return resetNp();
    case "npNext": { const bad = validateNpStep(npStep); if (bad) bad.focus(); else showNpStep(npStep + 1, true); return; }
    case "npBack": return showNpStep(Math.max(1, npStep - 1), true);
    case "stSigninBtn": state.signedIn = true; renderStaff(); $("#st-tab-" + state.stTab).focus(); return;
    case "stSignout": state.signedIn = false; renderStaff(); $("#stSigninBtn").focus(); return;
    case "stViewSite": return setView("site");
    case "stHoursPublish": return publishHours();
    case "stHoursUndo": state.draft = clone(state.pub.hours); renderStHours(); return toast(t("st_undone"));
    case "stNoticeSwitch": state.noticeDraft.active = !state.noticeDraft.active; return renderStNotice();
    case "stNoticePublish": return publishNotice();
    case "phCopy": return copyTokens();
  }
}

function copyTokens() {
  const text = Object.keys(PLACEHOLDERS).map((n) => phToken(n) + "\t" + PLACEHOLDERS[n].need).join("\n");
  const area = $("#phCopyArea");
  const fallback = () => { area.value = text; area.classList.remove("sr-only"); area.style.cssText = "width:100%;min-height:10rem"; area.removeAttribute("aria-hidden"); area.select(); $("#phCopyStatus").textContent = PROTO_MSG.copyFail; };
  try {
    navigator.clipboard.writeText(text).then(() => { $("#phCopyStatus").textContent = PROTO_MSG.copied; }, fallback);
  } catch (err) { fallback(); }
}

function onInput(e) {
  const el = e.target;
  if (el.id === "sch-lang" || el.id === "np-lang") el.dataset.touched = "1";
  if (el.name === "hasins" && el.checked) { setCollapse($("#npInsFields"), el.value === "yes"); clearFieldError(fieldOf(el)); }
  if (el.closest && el.closest(".field.has-error") && e.type === "change") {
    // Re-check gently once the person fixes a field
    const f = el.closest(".field");
    if ((el.type === "radio" || el.type === "checkbox") && el.checked) clearFieldError(f);
  }
  if (el.dataset.edge && el.closest("#stHoursBody")) {
    const k = el.closest("tr").dataset.day;
    if (el.value) state.draft[k][el.dataset.edge] = el.value;
    refreshHoursMeta();
  }
  const map = { "st-n-en": "en", "st-n-vi": "vi", "st-n-es": "es" };
  if (map[el.id]) { state.noticeDraft.text[map[el.id]] = el.value; refreshNoticeMeta(); }
  if (el.id === "st-n-from" || el.id === "st-n-to") { state.noticeDraft[el.id === "st-n-from" ? "from" : "to"] = el.value; refreshNoticeMeta(); }
}

function onKey(e) {
  if (e.key === "Escape") {
    if ($("#mobileMenu").classList.contains("is-open")) { closeMenu(); return; }
    if ($("#servicesMenu").classList.contains("is-open")) { toggleDropdown(false); $("#servicesToggle").focus(); }
  }
  trapMenuFocus(e);
}

// ---------- Start ----------
function init() {
  state.notice = sampleNotice();
  state.noticeDraft = clone(state.notice);
  state.prevLang = "en";
  state.sdType = "closed";
  state.confirmDelete = null;
  setMotion(store.get("motion", "full") === "system" ? "system" : "full");
  setScale(state.scale);
  $("#site").lang = state.lang;
  $("#view-staff").lang = state.lang;
  $$("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === state.lang)));
  applyI18n();
  renderSite();
  showNpStep(1);
  setupReveal();
  renderPhTable();
  updateProtoH();
  updateBreakpoint();

  document.addEventListener("click", onClick);
  document.addEventListener("input", onInput);
  document.addEventListener("change", onInput);
  document.addEventListener("keydown", onKey);
  $("#schForm").addEventListener("submit", onSchSubmit);
  $("#npForm").addEventListener("submit", onNpSubmit);
  $("#stDateForm").addEventListener("submit", onStDateSubmit);
  window.addEventListener("scroll", onSiteScroll, { passive: true });
  $("#screen").addEventListener("scroll", onSiteScroll, { passive: true });
  window.addEventListener("resize", () => { updateProtoH(); updateBreakpoint(); onSiteScroll(); });
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(() => { updateProtoH(); updateBreakpoint(); onSiteScroll(); });
    ro.observe($("#site"));
    ro.observe($("#protoBar"));
  }
  ["wheel", "touchstart", "keydown"].forEach((ev) => window.addEventListener(ev, cancelScroll, { passive: true }));
  $$(".collapse").forEach((c) => c.setAttribute("aria-hidden", String(!c.classList.contains("is-open"))));
  setInterval(renderStatus, 60000);
  onSiteScroll();
  openFromHash();
  booted = true;
}

// Plain #tokens open a view directly, e.g. index.html#staff-app or #new-patients
function openFromHash() {
  const h = location.hash.slice(1);
  const actions = {
    vi: () => setLang("vi"), es: () => setLang("es"), en: () => setLang("en"),
    phone: () => setDevice("phone"),
    schedule: () => goPage("schedule"), "new-patients": () => goPage("new"),
    staff: () => setView("staff"),
    "staff-app": () => { state.signedIn = true; setView("staff"); },
    "staff-submissions": () => { state.signedIn = true; state.stTab = "subs"; setView("staff"); },
    "how-it-works": () => setView("how"), placeholders: () => setView("ph")
  };
  if (actions[h]) actions[h]();
}
init();
