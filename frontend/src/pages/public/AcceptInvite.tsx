import { FormEvent, useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button, Input, Card } from "@/components/common";

const API_BASE = "http://localhost:5000";

export function AcceptInvite() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    if (!token) {
      setErrorText("No invite token provided.");
      setValidating(false);
      return;
    }

    fetch(`${API_BASE}/api/v1/staff-invites/${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setInviteEmail(data.email);
        setInviteRole(data.role);
      })
      .catch((err) => setErrorText(err.message))
      .finally(() => setValidating(false));
  }, [token]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErrorText("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/staff-invites/${token}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      navigate("/login");
    } catch (err) {
      setErrorText(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  if (validating) {
    return <div className="p-16 text-center text-neutral-700">Validating invite...</div>;
  }

  if (errorText && !inviteEmail) {
    return (
      <div className="mx-auto max-w-content px-6 py-16 text-center">
        <h1 className="font-heading text-2xl text-error">Invalid Invite</h1>
        <p className="mt-2 text-neutral-700">{errorText}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-content justify-center px-6 py-16">
      <Card className="w-full max-w-md">
        <h1 className="mb-2 font-heading text-2xl text-primary">Accept Invite</h1>
        <p className="mb-6 text-sm text-neutral-700">
          You've been invited as <strong>{inviteRole}</strong> for <strong>{inviteEmail}</strong>.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
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
            Create Staff Account
          </Button>
        </form>
      </Card>
    </div>
  );
}