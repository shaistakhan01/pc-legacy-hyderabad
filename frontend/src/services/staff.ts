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
export interface StaffInvite {
  id: string;
  email: string;
  role: string;
  status: string;
  created_at: string;
  expires_at: string;
}

export async function listInvites(): Promise<{
  success: boolean;
  invites: StaffInvite[];
  message?: string;
}> {
  const res = await fetch(`${API_BASE}/api/v1/staff-invites`, {
    headers: await authHeaders(),
  });
  return res.json();
}

export async function createInvite(
  email: string,
  role: "staff" | "admin"
): Promise<{ success: boolean; inviteLink?: string; message?: string }> {
  const res = await fetch(`${API_BASE}/api/v1/staff-invites`, {
    method: "POST",
    headers: await authHeaders(),
    body: JSON.stringify({ email, role }),
  });
  return res.json();
}
export async function updateStaffRole(
  userId: string,
  role: string
): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${API_BASE}/api/v1/staff/${userId}/role`, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify({ role }),
  });
  return res.json();
}
export async function toggleStaffActive(
  userId: string,
  isActive: boolean
): Promise<{ success: boolean; message?: string }> {
  const res = await fetch(`${API_BASE}/api/v1/staff/${userId}/active`, {
    method: "PATCH",
    headers: await authHeaders(),
    body: JSON.stringify({ isActive }),
  });
  return res.json();
}