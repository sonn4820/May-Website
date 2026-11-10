// ---------- Content pages: services, about the doctor, health tips, privacy & legal ----------
// One template (#page-doc) renders any page in DOC_META, in the current language (English as fallback).
const docText = (id) => (DOCS[state.lang] && DOCS[state.lang][id]) || DOCS.en[id];
const docTitle = (id) => t(DOC_META[id].titleKey);
const docLink = (id, inner, cls = "") => '<a href="#' + id + '" data-route="doc" data-doc="' + id + '"' + (cls ? ' class="' + cls + '"' : "") + ">" + inner + "</a>";
const DOC_PROTO = {
  service: "Prototype: nội dung bản nháp, cần nha sĩ xem lại trước khi đăng (đặc biệt các dịch vụ phòng khám thực sự làm).",
  about: "Prototype: tiểu sử tiếng Anh do phòng khám cung cấp; bản tiếng Việt và tiếng Tây Ban Nha là bản dịch, cần người bản ngữ xem lại.",
  tip: "Prototype: bài viết bản nháp theo hướng dẫn chung của ADA, cần nha sĩ xem lại trước khi đăng.",
  legal: "Prototype: bản nháp dựa trên mẫu của Bộ Y tế Hoa Kỳ (HHS). Cần luật sư hoặc chuyên viên HIPAA duyệt trước khi đăng."
};

// All words of a page, for the reading time on health tips (counted on the English text so every language shows the same)
function docWords(node) {
  if (typeof node === "string") return node.replace(/\{[^}]*\}/g, " ").split(/\s+/).filter(Boolean).length;
  if (Array.isArray(node)) return node.reduce((n, x) => n + docWords(x), 0);
  if (node && typeof node === "object") return Object.values(node).reduce((n, x) => n + docWords(x), 0);
  return 0;
}
const readMinutes = (id) => Math.max(2, Math.round(docWords(DOCS.en[id]) / 150));

let docFaqSeq = 0;
function docSectionHtml(s) {
  if (s.warn) return '<div class="doc-warn" role="note"><svg class="ic" aria-hidden="true"><use href="#i-info"/></svg><p>' + renderStr(s.warn) + "</p></div>";
  if (s.note) return '<div class="doc-note" role="note"><svg class="ic" aria-hidden="true"><use href="#i-info"/></svg><p>' + renderStr(s.note) + "</p></div>";
  if (s.more) return docLink(s.more, '<svg class="ic" aria-hidden="true"><use href="#i-doc"/></svg><span><small>' + esc(t(DOC_META[s.more].kind === "tip" ? "doc_read_tip" : "doc_read_more")) + "</small><strong>" + esc(docTitle(s.more)) + '</strong></span><svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg>', "doc-more");
  let h = s.h ? "<h2>" + renderStr(s.h) + "</h2>" : "";
  [].concat(s.p || []).forEach((p) => { h += "<p>" + renderStr(p) + "</p>"; });
  if (s.list) h += '<ul class="doc-list">' + s.list.map((x) => '<li><svg class="ic" aria-hidden="true"><use href="#i-check"/></svg><span>' + renderStr(x) + "</span></li>").join("") + "</ul>";
  if (s.steps) h += '<ol class="doc-steps">' + s.steps.map(([a, b], n) => '<li><span class="doc-steps__num" aria-hidden="true">' + (n + 1) + "</span><div><h3>" + renderStr(a) + "</h3><p>" + renderStr(b) + "</p></div></li>").join("") + "</ol>";
  if (s.faq) h += '<div class="faq">' + s.faq.map(([q, a]) => {
    const n = ++docFaqSeq;
    return '<div class="faq__item"><h3><button type="button" class="faq__q" id="doc-q' + n + '" aria-expanded="false" aria-controls="doc-a' + n + '"><span>' + renderStr(q) + '</span><span class="faq__icon" aria-hidden="true"></span></button></h3>' +
      '<div class="faq__a collapse" id="doc-a' + n + '" role="region" aria-labelledby="doc-q' + n + '" aria-hidden="true"><div class="collapse__inner"><p>' + renderStr(a) + "</p></div></div></div>";
  }).join("") + "</div>";
  if (s.taglines) h += '<ul class="doc-taglines">' + s.taglines.map(([lang, text]) => '<li lang="' + lang + '">' + renderStr(text) + "</li>").join("") + "</ul>";
  return '<section class="doc-sec">' + h + "</section>";
}

// Pages listed in the side panel: the other pages of the same kind
function docRelated(id) {
  const kind = DOC_META[id].kind;
  if (kind === "about") return { title: t("doc_related_about"), items: [["route", "new", t("nav_new")], ["doc", "services/checkups", t("svc1_t")], ["scroll", "insurance", t("nav_insurance")], ["scroll", "visit", t("nav_contact")]] };
  const same = Object.keys(DOC_META).filter((k) => k !== id && DOC_META[k].kind === kind).map((k) => ["doc", k, docTitle(k)]);
  if (kind === "tip") same.push(["scroll", "articles", t("doc_all_tips")]);
  return { title: t({ service: "doc_related_service", tip: "doc_related_tip", legal: "f_legal" }[kind]), items: same };
}

function renderDoc() {
  const id = state.doc, meta = DOC_META[id];
  if (!meta) return;
  const d = docText(id);
  const crumbParent = { service: ["services", "nav_services"], tip: ["articles", "nav_articles"], legal: [null, "f_legal"], about: [null, null] }[meta.kind];
  const chev = '<svg class="ic"><use href="#i-chev"/></svg>';
  let crumbs = '<a href="#" data-route="home" data-scroll="top">' + esc(t("nav_home")) + "</a>" + chev;
  if (crumbParent[1]) crumbs += (crumbParent[0] ? '<a href="#" data-route="home" data-scroll="' + crumbParent[0] + '">' + esc(t(crumbParent[1])) + "</a>" : "<span>" + esc(t(crumbParent[1])) + "</span>") + chev;
  $("#docCrumbs").innerHTML = crumbs + '<span aria-current="page">' + esc(docTitle(id)) + "</span>";
  $("#docEyebrow").textContent = t({ service: "nav_services", tip: meta.chipKey, legal: "f_legal", about: "doctor_eyebrow" }[meta.kind]);
  $("#docTitle").textContent = docTitle(id);
  $("#docLead").innerHTML = renderStr(d.lead || "");
  const metaEl = $("#docMeta");
  metaEl.hidden = !(meta.kind === "tip" || meta.kind === "legal");
  metaEl.innerHTML = meta.kind === "tip" ? esc(t("read_n", { n: readMinutes(id) })) : meta.kind === "legal" ? renderStr(t("doc_effective")) : "";
  $("#docAbout").hidden = meta.kind !== "about";

  let body = '<div class="proto-callout proto-callout--soft"><span>' + esc(DOC_PROTO[meta.kind]) + "</span></div>";
  body += d.sections.map(docSectionHtml).join("");
  if (meta.kind === "tip") body += '<p class="doc-disclaimer">' + esc(t("doc_tip_disclaimer")) + "</p>";
  $("#docBody").innerHTML = body;

  const rel = docRelated(id);
  $("#docRelatedTitle").textContent = rel.title;
  $("#docRelatedList").innerHTML = rel.items.map(([type, target, label]) => {
    const inner = "<span>" + esc(label) + '</span><svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg>';
    if (type === "doc") return "<li>" + docLink(target, inner) + "</li>";
    if (type === "route") return '<li><a href="#" data-route="' + target + '">' + inner + "</a></li>";
    return '<li><a href="#" data-route="home" data-scroll="' + target + '">' + inner + "</a></li>";
  }).join("");
  renderPlaceholders($("#page-doc"));
}

// Reading time on the home page article cards
function renderReadTimes() {
  $$("[data-readtime]").forEach((el) => { el.textContent = t("read_n", { n: readMinutes(el.dataset.readtime) }); });
}

// ---------- Addresses: every page has one (#schedule, #services/dentures …), so Back/Forward and shared links work ----------
function pageHash(page, doc) { return page === "doc" ? doc : page === "schedule" ? "schedule" : page === "new" ? "new-patients" : ""; }
function syncHash(page, doc) {
  const h = pageHash(page, doc);
  if (decodeURIComponent(location.hash.slice(1)) === h) return;
  try { history.pushState(null, "", h ? "#" + h : location.pathname + location.search); } catch (e) { /* file:// in some browsers: navigation still works */ }
}
// Returns true when the address named a website page
function routeFromHash(fromPop) {
  const h = decodeURIComponent(location.hash.slice(1));
  const opts = { pop: !!fromPop };
  if (DOC_META[h]) { goPage("doc", null, h, opts); return true; }
  if (h === "schedule") { goPage("schedule", null, null, opts); return true; }
  if (h === "new-patients") { goPage("new", null, null, opts); return true; }
  if (!h && fromPop) { goPage("home", null, null, opts); return true; }
  return false;
}
