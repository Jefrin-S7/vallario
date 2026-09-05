"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserRoleChange = void 0;
const v1_1 = require("firebase-functions/v1");
const auth_1 = require("firebase-admin/auth");
const audit_1 = require("./audit");
// When an admin changes `users/{uid}.role` in Firestore, mirror it onto the
// Auth custom claim used by Storage rules, and drop an audit entry. This is
// the single source of truth for "who changed a role, and when."
exports.onUserRoleChange = v1_1.firestore
    .document("users/{uid}")
    .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    if (before.role === after.role)
        return;
    await (0, auth_1.getAuth)().setCustomUserClaims(context.params.uid, { role: after.role });
    await (0, audit_1.writeAuditLog)({
        action: "role_change",
        actorUid: after.lastModifiedBy ?? "system",
        targetId: context.params.uid,
        targetType: "user",
        metadata: { from: before.role, to: after.role },
    });
});
