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

export interface StaffMember {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  email: string;
  is_active?: boolean;
  created_at: string;
}

export async function listStaff(): Promise<{ success: boolean; staff: StaffMember[]; message?: string }> {
  const res = await fetch(`${API_BASE}/api/v1/staff`, { headers: await authHeaders() });
  return res.json();
}