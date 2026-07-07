import { supabase } from "@/lib/supabaseClient";

const API_BASE = "http://localhost:5000";

export interface CreatePaymentIntentResponse {
  success: boolean;
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  message?: string;
}

export async function createPaymentIntent(
  amount: number,
  moduleType: string
): Promise<CreatePaymentIntentResponse> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`${API_BASE}/api/v1/payments/create-payment-intent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.access_token}`,
    },
    body: JSON.stringify({ amount, moduleType }),
  });
  return res.json();
}