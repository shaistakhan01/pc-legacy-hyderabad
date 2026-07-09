import { supabase } from "@/lib/supabaseClient";

const API_BASE = "http://localhost:5000";

async function authHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${session?.access_token}`,
  };
}

export interface Guest {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  id_proof_type: string | null;
  id_proof_number: string | null;
  created_at: string;
  notes?: string | null;
  tags?: string[] | null;
}

export async function listGuests(search?: string): Promise<{ success: boolean; guests: Guest[]; message?: string }> {
  const params = search ? `?search=${encodeURIComponent(search)}` : "";
  const res = await fetch(`${API_BASE}/api/v1/guests${params}`, { headers: await authHeaders() });
  return res.json();
}

export async function getGuest(id: string): Promise<{ success: boolean; guest: Guest; message?: string }> {
  const res = await fetch(`${API_BASE}/api/v1/guests/${id}`, { headers: await authHeaders() });
  return res.json();
}

export interface GuestPayload {
  fullName: string;
  phone?: string;
  email?: string;
  idProofType?: string;
  idProofNumber?: string;
}

export async function createGuest(payload: GuestPayload): Promise<{ success: boolean; guest?: Guest; message?: string }> {
  const res = await fetch(`${API_BASE}/api/v1/guests`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function updateGuest(
  id: string,
  payload: Partial<GuestPayload>
): Promise<{ success: boolean; guest?: Guest; message?: string }> {
  const res = await fetch(`${API_BASE}/api/v1/guests/${id}`, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify(payload),
  });
  return res.json();
}
export interface GuestBooking {
  id: string;
  module_type: string;
  reference_number: string;
  status: string;
  total_amount: number;
  room_bookings: { check_in: string; check_out: string; rooms: { room_number: string } | null } | null;
  restaurant_reservations: { reservation_date: string; reservation_time: string } | null;
  banquet_bookings: { event_date: string; event_halls: { name: string } | null } | null;
  conference_bookings: { date: string; conference_rooms: { name: string } | null } | null;
}

export async function fetchGuestBookings(
  guestId: string
): Promise<{ success: boolean; bookings: GuestBooking[]; message?: string }> {
  const res = await fetch(`${API_BASE}/api/v1/guests/${guestId}/bookings`, {
    headers: await authHeaders(),
  });
  return res.json();
}