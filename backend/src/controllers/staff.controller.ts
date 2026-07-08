import { Request, Response } from "express";
import { supabaseAdmin } from "../config/supabaseClient.js";
import { logActivity } from "../services/auditLog.service.js";

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

const VALID_ROLES = ["customer", "staff", "admin", "super_admin"];

// PATCH /api/v1/staff/:userId/role — admin/super_admin only.
export async function updateRole(req: Request, res: Response) {
  const { userId } = req.params;
  const { role } = req.body as { role?: string };

  if (!role || !VALID_ROLES.includes(role)) {
    return res.status(400).json({
      success: false,
      message: `role must be one of: ${VALID_ROLES.join(", ")}.`,
    });
  }

  if (userId === req.user!.id) {
    return res.status(400).json({
      success: false,
      message: "You cannot change your own role.",
    });
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ role })
    .eq("id", userId)
    .select()
    .single();

  if (error || !data) {
    return res.status(500).json({
      success: false,
      message: error?.message ?? "Failed to update role.",
    });
  }

  await logActivity(req.user!.id, `changed a staff member's role to ${role}`, "profiles", userId);
  res.json({ success: true, profile: data });
}

// PATCH /api/v1/staff/:userId/active — admin/super_admin only.
export async function toggleActive(req: Request, res: Response) {
  const { userId } = req.params;
  const { isActive } = req.body as { isActive?: boolean };

  if (typeof isActive !== "boolean") {
    return res.status(400).json({ success: false, message: "isActive (boolean) is required." });
  }

  if (userId === req.user!.id) {
    return res.status(400).json({ success: false, message: "You cannot deactivate your own account." });
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ is_active: isActive })
    .eq("id", userId)
    .select()
    .single();

  if (error || !data) {
    return res.status(500).json({ success: false, message: error?.message ?? "Failed to update account status." });
  }

  await logActivity(
    req.user!.id,
    isActive ? "reactivated a staff account" : "deactivated a staff account",
    "profiles",
    userId
  );
  res.json({ success: true, profile: data });
}