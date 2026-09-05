import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";

export type AuditAction =
  | "admin_login"
  | "product_create"
  | "product_update"
  | "product_updated"
  | "product_delete"
  | "price_change"
  | "order_modify"
  | "order_status_updated"
  | "refund_issued"
  | "user_disabled"
  | "role_change"
  | "permission_change"
  | "file_upload"
  | "license_revoked"
  | "settings_change"
  | "settings_change"
  | "store_settings_updated"
  | "entitlement_granted"
  | "entitlement_revoked"
  | "download_issued"
  | "webhook_received"
  | "coupon_created"
  | "coupon_deleted"
  | "catalog_seeded_to_firestore"
  | "customer_account_updated";

interface AuditEntry {
  action: AuditAction;
  actorUid: string | "system";
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, unknown>;
}

// Every sensitive mutation (spec #41) calls this. Writes go through the
// Admin SDK, so `auditLogs` stays append-only and unreachable from the
// client or the normal admin UI (see firebase/firestore.rules).
export async function writeAuditLog(entry: AuditEntry) {
  await adminDb()
    .collection("auditLogs")
    .add({ ...entry, createdAt: FieldValue.serverTimestamp() });
}
