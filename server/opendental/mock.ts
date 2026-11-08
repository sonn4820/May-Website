// In-memory stand-in for Open Dental, used for tests and for the prototype when no API keys are set.
// It follows the documented behaviour: GET /appointments/Slots returns whole open stretches of the
// provider's schedule (not single start times), and POST /appointments takes a 5-minute Pattern.
import { OpenDentalError } from "./types.ts";
import type { OdAppointment, OdAppointmentCreate, OdPatient, OdPatientCreate, OdPatientQuery, OdSlot, OdSlotQuery, OpenDentalApi } from "./types.ts";
import { addDays, fromMin, splitDateTime, toMin, weekday } from "../booking/time.ts";

/** Opening hours per weekday (0 = Sunday), "HH:mm". null = closed. Defaults to the clinic's hours (Nov 2026). */
export type WeekSchedule = Array<[string, string] | null>;
export const CLINIC_SCHEDULE: WeekSchedule = [null, ["10:00", "19:00"], ["09:00", "17:00"], ["09:00", "17:00"], ["09:00", "17:00"], null, ["09:00", "14:00"]];

export interface MockOptions {
  schedule?: WeekSchedule;
  provNum?: number;
  opNum?: number;
  /** Share of hours already taken by other patients (0–1), picked by a fixed hash so results are repeatable. */
  busyShare?: number;
}

function hash(s: string): number { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }

export class MockOpenDental implements OpenDentalApi {
  appointments: OdAppointment[] = [];
  /** Exactly what the website sent to POST /appointments (to check Note, Pattern, IsNewPatient in tests) */
  appointmentRequests: OdAppointmentCreate[] = [];
  patients: Array<OdPatient & OdPatientCreate> = [];
  calls: string[] = [];
  private schedule: WeekSchedule;
  private provNum: number;
  private opNum: number;
  private busyShare: number;
  private nextApt = 1000;
  private nextPat = 500;

  constructor(opts: MockOptions = {}) {
    this.schedule = opts.schedule ?? CLINIC_SCHEDULE;
    this.provNum = opts.provNum ?? 1;
    this.opNum = opts.opNum ?? 1;
    this.busyShare = opts.busyShare ?? 0.4;
  }

  async getSlots(q: OdSlotQuery): Promise<OdSlot[]> {
    this.calls.push("GET appointments/Slots");
    const out: OdSlot[] = [];
    for (let d = q.dateStart; d <= q.dateEnd; d = addDays(d, 1)) {
      const hours = this.schedule[weekday(d)];
      if (!hours) continue;
      const open = toMin(hours[0]), close = toMin(hours[1]);
      // Minutes taken by existing appointments: seeded "other patients" (whole hours) plus real bookings
      const busy: Array<[number, number]> = [];
      for (let m = open; m + 60 <= close; m += 60) if (hash(d + fromMin(m)) % 100 < this.busyShare * 100) busy.push([m, m + 60]);
      for (const a of this.appointments) {
        const s = splitDateTime(a.AptDateTime);
        if (s.date === d && a.Op === this.opNum) busy.push([s.minutes, s.minutes + a.Pattern.length * 5]);
      }
      busy.sort((a, b) => a[0] - b[0]);
      let cur = open;
      const push = (from: number, to: number) => {
        if (to - from >= (q.lengthMinutes || 5)) out.push({ DateTimeStart: d + " " + fromMin(from) + ":00", DateTimeEnd: d + " " + fromMin(to) + ":00", ProvNum: this.provNum, OpNum: this.opNum });
      };
      for (const [s, e] of busy) { if (s > cur) push(cur, Math.min(s, close)); cur = Math.max(cur, e); }
      if (cur < close) push(cur, close);
    }
    return out;
  }

  async findPatients(q: OdPatientQuery): Promise<OdPatient[]> {
    this.calls.push("GET patients/Simple");
    // Open Dental matches LName/FName partially and case-insensitively, Birthdate exactly
    const has = (a: string, b: string) => a.toLowerCase().includes(b.toLowerCase());
    return this.patients.filter((p) => has(p.LName, q.LName) && has(p.FName, q.FName) && p.Birthdate === q.Birthdate)
      .map(({ PatNum, LName, FName, Birthdate }) => ({ PatNum, LName, FName, Birthdate }));
  }

  async createPatient(p: OdPatientCreate): Promise<OdPatient> {
    this.calls.push("POST patients");
    if (!p.LName || !p.FName) throw new OpenDentalError(400, "Open Dental returned 400", "LName and FName are required");
    const row = { ...p, PatNum: this.nextPat++, Birthdate: p.Birthdate || "0001-01-01" };
    this.patients.push(row);
    return { PatNum: row.PatNum, LName: row.LName, FName: row.FName, Birthdate: row.Birthdate };
  }

  async createAppointment(a: OdAppointmentCreate): Promise<OdAppointment> {
    this.calls.push("POST appointments");
    if (!this.patients.some((p) => p.PatNum === a.PatNum)) throw new OpenDentalError(404, "Open Dental returned 404", "Patient not found");
    if (a.Pattern && !/^[X/]+$/.test(a.Pattern)) throw new OpenDentalError(400, "Open Dental returned 400", "Pattern must be X and /");
    const apt: OdAppointment = { AptNum: this.nextApt++, PatNum: a.PatNum, Op: a.Op, ProvNum: a.ProvNum ?? this.provNum, AptDateTime: a.AptDateTime, Pattern: a.Pattern || "/XX/", AptStatus: "Scheduled" };
    this.appointments.push(apt);
    this.appointmentRequests.push({ ...a });
    return apt;
  }
}
