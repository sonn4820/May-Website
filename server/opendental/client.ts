// Open Dental REST API client (Remote mode by default: https://api.opendental.com/api/v1/).
// Requests go from Open Dental HQ to the office through the eConnector, so the office server must be on.
// Auth header: "Authorization: ODFHIR {DeveloperKey}/{CustomerKey}" (https://www.opendental.com/site/apisetup.html).
import { OpenDentalError } from "./types.ts";
import type { OdAppointment, OdAppointmentCreate, OdPatient, OdPatientCreate, OdPatientQuery, OdSlot, OdSlotQuery, OpenDentalApi } from "./types.ts";

export interface OpenDentalClientOptions {
  baseUrl?: string;
  developerKey: string;
  customerKey: string;
  /** Minimum gap between requests. Open Dental throttles per key (the free tier allows 1 request / 5 s). */
  minIntervalMs?: number;
  timeoutMs?: number;
  fetch?: typeof fetch;
}

export const OPENDENTAL_REMOTE_URL = "https://api.opendental.com/api/v1/";

export class OpenDentalClient implements OpenDentalApi {
  private baseUrl: string;
  private auth: string;
  private minIntervalMs: number;
  private timeoutMs: number;
  private fetchFn: typeof fetch;
  private queue: Promise<unknown> = Promise.resolve();
  private lastAt = 0;

  constructor(opts: OpenDentalClientOptions) {
    if (!opts.developerKey || !opts.customerKey) throw new Error("Open Dental developer key and customer key are required");
    this.baseUrl = (opts.baseUrl || OPENDENTAL_REMOTE_URL).replace(/\/?$/, "/");
    this.auth = "ODFHIR " + opts.developerKey + "/" + opts.customerKey;
    this.minIntervalMs = opts.minIntervalMs ?? 1000;
    this.timeoutMs = opts.timeoutMs ?? 15000;
    this.fetchFn = opts.fetch ?? fetch;
  }

  getSlots(q: OdSlotQuery): Promise<OdSlot[]> {
    return this.request("GET", "appointments/Slots", { dateStart: q.dateStart, dateEnd: q.dateEnd, lengthMinutes: q.lengthMinutes, ProvNum: q.ProvNum, OpNum: q.OpNum });
  }

  findPatients(q: OdPatientQuery): Promise<OdPatient[]> {
    return this.request("GET", "patients/Simple", { LName: q.LName, FName: q.FName, Birthdate: q.Birthdate });
  }

  createPatient(p: OdPatientCreate): Promise<OdPatient> {
    return this.request("POST", "patients", undefined, p);
  }

  createAppointment(a: OdAppointmentCreate): Promise<OdAppointment> {
    return this.request("POST", "appointments", undefined, a);
  }

  // One request at a time, spaced by minIntervalMs, so a busy day never trips Open Dental's throttle.
  private request<T>(method: "GET" | "POST", path: string, query?: Record<string, string | number | undefined>, body?: unknown): Promise<T> {
    const run = async (): Promise<T> => {
      const wait = this.lastAt + this.minIntervalMs - Date.now();
      if (wait > 0) await new Promise((r) => setTimeout(r, wait));
      this.lastAt = Date.now();
      const url = new URL(path, this.baseUrl);
      for (const [k, v] of Object.entries(query || {})) if (v !== undefined && v !== "") url.searchParams.set(k, String(v));
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), this.timeoutMs);
      let res: Response;
      try {
        res = await this.fetchFn(url, {
          method,
          headers: { Authorization: this.auth, "Content-Type": "application/json", Accept: "application/json" },
          body: body === undefined ? undefined : JSON.stringify(body),
          signal: ctrl.signal
        });
      } catch (e) {
        throw new OpenDentalError(0, ctrl.signal.aborted ? "Open Dental did not answer in time" : "Could not reach Open Dental");
      } finally {
        clearTimeout(timer);
      }
      const text = await res.text();
      if (!res.ok) throw new OpenDentalError(res.status, "Open Dental returned " + res.status, text.slice(0, 500));
      try { return (text ? JSON.parse(text) : null) as T; } catch { throw new OpenDentalError(res.status, "Open Dental sent a response that is not JSON"); }
    };
    const p = this.queue.then(run, run);
    this.queue = p.catch(() => undefined);
    return p;
  }
}
