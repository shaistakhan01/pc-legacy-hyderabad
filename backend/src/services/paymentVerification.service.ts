import { stripe } from "../config/stripe.js";

export interface PaymentVerificationResult {
  isValid: boolean;
  reason?: string;
}

// Re-fetches the PaymentIntent directly from Stripe's servers (never
// trusting anything the client claims) and confirms both that it
// succeeded AND that the amount matches what this booking should cost —
// preventing a customer from paying for a cheap room but booking an
// expensive suite using a stale/mismatched PaymentIntent.
export async function verifyPayment(
  paymentIntentId: string,
  expectedAmount: number
): Promise<PaymentVerificationResult> {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return {
        isValid: false,
        reason: `Payment status is "${paymentIntent.status}", not succeeded.`,
      };
    }

    const expectedMinorUnits = Math.round(expectedAmount * 100);
    if (paymentIntent.amount !== expectedMinorUnits) {
      return {
        isValid: false,
        reason: "Payment amount does not match the booking total.",
      };
    }

    return { isValid: true };
  } catch (err) {
    return {
      isValid: false,
      reason:
        err instanceof Error ? err.message : "Could not verify payment.",
    };
  }
}