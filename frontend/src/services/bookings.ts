import { supabase } from "@/lib/supabaseClient";

const API_BASE = "http://localhost:5000";

export async function cancelBooking(
  bookingId: string,
  reason: string
): Promise<{ success: boolean; message?: string }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${API_BASE}/api/v1/bookings/${bookingId}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({ reason }),
  });
  return res.json();
}
export async function fetchInvoiceUrl(bookingId: string): Promise<{ success: boolean; url?: string; message?: string }> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${API_BASE}/api/v1/bookings/${bookingId}/invoice`, {
    headers: { Authorization: `Bearer ${session?.access_token}` },
  });
  return res.json();
}