import { Request, Response } from "express";
import { supabaseAdmin } from "../config/supabaseClient.js";
import { checkRoomAvailability, generateReferenceNumber } from "../services/roomAvailability.service.js";
import { verifyPayment } from "../services/paymentVerification.service.js";

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
  const {
    roomTypeId,
    checkIn,
    checkOut,
    numGuests,
    specialRequests,
    paymentIntentId,
  } = req.body as {
    roomTypeId?: string;
    checkIn?: string;
    checkOut?: string;
    numGuests?: number;
    specialRequests?: string;
    paymentIntentId?: string;
  };

  if (!roomTypeId || !checkIn || !checkOut || !numGuests) {
    return res.status(400).json({
      success: false,
      message: "roomTypeId, checkIn, checkOut, and numGuests are required.",
    });
  }

  if (!paymentIntentId) {
    return res.status(400).json({
      success: false,
      message: "Payment is required to complete this booking.",
    });
  }

  let availability;
  try {
    availability = await checkRoomAvailability(roomTypeId, checkIn, checkOut);
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : "Availability check failed.",
    });
  }

  if (!availability.available || !availability.roomId) {
    return res.status(409).json({
      success: false,
      message: "This room is no longer available for the selected dates.",
    });
  }

  const paymentCheck = await verifyPayment(paymentIntentId, availability.totalAmount);
  if (!paymentCheck.isValid) {
    return res.status(400).json({
      success: false,
      message: paymentCheck.reason ?? "Payment verification failed.",
    });
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
    return res.status(500).json({
      success: false,
      message: bookingError?.message ?? "Failed to create booking.",
    });
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
    await supabaseAdmin.from("bookings").delete().eq("id", booking.id);
    return res.status(500).json({
      success: false,
      message: roomBookingError?.message ?? "Failed to create room booking detail.",
    });
  }

  await supabaseAdmin.from("payment_transactions").insert({
    booking_id: booking.id,
    gateway_reference: paymentIntentId,
    status: "success",
    amount: availability.totalAmount,
    method: "stripe",
  });

  res.status(201).json({ success: true, booking, roomBooking });
}
// POST /api/v1/room-bookings/staff-assisted — staff/admin only.
// Creates a booking on behalf of a guest with no account. Payment is
// assumed collected in person (front desk) rather than via Stripe.
export async function createStaffAssistedBooking(req: Request, res: Response) {
  const { guestId, roomTypeId, checkIn, checkOut, numGuests, specialRequests } = req.body as {
    guestId?: string;
    roomTypeId?: string;
    checkIn?: string;
    checkOut?: string;
    numGuests?: number;
    specialRequests?: string;
  };

  if (!guestId || !roomTypeId || !checkIn || !checkOut || !numGuests) {
    return res.status(400).json({
      success: false,
      message: "guestId, roomTypeId, checkIn, checkOut, and numGuests are required.",
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
      guest_id: guestId,
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
    await supabaseAdmin.from("bookings").delete().eq("id", booking.id);
    return res.status(500).json({ success: false, message: roomBookingError?.message ?? "Failed to create room booking detail." });
  }

  await supabaseAdmin.from("payment_transactions").insert({
    booking_id: booking.id,
    gateway_reference: `staff-${req.user!.id}`,
    status: "success",
    amount: availability.totalAmount,
    method: "front_desk",
  });

  res.status(201).json({ success: true, booking, roomBooking });
}