// Booking settings, read from environment variables so they can change without touching code.
// See server/README.md for what each one means and where to find the numbers in Open Dental.
import { OPENDENTAL_REMOTE_URL } from "../opendental/client.ts";

export interface BookingConfig {
  /** "mock" uses the in-memory Open Dental (no keys needed); "opendental" calls the real API */
  mode: "mock" | "opendental";
  timeZone: string;
  /** Default visit length. Mây can still change each appointment's length in Open Dental afterwards. */
  visitMinutes: number;
  /** How often a start time is offered: 60 = on the hour */
  stepMinutes: number;
  /** How far ahead patients can book */
  bookingWeeks: number;
  provNum?: number;
  opNum?: number;
  clinicNum?: number;
  appointmentTypeNum?: number;
  opendental: { baseUrl: string; developerKey: string; customerKey: string; minIntervalMs: number; timeoutMs: number };
}

const int = (v: string | undefined, d?: number): number | undefined => {
  if (v === undefined || v.trim() === "") return d;
  const n = Number(v);
  if (!Number.isInteger(n)) throw new Error("Expected a whole number, got: " + v);
  return n;
};

export function loadBookingConfig(env: Record<string, string | undefined> = process.env): BookingConfig {
  const mode = env.BOOKING_MODE === "opendental" ? "opendental" : "mock";
  const cfg: BookingConfig = {
    mode,
    timeZone: env.CLINIC_TIMEZONE || "America/Chicago",
    visitMinutes: int(env.BOOKING_VISIT_MINUTES, 60)!,
    stepMinutes: int(env.BOOKING_STEP_MINUTES, 60)!,
    bookingWeeks: int(env.BOOKING_WEEKS, 8)!,
    provNum: int(env.OPENDENTAL_PROV_NUM),
    opNum: int(env.OPENDENTAL_OP_NUM),
    clinicNum: int(env.OPENDENTAL_CLINIC_NUM),
    appointmentTypeNum: int(env.OPENDENTAL_APPT_TYPE_NUM),
    opendental: {
      baseUrl: env.OPENDENTAL_BASE_URL || OPENDENTAL_REMOTE_URL,
      developerKey: env.OPENDENTAL_DEVELOPER_KEY || "",
      customerKey: env.OPENDENTAL_CUSTOMER_KEY || "",
      minIntervalMs: int(env.OPENDENTAL_MIN_INTERVAL_MS, 1000)!,
      timeoutMs: int(env.OPENDENTAL_TIMEOUT_MS, 15000)!
    }
  };
  checkConfig(cfg);
  return cfg;
}

export function checkConfig(cfg: BookingConfig): void {
  const problems: string[] = [];
  if (cfg.visitMinutes < 5 || cfg.visitMinutes > 540 || cfg.visitMinutes % 5) problems.push("BOOKING_VISIT_MINUTES must be 5–540 in steps of 5 (Open Dental patterns use 5-minute blocks)");
  if (cfg.stepMinutes < 5 || cfg.stepMinutes > 240 || cfg.stepMinutes % 5) problems.push("BOOKING_STEP_MINUTES must be 5–240 in steps of 5");
  if (cfg.bookingWeeks < 1 || cfg.bookingWeeks > 26) problems.push("BOOKING_WEEKS must be 1–26");
  try { new Intl.DateTimeFormat("en-US", { timeZone: cfg.timeZone }); } catch { problems.push("CLINIC_TIMEZONE is not a valid time zone: " + cfg.timeZone); }
  if (cfg.mode === "opendental") {
    if (!cfg.opendental.developerKey || !cfg.opendental.customerKey) problems.push("OPENDENTAL_DEVELOPER_KEY and OPENDENTAL_CUSTOMER_KEY are required");
    if (!cfg.provNum) problems.push("OPENDENTAL_PROV_NUM is required (the dentist's ProvNum)");
    if (!cfg.opNum) problems.push("OPENDENTAL_OP_NUM is required (the operatory online bookings go into)");
  }
  if (problems.length) throw new Error("Booking settings:\n- " + problems.join("\n- "));
}
