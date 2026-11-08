// Checks the booking form on the server. The browser checks too, but the server never trusts it.
import { HHMM, isRealDate } from "./time.ts";

export type Lang = "en" | "vi" | "es";

export interface BookingInput {
  date: string;        // yyyy-MM-dd
  time: string;        // HH:mm
  firstName: string;
  lastName: string;
  birthdate: string;   // yyyy-MM-dd
  phone: string;
  email: string;       // "" when not given
  newPatient: boolean;
  reason: string;      // "" when not given
  lang: Lang;
}

/** Field name -> error code. The browser maps codes to text in the patient's language. */
export type FieldErrors = Partial<Record<keyof BookingInput | "form", string>>;

const str = (v: unknown): string => (typeof v === "string" ? v.trim().replace(/\s+/g, " ") : "");

export function validateBooking(raw: unknown, today: string): { ok: true; value: BookingInput } | { ok: false; fields: FieldErrors } {
  const b = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const fields: FieldErrors = {};
  // Honeypot: a hidden field people never see. Bots fill it in.
  if (str(b.website)) return { ok: false, fields: { form: "rejected" } };

  const value: BookingInput = {
    date: str(b.date),
    time: str(b.time),
    firstName: str(b.firstName),
    lastName: str(b.lastName),
    birthdate: str(b.birthdate),
    phone: str(b.phone),
    email: str(b.email),
    newPatient: b.newPatient === true,
    reason: typeof b.reason === "string" ? b.reason.trim().slice(0, 500) : "",
    lang: (["en", "vi", "es"] as const).find((l) => l === b.lang) ?? "en"
  };
  if (!isRealDate(value.date)) fields.date = "err_slot";
  if (!HHMM.test(value.time)) fields.time = "err_slot";
  if (!value.firstName || value.firstName.length > 60) fields.firstName = "err_first";
  if (!value.lastName || value.lastName.length > 60) fields.lastName = "err_last";
  if (!isRealDate(value.birthdate) || value.birthdate < "1900-01-01" || value.birthdate > today) fields.birthdate = "err_dob";
  const digits = value.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 15 || value.phone.length > 25) fields.phone = "err_phone";
  if (value.email && (value.email.length > 120 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email))) fields.email = "err_email";
  if (typeof b.newPatient !== "boolean") fields.newPatient = "err_choose";
  return Object.keys(fields).length ? { ok: false, fields } : { ok: true, value };
}
