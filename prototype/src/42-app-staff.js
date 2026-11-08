// ---------- Staff Portal ----------
const hoursDirty = () => JSON.stringify(state.draft) !== JSON.stringify(state.pub.hours);
const badDay = (k) => state.draft[k].open && toMin(state.draft[k].to) <= toMin(state.draft[k].from);

function renderStaff() {
  $("#stSignin").hidden = state.signedIn;
  $("#stApp").hidden = !state.signedIn;
  updateSubsCount();
  if (!state.signedIn) return;
  $$("[data-st]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.st === state.stTab)));
  $$("[data-st-panel]").forEach((p) => { p.hidden = p.dataset.stPanel !== state.stTab; });
  renderStHours();
  renderStDates();
  renderStNotice();
  renderSheet();
}

function setStTab(tab) {
  if (tab === state.stTab) return;
  state.stTab = tab;
  animateHeight($("#stPanels"), () => {
    $$("[data-st]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.st === tab)));
    $$("[data-st-panel]").forEach((p) => { p.hidden = p.dataset.stPanel !== tab; });
  });
  const panel = $('[data-st-panel="' + tab + '"]');
  panel.classList.remove("is-entering"); void panel.offsetWidth; panel.classList.add("is-entering");
}

function renderStHours() {
  const body = $("#stHoursBody");
  body.innerHTML = "";
  WEEK_ORDER.forEach((k) => {
    const h = state.draft[k];
    const tr = document.createElement("tr");
    tr.dataset.day = k;
    tr.innerHTML = '<th scope="row"></th><td><button type="button" class="switch" role="switch"><span class="switch__track"><span class="switch__thumb"></span></span><span class="switch__text"></span></button></td><td class="time"><input type="time" step="900" data-edge="from"></td><td class="time"><input type="time" step="900" data-edge="to"></td>';
    tr.firstChild.textContent = weekdayName(k);
    const sw = $(".switch", tr);
    sw.setAttribute("aria-checked", String(h.open));
    sw.setAttribute("aria-label", weekdayName(k) + ": " + t("st_col_open"));
    $(".switch__text", sw).textContent = h.open ? t("st_open") : t("st_closed");
    $$("input", tr).forEach((inp) => {
      inp.id = "st-" + inp.dataset.edge + "-" + k;
      inp.value = h[inp.dataset.edge];
      inp.disabled = !h.open;
      inp.setAttribute("aria-label", weekdayName(k) + " " + t(inp.dataset.edge === "from" ? "st_col_from" : "st_col_to"));
    });
    body.appendChild(tr);
  });
  refreshHoursMeta();
}

function refreshHoursMeta() {
  $$("#stHoursBody .row-error").forEach((r) => r.remove());
  WEEK_ORDER.forEach((k) => {
    if (!badDay(k)) return;
    const row = $('#stHoursBody tr[data-day="' + k + '"]');
    const err = document.createElement("tr");
    err.className = "row-error";
    err.innerHTML = '<td colspan="4"></td>';
    err.firstChild.textContent = weekdayName(k) + ": " + t("st_err_time");
    row.after(err);
  });
  $("#stHoursDirty").hidden = !hoursDirty();
  $("#stHoursStatus").textContent = state.pub.at ? t("st_last_pub", { t: fmtStamp(state.pub.at) }) : t("st_never");
}

function publishHours() {
  if (WEEK_ORDER.some(badDay)) return toast(t("st_fix_first"));
  if (!hoursDirty()) return toast(t("st_nothing"));
  state.flashDays = WEEK_ORDER.filter((k) => JSON.stringify(state.draft[k]) !== JSON.stringify(state.pub.hours[k]));
  state.pub.hours = clone(state.draft);
  state.pub.at = new Date();
  refreshHoursMeta();
  renderSite();
  renderSheet();
  toast(t("st_published_hours"));
}

function renderStDates() {
  const ul = $("#stDatesList");
  ul.innerHTML = "";
  const list = state.dates.filter((d) => d.date >= isoDate(new Date())).sort((a, b) => a.date.localeCompare(b.date));
  $("#stDatesCount").textContent = list.length;
  if (!list.length) { const li = document.createElement("li"); li.className = "panel__desc"; li.textContent = t("st_dates_empty"); ul.appendChild(li); }
  list.forEach((d) => {
    const li = document.createElement("li");
    li.className = "sd-item" + (d.id === state.newDateId ? " is-new" : "");
    li.dataset.id = d.id;
    li.innerHTML = '<span class="sd-date"></span><div class="sd-body"><span class="sd-type"></span><span class="sd-note"></span><span class="sd-langs"></span></div><div class="sd-actions"></div>';
    $(".sd-date", li).textContent = fmtDateShort(fromIso(d.date));
    const type = $(".sd-type", li);
    type.textContent = d.type === "closed" ? t("st_type_closed") : t("st_type_special") + ": " + fmtRange(d.from, d.to);
    type.classList.toggle("is-closed", d.type === "closed");
    $(".sd-note", li).textContent = noteText(d);
    const langs = $(".sd-langs", li);
    ["en", "vi", "es"].forEach((l) => {
      const s = document.createElement("span");
      const has = (d.note[l] || "").trim();
      s.textContent = has ? l.toUpperCase() : t("st_missing", { lang: t("st_lang_" + l) });
      if (!has) s.className = "missing";
      langs.appendChild(s);
    });
    const actions = $(".sd-actions", li);
    if (state.confirmDelete === d.id) {
      actions.innerHTML = '<span class="sd-type"></span><button type="button" class="icon-btn" data-del-no></button><button type="button" class="icon-btn icon-btn--danger" data-del-yes></button>';
      actions.children[0].textContent = t("st_confirm_delete");
      actions.children[1].textContent = t("st_cancel");
      actions.children[2].textContent = t("st_yes_delete");
      actions.children[2].dataset.delYes = d.id;
    } else {
      actions.innerHTML = '<button type="button" class="icon-btn icon-btn--danger"><svg class="ic"><use href="#i-trash"/></svg><span></span></button>';
      actions.firstChild.dataset.del = d.id;
      $("span", actions).textContent = t("st_delete");
    }
    ul.appendChild(li);
  });
  state.newDateId = null;
}

function removeStDate(id) {
  const li = $('#stDatesList .sd-item[data-id="' + id + '"]');
  const finish = () => {
    state.dates = state.dates.filter((x) => x.id !== id);
    state.confirmDelete = null;
    animateHeight($("#stDatesList"), renderStDates);
    renderSite(); renderSheet();
    toast(t("st_deleted"));
  };
  if (!li) return finish();
  li.classList.add("is-removing");
  setTimeout(finish, 300);
}

function onStDateSubmit(e) {
  e.preventDefault();
  const err = $("#stDateErr");
  const date = $("#st-date").value, en = $("#st-sd-en").value.trim();
  const special = state.sdType === "special";
  const from = $("#st-sd-from").value, to = $("#st-sd-to").value;
  let msg = "";
  if (!date) msg = t("st_err_date");
  else if (!en) msg = t("st_err_note");
  else if (special && (!from || !to || toMin(to) <= toMin(from))) msg = t("st_err_time");
  err.hidden = !msg;
  err.textContent = msg;
  if (msg) return;
  state.dates = state.dates.filter((d) => d.date !== date);
  state.newDateId = Date.now();
  state.dates.push({ id: state.newDateId, date, type: special ? "special" : "closed", from: special ? from : undefined, to: special ? to : undefined,
    note: { en, vi: $("#st-sd-vi").value.trim(), es: $("#st-sd-es").value.trim() } });
  ["#st-date", "#st-sd-en", "#st-sd-vi", "#st-sd-es"].forEach((s) => { $(s).value = ""; });
  animateHeight($("#stDatesList"), renderStDates);
  renderSite();
  renderSheet();
  toast(t("st_added"));
}

function renderStNotice() {
  const n = state.noticeDraft;
  $("#stNoticeSwitch").setAttribute("aria-checked", String(n.active));
  [["#st-n-en", n.text.en], ["#st-n-vi", n.text.vi], ["#st-n-es", n.text.es], ["#st-n-from", n.from], ["#st-n-to", n.to]].forEach(([s, v]) => {
    const el = $(s);
    if (el.value !== (v || "")) el.value = v || "";
  });
  refreshNoticeMeta();
}
function refreshNoticeMeta() {
  const n = state.noticeDraft;
  $("#stNoticePreviewText").textContent = noticeText(n, state.prevLang) || "…";
  $$("[data-plang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.plang === state.prevLang)));
  $("#stNoticeDirty").hidden = JSON.stringify(n) === JSON.stringify(state.notice);
  $("#stNoticeStatus").textContent = state.noticeAt ? t("st_last_pub", { t: fmtStamp(state.noticeAt) }) : "";
}
function publishNotice() {
  const n = state.noticeDraft;
  if (n.active && !n.text.en.trim()) return toast(t("st_err_notice"));
  state.notice = clone(n);
  state.noticeDismissed = false;
  state.noticeAt = new Date();
  refreshNoticeMeta();
  renderSite();
  renderSheet();
  toast(n.active ? t("st_notice_published") : t("st_notice_hidden"));
}

// ---------- Google Sheet mock (column names stay in English: they are the real Sheet headers) ----------
const stampCell = (d) => isoDate(d) + " " + pad(d.getHours()) + ":" + pad(d.getMinutes());
// Online appointments are not here: they go straight into OpenDental (server/booking).
const SHEETS = {
  np: {
    cols: ["Received", "Name", "Date of birth", "Language", "Phone", "Email", "Mailing address", "Insurance", "Member ID", "Medicines", "Allergies", "Notes", "Status", "Google Doc"],
    rows: () => state.subs.np.map((r) => ({ src: r, cells: [stampCell(r.received), r.name, r.dob, r.lang.toUpperCase(), r.phone, r.email, r.address, r.insurance, r.member, r.meds, r.allergies, r.notes, { status: r }, { doc: r }] }))
  },
  hours: {
    cols: ["Day", "Open", "Opens", "Closes"],
    rows: () => WEEK_ORDER.map((k) => { const h = state.pub.hours[k]; return { cells: [weekdayName(k, "en"), h.open ? "TRUE" : "FALSE", h.from, h.to] }; })
  },
  dates: {
    cols: ["Date", "Type", "Opens", "Closes", "Note (EN)", "Note (VI)", "Note (ES)"],
    rows: () => state.dates.slice().sort((a, b) => a.date.localeCompare(b.date)).map((d) => ({ cells: [d.date, d.type, d.from || "", d.to || "", d.note.en, d.note.vi, d.note.es] }))
  },
  notice: {
    cols: ["Active", "Show from", "Show until", "Text (EN)", "Text (VI)", "Text (ES)"],
    rows: () => (state.notice ? [{ cells: [state.notice.active ? "TRUE" : "FALSE", state.notice.from, state.notice.to, state.notice.text.en, state.notice.text.vi, state.notice.text.es] }] : [])
  }
};

function renderSheet(animate) {
  const sh = SHEETS[state.sheetTab];
  if (animate) { const sc = $(".sheet__scroll"); sc.classList.remove("is-entering"); void sc.offsetWidth; sc.classList.add("is-entering"); }
  const rows = sh.rows();
  $$("[data-sheet]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.sheet === state.sheetTab)));
  const grid = $("#stSheetGrid");
  grid.innerHTML = "";
  $("#stSheetEmpty").hidden = !(state.sheetTab === "np" && rows.length === 0);
  const thead = document.createElement("thead");
  const letters = document.createElement("tr");
  letters.appendChild(document.createElement("th"));
  sh.cols.forEach((c, i) => { const th = document.createElement("th"); th.textContent = String.fromCharCode(65 + i); letters.appendChild(th); });
  thead.appendChild(letters);
  const tbody = document.createElement("tbody");
  const hdr = document.createElement("tr");
  hdr.className = "hdr";
  const n1 = document.createElement("th"); n1.className = "rown"; n1.textContent = "1"; hdr.appendChild(n1);
  sh.cols.forEach((c) => { const td = document.createElement("td"); td.textContent = c; hdr.appendChild(td); });
  tbody.appendChild(hdr);
  rows.forEach((row, i) => {
    const tr = document.createElement("tr");
    if (row.src && row.src.isNew) { tr.className = "is-new"; row.src.isNew = false; }
    const n = document.createElement("th"); n.className = "rown"; n.textContent = String(i + 2); tr.appendChild(n);
    row.cells.forEach((cell) => {
      const td = document.createElement("td");
      if (cell && cell.status) {
        const sel = document.createElement("select");
        sel.setAttribute("aria-label", "Status");
        ["new", "called", "booked"].forEach((v) => sel.appendChild(new Option(cap(v), v)));
        sel.value = cell.status.status;
        sel.addEventListener("change", () => { cell.status.status = sel.value; });
        td.appendChild(sel);
      } else if (cell && cell.doc) {
        if (cell.doc.doc) td.textContent = "✓ " + cell.doc.doc;
        else { const b = document.createElement("button"); b.type = "button"; b.className = "icon-btn"; b.innerHTML = '<svg class="ic"><use href="#i-doc"/></svg><span></span>'; $("span", b).textContent = t("st_make_doc"); b.dataset.mkdoc = state.subs.np.indexOf(cell.doc); td.appendChild(b); }
      } else td.textContent = cell == null ? "" : String(cell);
      if (typeof cell === "string" && cell.length > 28) td.title = cell;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  grid.append(thead, tbody);
  updateSubsCount();
}

function updateSubsCount() {
  $("#stSubsCount").textContent = state.subs.np.length;
  $("#stCountNp").textContent = state.subs.np.length;
}
