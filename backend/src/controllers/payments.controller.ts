import { Request, Response } from "express";
import { stripe } from "../config/stripe.js";
import { env } from "../config/env.js";

// POST /api/v1/payments/create-payment-intent — requires auth.
// Amount must be in the smallest currency unit per Stripe's API
// (cents for USD) — $90.00 must be sent as 9000.
export async function createPaymentIntent(req: Request, res: Response) {
  const { amount, moduleType } = req.body as {
    amount?: number;
    moduleType?: string;
  };

  if (!amount || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "A valid positive amount is required.",
    });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // major units -> minor units
      currency: env.STRIPE_CURRENCY,
      metadata: { moduleType: moduleType ?? "booking" },
      automatic_payment_methods: { enabled: true },
    });

    res.status(201).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message:
        err instanceof Error ? err.message : "Failed to create payment intent.",
    });
  }
}