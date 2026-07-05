import { supabaseAdmin } from "../config/supabaseClient.js";

export interface AvailabilityResult {
  available: boolean;
  roomId: string | null;
  nights: number;
  pricePerNight: number;
  totalAmount: number;
}

// Finds a physical room of the given type with no overlapping,
// non-cancelled booking for the requested date range. Uses the
// service-role client since room_bookings is RLS-restricted to owner/
// staff — this check must run for anonymous browsers too.
export async function checkRoomAvailability(
  roomTypeId: string,
  checkIn: string,
  checkOut: string
): Promise<AvailabilityResult> {
  const { data: roomType, error: roomTypeError } = await supabaseAdmin
    .from("room_types")
    .select("base_price")
    .eq("id", roomTypeId)
    .single();

  if (roomTypeError || !roomType) {
    throw new Error("Room type not found.");
  }

  const nights = Math.round(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
  );

  if (nights <= 0) {
    throw new Error("Check-out date must be after check-in date.");
  }

  const pricePerNight = Number(roomType.base_price);
  const totalAmount = pricePerNight * nights;

  const { data: candidateRooms, error: roomsError } = await supabaseAdmin
    .from("rooms")
    .select("id")
    .eq("room_type_id", roomTypeId)
    .eq("status", "available");

  if (roomsError || !candidateRooms || candidateRooms.length === 0) {
    return { available: false, roomId: null, nights, pricePerNight, totalAmount };
  }

  const candidateIds = candidateRooms.map((r) => r.id);

  // Overlap condition: existing.check_in < new.check_out AND existing.check_out > new.check_in
  const { data: conflicts, error: conflictsError } = await supabaseAdmin
    .from("room_bookings")
    .select("room_id, bookings!inner(status)")
    .in("room_id", candidateIds)
    .lt("check_in", checkOut)
    .gt("check_out", checkIn)
    .neq("bookings.status", "cancelled");

  if (conflictsError) {
    throw new Error(conflictsError.message);
  }

  const bookedRoomIds = new Set((conflicts ?? []).map((c) => c.room_id));
  const availableRoomId = candidateIds.find((id) => !bookedRoomIds.has(id)) ?? null;

  return {
    available: availableRoomId !== null,
    roomId: availableRoomId,
    nights,
    pricePerNight,
    totalAmount,
  };
}

export function generateReferenceNumber(prefix: string): string {
  const timestampPart = Date.now().toString(36).toUpperCase();
  const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${timestampPart}-${randomPart}`;
}