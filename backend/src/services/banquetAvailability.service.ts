import { supabaseAdmin } from "../config/supabaseClient.js";

export interface HallAvailabilityResult {
  available: boolean;
  reason?: string;
  basePrice: number;
}

// Each event_halls row is one specific physical space — availability is
// a direct conflict check against that hall's own bookings, unlike the
// room module's "find any matching physical room" logic.
export async function checkHallAvailability(
  hallId: string,
  eventDate: string,
  startTime: string,
  endTime: string,
  guestCount: number
): Promise<HallAvailabilityResult> {
  const { data: hall, error: hallError } = await supabaseAdmin
    .from("event_halls")
    .select("base_price, capacity_min, capacity_max")
    .eq("id", hallId)
    .single();

  if (hallError || !hall) {
    throw new Error("Event hall not found.");
  }

  const basePrice = Number(hall.base_price);

  if (hall.capacity_min && guestCount < hall.capacity_min) {
    return { available: false, reason: `This hall requires a minimum of ${hall.capacity_min} guests.`, basePrice };
  }
  if (hall.capacity_max && guestCount > hall.capacity_max) {
    return { available: false, reason: `This hall accommodates a maximum of ${hall.capacity_max} guests.`, basePrice };
  }

  const { data: sameDayBookings, error: bookingsError } = await supabaseAdmin
    .from("banquet_bookings")
    .select("start_time, end_time, bookings!inner(status)")
    .eq("hall_id", hallId)
    .eq("event_date", eventDate)
    .neq("bookings.status", "cancelled");

  if (bookingsError) {
    throw new Error(bookingsError.message);
  }

  const hasConflict = (sameDayBookings ?? []).some(
    (b) => startTime < b.end_time && endTime > b.start_time
  );

  if (hasConflict) {
    return { available: false, reason: "This hall is already booked for an overlapping time on this date.", basePrice };
  }

  return { available: true, basePrice };
}

export function calculateAddOnsCost(
  addOns: { price: number; category: string | null }[],
  guestCount: number
): number {
  return addOns.reduce((sum, addon) => {
    const cost = addon.category === "catering" ? addon.price * guestCount : addon.price;
    return sum + cost;
  }, 0);
}