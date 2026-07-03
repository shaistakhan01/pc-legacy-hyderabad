import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button, Input, Card } from "@/components/common";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorText("");
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    setIsLoading(false);

    if (error) {
      setErrorText(error.message);
      return;
    }

    navigate("/account/bookings");
  }

  return (
    <div className="mx-auto flex max-w-content justify-center px-6 py-16">
      <Card className="w-full max-w-md">
        <h1 className="mb-6 font-heading text-2xl text-primary">Log In</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            errorText={errorText || undefined}
          />
          <Button type="submit" isLoading={isLoading} className="mt-2">
            Log In
          </Button>
        </form>
        <div className="mt-4 flex justify-between text-sm text-neutral-700">
          <Link to="/register" className="hover:text-primary transition-colors">
            Create an account
          </Link>
          <Link to="/forgot-password" className="hover:text-primary transition-colors">
            Forgot password?
          </Link>
        </div>
      </Card>
    </div>
  );
}