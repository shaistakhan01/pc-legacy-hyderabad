import Stripe from "stripe";
import { env } from "./env.js";

// Single shared Stripe SDK instance — used to create and verify
// PaymentIntents server-side. Never expose STRIPE_SECRET_KEY to the
// frontend; only the publishable key is meant to be public.
export const stripe = new Stripe(env.STRIPE_SECRET_KEY);