import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../config/supabaseClient.js", () => ({
  supabaseAdmin: {
    from: vi.fn(),
  },
}));

import { supabaseAdmin } from "../../config/supabaseClient.js";
import { checkCancellationPolicy } from "../cancellationPolicy.service.js";

function mockSingleResult(data: unknown) {
  const single = vi.fn().mockResolvedValue({ data, error: null });
  const eq = vi.fn().mockReturnValue({ single });
  const select = vi.fn().mockReturnValue({ eq });
  (supabaseAdmin.from as ReturnType<typeof vi.fn>).mockReturnValue({ select });
}

describe("checkCancellationPolicy — room bookings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("allows cancellation when check-in is in the future", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 5);
    mockSingleResult({ check_in: futureDate.toISOString().slice(0, 10) });

    const result = await checkCancellationPolicy("room", "booking-1");
    expect(result.allowed).toBe(true);
  });

  it("blocks cancellation when check-in is today or in the past", async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    mockSingleResult({ check_in: pastDate.toISOString().slice(0, 10) });

    const result = await checkCancellationPolicy("room", "booking-1");
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("check-in date");
  });
});

describe("checkCancellationPolicy — banquet bookings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks cancellation within 7 days of the event", async () => {
    const soonDate = new Date();
    soonDate.setDate(soonDate.getDate() + 3);
    mockSingleResult({ event_date: soonDate.toISOString().slice(0, 10) });

    const result = await checkCancellationPolicy("banquet", "booking-2");
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("7 days");
  });

  it("allows cancellation more than 7 days before the event", async () => {
    const farDate = new Date();
    farDate.setDate(farDate.getDate() + 30);
    mockSingleResult({ event_date: farDate.toISOString().slice(0, 10) });

    const result = await checkCancellationPolicy("banquet", "booking-2");
    expect(result.allowed).toBe(true);
  });
});