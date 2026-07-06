import { Request, Response } from "express";
import { supabaseAdmin } from "../config/supabaseClient.js";
import {
  checkHallAvailability,
  calculateAddOnsCost,
} from "../services/banquetAvailability.service.js";
import { generateReferenceNumber } from "../services/roomAvailability.service.js";

// GET /api/v1/banquet-bookings/availability
// Public — no auth required.
export async function getAvailability(req: Request, res: Response) {
  const { hallId, eventDate, startTime, endTime, guestCount } = req.query as {
    hallId?: string;
    eventDate?: string;
    startTime?: string;
    endTime?: string;
    guestCount?: string;
  };

  if (!hallId || !eventDate || !startTime || !endTime || !guestCount) {
    return res.status(400).json({
      success: false,
      message: "hallId, eventDate, startTime, endTime, and guestCount are required.",
    });
  }

  try {
    const result = await checkHallAvailability(
      hallId,
      eventDate,
      startTime,
      endTime,
      Number(guestCount)
    );
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : "Availability check failed.",
    });
  }
}

// GET /api/v1/banquet-bookings/add-ons
// Public — used to populate the booking form's add-on checkboxes with live pricing.
export async function listAddOns(_req: Request, res: Response) {
  const { data, error } = await supabaseAdmin
    .from("hall_add_ons")
    .select("*")
    .order("category");

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  res.json({ success: true, addOns: data });
}

// POST /api/v1/banquet-bookings — requires auth (any logged-in user).
export async function createBooking(req: Request, res: Response) {
  const { hallId, eventDate, startTime, endTime, eventType, guestCount, addOnIds } =
    req.body as {
      hallId?: string;
      eventDate?: string;
      startTime?: string;
      endTime?: string;
      eventType?: string;
      guestCount?: number;
      addOnIds?: string[];
    };

  if (!hallId || !eventDate || !startTime || !endTime || !guestCount) {
    return res.status(400).json({
      success: false,
      message: "hallId, eventDate, startTime, endTime, and guestCount are required.",
    });
  }

  // Re-validate availability server-side — never trust the client's check.
  let availability;
  try {
    availability = await checkHallAvailability(
      hallId,
      eventDate,
      startTime,
      endTime,
      guestCount
    );
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : "Availability check failed.",
    });
  }

  if (!availability.available) {
    return res.status(409).json({
      success: false,
      message: availability.reason ?? "This hall is not available.",
    });
  }

  // Recalculate add-ons cost server-side — never trust a client-submitted total.
  let addOnsCost = 0;
  const validAddOnIds = addOnIds ?? [];

  if (validAddOnIds.length > 0) {
    const { data: selectedAddOns, error: addOnsError } = await supabaseAdmin
      .from("hall_add_ons")
      .select("id, price, category")
      .in("id", validAddOnIds);

    if (addOnsError) {
      return res.status(500).json({ success: false, message: addOnsError.message });
    }

    addOnsCost = calculateAddOnsCost(selectedAddOns ?? [], guestCount);
  }

  const totalAmount = availability.basePrice + addOnsCost;
  const referenceNumber = generateReferenceNumber("BQ");

  // Create the parent bookings row first.
  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("bookings")
    .insert({
      user_id: req.user!.id,
      module_type: "banquet",
      reference_number: referenceNumber,
      status: "confirmed",
      total_amount: totalAmount,
    })
    .select()
    .single();

  if (bookingError || !booking) {
    return res.status(500).json({
      success: false,
      message: bookingError?.message ?? "Failed to create booking.",
    });
  }

  // Create the banquet_bookings detail row.
  const { data: banquetBooking, error: banquetBookingError } = await supabaseAdmin
    .from("banquet_bookings")
    .insert({
      booking_id: booking.id,
      hall_id: hallId,
      event_date: eventDate,
      start_time: startTime,
      end_time: endTime,
      event_type: eventType ?? null,
      guest_count: guestCount,
      add_on_ids: validAddOnIds,
    })
    .select()
    .single();

  if (banquetBookingError || !banquetBooking) {
    // Roll back the parent booking row to avoid orphaned records.
    await supabaseAdmin.from("bookings").delete().eq("id", booking.id);
    return res.status(500).json({
      success: false,
      message: banquetBookingError?.message ?? "Failed to create banquet booking.",
    });
  }

  res.status(201).json({ success: true, booking, banquetBooking });
}