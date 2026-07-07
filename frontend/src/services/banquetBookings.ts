import { supabase } from "@/lib/supabaseClient";

const API_BASE = "http://localhost:5000";

export interface HallAvailabilityResponse {
  success: boolean;
  available: boolean;
  reason?: string;
  basePrice: number;
  message?: string;
}

export async function checkHallAvailability(
  hallId: string,
  eventDate: string,
  startTime: string,
  endTime: string,
  guestCount: number
): Promise<HallAvailabilityResponse> {
  const params = new URLSearchParams({ hallId, eventDate, startTime, endTime, guestCount: String(guestCount) });
  const res = await fetch(`${API_BASE}/api/v1/banquet-bookings/availability?${params}`);
  return res.json();
}

export interface HallAddOn {
  id: string;
  name: string;
  price: number;
  category: string | null;
}

export async function listAddOns(): Promise<{ success: boolean; addOns: HallAddOn[] }> {
  const res = await fetch(`${API_BASE}/api/v1/banquet-bookings/add-ons`);
  return res.json();
}

export interface CreateBanquetBookingPayload {
  hallId: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  eventType: string;
  guestCount: number;
  addOnIds: string[];
  paymentIntentId: string;
}

export async function createBanquetBooking(payload: CreateBanquetBookingPayload) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${API_BASE}/api/v1/banquet-bookings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify(payload),
  });
  return res.json();
}