import { FormEvent, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button, Input, Card } from "@/components/common";

export function Register() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorText("");

    if (password.length < 8) {
      setErrorText("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

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
        <h1 className="mb-6 font-heading text-2xl text-primary">Create Account</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
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
            helperText="At least 8 characters."
            errorText={errorText || undefined}
            required
          />
          <Button type="submit" isLoading={isLoading} className="mt-2">
            Create Account
          </Button>
        </form>
        <div className="mt-4 text-sm text-neutral-700">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </div>
      </Card>
    </div>
  );
}