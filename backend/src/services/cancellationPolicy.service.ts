import { supabaseAdmin } from "../config/supabaseClient.js";

export interface PolicyResult {
  allowed: boolean;
  reason?: string;
}

// Each module has a different "how close to the event can you still
// cancel" rule, matching realistic hospitality business practice.
export async function checkCancellationPolicy(
  moduleType: string,
  bookingId: string
): Promise<PolicyResult> {
  const now = new Date();

  if (moduleType === "room") {
    const { data } = await supabaseAdmin
      .from("room_bookings")
      .select("check_in")
      .eq("booking_id", bookingId)
      .single();

    if (!data) return { allowed: false, reason: "Booking detail not found." };

    const checkIn = new Date(data.check_in);
    if (checkIn <= now) {
      return { allowed: false, reason: "Cannot cancel a room booking on or after the check-in date." };
    }
    return { allowed: true };
  }

  if (moduleType === "restaurant") {
    const { data } = await supabaseAdmin
      .from("restaurant_reservations")
      .select("reservation_date, reservation_time")
      .eq("booking_id", bookingId)
      .single();

    if (!data) return { allowed: false, reason: "Booking detail not found." };

    const reservationDateTime = new Date(`${data.reservation_date}T${data.reservation_time}`);
    if (reservationDateTime <= now) {
      return { allowed: false, reason: "Cannot cancel a reservation that has already passed." };
    }
    return { allowed: true };
  }

  if (moduleType === "banquet") {
    const { data } = await supabaseAdmin
      .from("banquet_bookings")
      .select("event_date")
      .eq("booking_id", bookingId)
      .single();

    if (!data) return { allowed: false, reason: "Booking detail not found." };

    const eventDate = new Date(data.event_date);
    const sevenDaysBefore = new Date(eventDate);
    sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);

    if (now >= sevenDaysBefore) {
      return { allowed: false, reason: "Banquet bookings cannot be cancelled within 7 days of the event date." };
    }
    return { allowed: true };
  }

  if (moduleType === "conference") {
    const { data } = await supabaseAdmin
      .from("conference_bookings")
      .select("date, start_time")
      .eq("booking_id", bookingId)
      .single();

    if (!data) return { allowed: false, reason: "Booking detail not found." };

    const bookingDateTime = new Date(`${data.date}T${data.start_time}`);
    const twentyFourHoursBefore = new Date(bookingDateTime);
    twentyFourHoursBefore.setHours(twentyFourHoursBefore.getHours() - 24);

    if (now >= twentyFourHoursBefore) {
      return { allowed: false, reason: "Conference room bookings cannot be cancelled within 24 hours of the start time." };
    }
    return { allowed: true };
  }

  return { allowed: false, reason: "Unknown module type." };
}