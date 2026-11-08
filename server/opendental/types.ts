// Shapes used by the Open Dental REST API (https://www.opendental.com/site/apispecification.html).
// Field names match Open Dental exactly. Dates are "yyyy-MM-dd", date-times "yyyy-MM-dd HH:mm:ss",
// both in the office's local time.

/** One open stretch of time on a provider's schedule (GET /appointments/Slots). */
export interface OdSlot {
  DateTimeStart: string;
  DateTimeEnd: string;
  ProvNum: number;
  OpNum: number;
}

export interface OdSlotQuery {
  dateStart: string;
  dateEnd: string;
  lengthMinutes?: number;
  ProvNum?: number;
  OpNum?: number;
}

/** Fields returned by GET /patients/Simple that the website uses. */
export interface OdPatient {
  PatNum: number;
  LName: string;
  FName: string;
  Birthdate: string;
}

export interface OdPatientQuery {
  LName: string;
  FName: string;
  Birthdate: string;
}

/** POST /patients. Only LName and FName are required by Open Dental. */
export interface OdPatientCreate {
  LName: string;
  FName: string;
  Birthdate?: string;
  WirelessPhone?: string;
  Email?: string;
  PreferContactMethod?: string;
  PriProv?: number;
  ClinicNum?: number;
}

/** POST /appointments. Required: PatNum, Op, AptDateTime. */
export interface OdAppointmentCreate {
  PatNum: number;
  Op: number;
  AptDateTime: string;
  ProvNum?: number;
  Pattern?: string;
  Note?: string;
  IsNewPatient?: "true" | "false";
  AppointmentTypeNum?: number;
  ClinicNum?: number;
}

export interface OdAppointment {
  AptNum: number;
  PatNum: number;
  Op: number;
  ProvNum: number;
  AptDateTime: string;
  Pattern: string;
  AptStatus: string;
}

/** What the booking service needs from Open Dental. The real client and the mock both implement it. */
export interface OpenDentalApi {
  getSlots(q: OdSlotQuery): Promise<OdSlot[]>;
  findPatients(q: OdPatientQuery): Promise<OdPatient[]>;
  createPatient(p: OdPatientCreate): Promise<OdPatient>;
  createAppointment(a: OdAppointmentCreate): Promise<OdAppointment>;
}

/** A failed call to Open Dental. `detail` is Open Dental's explanation; never send it to the browser or logs (it can contain patient data). */
export class OpenDentalError extends Error {
  status: number;
  detail: string;
  constructor(status: number, message: string, detail = "") {
    super(message);
    this.name = "OpenDentalError";
    this.status = status;
    this.detail = detail;
  }
}
