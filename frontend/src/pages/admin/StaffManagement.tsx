import { FormEvent, useEffect, useState } from "react";
import {
  listStaff,
  listInvites,
  createInvite,
  updateStaffRole,
  toggleStaffActive,
  type StaffMember,
  type StaffInvite,
} from "@/services/staff";
import { Card, Badge, Tabs, Button, Input, Select } from "@/components/common";

const roleToBadge: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
  super_admin: "error",
  admin: "warning",
  staff: "info",
};

const inviteStatusToBadge: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
  pending: "warning",
  accepted: "success",
  revoked: "error",
};

function DirectoryTab() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  function loadStaff() {
    listStaff().then((res) => {
      if (res.success) setStaff(res.staff);
      setLoading(false);
    });
  }

  useEffect(() => {
    loadStaff();
  }, []);

  async function handleRoleChange(userId: string, newRole: string) {
    setUpdatingId(userId);
    await updateStaffRole(userId, newRole);
    setUpdatingId(null);
    loadStaff();
  }

  async function handleToggleActive(userId: string, currentlyActive: boolean) {
    setUpdatingId(userId);
    await toggleStaffActive(userId, !currentlyActive);
    setUpdatingId(null);
    loadStaff();
  }

  if (loading) return <p className="text-neutral-700">Loading staff directory...</p>;

  return (
    <div className="flex flex-col gap-3">
      {staff.map((member) => (
        <Card key={member.id}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">
                {member.full_name ?? "Unnamed"}
              </p>
              <p className="text-sm text-neutral-700">{member.email}</p>
              <p className="text-xs text-neutral-400">
                Joined {new Date(member.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge status={roleToBadge[member.role] ?? "neutral"}>
                {member.role}
              </Badge>
              <select
                className="rounded-sm border border-neutral-200 px-2 py-1 text-sm"
                value={member.role}
                disabled={updatingId === member.id}
                onChange={(e) => handleRoleChange(member.id, e.target.value)}
              >
                <option value="staff">staff</option>
                <option value="admin">admin</option>
                <option value="super_admin">super_admin</option>
                <option value="customer">customer (demote)</option>
              </select>
              <Button
                size="sm"
                variant={member.is_active === false ? "primary" : "destructive"}
                disabled={updatingId === member.id}
                onClick={() => handleToggleActive(member.id, member.is_active !== false)}
              >
                {member.is_active === false ? "Reactivate" : "Deactivate"}
              </Button>
              {updatingId === member.id && (
                <span className="text-xs text-neutral-400">Saving...</span>
              )}
            </div>
          </div>
        </Card>
      ))}
      {staff.length === 0 && (
        <p className="text-neutral-700">No staff accounts yet.</p>
      )}
    </div>
  );
}

function InvitesTab() {
  const [invites, setInvites] = useState<StaffInvite[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"staff" | "admin">("staff");
  const [isSending, setIsSending] = useState(false);
  const [lastInviteLink, setLastInviteLink] = useState("");
  const [errorText, setErrorText] = useState("");

  function loadInvites() {
    listInvites().then((res) => res.success && setInvites(res.invites));
  }

  useEffect(() => {
    loadInvites();
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSending(true);
    setErrorText("");
    setLastInviteLink("");

    const result = await createInvite(email, role);
    setIsSending(false);

    if (!result.success) {
      setErrorText(result.message ?? "Failed to create invite.");
      return;
    }

    setLastInviteLink(result.inviteLink ?? "");
    setEmail("");
    loadInvites();
  }

  return (
    <div>
      <Card className="mb-6 max-w-md">
        <h3 className="mb-4 font-heading text-lg text-neutral-900">
          Send New Invite
        </h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Select
            label="Role"
            value={role}
            onChange={(e) => setRole(e.target.value as "staff" | "admin")}
            options={[
              { value: "staff", label: "Staff" },
              { value: "admin", label: "Admin" },
            ]}
          />
          <Button type="submit" isLoading={isSending}>
            Send Invite
          </Button>
          {errorText && <p className="text-sm text-error">{errorText}</p>}
          {lastInviteLink && (
            <p className="text-sm text-neutral-700">
              Invite link (share manually):
              <br />
              <span className="break-all text-xs text-primary">
                {lastInviteLink}
              </span>
            </p>
          )}
        </form>
      </Card>

      <h3 className="mb-3 font-heading text-lg text-neutral-900">All Invites</h3>
      <div className="flex flex-col gap-3">
        {invites.map((invite) => (
          <Card key={invite.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-neutral-900">{invite.email}</p>
                <p className="text-xs text-neutral-400">
                  Role: {invite.role} · Expires{" "}
                  {new Date(invite.expires_at).toLocaleDateString()}
                </p>
              </div>
              <Badge status={inviteStatusToBadge[invite.status] ?? "neutral"}>
                {invite.status}
              </Badge>
            </div>
          </Card>
        ))}
        {invites.length === 0 && (
          <p className="text-neutral-700">No invites sent yet.</p>
        )}
      </div>
    </div>
  );
}

export function StaffManagement() {
  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl text-primary">Staff & Roles</h1>
      <Tabs
        items={[
          { id: "directory", label: "Directory", content: <DirectoryTab /> },
          { id: "invites", label: "Invites", content: <InvitesTab /> },
        ]}
      />
    </div>
  );
}