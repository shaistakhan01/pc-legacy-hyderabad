import { loadStripe } from "@stripe/stripe-js";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const key = (import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY as string;

export const stripePromise = loadStripe(key);