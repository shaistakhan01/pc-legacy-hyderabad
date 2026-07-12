import { FormEvent, useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Modal, Button } from "@/components/common";

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientSecret: string;
  amountLabel: string;
  onSuccess: (paymentIntentId: string) => void;
}

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      fontSize: "16px",
      color: "#1A1A1A",
      "::placeholder": { color: "#9A9A9A" },
    },
  },
};

// Reusable across all three paid modules (Room, Banquet, Conference) —
// each booking flow creates its own PaymentIntent (via 8.2's endpoint)
// and passes the resulting client_secret in here.
export function StripeCheckoutModal({
  isOpen,
  onClose,
  clientSecret,
  amountLabel,
  onSuccess,
}: StripeCheckoutModalProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [errorText, setErrorText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

async function handleSubmit(e: FormEvent) {
  e.preventDefault();
  if (!stripe || !elements) {
    setErrorText("Payment system not ready. Please wait a moment and try again.");
    return;
  }

  const cardElement = elements.getElement(CardElement);
  if (!cardElement) {
    setErrorText("Card input not found. Please close and reopen the payment form.");
    return;
  }

  setIsProcessing(true);
  setErrorText("");

  const { error, paymentIntent } = await stripe.confirmCardPayment(
    clientSecret,
    {
      payment_method: { card: cardElement },
    }
  );

  setIsProcessing(false);

  if (error) {
    setErrorText(error.message ?? "Payment failed. Please try again.");
    return;
  }

  if (paymentIntent?.status === "succeeded") {
    onSuccess(paymentIntent.id);
  }
}

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Complete Payment">
      <p className="mb-4 text-sm text-neutral-700">{amountLabel}</p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="rounded-sm border border-neutral-200 p-3">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        {errorText && <p className="text-sm text-error">{errorText}</p>}
        <Button type="submit" isLoading={isProcessing} disabled={!stripe}>
          Pay Now
        </Button>
        <p className="text-xs text-neutral-400">
          Test mode — use card number 4242 4242 4242 4242, any future expiry, any CVC.
        </p>
      </form>
    </Modal>
  );
}