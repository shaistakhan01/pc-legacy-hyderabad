import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing Supabase environment variables. Check frontend/.env against .env.example."
  );
}

// Frontend-only client using the publishable key.
// Used for: reading public reference data, Storage public URLs, and Realtime
// subscriptions. All business-rule writes (bookings, payments) go through
// the Express backend — never call Supabase directly from the frontend for
// any write that involves business logic.
export const supabase = createClient(supabaseUrl, supabasePublishableKey);