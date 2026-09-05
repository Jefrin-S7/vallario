"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onReviewCreate = void 0;
const v1_1 = require("firebase-functions/v1");
const firestore_1 = require("firebase-admin/firestore");
// Firestore rules already require a review's `uid` to match the caller, but
// they can't cheaply check "does this uid actually own this product" — that
// check happens here. Reviews from a non-owner are deleted immediately;
// legitimate ones get `verifiedPurchase: true` and stay `pending` for
// moderation (spec #38).
exports.onReviewCreate = v1_1.firestore
    .document("reviews/{reviewId}")
    .onCreate(async (snap) => {
    const review = snap.data();
    const db = (0, firestore_1.getFirestore)();
    const entitlement = await db
        .collection("entitlements")
        .doc(`${review.uid}_${review.productId}`)
        .get();
    if (!entitlement.exists || entitlement.data()?.revoked) {
        await snap.ref.delete();
        return;
    }
    await snap.ref.update({ verifiedPurchase: true });
});
