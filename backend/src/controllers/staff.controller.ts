import { Request, Response } from "express";
import { supabaseAdmin } from "../config/supabaseClient.js";

// GET /api/v1/staff — requires staff/admin/super_admin.
// profiles has no email column (that's Supabase Auth-only data), so we
// fetch profiles first, then cross-reference auth.users via the admin
// client to attach each person's email.
export async function listStaff(_req: Request, res: Response) {
  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .in("role", ["staff", "admin", "super_admin"])
    .order("created_at", { ascending: false });

  if (profilesError) {
    return res.status(500).json({ success: false, message: profilesError.message });
  }

  const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();

  if (usersError) {
    return res.status(500).json({ success: false, message: usersError.message });
  }

  const emailById = new Map(usersData.users.map((u) => [u.id, u.email]));

  const staff = (profiles ?? []).map((p) => ({
    ...p,
    email: emailById.get(p.id) ?? "unknown",
  }));

  res.json({ success: true, staff });
}