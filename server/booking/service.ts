// Online booking on top of Open Dental:
//  - availability(): open start times for the website's month calendar, from GET /appointments/Slots
//  - book(): re-checks the time, finds or creates the patient, then POST /appointments
// Open Dental stays the only place appointments live; the website keeps no copy of them.
import { OpenDentalError } from "../opendental/types.ts";
import type { OdSlot, OpenDentalApi } from "../opendental/types.ts";
import type { BookingConfig } from "./config.ts";
import { addDays, fromMin, nowIn, splitDateTime, toMin } from "./time.ts";
import { validateBooking } from "./validate.ts";
import type { BookingInput, FieldErrors } from "./validate.ts";

export interface Availability {
  timeZone: string;
  visitMinutes: number;
  from: string;
  to: string;
  /** "yyyy-MM-dd" -> ["09:00", "10:00", …]; days without open times are left out */
  days: Record<string, string[]>;
}

export type BookingErrorCode = "invalid" | "outside_window" | "slot_taken" | "busy" | "unavailable";

export class BookingError extends Error {
  code: BookingErrorCode;
  fields?: FieldErrors;
  constructor(code: BookingErrorCode, fields?: FieldErrors) {
    super(code);
    this.name = "BookingError";
    this.code = code;
    this.fields = fields;
  }
}

export interface BookingResult {
  aptNum: number;
  date: string;
  time: string;
  visitMinutes: number;
  /** true when the patient record may be a duplicate; the appointment note asks staff to check */
  needsReview: boolean;
}

export interface BookingServiceOptions {
  now?: () => Date;
  /** Extra closed days on top of Open Dental (for example the website's "Special dates" sheet) */
  isClosed?: (date: string) => boolean | Promise<boolean>;
  cacheMs?: number;
}

const LANG_NAME = { en: "English", vi: "Vietnamese", es: "Spanish" } as const;
const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/** Turns Open Dental's open stretches into start times on a fixed grid (e.g. every hour) that fit a whole visit. */
export function slotsToStartTimes(slots: OdSlot[], visitMinutes: number, stepMinutes: number): Record<string, string[]> {
  const days: Record<string, Set<string>> = {};
  for (const s of slots) {
    const a = splitDateTime(s.DateTimeStart), b = splitDateTime(s.DateTimeEnd);
    if (a.date !== b.date) continue; // Open Dental slots never cross midnight; skip anything odd
    for (let m = Math.ceil(a.minutes / stepMinutes) * stepMinutes; m + visitMinutes <= b.minutes; m += stepMinutes) (days[a.date] ??= new Set()).add(fromMin(m));
  }
  return Object.fromEntries(Object.keys(days).sort().map((d) => [d, [...days[d]].sort()]));
}

export class BookingService {
  private api: OpenDentalApi;
  private cfg: BookingConfig;
  private now: () => Date;
  private isClosed: (date: string) => boolean | Promise<boolean>;
  private cacheMs: number;
  private cache: { at: number; key: string; value: Availability } | null = null;
  private locks = new Set<string>();

  constructor(api: OpenDentalApi, cfg: BookingConfig, opts: BookingServiceOptions = {}) {
    this.api = api;
    this.cfg = cfg;
    this.now = opts.now ?? (() => new Date());
    this.isClosed = opts.isClosed ?? (() => false);
    this.cacheMs = opts.cacheMs ?? 60_000;
  }

  /** First and last bookable day: from tomorrow, up to bookingWeeks ahead (clinic time zone). */
  window(): { today: string; from: string; to: string } {
    const today = nowIn(this.cfg.timeZone, this.now()).date;
    return { today, from: addDays(today, 1), to: addDays(today, this.cfg.bookingWeeks * 7) };
  }

  async availability(fresh = false): Promise<Availability> {
    const { from, to } = this.window();
    const key = from + "|" + to;
    if (!fresh && this.cache && this.cache.key === key && Date.now() - this.cache.at < this.cacheMs) return this.cache.value;
    const days = await this.startTimes(from, to);
    const value: Availability = { timeZone: this.cfg.timeZone, visitMinutes: this.cfg.visitMinutes, from, to, days };
    this.cache = { at: Date.now(), key, value };
    return value;
  }

  async book(raw: unknown): Promise<BookingResult> {
    const { today, from, to } = this.window();
    const v = validateBooking(raw, today);
    if (!v.ok) throw new BookingError("invalid", v.fields);
    const b = v.value;
    if (b.date < from || b.date > to) throw new BookingError("outside_window", { date: "err_slot" });

    // Two people pressing "Book" for the same time: only the first goes through
    const lock = b.date + " " + b.time;
    if (this.locks.has(lock)) throw new BookingError("busy");
    this.locks.add(lock);
    try {
      const open = (await this.startTimes(b.date, b.date))[b.date] || [];
      if (!open.includes(b.time)) throw new BookingError("slot_taken", { time: "err_slot_taken" });

      const { patNum, needsReview } = await this.findOrCreatePatient(b);
      const apt = await this.api.createAppointment({
        PatNum: patNum,
        Op: this.cfg.opNum ?? 0,
        ProvNum: this.cfg.provNum,
        ClinicNum: this.cfg.clinicNum,
        AptDateTime: b.date + " " + b.time + ":00",
        Pattern: "X".repeat(this.cfg.visitMinutes / 5),
        AppointmentTypeNum: this.cfg.appointmentTypeNum,
        IsNewPatient: b.newPatient ? "true" : "false",
        Note: appointmentNote(b, needsReview)
      });
      this.cache = null;
      return { aptNum: apt.AptNum, date: b.date, time: b.time, visitMinutes: this.cfg.visitMinutes, needsReview };
    } catch (e) {
      if (e instanceof BookingError) throw e;
      if (e instanceof OpenDentalError) throw new BookingError("unavailable");
      throw e;
    } finally {
      this.locks.delete(lock);
    }
  }

  private async startTimes(from: string, to: string): Promise<Record<string, string[]>> {
    let slots: OdSlot[];
    try {
      slots = await this.api.getSlots({ dateStart: from, dateEnd: to, lengthMinutes: this.cfg.visitMinutes, ProvNum: this.cfg.provNum, OpNum: this.cfg.opNum });
    } catch (e) {
      if (e instanceof OpenDentalError) throw new BookingError("unavailable");
      throw e;
    }
    const days = slotsToStartTimes(slots, this.cfg.visitMinutes, this.cfg.stepMinutes);
    for (const d of Object.keys(days)) if (d < from || d > to || (await this.isClosed(d))) delete days[d];
    return days;
  }

  // Match on last name + first name + date of birth, as Open Dental recommends. Exactly one match = same person.
  // Zero or several matches: create a new record and leave a note so staff can merge duplicates in Open Dental.
  private async findOrCreatePatient(b: BookingInput): Promise<{ patNum: number; needsReview: boolean }> {
    const found = await this.api.findPatients({ LName: b.lastName, FName: b.firstName, Birthdate: b.birthdate });
    const exact = found.filter((p) => norm(p.LName) === norm(b.lastName) && norm(p.FName) === norm(b.firstName) && p.Birthdate === b.birthdate);
    if (exact.length === 1) return { patNum: exact[0].PatNum, needsReview: false };
    const p = await this.api.createPatient({
      LName: b.lastName, FName: b.firstName, Birthdate: b.birthdate,
      WirelessPhone: b.phone, Email: b.email || undefined, PreferContactMethod: "WirelessPh",
      PriProv: this.cfg.provNum, ClinicNum: this.cfg.clinicNum
    });
    return { patNum: p.PatNum, needsReview: !(b.newPatient && exact.length === 0) };
  }
}

function appointmentNote(b: BookingInput, needsReview: boolean): string {
  const lines = ["Booked on the website.", (b.newPatient ? "New patient" : "Existing patient") + ". Call in " + LANG_NAME[b.lang] + "."];
  if (b.reason) lines.push("Reason: " + b.reason);
  if (needsReview) lines.push(b.newPatient ? "Possible duplicate patient record: please check." : "Said existing patient, but no single match by name + birth date: please check and merge.");
  return lines.join("\n");
}
