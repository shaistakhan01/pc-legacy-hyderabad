import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Missing Supabase environment variables. Check frontend/.env against .env.example."
  );
}

// Generic <Database> gives full autocomplete + type checking on every
// .from("table_name") call — typos in table/column names now fail at
// compile time instead of silently returning wrong data at runtime.
export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey);