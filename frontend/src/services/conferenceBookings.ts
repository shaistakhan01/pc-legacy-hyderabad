import { supabase } from "@/lib/supabaseClient";

const API_BASE = "http://localhost:5000";

export interface ConferenceAvailabilityResponse {
  success: boolean;
  available: boolean;
  reason?: string;
  hourlyRate: number;
  hours: number;
  totalAmount: number;
  message?: string;
}

export async function checkConferenceAvailability(
  roomId: string,
  date: string,
  startTime: string,
  endTime: string,
  attendeeCount: number
): Promise<ConferenceAvailabilityResponse> {
  const params = new URLSearchParams({ roomId, date, startTime, endTime, attendeeCount: String(attendeeCount) });
  const res = await fetch(`${API_BASE}/api/v1/conference-bookings/availability?${params}`);
  return res.json();
}

export interface CreateConferenceBookingPayload {
  roomId: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendeeCount: number;
  cateringRequired: boolean;
  paymentIntentId: string;
}

export async function createConferenceBooking(payload: CreateConferenceBookingPayload) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${API_BASE}/api/v1/conference-bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}