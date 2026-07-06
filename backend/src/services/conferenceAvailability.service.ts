import { supabaseAdmin } from "../config/supabaseClient.js";

export interface ConferenceAvailabilityResult {
  available: boolean;
  reason?: string;
  hourlyRate: number;
  hours: number;
  totalAmount: number;
}

// Same direct hall-style conflict check as the banquet module (Phase 6.2)
// — each conference_rooms row is one specific physical space.
export async function checkConferenceAvailability(
  roomId: string,
  date: string,
  startTime: string,
  endTime: string,
  attendeeCount: number
): Promise<ConferenceAvailabilityResult> {
  const { data: room, error: roomError } = await supabaseAdmin
    .from("conference_rooms")
    .select("hourly_rate, capacity")
    .eq("id", roomId)
    .single();

  if (roomError || !room) {
    throw new Error("Conference room not found.");
  }

  const hourlyRate = Number(room.hourly_rate);

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const hours = (endMinutes - startMinutes) / 60;

  if (hours <= 0) {
    throw new Error("End time must be after start time.");
  }

  if (room.capacity && attendeeCount > room.capacity) {
    return {
      available: false,
      reason: `This room seats a maximum of ${room.capacity} people.`,
      hourlyRate,
      hours,
      totalAmount: hourlyRate * hours,
    };
  }

  const { data: sameDayBookings, error: bookingsError } = await supabaseAdmin
    .from("conference_bookings")
    .select("start_time, end_time, bookings!inner(status)")
    .eq("room_id", roomId)
    .eq("date", date)
    .neq("bookings.status", "cancelled");

  if (bookingsError) {
    throw new Error(bookingsError.message);
  }

  const hasConflict = (sameDayBookings ?? []).some(
    (b) => startTime < b.end_time && endTime > b.start_time
  );

  if (hasConflict) {
    return {
      available: false,
      reason: "This room is already booked for an overlapping time on this date.",
      hourlyRate,
      hours,
      totalAmount: hourlyRate * hours,
    };
  }

  return { available: true, hourlyRate, hours, totalAmount: hourlyRate * hours };
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}