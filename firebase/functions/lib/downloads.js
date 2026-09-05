"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestDownload = void 0;
const v1_1 = require("firebase-functions/v1");
const firestore_1 = require("firebase-admin/firestore");
const storage_1 = require("firebase-admin/storage");
const audit_1 = require("./audit");
const SIGNED_URL_TTL_MINUTES = 15;
// Callable from the authenticated client SDK as
// `httpsCallable(functions, "requestDownload")({ productId })`.
// This is the ONLY path that ever produces a working download link — no
// permanent public URL for a digital product ever exists. Checks, in order:
//   1. caller is authenticated
//   2. an entitlement doc for (uid, productId) exists and is not revoked
//   3. downloadsUsed < downloadLimit
//   4. downloadExpiresAt (if set) has not passed
exports.requestDownload = v1_1.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new v1_1.https.HttpsError("unauthenticated", "Sign in to download your purchase.");
    }
    const uid = context.auth.uid;
    const productId = String(data?.productId ?? "");
    if (!productId) {
        throw new v1_1.https.HttpsError("invalid-argument", "productId is required.");
    }
    const db = (0, firestore_1.getFirestore)();
    const entitlementId = `${uid}_${productId}`;
    const entitlementRef = db.collection("entitlements").doc(entitlementId);
    const entitlementSnap = await entitlementRef.get();
    if (!entitlementSnap.exists) {
        throw new v1_1.https.HttpsError("permission-denied", "No purchase found for this product.");
    }
    const entitlement = entitlementSnap.data();
    if (entitlement.revoked) {
        throw new v1_1.https.HttpsError("permission-denied", "Access to this product has been revoked.");
    }
    if (entitlement.downloadsUsed >= entitlement.downloadLimit) {
        throw new v1_1.https.HttpsError("resource-exhausted", "Download limit reached for this product. Contact support for a reset.");
    }
    if (entitlement.downloadExpiresAt && entitlement.downloadExpiresAt.toMillis() < Date.now()) {
        throw new v1_1.https.HttpsError("permission-denied", "This download link window has expired.");
    }
    const productSnap = await db.collection("products").doc(productId).get();
    if (!productSnap.exists) {
        throw new v1_1.https.HttpsError("not-found", "Product not found.");
    }
    const storagePath = `products/${productId}/original/${productSnap.data().fileName ?? "download.zip"}`;
    const bucket = (0, storage_1.getStorage)().bucket();
    const [url] = await bucket.file(storagePath).getSignedUrl({
        action: "read",
        expires: Date.now() + SIGNED_URL_TTL_MINUTES * 60 * 1000,
    });
    const batch = db.batch();
    batch.update(entitlementRef, {
        downloadsUsed: firestore_1.FieldValue.increment(1),
        lastDownloadedAt: firestore_1.FieldValue.serverTimestamp(),
    });
    const downloadLogRef = db.collection("downloads").doc();
    batch.set(downloadLogRef, {
        uid,
        productId,
        entitlementId,
        issuedAt: firestore_1.FieldValue.serverTimestamp(),
        ip: context.rawRequest?.ip ?? null,
        userAgent: context.rawRequest?.headers["user-agent"] ?? null,
    });
    await batch.commit();
    await (0, audit_1.writeAuditLog)({
        action: "download_issued",
        actorUid: uid,
        targetId: productId,
        targetType: "product_download",
    });
    return { url, expiresInMinutes: SIGNED_URL_TTL_MINUTES };
});
