import { getFirestore, FieldValue } from "firebase-admin/firestore";

export type AuditAction =
  | "admin_login"
  | "product_create"
  | "product_update"
  | "product_delete"
  | "price_change"
  | "order_modify"
  | "refund_issued"
  | "user_disabled"
  | "role_change"
  | "permission_change"
  | "file_upload"
  | "license_revoked"
  | "settings_change"
  | "entitlement_granted"
  | "entitlement_revoked"
  | "download_issued"
  | "webhook_received";

interface AuditEntry {
  action: AuditAction;
  actorUid: string | "system";
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, unknown>;
}

// Every sensitive mutation in the system (see spec #41) must call this.
// Writes go straight through the Admin SDK, so `auditLogs` stays append-only
// and unreachable from the client or the normal admin UI (see firestore.rules).
export async function writeAuditLog(entry: AuditEntry) {
  const db = getFirestore();
  await db.collection("auditLogs").add({
    ...entry,
    createdAt: FieldValue.serverTimestamp(),
  });
}
