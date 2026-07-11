import { Request, Response } from "express";
import { supabaseAdmin } from "../config/supabaseClient.js";
import { stripe } from "../config/stripe.js";
import { checkCancellationPolicy } from "../services/cancellationPolicy.service.js";
import { generateInvoicePdf } from "../services/invoice.service.js";



// POST /api/v1/bookings/:bookingId/cancel — owner or staff/admin.
export async function cancelBooking(req: Request, res: Response) {
  const { bookingId } = req.params;
  const { reason } = req.body as { reason?: string };

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) {
    return res.status(404).json({ success: false, message: "Booking not found." });
  }

  const isOwner = booking.user_id === req.user!.id;
  const isStaff = ["staff", "admin", "super_admin"].includes(req.user!.role);

  if (!isOwner && !isStaff) {
    return res.status(403).json({ success: false, message: "You do not have permission to cancel this booking." });
  }

  if (booking.status === "cancelled") {
    return res.status(400).json({ success: false, message: "This booking is already cancelled." });
  }
  if (booking.status === "completed") {
    return res.status(400).json({ success: false, message: "Completed bookings cannot be cancelled." });
  }

  // Staff/admin can override the policy (e.g., goodwill cancellation);
  // customers cancelling their own booking must pass the policy check.
  if (isOwner && !isStaff) {
    const policyResult = await checkCancellationPolicy(booking.module_type, bookingId);
    if (!policyResult.allowed) {
      return res.status(400).json({ success: false, message: policyResult.reason });
    }
  }

  // Attempt a real Stripe refund if a successful payment exists for this booking.
  const { data: payment } = await supabaseAdmin
    .from("payment_transactions")
    .select("*")
    .eq("booking_id", bookingId)
    .eq("status", "success")
    .maybeSingle();

  if (payment && payment.method === "stripe" && payment.gateway_reference) {
    try {
      await stripe.refunds.create({ payment_intent: payment.gateway_reference });
      await supabaseAdmin.from("payment_transactions").update({ status: "refunded" }).eq("id", payment.id);
    } catch (err) {
      // Don't block the cancellation itself if the refund call fails —
      // log it for staff follow-up rather than leaving the customer stuck.
      console.error("Stripe refund failed during cancellation:", err);
    }
  }

  const { data: updated, error: updateError } = await supabaseAdmin
    .from("bookings")
    .update({
      status: "cancelled",
      cancelled_at: new Date().toISOString(),
      cancelled_by: req.user!.id,
      cancellation_reason: reason ?? null,
    })
    .eq("id", bookingId)
    .select()
    .single();

  if (updateError || !updated) {
    return res.status(500).json({ success: false, message: updateError?.message ?? "Failed to cancel booking." });
  }

  res.json({ success: true, booking: updated });
}
// GET /api/v1/bookings/:bookingId/invoice — owner or staff/admin.
// Generates the PDF on first request and caches its storage path;
// subsequent requests just re-sign a fresh URL to the same file.
export async function getInvoice(req: Request, res: Response) {
  const { bookingId } = req.params;

  const { data: booking, error: bookingError } = await supabaseAdmin
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .single();

  if (bookingError || !booking) {
    return res.status(404).json({ success: false, message: "Booking not found." });
  }

  const isOwner = booking.user_id === req.user!.id;
  const isStaff = ["staff", "admin", "super_admin"].includes(req.user!.role);

  if (!isOwner && !isStaff) {
    return res.status(403).json({ success: false, message: "You do not have permission to view this invoice." });
  }

  let path = booking.invoice_path;

  if (!path) {
    const pdfBuffer = await generateInvoicePdf(booking);
    path = `${bookingId}/invoice.pdf`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from("invoices")
      .upload(path, pdfBuffer, { contentType: "application/pdf", upsert: true });

    if (uploadError) {
      return res.status(500).json({ success: false, message: uploadError.message });
    }

    await supabaseAdmin.from("bookings").update({ invoice_path: path }).eq("id", bookingId);
  }

  const { data: signed, error: signError } = await supabaseAdmin.storage
    .from("invoices")
    .createSignedUrl(path, 60 * 10);

  if (signError || !signed) {
    return res.status(500).json({ success: false, message: signError?.message ?? "Failed to generate invoice link." });
  }

  res.json({ success: true, url: signed.signedUrl });
}