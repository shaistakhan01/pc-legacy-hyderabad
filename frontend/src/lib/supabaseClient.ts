import { createClient } from "@supabase/supabase-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL as string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabasePublishableKey = (import.meta as any).env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing Supabase environment variables. Check frontend/.env against .env.example."
  );
}

// Frontend-only client using the publishable key.
// Used for: reading public reference data, Storage public URLs, and Realtime
// subscriptions. All business-rule writes go through the Express backend.
export const supabase = createClient(supabaseUrl, supabasePublishableKey);