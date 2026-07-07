import { supabase } from "@/lib/supabaseClient";

const API_BASE = "http://localhost:5000";

export interface AvailabilityResponse {
  success: boolean;
  available: boolean;
  roomId: string | null;
  nights: number;
  pricePerNight: number;
  totalAmount: number;
  message?: string;
}

export async function checkAvailability(
  roomTypeId: string,
  checkIn: string,
  checkOut: string
): Promise<AvailabilityResponse> {
  const params = new URLSearchParams({ roomTypeId, checkIn, checkOut });
  const res = await fetch(`${API_BASE}/api/v1/room-bookings/availability?${params}`);
  return res.json();
}

export interface CreateBookingPayload {
  roomTypeId: string;
  checkIn: string;
  checkOut: string;
  numGuests: number;
  specialRequests?: string;
  paymentIntentId: string;
}

export async function createRoomBooking(payload: CreateBookingPayload) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${API_BASE}/api/v1/room-bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}