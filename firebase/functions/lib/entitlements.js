"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.grantEntitlementsForOrder = grantEntitlementsForOrder;
const firestore_1 = require("firebase-admin/firestore");
const audit_1 = require("./audit");
const email_1 = require("./email");
// Called exclusively from a verified webhook handler (never from the client).
// Idempotent per order: if entitlements for this order already exist, it's a
// no-op, so a retried webhook can never double-grant access.
async function grantEntitlementsForOrder({ orderId, uid, userEmail, items, }) {
    const db = (0, firestore_1.getFirestore)();
    const existing = await db
        .collection("entitlements")
        .where("orderId", "==", orderId)
        .limit(1)
        .get();
    if (!existing.empty) {
        console.log(`[entitlements] order ${orderId} already granted — skipping.`);
        return;
    }
    const batch = db.batch();
    for (const item of items) {
        const entitlementId = `${uid}_${item.productId}`;
        const ref = db.collection("entitlements").doc(entitlementId);
        batch.set(ref, {
            uid,
            productId: item.productId,
            orderId,
            grantedAt: firestore_1.FieldValue.serverTimestamp(),
            revoked: false,
            downloadLimit: item.downloadLimit ?? 5,
            downloadsUsed: 0,
            downloadExpiresAt: null, // set on first issued download URL, see downloads.ts
            lastDownloadedAt: null,
        });
    }
    batch.update(db.collection("orders").doc(orderId), {
        status: "paid",
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    });
    await batch.commit();
    await (0, audit_1.writeAuditLog)({
        action: "entitlement_granted",
        actorUid: "system",
        targetId: orderId,
        targetType: "order",
        metadata: { uid, productIds: items.map((i) => i.productId) },
    });
    await (0, email_1.sendEmail)({
        to: userEmail,
        template: "digital_delivery",
        data: { orderId, productIds: items.map((i) => i.productId) },
    });
}
