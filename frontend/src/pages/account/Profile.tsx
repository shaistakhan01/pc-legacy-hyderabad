import { FormEvent, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabaseClient";
import { Button, Input, Card } from "@/components/common";

export function Profile() {
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [savedMessage, setSavedMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(profile?.reminders_enabled ?? true);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
      setRemindersEnabled(profile.reminders_enabled ?? true);
    }
  }, [profile]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!profile) return;

    setIsLoading(true);
    setSavedMessage("");

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, reminders_enabled: remindersEnabled })
      .eq("id", profile.id);

    setIsLoading(false);

    if (!error) {
      setSavedMessage("Profile updated successfully.");
      await refreshProfile();
    }
  }

  return (
    <div className="mx-auto max-w-content px-6 py-12">
      <h1 className="mb-6 font-heading text-2xl text-primary">Profile & Preferences</h1>
      <Card className="max-w-md">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-neutral-700">
            <input
              type="checkbox"
              checked={remindersEnabled}
              onChange={(e) => setRemindersEnabled(e.target.checked)}
            />
            Send me booking reminder emails
          </label>
          <Button type="submit" isLoading={isLoading} className="mt-2">
            Save Changes
          </Button>
          {savedMessage && <p className="text-sm text-success">{savedMessage}</p>}
        </form>
      </Card>
    </div>
  );
}