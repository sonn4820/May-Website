// HTTP endpoints for online booking, written with the web-standard Request/Response so the same code
// runs in an Astro API route (export const GET = ({ request }) => handlers.availability(request)) and in
// the prototype's dev server.
//
//   GET  /api/booking/availability  -> 200 Availability | 503 { error: "unavailable" }
//   POST /api/booking               -> 201 { ok, date, time, visitMinutes }
//                                      400 { error: "invalid", fields } | 409 { error: "slot_taken" | "busy" }
//                                      429 { error: "too_many" } | 503 { error: "unavailable" }
//
// Nothing here logs request bodies: they contain patient information.
import { BookingError } from "./service.ts";
import type { BookingService } from "./service.ts";

export interface HandlerOptions {
  /** Bookings allowed per client IP per window (stops a bot from filling the schedule) */
  maxBookings?: number;
  windowMs?: number;
  maxBodyBytes?: number;
  now?: () => number;
}

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

const STATUS: Record<string, number> = { invalid: 400, outside_window: 400, slot_taken: 409, busy: 409, unavailable: 503 };

export function createBookingHandlers(service: BookingService, opts: HandlerOptions = {}) {
  const maxBookings = opts.maxBookings ?? 5;
  const windowMs = opts.windowMs ?? 10 * 60_000;
  const maxBody = opts.maxBodyBytes ?? 10_000;
  const now = opts.now ?? Date.now;
  const hits = new Map<string, number[]>();

  function limited(ip: string): boolean {
    const t = now();
    const recent = (hits.get(ip) || []).filter((x) => t - x < windowMs);
    if (recent.length >= maxBookings) { hits.set(ip, recent); return true; }
    recent.push(t);
    hits.set(ip, recent);
    if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((x) => t - x < windowMs)) hits.delete(k);
    return false;
  }

  function fail(e: unknown): Response {
    if (e instanceof BookingError) return json(STATUS[e.code] ?? 500, e.fields ? { error: e.code, fields: e.fields } : { error: e.code });
    console.error("booking: unexpected error", e instanceof Error ? e.name : typeof e);
    return json(500, { error: "server" });
  }

  return {
    async availability(_req: Request): Promise<Response> {
      try { return json(200, await service.availability()); } catch (e) { return fail(e); }
    },

    async book(req: Request, clientIp = "unknown"): Promise<Response> {
      if (req.method !== "POST") return json(405, { error: "method" });
      if (!(req.headers.get("content-type") || "").includes("application/json")) return json(415, { error: "json_only" });
      const text = await req.text();
      if (text.length > maxBody) return json(413, { error: "too_large" });
      let body: unknown;
      try { body = JSON.parse(text); } catch { return json(400, { error: "invalid", fields: { form: "err_form" } }); }
      if (limited(clientIp)) return json(429, { error: "too_many" });
      try {
        const r = await service.book(body);
        return json(201, { ok: true, date: r.date, time: r.time, visitMinutes: r.visitMinutes });
      } catch (e) { return fail(e); }
    }
  };
}
