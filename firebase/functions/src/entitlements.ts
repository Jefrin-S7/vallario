import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { writeAuditLog } from "./audit";
import { sendEmail } from "./email";

interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  downloadLimit?: number;
}

interface GrantEntitlementsInput {
  orderId: string;
  uid: string;
  userEmail: string;
  items: OrderItem[];
}

// Called exclusively from a verified webhook handler (never from the client).
// Idempotent per order: if entitlements for this order already exist, it's a
// no-op, so a retried webhook can never double-grant access.
export async function grantEntitlementsForOrder({
  orderId,
  uid,
  userEmail,
  items,
}: GrantEntitlementsInput) {
  const db = getFirestore();

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
      grantedAt: FieldValue.serverTimestamp(),
      revoked: false,
      downloadLimit: item.downloadLimit ?? 5,
      downloadsUsed: 0,
      downloadExpiresAt: null, // set on first issued download URL, see downloads.ts
      lastDownloadedAt: null,
    });
  }
  batch.update(db.collection("orders").doc(orderId), {
    status: "paid",
    updatedAt: FieldValue.serverTimestamp(),
  });
  await batch.commit();

  await writeAuditLog({
    action: "entitlement_granted",
    actorUid: "system",
    targetId: orderId,
    targetType: "order",
    metadata: { uid, productIds: items.map((i) => i.productId) },
  });

  await sendEmail({
    to: userEmail,
    template: "digital_delivery",
    data: { orderId, productIds: items.map((i) => i.productId) },
  });
}
