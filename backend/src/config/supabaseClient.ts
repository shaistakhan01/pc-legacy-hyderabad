import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types.js";
import { env } from "./env.js";

// Uses the secret (service role) key — bypasses RLS entirely.
// Used for: validating any caller's JWT via auth.getUser(token), reading
// profiles.role during auth middleware, and any operation that must
// intentionally ignore RLS (e.g. staff invite acceptance in 3.5).
// NEVER expose this client or its key to the frontend.
export const supabaseAdmin = createClient<Database>(
  env.SUPABASE_URL,
  env.SUPABASE_SECRET_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);