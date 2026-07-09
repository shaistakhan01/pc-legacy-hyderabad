import { supabase } from "@/lib/supabaseClient";

const API_BASE = "http://localhost:5000";

async function authHeader() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return `Bearer ${session?.access_token}`;
}

export interface GuestDocument {
  name: string;
  url: string | null;
}

export async function listGuestDocuments(guestId: string): Promise<{ success: boolean; documents: GuestDocument[] }> {
  const res = await fetch(`${API_BASE}/api/v1/guests/${guestId}/documents`, {
    headers: { Authorization: await authHeader() },
  });
  return res.json();
}

export async function uploadGuestDocument(guestId: string, file: File): Promise<{ success: boolean; message?: string }> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/api/v1/guests/${guestId}/documents`, {
    method: "POST",
    headers: { Authorization: await authHeader() },
    body: formData,
  });
  return res.json();
}