import { Request, Response } from "express";
import { supabaseAdmin } from "../config/supabaseClient.js";
import { checkConferenceAvailability } from "../services/conferenceAvailability.service.js";
import { generateReferenceNumber } from "../services/roomAvailability.service.js";
import { verifyPayment } from "../services/paymentVerification.service.js";
import { sendConferenceConfirmation } from "../services/emailTemplates.service.js";

// GET /api/v1/conference-bookings/availability
// Public — no auth required.
export async function getAvailability(req: Request, res: Response) {
  const { roomId, date, startTime, endTime, attendeeCount } = req.query as {
    roomId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    attendeeCount?: string;
  };

  if (!roomId || !date || !startTime || !endTime || !attendeeCount) {
    return res.status(400).json({
      success: false,
      message: "roomId, date, startTime, endTime, and attendeeCount are required.",
    });
  }

  try {
    const result = await checkConferenceAvailability(
      roomId,
      date,
      startTime,
      endTime,
      Number(attendeeCount)
    );
    res.json({ success: true, ...result });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err instanceof Error ? err.message : "Availability check failed.",
    });
  }
}

// POST /api/v1/conference-bookings — requires auth (any logged-in user).
export async function createBooking(req: Request, res: Response) {
  const { roomId, date, startTime, endTime, purpose, attendeeCount, cateringRequired, paymentIntentId } = req.body as {
    roomId?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    purpose?: string;
    attendeeCount?: number;
    cateringRequired?: boolean;
    paymentIntentId?: string;
  };

  if (!roomId || !date || !startTime || !endTime || !attendeeCount) {
    return res.status(400).json({
      success: false,
      message: "roomId, date, startTime, endTime, and attendeeCount are required.",
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
    availability = await checkConferenceAvailability(roomId, date, startTime, endTime, attendeeCount);
  } catch (err) {
    return res.status(400).json({ success: false, message: err instanceof Error ? err.message : "Availability check failed." });
  }

  if (!availability.available) {
    return res.status(409).json({ success: false, message: availability.reason ?? "This room is not available." });
  }

  const paymentCheck = await verifyPayment(paymentIntentId, availability.totalAmount);
  if (!paymentCheck.isValid) {
    return res.status(400).json({ success: false, message: paymentCheck.reason ?? "Payment verification failed." });
  }

  const referenceNumber = generateReferenceNumber("CF");

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("bookings")
    .insert({
      user_id: req.user!.id,
      module_type: "conference",
      reference_number: referenceNumber,
      status: "confirmed",
      total_amount: availability.totalAmount,
    })
    .select()
    .single();

  if (bookingError || !booking) {
    return res.status(500).json({ success: false, message: bookingError?.message ?? "Failed to create booking." });
  }

  const { data: conferenceBooking, error: conferenceBookingError } = await supabaseAdmin
    .from("conference_bookings")
    .insert({
      booking_id: booking.id,
      room_id: roomId,
      date,
      start_time: startTime,
      end_time: endTime,
      purpose: purpose ?? null,
      attendee_count: attendeeCount,
      catering_required: cateringRequired ?? false,
    })
    .select()
    .single();

  if (conferenceBookingError || !conferenceBooking) {
    await supabaseAdmin.from("bookings").delete().eq("id", booking.id);
    return res.status(500).json({ success: false, message: conferenceBookingError?.message ?? "Failed to create conference booking." });
  }

  await supabaseAdmin.from("payment_transactions").insert({
    booking_id: booking.id,
    gateway_reference: paymentIntentId,
    status: "success",
    amount: availability.totalAmount,
    method: "stripe",
  });

  // Fire-and-forget confirmation email
  const { data: userData } = await supabaseAdmin.auth.admin.getUserById(req.user!.id);
  if (userData.user?.email) {
    const { data: roomData } = await supabaseAdmin
      .from("conference_rooms")
      .select("name")
      .eq("id", roomId)
      .single();

    sendConferenceConfirmation(userData.user.email, {
      guestName: userData.user.user_metadata?.full_name ?? "Guest",
      referenceNumber: booking.reference_number,
      roomName: roomData?.name ?? "Conference Room",
      date: conferenceBooking.date,
      startTime: conferenceBooking.start_time,
      endTime: conferenceBooking.end_time,
      attendeeCount: conferenceBooking.attendee_count,
      totalAmount: booking.total_amount,
    });
  }
  
  res.status(201).json({ success: true, booking, conferenceBooking });
}