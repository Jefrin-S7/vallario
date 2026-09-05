import { firestore } from "firebase-functions/v1";
import { getFirestore } from "firebase-admin/firestore";

// Firestore rules already require a review's `uid` to match the caller, but
// they can't cheaply check "does this uid actually own this product" — that
// check happens here. Reviews from a non-owner are deleted immediately;
// legitimate ones get `verifiedPurchase: true` and stay `pending` for
// moderation (spec #38).
export const onReviewCreate = firestore
  .document("reviews/{reviewId}")
  .onCreate(async (snap) => {
    const review = snap.data();
    const db = getFirestore();

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
