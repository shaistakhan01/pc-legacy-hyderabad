import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button, Input, Card } from "@/components/common";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorText("");
    setIsLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    setIsLoading(false);

    if (error) {
      setErrorText(error.message);
      return;
    }

    setSent(true);
  }

  return (
    <div className="mx-auto flex max-w-content justify-center px-6 py-16">
      <Card className="w-full max-w-md">
        <h1 className="mb-6 font-heading text-2xl text-primary">Reset Password</h1>
        {sent ? (
          <p className="text-neutral-700">
            If an account exists for that email, a reset link has been sent.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              errorText={errorText || undefined}
              required
            />
            <Button type="submit" isLoading={isLoading} className="mt-2">
              Send Reset Link
            </Button>
          </form>
        )}
        <div className="mt-4 text-sm text-neutral-700">
          <Link to="/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </div>
      </Card>
    </div>
  );
}