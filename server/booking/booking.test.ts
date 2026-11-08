// Run: npm run api:test
import { test } from "node:test";
import assert from "node:assert/strict";
import { OpenDentalClient } from "../opendental/client.ts";
import { MockOpenDental } from "../opendental/mock.ts";
import { OpenDentalError } from "../opendental/types.ts";
import { checkConfig, loadBookingConfig } from "./config.ts";
import type { BookingConfig } from "./config.ts";
import { createBookingHandlers } from "./http.ts";
import { BookingError, BookingService, slotsToStartTimes } from "./service.ts";
import { addDays, nowIn, weekday } from "./time.ts";
import { validateBooking } from "./validate.ts";

// Sunday 8 Nov 2026, 10:00 in Chicago (16:00 UTC)
const NOW = new Date("2026-11-08T16:00:00Z");
const cfg = (over: Partial<BookingConfig> = {}): BookingConfig => ({ ...loadBookingConfig({}), provNum: 1, opNum: 1, ...over });
const setup = (over: Partial<BookingConfig> = {}, mockOpts = {}) => {
  const api = new MockOpenDental(mockOpts);
  const service = new BookingService(api, cfg(over), { now: () => NOW });
  return { api, service };
};
const person = (over: Record<string, unknown> = {}) => ({
  firstName: "Ana", lastName: "Tran", birthdate: "1950-03-04", phone: "555-123-4567", email: "", newPatient: true, reason: "Checkup", lang: "vi", ...over
});
const firstOpen = async (service: BookingService) => {
  const a = await service.availability(true);
  const date = Object.keys(a.days)[0];
  return { date, time: a.days[date][0], a };
};

test("time helpers use the clinic time zone, not the server's", () => {
  assert.deepEqual(nowIn("America/Chicago", NOW), { date: "2026-11-08", minutes: 600 });
  assert.equal(nowIn("America/Chicago", new Date("2026-11-09T03:30:00Z")).date, "2026-11-08"); // 9:30 PM Sunday in Chicago
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
  assert.equal(weekday("2026-11-13"), 5);
});

test("config: defaults are 60-minute visits, on the hour, 8 weeks, Chicago", () => {
  const c = loadBookingConfig({});
  assert.equal(c.mode, "mock");
  assert.equal(c.visitMinutes, 60);
  assert.equal(c.stepMinutes, 60);
  assert.equal(c.bookingWeeks, 8);
  assert.equal(c.timeZone, "America/Chicago");
  assert.throws(() => loadBookingConfig({ BOOKING_MODE: "opendental" }), /DEVELOPER_KEY.*\n.*PROV_NUM.*\n.*OP_NUM/s);
  assert.throws(() => checkConfig({ ...c, visitMinutes: 62 }), /steps of 5/);
});

test("Open Dental slots become start times that fit a whole visit", () => {
  const days = slotsToStartTimes([
    { DateTimeStart: "2026-11-10 08:15:00", DateTimeEnd: "2026-11-10 10:30:00", ProvNum: 1, OpNum: 1 },
    { DateTimeStart: "2026-11-10 13:00:00", DateTimeEnd: "2026-11-10 13:45:00", ProvNum: 1, OpNum: 1 },
    { DateTimeStart: "2026-11-11 09:00:00", DateTimeEnd: "2026-11-11 11:00:00", ProvNum: 1, OpNum: 1 }
  ], 60, 60);
  assert.deepEqual(days, { "2026-11-10": ["09:00"], "2026-11-11": ["09:00", "10:00"] });
  assert.deepEqual(slotsToStartTimes([{ DateTimeStart: "2026-11-10 09:00:00", DateTimeEnd: "2026-11-10 10:30:00", ProvNum: 1, OpNum: 1 }], 30, 30)["2026-11-10"], ["09:00", "09:30", "10:00"]);
});

test("availability: tomorrow to 8 weeks ahead, only open days, within opening hours", async () => {
  const { service } = setup();
  const a = await service.availability();
  assert.equal(a.from, "2026-11-09");
  assert.equal(a.to, "2027-01-03");
  const dates = Object.keys(a.days);
  assert.ok(dates.length > 20);
  assert.ok(dates.every((d) => d >= a.from && d <= a.to));
  assert.ok(dates.every((d) => weekday(d) !== 0 && weekday(d) !== 5), "never Sunday or Friday");
  for (const d of dates) {
    const [open, last] = ({ 1: ["10:00", "18:00"], 6: ["09:00", "13:00"] } as Record<number, string[]>)[weekday(d)] ?? ["09:00", "16:00"];
    assert.ok(a.days[d].every((t) => t >= open && t <= last), d + " " + a.days[d]);
  }
});

test("availability is cached between calls and skips extra closed days", async () => {
  const api = new MockOpenDental();
  const service = new BookingService(api, cfg(), { now: () => NOW, isClosed: (d) => d === "2026-11-26" });
  const a = await service.availability();
  await service.availability();
  assert.equal(api.calls.filter((c) => c === "GET appointments/Slots").length, 1);
  assert.equal(a.days["2026-11-26"], undefined, "Thanksgiving closed");
});

test("booking creates the patient and a 60-minute appointment in Open Dental", async () => {
  const { api, service } = setup();
  const { date, time } = await firstOpen(service);
  const r = await service.book({ ...person(), date, time });
  assert.equal(r.date, date);
  assert.equal(r.needsReview, false);
  assert.equal(api.patients.length, 1);
  assert.deepEqual([api.patients[0].LName, api.patients[0].FName, api.patients[0].Birthdate, api.patients[0].WirelessPhone], ["Tran", "Ana", "1950-03-04", "555-123-4567"]);
  const req = api.appointmentRequests[0];
  assert.equal(req.AptDateTime, date + " " + time + ":00");
  assert.equal(req.Pattern, "XXXXXXXXXXXX");
  assert.equal(req.IsNewPatient, "true");
  assert.equal(req.Op, 1);
  assert.match(req.Note!, /Booked on the website\.\nNew patient\. Call in Vietnamese\.\nReason: Checkup/);
  const after = await service.availability();
  assert.ok(!(after.days[date] || []).includes(time), "booked time is gone");
});

test("visit length follows the setting (Mây can change it)", async () => {
  const { api, service } = setup({ visitMinutes: 90, stepMinutes: 30 });
  const { date, time } = await firstOpen(service);
  await service.book({ ...person(), date, time });
  assert.equal(api.appointmentRequests[0].Pattern.length * 5, 90);
});

test("the same time cannot be booked twice", async () => {
  const { service } = setup();
  const { date, time } = await firstOpen(service);
  const [r1, r2] = await Promise.allSettled([service.book({ ...person(), date, time }), service.book({ ...person({ firstName: "Binh" }), date, time })]);
  assert.equal(r1.status, "fulfilled");
  assert.ok(r2.status === "rejected" && r2.reason instanceof BookingError && ["busy", "slot_taken"].includes(r2.reason.code));
  await assert.rejects(service.book({ ...person({ firstName: "Chi" }), date, time }), (e: unknown) => e instanceof BookingError && e.code === "slot_taken");
});

test("existing patient: one exact match is reused, no new record", async () => {
  const { api, service } = setup();
  await api.createPatient({ LName: "Trần", FName: "Ana", Birthdate: "1950-03-04" });
  await api.createPatient({ LName: "Tranh", FName: "Anabel", Birthdate: "1950-03-04" }); // partial match only
  const { date, time } = await firstOpen(service);
  const r = await service.book({ ...person({ newPatient: false, lastName: "Trần" }), date, time });
  assert.equal(api.patients.length, 2);
  assert.equal(api.appointmentRequests[0].PatNum, api.patients[0].PatNum);
  assert.equal(r.needsReview, false);
});

test("existing patient not found: record created and note asks staff to check", async () => {
  const { api, service } = setup();
  const { date, time } = await firstOpen(service);
  const r = await service.book({ ...person({ newPatient: false }), date, time });
  assert.equal(r.needsReview, true);
  assert.equal(api.patients.length, 1);
  assert.match(api.appointmentRequests[0].Note!, /no single match by name \+ birth date/);
});

test("times outside the window or not open are refused", async () => {
  const { service } = setup();
  await assert.rejects(service.book({ ...person(), date: "2026-11-08", time: "10:00" }), (e: unknown) => e instanceof BookingError && e.code === "outside_window");
  await assert.rejects(service.book({ ...person(), date: "2026-11-13", time: "10:00" }), (e: unknown) => e instanceof BookingError && e.code === "slot_taken"); // Friday
  await assert.rejects(service.book({ ...person(), date: "2026-11-10", time: "07:00" }), (e: unknown) => e instanceof BookingError && e.code === "slot_taken");
});

test("validation returns a code per field", () => {
  const bad = validateBooking({ date: "2026-02-30", time: "9am", firstName: "", lastName: "x".repeat(61), birthdate: "2030-01-01", phone: "123", email: "nope", newPatient: "yes" }, "2026-11-08");
  assert.equal(bad.ok, false);
  assert.deepEqual(!bad.ok && bad.fields, { date: "err_slot", time: "err_slot", firstName: "err_first", lastName: "err_last", birthdate: "err_dob", phone: "err_phone", email: "err_email", newPatient: "err_choose" });
  assert.deepEqual(validateBooking({ ...person(), date: "2026-11-10", time: "09:00", website: "http://spam" }, "2026-11-08"), { ok: false, fields: { form: "rejected" } });
});

test("Open Dental down: the website gets 'unavailable', never the raw error", async () => {
  const api = new MockOpenDental();
  api.getSlots = async () => { throw new OpenDentalError(0, "Could not reach Open Dental"); };
  const h = createBookingHandlers(new BookingService(api, cfg(), { now: () => NOW }));
  const res = await h.availability(new Request("http://x/api/booking/availability"));
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { error: "unavailable" });
});

test("HTTP: 201 on success, 400 with fields, 409 when taken, 429 when flooded", async () => {
  const { service } = setup();
  let t = 0;
  const h = createBookingHandlers(service, { maxBookings: 2, now: () => t });
  const post = (body: unknown, ip = "1.1.1.1") => h.book(new Request("http://x/api/booking", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }), ip);
  const { date, time } = await firstOpen(service);
  const ok = await post({ ...person(), date, time });
  assert.equal(ok.status, 201);
  assert.deepEqual(await ok.json(), { ok: true, date, time, visitMinutes: 60 });
  const bad = await post({ date, time });
  assert.equal(bad.status, 400);
  assert.equal((await bad.json()).fields.firstName, "err_first");
  const taken = await post({ ...person(), date, time }, "2.2.2.2");
  assert.equal(taken.status, 409);
  assert.equal((await post({ ...person(), date, time })).status, 429);
  t += 11 * 60_000;
  assert.notEqual((await post({ ...person(), date, time })).status, 429, "limit resets after the window");
  const notJson = await h.book(new Request("http://x/api/booking", { method: "POST", body: "a=b" }), "3.3.3.3");
  assert.equal(notJson.status, 415);
});

test("client: sends the ODFHIR header, query string and JSON body; spaces requests", async () => {
  const seen: Array<{ url: string; init: RequestInit; at: number }> = [];
  const fake = (async (url: URL, init: RequestInit) => {
    seen.push({ url: String(url), init, at: Date.now() });
    return new Response(init.method === "POST" ? JSON.stringify({ PatNum: 7, LName: "Tran", FName: "Ana", Birthdate: "1950-03-04" }) : "[]", { status: init.method === "POST" ? 201 : 200 });
  }) as unknown as typeof fetch;
  const c = new OpenDentalClient({ developerKey: "DEV", customerKey: "CUST", fetch: fake, minIntervalMs: 40 });
  await Promise.all([c.getSlots({ dateStart: "2026-11-09", dateEnd: "2026-11-10", lengthMinutes: 60, ProvNum: 2, OpNum: 3 }), c.createPatient({ LName: "Tran", FName: "Ana" })]);
  assert.equal(seen[0].url, "https://api.opendental.com/api/v1/appointments/Slots?dateStart=2026-11-09&dateEnd=2026-11-10&lengthMinutes=60&ProvNum=2&OpNum=3");
  assert.equal((seen[0].init.headers as Record<string, string>).Authorization, "ODFHIR DEV/CUST");
  assert.equal(seen[1].url, "https://api.opendental.com/api/v1/patients");
  assert.deepEqual(JSON.parse(String(seen[1].init.body)), { LName: "Tran", FName: "Ana" });
  assert.ok(seen[1].at - seen[0].at >= 35, "second request waited for the throttle gap");
});

test("client: errors keep Open Dental's text out of the message", async () => {
  const fake = (async () => new Response("Patient Tran, Ana already exists", { status: 400 })) as unknown as typeof fetch;
  const c = new OpenDentalClient({ developerKey: "D", customerKey: "C", fetch: fake, minIntervalMs: 0 });
  await assert.rejects(c.createPatient({ LName: "Tran", FName: "Ana" }), (e: unknown) => e instanceof OpenDentalError && e.status === 400 && !e.message.includes("Tran") && e.detail.includes("Tran"));
  const slow = ((_u: URL, init: RequestInit) => new Promise((_r, reject) => init.signal!.addEventListener("abort", () => reject(new Error("aborted"))))) as unknown as typeof fetch;
  const c2 = new OpenDentalClient({ developerKey: "D", customerKey: "C", fetch: slow, minIntervalMs: 0, timeoutMs: 30 });
  await assert.rejects(c2.getSlots({ dateStart: "2026-11-09", dateEnd: "2026-11-09" }), (e: unknown) => e instanceof OpenDentalError && /in time/.test(e.message));
});
