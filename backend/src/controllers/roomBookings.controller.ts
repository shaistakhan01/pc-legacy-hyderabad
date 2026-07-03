import { Request, Response } from "express";
import { supabaseAdmin } from "../config/supabaseClient.js";
import { checkRoomAvailability, generateReferenceNumber } from "../services/roomAvailability.service.js";

// GET /api/v1/room-bookings/availability?roomTypeId=&checkIn=&checkOut=
// Public — no auth required, just checking if dates are bookable.
export async function getAvailability(req: Request, res: Response) {
  const { roomTypeId, checkIn, checkOut } = req.query as {
    roomTypeId?: string;
    checkIn?: string;
    checkOut?: string;
  };

  if (!roomTypeId || !checkIn || !checkOut) {
    return res.status(400).json({
      success: false,
      message: "roomTypeId, checkIn, and checkOut are required query parameters.",
    });
  }

  try {
    const result = await checkRoomAvailability(roomTypeId, checkIn, checkOut);
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Availability check failed." });
  }
}

// POST /api/v1/room-bookings — requires auth (any logged-in user).
// Re-checks availability server-side (never trust a client-reported
// "it was available a minute ago") before writing anything.
export async function createBooking(req: Request, res: Response) {
  const { roomTypeId, checkIn, checkOut, numGuests, specialRequests } = req.body as {
    roomTypeId?: string;
    checkIn?: string;
    checkOut?: string;
    numGuests?: number;
    specialRequests?: string;
  };

  if (!roomTypeId || !checkIn || !checkOut || !numGuests) {
    return res.status(400).json({
      success: false,
      message: "roomTypeId, checkIn, checkOut, and numGuests are required.",
    });
  }

  let availability;
  try {
    availability = await checkRoomAvailability(roomTypeId, checkIn, checkOut);
  } catch (err) {
    return res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Availability check failed." });
  }

  if (!availability.available || !availability.roomId) {
    return res.status(409).json({ success: false, message: "This room is no longer available for the selected dates." });
  }

  const referenceNumber = generateReferenceNumber("RM");

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("bookings")
    .insert({
      user_id: req.user!.id,
      module_type: "room",
      reference_number: referenceNumber,
      status: "confirmed",
      total_amount: availability.totalAmount,
    })
    .select()
    .single();

  if (bookingError || !booking) {
    return res.status(500).json({ success: false, message: bookingError?.message ?? "Failed to create booking." });
  }

  const { data: roomBooking, error: roomBookingError } = await supabaseAdmin
    .from("room_bookings")
    .insert({
      booking_id: booking.id,
      room_id: availability.roomId,
      check_in: checkIn,
      check_out: checkOut,
      num_guests: numGuests,
      special_requests: specialRequests ?? null,
    })
    .select()
    .single();

  if (roomBookingError || !roomBooking) {
    // Roll back the parent booking row since the detail row failed —
    // supabase-js has no multi-table transaction API, so this manual
    // cleanup step keeps the ledger consistent.
    await supabaseAdmin.from("bookings").delete().eq("id", booking.id);
    return res.status(500).json({ success: false, message: roomBookingError?.message ?? "Failed to create room booking detail." });
  }

  res.status(201).json({ success: true, booking, roomBooking });
}