import { Request, Response } from "express";
import { supabaseAdmin } from "../config/supabaseClient.js";

// GET /api/v1/guests?search= — staff/admin only.
export async function listGuests(req: Request, res: Response) {
  const { search } = req.query as { search?: string };

  let query = supabaseAdmin.from("guests").select("*").order("created_at", { ascending: false });

  if (search) {
    query = query.or(`full_name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  res.json({ success: true, guests: data });
}

// GET /api/v1/guests/:id — staff/admin only.
export async function getGuest(req: Request, res: Response) {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin.from("guests").select("*").eq("id", id).single();

  if (error || !data) {
    return res.status(404).json({ success: false, message: "Guest not found." });
  }

  res.json({ success: true, guest: data });
}

// POST /api/v1/guests — staff/admin only.
export async function createGuest(req: Request, res: Response) {
  const { fullName, phone, email, idProofType, idProofNumber } = req.body as {
    fullName?: string;
    phone?: string;
    email?: string;
    idProofType?: string;
    idProofNumber?: string;
  };

  if (!fullName) {
    return res.status(400).json({ success: false, message: "fullName is required." });
  }

  const { data, error } = await supabaseAdmin
    .from("guests")
    .insert({
      full_name: fullName,
      phone: phone ?? null,
      email: email ?? null,
      id_proof_type: idProofType ?? null,
      id_proof_number: idProofNumber ?? null,
      created_by: req.user!.id,
    })
    .select()
    .single();

  if (error || !data) {
    return res.status(500).json({ success: false, message: error?.message ?? "Failed to create guest." });
  }

  res.status(201).json({ success: true, guest: data });
}

// PATCH /api/v1/guests/:id — staff/admin only.
export async function updateGuest(req: Request, res: Response) {
  const { id } = req.params;
  const { fullName, phone, email, idProofType, idProofNumber, notes, tags } = req.body as {
    fullName?: string;
    phone?: string;
    email?: string;
    idProofType?: string;
    idProofNumber?: string;
    notes?: string;
    tags?: string[];
  };

  const { data, error } = await supabaseAdmin
    .from("guests")
    .update({
      ...(fullName !== undefined && { full_name: fullName }),
      ...(phone !== undefined && { phone }),
      ...(email !== undefined && { email }),
      ...(idProofType !== undefined && { id_proof_type: idProofType }),
      ...(idProofNumber !== undefined && { id_proof_number: idProofNumber }),
      ...(notes !== undefined && { notes }),
      ...(tags !== undefined && { tags }),
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    return res.status(500).json({ success: false, message: error?.message ?? "Failed to update guest." });
  }

  res.json({ success: true, guest: data });
}

// GET /api/v1/guests/:id/bookings — staff/admin only.
export async function getGuestBookings(req: Request, res: Response) {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select(
      `id, module_type, reference_number, status, total_amount, created_at,
       room_bookings ( check_in, check_out, rooms ( room_number ) ),
       restaurant_reservations ( reservation_date, reservation_time ),
       banquet_bookings ( event_date, event_halls ( name ) ),
       conference_bookings ( date, conference_rooms ( name ) )`
    )
    .eq("guest_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  res.json({ success: true, bookings: data });
}
// GET /api/v1/guests/:id/stats — staff/admin only.
export async function getGuestStats(req: Request, res: Response) {
  const { id } = req.params;

  const { data, error } = await supabaseAdmin
    .from("bookings")
    .select("total_amount, status")
    .eq("guest_id", id);

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  const completedBookings = (data ?? []).filter((b) => b.status !== "cancelled");
  const totalSpend = completedBookings.reduce((sum, b) => sum + Number(b.total_amount), 0);
  const visitCount = completedBookings.length;

  res.json({ success: true, totalSpend, visitCount });
}