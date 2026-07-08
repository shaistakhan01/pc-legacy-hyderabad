import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, Badge } from "@/components/common";

interface AuditLogRow {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  profiles: { full_name: string | null } | null;
}

export function AuditLog() {
  const [logs, setLogs] = useState<AuditLogRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("audit_logs")
      .select(`id, action, entity_type, entity_id, metadata, created_at, profiles ( full_name )`)
      .order("created_at", { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (!error && data) setLogs(data as unknown as AuditLogRow[]);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="p-16 text-center text-neutral-700">Loading activity log...</div>;
  }

  return (
    <div>
      <h1 className="mb-6 font-heading text-2xl text-primary">Audit Log</h1>
      <div className="flex flex-col gap-2">
        {logs.map((log) => (
          <Card key={log.id}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-900">
                  <strong>{log.profiles?.full_name ?? "System"}</strong> {log.action}
                </p>
                <p className="text-xs text-neutral-400">
                  {new Date(log.created_at).toLocaleString()}
                </p>
              </div>
              <Badge status="neutral">{log.entity_type}</Badge>
            </div>
          </Card>
        ))}
        {logs.length === 0 && (
          <p className="text-neutral-700">
            No activity recorded yet — actions get logged starting with Sub-Phase 9.6.
          </p>
        )}
      </div>
    </div>
  );
}