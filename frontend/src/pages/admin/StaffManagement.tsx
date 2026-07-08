import { useEffect, useState } from "react";
import { listStaff, type StaffMember } from "@/services/staff";
import { Card, Badge, Tabs } from "@/components/common";

const roleToBadge: Record<string, "success" | "warning" | "error" | "info" | "neutral"> = {
  super_admin: "error",
  admin: "warning",
  staff: "info",
};

function DirectoryTab() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  function loadStaff() {
    listStaff().then((res) => {
      if (res.success) setStaff(res.staff);
      setLoading(false);
    });
  }

  useEffect(() => {
    loadStaff();
  }, []);

  if (loading) return <p className="text-neutral-700">Loading staff directory...</p>;

  return (
    <div className="flex flex-col gap-3">
      {staff.map((member) => (
        <Card key={member.id}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-neutral-900">{member.full_name ?? "Unnamed"}</p>
              <p className="text-sm text-neutral-700">{member.email}</p>
              <p className="text-xs text-neutral-400">
                Joined {new Date(member.created_at).toLocaleDateString()}
              </p>
            </div>
            <Badge status={roleToBadge[member.role] ?? "neutral"}>{member.role}</Badge>
          </div>
        </Card>
      ))}
      {staff.length === 0 && <p className="text-neutral-700">No staff accounts yet.</p>}
    </div>
  );
}

export function StaffManagement() {
  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl text-primary">Staff & Roles</h1>
      <Tabs items={[{ id: "directory", label: "Directory", content: <DirectoryTab /> }]} />
    </div>
  );
}