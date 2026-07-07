import { loadStripe } from "@stripe/stripe-js";

// Loaded once and reused everywhere Stripe Elements is needed.
export const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY
);