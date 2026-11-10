// Functional checks for the prototype in jsdom. Run: npm run proto:test
// For a visual check, screenshot index.html with headless Chrome (see README).
import { JSDOM, VirtualConsole } from "jsdom";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("./index.html", import.meta.url), "utf8").replace(/<link[^>]+fonts\.g[^>]+>/g, "");

function boot(url = "http://localhost/") {
  const errors = [];
  const vc = new VirtualConsole();
  vc.on("jsdomError", (e) => { if (!/Could not parse CSS|Not implemented: navigation/.test(e.message)) errors.push(e.message); });
  vc.on("error", (m) => errors.push(String(m)));
  const dom = new JSDOM(html, {
    runScripts: "dangerously", pretendToBeVisual: true, url, virtualConsole: vc,
    beforeParse(w) {
      w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
      w.scrollTo = () => {};
      w.Element.prototype.scrollTo = function () {};
      w.HTMLElement.prototype.scrollIntoView = function () {};
      Object.defineProperty(w.HTMLElement.prototype, "offsetParent", { get() { for (let el = this; el; el = el.parentElement) if (el.hidden) return null; return this.parentElement; } });
      Object.defineProperty(w.navigator, "clipboard", { value: { writeText: () => Promise.resolve() } });
    }
  });
  return { dom, w: dom.window, d: dom.window.document, errors };
}

const results = [];
const ok = (name, cond, extra = "") => results.push({ name, pass: !!cond, extra });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const { dom, w, d, errors } = boot();
const $ = (s) => d.querySelector(s);
const $$ = (s) => Array.from(d.querySelectorAll(s));
const click = (el) => el.dispatchEvent(new w.MouseEvent("click", { bubbles: true, cancelable: true }));
const type = (el, v) => { el.value = v; el.dispatchEvent(new w.Event("input", { bubbles: true })); el.dispatchEvent(new w.Event("change", { bubbles: true })); };
const check = (el) => { el.checked = true; el.dispatchEvent(new w.Event("change", { bubbles: true })); };
const submit = (form) => form.dispatchEvent(new w.Event("submit", { bubbles: true, cancelable: true }));
const text = (s) => ($(s) ? $(s).textContent.trim() : "");

ok("loads without script errors", errors.length === 0, errors.join(" | "));
ok("English hero title", text("#page-home h1") === "Gentle dental care, at your pace.", text("#page-home h1"));
ok("placeholders render as tokens", text(".doctor__bio .ph") === "INPUT_INFO_ABOUT_DOCTOR_BIO_HERE");
ok("header shows only the clinic name", text(".header .brand__text") === "Excelcare Dental" && !$(".brand__doc"), text(".header .brand__text"));
ok("doctor name and degree", text("#doctor-title") === "Dr. Van H Nguyen, DMD" && !$("#doctor-title .ph"), text("#doctor-title"));
ok("doctor photo inlined", ($("#doctor .photo img") || {}).src?.startsWith("data:image/jpeg;base64,") && $("#doctor .photo img").alt === "Portrait of Dr. Van H Nguyen");
ok("first-visit section removed, gallery hidden", !$("#first-visit") && $("#gallery").hidden);
ok("parking and ramp text", text(".access-list").includes("Free parking right in front of the office.") && text(".access-list").includes("ramp"), text(".access-list"));
const payAlts = $$(".paylist img").map((i) => i.alt);
ok("payment methods with logos", text(".paylist").includes("Cash") && ["Visa", "Mastercard", "American Express", "Cherry", "CareCredit"].every((s) => payAlts.includes(s)) && $$(".paylist img").every((i) => i.src.startsWith("data:image/")), payAlts.join(","));
const insAlts = $$(".insmarks img").map((i) => i.alt);
ok("10 insurer logos with names", insAlts.join(",") === "Delta Dental,Aetna,Blue Cross Blue Shield,Cigna,GEHA,Humana,UnitedHealthcare,MetLife,United Concordia,Sun Life" && $$(".insmarks img").every((i) => i.src.startsWith("data:image/")), insAlts.join(","));
ok("insurance note", text(".insnote").startsWith("We accept most major insurance plans.") && !$('#insurance .ph'), text(".insnote"));
const mapsLinks = $$("#site [data-maps]");
ok("Google Maps links open in a new tab", mapsLinks.length === 3 && mapsLinks.every((a) => a.target === "_blank" && a.rel === "noopener" && a.querySelector(".newtab")) &&
  $('[data-maps="place"]').href === "https://share.google/fyuOVADZM7Bpl3VVZ" &&
  $$('[data-maps="directions"]').every((a) => a.href === "https://www.google.com/maps/dir/?api=1&destination=Excelcare%20Dental%2C%201227%20N%20Illinois%2083%20Ste%20E%2C%20Grayslake%2C%20IL%2060030"),
  mapsLinks.map((a) => a.href).join(" | "));
const mapSrc = () => $(".map__frame").getAttribute("src") || "";
ok("live Google map of the clinic", mapSrc().startsWith("https://maps.google.com/maps?q=Excelcare%20Dental%2C%201227%20N%20Illinois%2083") && mapSrc().includes("output=embed") && $(".map__frame").title === "Map showing Excelcare Dental in Grayslake", mapSrc());
const hoursRow = (day) => { const tr = $$("#hoursBody tr").find((r) => r.querySelector("th").textContent.startsWith(day)); return tr ? tr.querySelector("td").textContent : ""; };
ok("clinic hours", /10:00\s?AM\s–\s7:00\s?PM/.test(hoursRow("Monday")) && /9:00\s?AM\s–\s5:00\s?PM/.test(hoursRow("Wednesday")) && hoursRow("Friday") === "Closed" && /9:00\s?AM\s–\s2:00\s?PM/.test(hoursRow("Saturday")) && hoursRow("Sunday") === "Closed", ["Monday", "Friday", "Saturday"].map(hoursRow).join(" | "));
ok("placeholder count shown", Number(text("#phCount")) > 0, text("#phCount"));
ok("confirmed clinic info shown", text('.header__phone-num') === "847-548-2222" && $$("[data-info]").every((el) => el.textContent.trim()), text(".header__phone-num"));
ok("7 rows of opening hours", $$("#hoursBody tr").length === 7);
ok("status text filled", text("[data-status] .status-text").length > 5, text("[data-status] .status-text"));
ok("notice banner visible", !$("#siteNotice").hidden && text("#noticeText").includes("Thanksgiving"), text("#noticeText"));
ok("notice reopens on an open day (not a closed Friday)", !/again on Friday/.test(text("#noticeText")), text("#noticeText"));
ok("all reveal items visible without IntersectionObserver", $$(".reveal:not(.is-in)").length === 0);
const offers = $$("#site .offer");
ok("$89 new patient special on home and New Patients page", offers.length === 2 && $("#page-home .offer") && $("#page-new .offer") &&
  offers.every((o) => o.querySelector(".offer__title").textContent === "Online New Patient Special" && o.querySelector(".offer__amount").textContent === "$89" &&
    o.querySelector(".offer__what").textContent === "Comprehensive Exam & Full-Mouth Diagnostic X-rays" && o.querySelector(".offer__note").textContent === "*For patients with no insurance" &&
    o.querySelector(".offer__cta").dataset.route === "schedule"),
  offers.map((o) => o.textContent.replace(/\s+/g, " ").trim()).join(" | "));

click($('[data-lang="vi"]'));
ok("Vietnamese hero", text("#page-home h1") === "Chăm sóc răng nhẹ nhàng, không vội vàng.");
ok("Vietnamese special", text("#page-home .offer__note") === "*Dành cho bệnh nhân không có bảo hiểm", text("#page-home .offer__note"));
ok("Vietnamese notice", text("#noticeText").startsWith("Phòng khám nghỉ"), text("#noticeText"));
ok("Vietnamese weekday names", $$("#hoursBody th")[0].textContent.startsWith("Thứ"), $$("#hoursBody th")[0].textContent);
click($('[data-lang="es"]'));
ok("Spanish CTA", text(".header .btn--cta span") === "Haga una cita");
ok("Spanish status", /Abierto|Cerrado/.test(text("[data-status] .status-text")), text("[data-status] .status-text"));
ok("site lang attribute", $("#site").lang === "es");
click($('[data-lang="en"]'));

// Staff portal: hours
click($("#tab-staff"));
ok("staff sign-in shown", !$("#stSignin").hidden && $("#stApp").hidden);
click($("#stSigninBtn"));
ok("staff app shown", !$("#stApp").hidden);
const friRow = () => $('#stHoursBody tr[data-day="fri"]');
const nextFriday = () => { let x = new w.Date(); x.setHours(0, 0, 0, 0); do x.setDate(x.getDate() + 1); while (x.getDay() !== 5 || w.dayInfo(x).special); return x; };
ok("booking calendar skips Fridays while closed", w.daySlots(nextFriday()).length === 0);
click(friRow().querySelector(".switch"));
ok("Friday switched on in draft", friRow().querySelector(".switch").getAttribute("aria-checked") === "true");
ok("dirty chip visible", !$("#stHoursDirty").hidden);
type(friRow().querySelectorAll("input")[0], "09:00");
type(friRow().querySelectorAll("input")[1], "12:30");
click($("#stHoursPublish"));
ok("website shows new Friday hours", /9:00\s?AM\s–\s12:30\s?PM/.test(hoursRow("Friday")), hoursRow("Friday"));
ok("booking calendar offers Friday times", w.daySlots(nextFriday()).length > 0 && w.daySlots(nextFriday()).every((s) => s >= "09:00" && s <= "11:30"), w.daySlots(nextFriday()).join(","));
const monRow = $('#stHoursBody tr[data-day="mon"]');
type(monRow.querySelectorAll("input")[0], "17:00");
type(monRow.querySelectorAll("input")[1], "09:00");
ok("invalid hours flagged", $$("#stHoursBody .row-error").length === 1);
click($("#stHoursPublish"));
ok("publish blocked while invalid", /Fix the highlighted/.test(text("#toasts")));
click($("#stHoursUndo"));
ok("undo clears error", $$("#stHoursBody .row-error").length === 0 && $("#stHoursDirty").hidden);

// Special dates
click($("#st-tab-dates"));
const before = $$("#stDatesList .sd-item").length;
const tomorrow = new w.Date(Date.now() + 86400000);
const iso = tomorrow.getFullYear() + "-" + String(tomorrow.getMonth() + 1).padStart(2, "0") + "-" + String(tomorrow.getDate()).padStart(2, "0");
submit($("#stDateForm"));
ok("date form validates", !$("#stDateErr").hidden);
type($("#st-date"), iso);
type($("#st-sd-en"), "Staff training");
click($('[data-sdtype="special"]'));
ok("special hours inputs shown", $("#stSdTimes").classList.contains("is-open"));
submit($("#stDateForm"));
ok("special date added", $$("#stDatesList .sd-item").length === before + 1);
ok("website lists the change", text("#changesList").includes("Staff training"), text("#changesList"));
ok("missing translations flagged", $$("#stDatesList .missing").length >= 2);
const delBtn = $$("#stDatesList [data-del]").pop();
click(delBtn);
ok("inline delete confirmation", !!$("[data-del-yes]"));
click($("[data-del-yes]"));
ok("item fades out before removal", $$("#stDatesList .is-removing").length === 1);
await sleep(400);
ok("date deleted", $$("#stDatesList .sd-item").length === before);

// Notice
click($("#st-tab-notice"));
type($("#st-n-en"), "We open late on Monday at 10:00 AM.");
ok("notice preview updates", text("#stNoticePreviewText") === "We open late on Monday at 10:00 AM.");
click($("#stNoticePublish"));
ok("website notice updated", text("#noticeText") === "We open late on Monday at 10:00 AM.");
click($("#stNoticeSwitch"));
click($("#stNoticePublish"));
ok("notice hidden after switch off", $("#siteNotice").hidden);
click($("#stNoticeSwitch"));
click($("#stNoticePublish"));

// Smooth scroll to a section, notice closing, FAQ
click($("#tab-site"));
click($('.nav__link[data-scroll="visit"]'));
await sleep(80);
ok("nav link scrolls to section and marks arrival", $("#visit").classList.contains("is-arrived") && d.activeElement === $("#visit"));
click($("#noticeClose"));
ok("notice folds away (closing state)", $("#siteNotice").classList.contains("is-closing"));
await sleep(550);
ok("notice hidden after folding", $("#siteNotice").hidden);

// Schedule form
click($('.header [data-route="schedule"]'));
ok("old page fades out first", $("#page-home").classList.contains("is-leaving"));
await sleep(350);
ok("schedule page shown", !$("#page-schedule").hidden && $("#page-home").hidden && $("#page-schedule").classList.contains("is-entering"));
const openDays = $$("#calGrid .cal__day.has-slots");
ok("calendar shows open days and pre-selects the first", openDays.length > 0 && openDays.every((b) => !b.disabled) && $$('#calGrid .cal__day[aria-pressed="true"]').length === 1 && $$("#slotsGrid .slot").length > 0);
ok("closed days cannot be picked", $$("#calGrid .cal__day:not(.has-slots)").every((b) => b.disabled));
submit($("#schForm"));
ok("schedule errors shown (time, first, last, birth date, phone, new patient)", $$("#schForm .error-msg").length === 6, String($$("#schForm .error-msg").length));
ok("demo mode note shown when there is no booking API", text("#schSourceNote").includes("dữ liệu giả"));
ok("missing time focuses a time button", d.activeElement && d.activeElement.classList.contains("slot"));
if (openDays[1]) { click(openDays[1]); ok("picking another day shows its times", openDays[1].getAttribute("aria-pressed") === "true" && text("#slotsTitle").includes(String(Number(openDays[1].dataset.date.slice(8))))); }
const slotBtn = $$("#slotsGrid .slot").pop();
const pickedIso = $('#calGrid .cal__day[aria-pressed="true"]').dataset.date + " " + slotBtn.dataset.slot;
click(slotBtn);
ok("picking a time shows the summary and clears the error", slotBtn.getAttribute("aria-pressed") === "true" && !$("#schPicked").hidden && !$('[data-field="slot"] .error-msg'), text("#schPicked"));
click($("#calNext"));
ok("next month button works", !$("#calPrev").disabled || $("#calNext").disabled);
type($("#sch-first"), "Test");
type($("#sch-last"), "Patient");
$("#sch-dob-m").value = "2"; $("#sch-dob-m").dispatchEvent(new w.Event("change", { bubbles: true }));
type($("#sch-dob-d"), "30");
type($("#sch-dob-y"), "1950");
type($("#sch-phone"), "555-123-4567");
check($("#sch-newpt-yes"));
submit($("#schForm"));
ok("impossible birth date (Feb 30) refused", $$("#schForm .error-msg").length === 1 && !!$('[data-field="sch-dob"] .error-msg'));
type($("#sch-dob-d"), "28");
submit($("#schForm"));
ok("sending state", $('#schForm button[type="submit"]').getAttribute("aria-busy") === "true");
await sleep(800);
ok("schedule success", !$("#schOk").hidden && text("#schOkBody").includes("555-123-4567") && text("#schOkBody").includes(slotBtn.textContent), text("#schOkBody"));
const [py, pm, pd] = pickedIso.slice(0, 10).split("-").map(Number);
ok("booked time is no longer offered", !w.daySlots(new w.Date(py, pm - 1, pd)).includes(pickedIso.slice(11)));
ok("bookings are not copied into the Google Sheet (they live in OpenDental)", text("#stSubsCount") === "0" && !$('[data-sheet="appt"]'));
click($('[data-lang="vi"]'));
ok("booking confirmation follows the language", text("#schOk h2") === "Cảm ơn quý vị, lịch hẹn đã được đặt" && text("#schOkBody").startsWith("Hẹn gặp quý vị"), text("#schOkBody"));
click($('[data-lang="en"]'));

// New patient form
click($('.nav__link[data-route="new"]'));
await sleep(350);
const q1 = $("#faq-q1");
click(q1);
ok("FAQ opens smoothly (collapse)", q1.getAttribute("aria-expanded") === "true" && $("#faq-a1").classList.contains("is-open"));
click(q1);
ok("FAQ closes", !$("#faq-a1").classList.contains("is-open"));
click($("#npNext"));
ok("step 1 errors", $$('#npForm .form-step[data-step="1"] .error-msg').length === 3);
type($("#np-first"), "Ana");
type($("#np-last"), "Tran");
$("#np-dob-m").value = "3"; $("#np-dob-m").dispatchEvent(new w.Event("change", { bubbles: true }));
type($("#np-dob-d"), "4");
type($("#np-dob-y"), "1950");
click($("#npNext"));
ok("step 2 shown", !$('#npForm .form-step[data-step="2"]').hidden && text("#npStepText").startsWith("Step 2 of 3"));
ok("step slides in from the right", $('#npForm .form-step[data-step="2"]').classList.contains("enter-next"));
type($("#np-phone"), "5551234567");
check($("#np-ins-yes"));
ok("insurance fields revealed", $("#npInsFields").classList.contains("is-open"));
click($("#npNext"));
ok("insurance company required", $$('#npForm .form-step[data-step="2"] .error-msg').length === 1);
type($("#np-insco"), "Delta Dental");
click($("#npNext"));
ok("step 3 shown", !$('#npForm .form-step[data-step="3"]').hidden && !$("#npSubmit").hidden);
submit($("#npForm"));
ok("consent required", $$('#npForm .form-step[data-step="3"] .error-msg').length === 1);
check($("#np-consent"));
submit($("#npForm"));
await sleep(800);
ok("new patient success", !$("#npOk").hidden);

// Sheet + Google Doc
click($('[data-goto-subs="np"]'));
ok("staff subs tab open", !$('[data-st-panel="subs"]').hidden);
ok("sheet row added", $("#stSheetGrid").textContent.includes("Ana Tran") && $("#stSheetGrid").textContent.includes("Delta Dental"));
click($("[data-mkdoc]"));
ok("Google Doc created", $("#stSheetGrid").textContent.includes("✓ New patient – Ana Tran"));
click($('[data-sheet="hours"]'));
ok("Hours sheet shows published data", $("#stSheetGrid").textContent.includes("Saturday"));

// Content pages: every internal link opens a real page
click($("#tab-site"));
const DOC_IDS = Object.keys(w.eval("DOC_META"));
ok("14 content pages, text in all 3 languages", DOC_IDS.length === 14 && ["en", "vi", "es"].every((l) => DOC_IDS.every((id) => w.eval("DOCS")[l][id] && w.eval("DOCS")[l][id].sections.length > 0)));
ok("no 'coming soon' links left on the website", $$("#site [data-soon]").length === 0);
ok("every page link points at an existing page", $$("#site [data-doc]").every((a) => DOC_IDS.includes(a.dataset.doc) && a.getAttribute("href") === "#" + a.dataset.doc), $$("#site [data-doc]").map((a) => a.dataset.doc).filter((x) => !DOC_IDS.includes(x)).join(","));
ok("every page is linked from somewhere on the site", DOC_IDS.every((id) => $$('#site [data-doc="' + id + '"]').length > 0), DOC_IDS.filter((id) => !$$('#site [data-doc="' + id + '"]').length).join(","));
const openDoc = async (sel) => { click($(sel)); await sleep(350); };
await openDoc('#services .card__link[data-doc="services/dentures"]');
ok("service card opens its page", !$("#page-doc").hidden && $("#page-home").hidden && text("#docTitle") === "Dentures & Partials" && w.location.hash === "#services/dentures", text("#docTitle") + " " + w.location.hash);
ok("service page has steps, list, breadcrumb and related services", $$("#docBody .doc-steps li").length === 4 && $$("#docBody .doc-list li").length >= 5 && text("#docCrumbs").includes("Services") && $$("#docRelatedList a").length === 5);
ok("aside offers schedule and call", !!$('#page-doc .doc__aside [data-route="schedule"]') && !!$("#page-doc .doc__aside [data-call]") && text("#page-doc [data-status] .status-text").length > 5);
await openDoc('#docBody .doc-more');
ok("link inside a page opens the article", text("#docTitle") === "Caring for your dentures: a simple daily routine" && /\d+ minute read/.test(text("#docMeta")) && !!$("#docBody .doc-disclaimer"));
w.history.back();
await sleep(400);
ok("browser Back returns to the previous page", text("#docTitle") === "Dentures & Partials" && w.location.hash === "#services/dentures", text("#docTitle"));
await openDoc('#servicesMenu [data-doc="services/emergency"]');
ok("services menu opens a service page with the 911 warning", text("#docTitle") === "Emergency Care" && !!$("#docBody .doc-warn") && text("#docBody").includes("INPUT_INFO_ABOUT_AFTER_HOURS_EMERGENCY_HERE"));
await openDoc('#servicesMenu [data-doc="services/checkups"]');
const docFaq = $("#docBody .faq__q");
click(docFaq);
ok("FAQ on a content page opens", docFaq.getAttribute("aria-expanded") === "true" && $("#" + docFaq.getAttribute("aria-controls")).classList.contains("is-open"));
await openDoc('.nav__link[data-doc="about"]');
ok("About the Doctor page with photo and facts", !$("#docAbout").hidden && $("#docAbout img").src.startsWith("data:image/jpeg") && text("#docTitle") === "Dr. Van H Nguyen, DMD" && $('.nav__link[data-doc="about"]').getAttribute("aria-current") === "page");
await openDoc('.footer [data-doc="privacy-practices"]');
ok("Notice of Privacy Practices opens from the footer", text("#docTitle") === "Notice of Privacy Practices" && text("#docLead").startsWith("This notice describes how medical information") && text("#docMeta").includes("INPUT_INFO_ABOUT_LEGAL_EFFECTIVE_DATE_HERE") && $("#docAbout").hidden);
await openDoc('.footer [data-doc="nondiscrimination"]');
ok("Nondiscrimination notice has Spanish and Vietnamese taglines", $$('#docBody .doc-taglines li[lang="es"], #docBody .doc-taglines li[lang="vi"]').length === 2);
click($('[data-lang="vi"]'));
ok("content page follows the language", text("#docTitle") === "Thông báo không phân biệt đối xử" || text("#docLead").startsWith("Excelcare Dental tuân thủ"), text("#docLead"));
click($('[data-lang="es"]'));
ok("Spanish content page", text("#docLead").startsWith("Excelcare Dental cumple"), text("#docLead"));
click($('[data-lang="en"]'));
await openDoc('#docCrumbs [data-route="home"]');
ok("breadcrumb Home returns to the home page", !$("#page-home").hidden && $("#page-doc").hidden && w.location.hash === "");
ok("article cards show reading time", $$("[data-readtime]").every((el) => /^\d+ minute read$/.test(el.textContent)), $$("[data-readtime]").map((e) => e.textContent).join("|"));

// Placeholders, menu, dropdown, text size, device
click($("#tab-ph"));
ok("placeholder table rows", $$("#phBody tr").length === Number(text("#phCount")));
click($("#phCopy"));
await sleep(30);
ok("copy confirms", text("#phCopyStatus").startsWith("Đã sao chép"), text("#phCopyStatus"));
click($("#tab-site"));
click($("#menuBtn"));
ok("menu opens", $("#mobileMenu").classList.contains("is-open") && $("#menuBtn").getAttribute("aria-expanded") === "true");
d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
ok("Escape closes menu", !$("#mobileMenu").classList.contains("is-open"));
click($("#servicesToggle"));
ok("dropdown opens", $("#servicesMenu").classList.contains("is-open"));
click($("#page-home") || d.body);
ok("outside click closes dropdown", !$("#servicesMenu").classList.contains("is-open"));
click($('[data-scale="1.3"]'));
ok("text size A++", d.documentElement.style.fontSize === "130%");
click($('[data-scale="1"]'));

// Accessibility menu
const tile = (k) => $('#a11yGrid [data-a11y="' + k + '"]');
ok("accessibility button and 10 tiles", !!$("#a11yBtn") && $$("#a11yGrid [data-a11y]").length === 10);
click($("#a11yBtn"));
ok("accessibility panel opens", $("#a11yPanel").classList.contains("is-open") && !$("#a11yPanel").inert && $("#a11yBtn").getAttribute("aria-expanded") === "true");
ok("accessibility tiles start off", $$("#a11yGrid [data-a11y]").every((b) => b.getAttribute("aria-pressed") === "false") && $("#a11yReset").disabled);
click(tile("contrast"));
ok("contrast level 1", $("#site").getAttribute("data-a11y-contrast") === "1" && tile("contrast").getAttribute("aria-pressed") === "true" && tile("contrast").textContent.includes("High contrast"));
click(tile("contrast"));
ok("contrast level 2", $("#site").getAttribute("data-a11y-contrast") === "2" && tile("contrast").querySelectorAll(".is-on").length === 2);
click(tile("contrast"));
ok("contrast cycles back off", !$("#site").hasAttribute("data-a11y-contrast") && tile("contrast").getAttribute("aria-pressed") === "false");
click(tile("size"));
ok("bigger text drives the A+ size", d.documentElement.style.fontSize === "115%" && $('.utility [data-scale="1.15"]').getAttribute("aria-pressed") === "true");
click($('.utility [data-scale="1.3"]'));
ok("A++ button updates bigger-text tile", tile("size").querySelectorAll(".is-on").length === 2);
click(tile("links"));
click(tile("still"));
ok("toggles set attributes", $("#site").hasAttribute("data-a11y-links") && $("#site").hasAttribute("data-a11y-still") && $("#a11yBtn").classList.contains("is-active"));
ok("accessibility choices saved", JSON.parse(w.localStorage.getItem("dentproto:a11y")).links === 1);
click($('[data-lang="vi"]'));
ok("accessibility menu in Vietnamese", text("#a11yTitle") === "Hỗ trợ dễ đọc, dễ xem" && tile("links").textContent.includes("Đang bật"));
click($('[data-lang="en"]'));
ok("clicking the page outside closes the panel", !$("#a11yPanel").classList.contains("is-open") && $("#a11yBtn").getAttribute("aria-expanded") === "false");
click($("#a11yBtn"));
click($("#a11yReset"));
ok("reset clears everything", !$("#site").hasAttribute("data-a11y-links") && !$("#site").hasAttribute("data-a11y-still") && d.documentElement.style.fontSize === "100%" && !$("#a11yBtn").classList.contains("is-active"));
d.dispatchEvent(new w.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
ok("Escape closes accessibility panel", !$("#a11yPanel").classList.contains("is-open") && $("#a11yPanel").inert);

// Prototype bar collapse button
click($("#protoToggle"));
ok("prototype bar collapses", $("#protoBar").classList.contains("is-collapsed") && $("#protoToggle").getAttribute("aria-expanded") === "false" && text("#protoToggle") === "Mở rộng" && w.localStorage.getItem("dentproto:protoCollapsed") === "true");
click($("#protoToggle"));
ok("prototype bar expands", !$("#protoBar").classList.contains("is-collapsed") && $("#protoToggle").getAttribute("aria-expanded") === "true" && text("#protoToggle") === "Thu gọn");

click($('[data-device="phone"]'));
ok("phone frame", $("#device").classList.contains("is-phone"));
click($('[data-phmode="label"]'));
ok("label mode", text(".doctor__bio .ph") === "Short bio");
ok("no script errors during the run", errors.length === 0, errors.join(" | "));
await sleep(50);
dom.window.close();

// A shared link opens that page straight away
const deep = boot("http://localhost/#tips/dry-mouth");
await sleep(50);
ok("shared link opens the page directly", !deep.d.querySelector("#page-doc").hidden && deep.d.querySelector("#docTitle").textContent === "Dry mouth: why it happens and what helps" && deep.errors.length === 0, deep.errors.join(" | "));
deep.dom.window.close();

const failed = results.filter((r) => !r.pass);
results.forEach((r) => console.log((r.pass ? "PASS " : "FAIL ") + r.name + (r.pass || !r.extra ? "" : "  -> " + r.extra)));
console.log("\n" + (results.length - failed.length) + "/" + results.length + " checks passed");
process.exitCode = failed.length ? 1 : 0;
