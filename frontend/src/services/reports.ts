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

export interface ReportSummary {
  success: boolean;
  totalRevenue: number;
  totalBookings: number;
  bookingsByModule: Record<string, number>;
  revenueByModule: Record<string, number>;
  bookingsByStatus: Record<string, number>;
  message?: string;
}

export async function fetchSummary(startDate: string, endDate: string): Promise<ReportSummary> {
  const params = new URLSearchParams({ startDate, endDate });
  const res = await fetch(`${API_BASE}/api/v1/reports/summary?${params}`, { headers: await authHeaders() });
  return res.json();
}
export interface RevenueTrendPoint {
  date: string;
  revenue: number;
}

export async function fetchRevenueTrend(
  startDate: string,
  endDate: string
): Promise<{ success: boolean; trend: RevenueTrendPoint[]; message?: string }> {
  const params = new URLSearchParams({ startDate, endDate });
  const res = await fetch(`${API_BASE}/api/v1/reports/revenue-trend?${params}`, { headers: await authHeaders() });
  return res.json();
}