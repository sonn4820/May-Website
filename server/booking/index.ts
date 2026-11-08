// Wires booking together from environment variables.
// BOOKING_MODE=opendental uses the real Open Dental API; anything else uses the in-memory mock.
import { OpenDentalClient } from "../opendental/client.ts";
import { MockOpenDental } from "../opendental/mock.ts";
import type { OpenDentalApi } from "../opendental/types.ts";
import { loadBookingConfig } from "./config.ts";
import { createBookingHandlers } from "./http.ts";
import type { HandlerOptions } from "./http.ts";
import { BookingService } from "./service.ts";
import type { BookingServiceOptions } from "./service.ts";

export function createBookingFromEnv(env: Record<string, string | undefined> = process.env, opts: BookingServiceOptions & HandlerOptions = {}) {
  const cfg = loadBookingConfig(env);
  if (cfg.mode === "mock") { cfg.provNum ??= 1; cfg.opNum ??= 1; }
  const api: OpenDentalApi = cfg.mode === "opendental"
    ? new OpenDentalClient({ ...cfg.opendental })
    : new MockOpenDental({ provNum: cfg.provNum, opNum: cfg.opNum });
  const service = new BookingService(api, cfg, opts);
  return { cfg, api, service, handlers: createBookingHandlers(service, opts) };
}

export { BookingService, BookingError, slotsToStartTimes } from "./service.ts";
export { createBookingHandlers } from "./http.ts";
export { loadBookingConfig } from "./config.ts";
