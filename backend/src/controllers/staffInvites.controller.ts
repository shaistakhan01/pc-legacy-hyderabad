import { Request, Response } from "express";
import { supabaseAdmin } from "../config/supabaseClient.js";

export async function createInvite(req: Request, res: Response) {
  const { email, role } = req.body as { email?: string; role?: string };

  if (!email || !role || !["staff", "admin"].includes(role)) {
    return res.status(400).json({ success: false, message: "email and a valid role ('staff' or 'admin') are required." });
  }

  const { data, error } = await supabaseAdmin
    .from("staff_invites")
    .insert({ email, role, invited_by: req.user!.id })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  const inviteLink = `http://localhost:5173/staff/accept-invite?token=${data.token}`;

  res.status(201).json({ success: true, invite: data, inviteLink });
}

export async function getInviteByToken(req: Request, res: Response) {
  const { token } = req.params;

  const { data, error } = await supabaseAdmin
    .from("staff_invites")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (error || !data) {
    return res.status(404).json({ success: false, message: "Invite not found or already used." });
  }

  if (new Date(data.expires_at) < new Date()) {
    return res.status(410).json({ success: false, message: "This invite has expired." });
  }

  res.json({ success: true, email: data.email, role: data.role });
}

export async function acceptInvite(req: Request, res: Response) {
  const { token } = req.params;
  const { fullName, password } = req.body as { fullName?: string; password?: string };

  if (!fullName || !password || password.length < 8) {
    return res.status(400).json({ success: false, message: "fullName and a password of at least 8 characters are required." });
  }

  const { data: invite, error: inviteError } = await supabaseAdmin
    .from("staff_invites")
    .select("*")
    .eq("token", token)
    .eq("status", "pending")
    .single();

  if (inviteError || !invite) {
    return res.status(404).json({ success: false, message: "Invite not found or already used." });
  }

  if (new Date(invite.expires_at) < new Date()) {
    return res.status(410).json({ success: false, message: "This invite has expired." });
  }

  const { data: created, error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: invite.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

  if (createError || !created.user) {
    return res.status(500).json({ success: false, message: createError?.message ?? "Failed to create user." });
  }

  const { error: updateError } = await supabaseAdmin
    .from("profiles")
    .update({ role: invite.role })
    .eq("id", created.user.id);

  if (updateError) {
    return res.status(500).json({ success: false, message: updateError.message });
  }

  await supabaseAdmin
    .from("staff_invites")
    .update({ status: "accepted" })
    .eq("id", invite.id);

  res.status(201).json({ success: true, message: "Account created successfully." });
}