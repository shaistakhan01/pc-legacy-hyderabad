import { supabase } from "@/lib/supabaseClient";

const API_BASE = "http://localhost:5000";

export interface TableAvailabilityResponse {
  success: boolean;
  available: boolean;
  tableId: string | null;
  tableNumber: string | null;
  message?: string;
}

export async function checkTableAvailability(
  date: string,
  time: string,
  partySize: number
): Promise<TableAvailabilityResponse> {
  const params = new URLSearchParams({ date, time, partySize: String(partySize) });
  const res = await fetch(`${API_BASE}/api/v1/restaurant-reservations/availability?${params}`);
  return res.json();
}

export interface CreateReservationPayload {
  reservationDate: string;
  reservationTime: string;
  partySize: number;
  specialRequests?: string;
}

export async function createReservation(payload: CreateReservationPayload) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${API_BASE}/api/v1/restaurant-reservations`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}