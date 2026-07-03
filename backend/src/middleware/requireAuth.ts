import { Request, Response, NextFunction } from "express";
import { supabaseAdmin } from "../config/supabaseClient.js";

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Missing or malformed Authorization header." });
  }

  const token = authHeader.slice("Bearer ".length);

  const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);

  if (userError || !userData.user) {
    return res.status(401).json({ success: false, message: "Invalid or expired token." });
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", userData.user.id)
    .single();

  if (profileError || !profile) {
    return res.status(401).json({ success: false, message: "No matching profile found for this user." });
  }

  req.user = {
    id: userData.user.id,
    email: userData.user.email,
    role: profile.role as "customer" | "staff" | "admin" | "super_admin",
  };

  next();
}