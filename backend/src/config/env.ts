import dotenv from "dotenv";

dotenv.config();

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. Check backend/.env against .env.example.`
    );
  }
  return value;
}

export const env = {
  PORT: process.env.PORT ?? "5000",
  NODE_ENV: process.env.NODE_ENV ?? "development",
  SUPABASE_URL: requireEnv("SUPABASE_URL"),
  // Secret key: full DB access, bypasses RLS. Backend-only. Never log this
  // value or send it to the frontend under any circumstance.
  SUPABASE_SECRET_KEY: requireEnv("SUPABASE_SECRET_KEY"),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? "http://localhost:5173",

  STRIPE_SECRET_KEY: requireEnv("STRIPE_SECRET_KEY"),
  STRIPE_CURRENCY: process.env.STRIPE_CURRENCY ?? "usd",

  RESEND_API_KEY: requireEnv("RESEND_API_KEY"),
  EMAIL_FROM: process.env.EMAIL_FROM ?? "onboarding@resend.dev",
};