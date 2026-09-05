import { https } from "firebase-functions/v1";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { writeAuditLog } from "./audit";

const SIGNED_URL_TTL_MINUTES = 15;

// Callable from the authenticated client SDK as
// `httpsCallable(functions, "requestDownload")({ productId })`.
// This is the ONLY path that ever produces a working download link — no
// permanent public URL for a digital product ever exists. Checks, in order:
//   1. caller is authenticated
//   2. an entitlement doc for (uid, productId) exists and is not revoked
//   3. downloadsUsed < downloadLimit
//   4. downloadExpiresAt (if set) has not passed
export const requestDownload = https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new https.HttpsError("unauthenticated", "Sign in to download your purchase.");
  }
  const uid = context.auth.uid;
  const productId = String(data?.productId ?? "");
  if (!productId) {
    throw new https.HttpsError("invalid-argument", "productId is required.");
  }

  const db = getFirestore();
  const entitlementId = `${uid}_${productId}`;
  const entitlementRef = db.collection("entitlements").doc(entitlementId);
  const entitlementSnap = await entitlementRef.get();

  if (!entitlementSnap.exists) {
    throw new https.HttpsError("permission-denied", "No purchase found for this product.");
  }
  const entitlement = entitlementSnap.data()!;

  if (entitlement.revoked) {
    throw new https.HttpsError("permission-denied", "Access to this product has been revoked.");
  }
  if (entitlement.downloadsUsed >= entitlement.downloadLimit) {
    throw new https.HttpsError(
      "resource-exhausted",
      "Download limit reached for this product. Contact support for a reset."
    );
  }
  if (entitlement.downloadExpiresAt && entitlement.downloadExpiresAt.toMillis() < Date.now()) {
    throw new https.HttpsError("permission-denied", "This download link window has expired.");
  }

  const productSnap = await db.collection("products").doc(productId).get();
  if (!productSnap.exists) {
    throw new https.HttpsError("not-found", "Product not found.");
  }
  const storagePath = `products/${productId}/original/${productSnap.data()!.fileName ?? "download.zip"}`;

  const bucket = getStorage().bucket();
  const [url] = await bucket.file(storagePath).getSignedUrl({
    action: "read",
    expires: Date.now() + SIGNED_URL_TTL_MINUTES * 60 * 1000,
  });

  const batch = db.batch();
  batch.update(entitlementRef, {
    downloadsUsed: FieldValue.increment(1),
    lastDownloadedAt: FieldValue.serverTimestamp(),
  });
  const downloadLogRef = db.collection("downloads").doc();
  batch.set(downloadLogRef, {
    uid,
    productId,
    entitlementId,
    issuedAt: FieldValue.serverTimestamp(),
    ip: context.rawRequest?.ip ?? null,
    userAgent: context.rawRequest?.headers["user-agent"] ?? null,
  });
  await batch.commit();

  await writeAuditLog({
    action: "download_issued",
    actorUid: uid,
    targetId: productId,
    targetType: "product_download",
  });

  return { url, expiresInMinutes: SIGNED_URL_TTL_MINUTES };
});
