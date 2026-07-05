import { Request, Response } from "express";
import { checkTableAvailability } from "../services/restaurantAvailability.service.js";
import { supabaseAdmin } from "../config/supabaseClient.js";
import { generateReferenceNumber } from "../services/roomAvailability.service.js";

// GET /api/v1/restaurant-reservations/availability?date=&time=&partySize=
// Public — no auth required.
export async function getAvailability(req: Request, res: Response) {
  const { date, time, partySize } = req.query as {
    date?: string;
    time?: string;
    partySize?: string;
  };

  if (!date || !time || !partySize) {
    return res.status(400).json({
      success: false,
      message: "date, time, and partySize are required query parameters.",
    });
  }

  try {
    const result = await checkTableAvailability(date, time, Number(partySize));
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Availability check failed." });
  }
}

// POST /api/v1/restaurant-reservations — requires auth (any logged-in user).
export async function createReservation(req: Request, res: Response) {
  const { reservationDate, reservationTime, partySize, specialRequests } = req.body as {
    reservationDate?: string;
    reservationTime?: string;
    partySize?: number;
    specialRequests?: string;
  };

  if (!reservationDate || !reservationTime || !partySize) {
    return res.status(400).json({
      success: false,
      message: "reservationDate, reservationTime, and partySize are required.",
    });
  }

  let availability;
  try {
    availability = await checkTableAvailability(reservationDate, reservationTime, partySize);
  } catch (err) {
    return res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Availability check failed." });
  }

  if (!availability.available || !availability.tableId) {
    return res.status(409).json({ success: false, message: "No tables available for this date and time." });
  }

  const referenceNumber = generateReferenceNumber("RS");

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("bookings")
    .insert({
      user_id: req.user!.id,
      module_type: "restaurant",
      reference_number: referenceNumber,
      status: "confirmed",
      total_amount: 0, // Billing happens at the restaurant — see phase design note.
    })
    .select()
    .single();

  if (bookingError || !booking) {
    return res.status(500).json({ success: false, message: bookingError?.message ?? "Failed to create booking." });
  }

  const { data: reservation, error: reservationError } = await supabaseAdmin
    .from("restaurant_reservations")
    .insert({
      booking_id: booking.id,
      table_id: availability.tableId,
      reservation_date: reservationDate,
      reservation_time: reservationTime,
      party_size: partySize,
      status: "confirmed",
    })
    .select()
    .single();

  if (reservationError || !reservation) {
    await supabaseAdmin.from("bookings").delete().eq("id", booking.id);
    return res.status(500).json({ success: false, message: reservationError?.message ?? "Failed to create reservation." });
  }

  res.status(201).json({ success: true, booking, reservation });
}