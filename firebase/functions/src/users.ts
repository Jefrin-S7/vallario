import { firestore } from "firebase-functions/v1";
import { getAuth } from "firebase-admin/auth";
import { writeAuditLog } from "./audit";

// When an admin changes `users/{uid}.role` in Firestore, mirror it onto the
// Auth custom claim used by Storage rules, and drop an audit entry. This is
// the single source of truth for "who changed a role, and when."
export const onUserRoleChange = firestore
  .document("users/{uid}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    if (before.role === after.role) return;

    await getAuth().setCustomUserClaims(context.params.uid, { role: after.role });

    await writeAuditLog({
      action: "role_change",
      actorUid: after.lastModifiedBy ?? "system",
      targetId: context.params.uid,
      targetType: "user",
      metadata: { from: before.role, to: after.role },
    });
  });
