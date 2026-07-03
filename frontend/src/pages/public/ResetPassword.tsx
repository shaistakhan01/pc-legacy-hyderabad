import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button, Input, Card } from "@/components/common";

export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    // Supabase's password-reset link can arrive as either a URL hash
    // (#access_token=...&type=recovery) or a PKCE ?code=... param,
    // depending on client version/config. Handle both, and also listen
    // for the PASSWORD_RECOVERY auth event as a fallback signal.
    async function establishSession() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          setSessionReady(true);
          setCheckingSession(false);
          return;
        }
      }

      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setSessionReady(true);
      }
      setCheckingSession(false);
    }

    establishSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" && session) {
        setSessionReady(true);
        setCheckingSession(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorText("");

    if (password.length < 8) {
      setErrorText("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setIsLoading(false);

    if (error) {
      setErrorText(error.message);
      return;
    }

    navigate("/login");
  }

  if (checkingSession) {
    return <div className="p-16 text-center text-neutral-700">Verifying reset link...</div>;
  }

  if (!sessionReady) {
    return (
      <div className="mx-auto max-w-content px-6 py-16 text-center">
        <h1 className="font-heading text-2xl text-error">Invalid or Expired Link</h1>
        <p className="mt-2 text-neutral-700">
          This password reset link is no longer valid. Please request a new one.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-content justify-center px-6 py-16">
      <Card className="w-full max-w-md">
        <h1 className="mb-6 font-heading text-2xl text-primary">Set New Password</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            helperText="At least 8 characters."
            errorText={errorText || undefined}
            required
          />
          <Button type="submit" isLoading={isLoading} className="mt-2">
            Update Password
          </Button>
        </form>
      </Card>
    </div>
  );
}