import { supabaseAdmin } from "../config/supabaseClient.js";

// Fire-and-forget style logging — a failed audit log write should never
// block or fail the actual action it's describing, so errors here are
// caught and logged to the console rather than propagated.
export async function logActivity(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string | null,
  metadata?: Record<string, unknown>
): Promise<void> {
  try {
    await supabaseAdmin.from("audit_logs").insert({
      actor_id: actorId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}