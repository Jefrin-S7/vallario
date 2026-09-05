import "server-only";
import { getSignedDownloadUrl as getS3SignedUrl, isStorageConfigured as isS3Configured } from "./s3";
import { adminStorage } from "@/lib/firebase/admin";

// Two ways to store the actual purchasable product files, picked
// automatically based on what's configured — no code change needed to
// switch between them:
//
//   1. S3-compatible (Cloudflare R2, Backblaze B2, Supabase Storage) — set
//      S3_ENDPOINT/S3_ACCESS_KEY_ID/etc. Best long-term choice: R2 has zero
//      egress fees, which matters a lot for a download-heavy store. BUT
//      Cloudflare (and some other providers) ask for a card on file even
//      for their free tier, in some regions/account types — a real
//      blocker if you only have a card that doesn't support that.
//
//   2. Firebase Storage — automatically used if no S3_* vars are set, since
//      you already have a Firebase project for Auth + Firestore and its
//      free Spark plan needs NO card at all. Free quota is smaller (5GB
//      storage, ~1GB/day downloaded) and its *paid* Blaze tier bills per
//      GB served — but you only hit that if you outgrow Spark's quota,
//      which is a "good problem to have, deal with it then" situation, not
//      a blocker to launching.
//
// Bottom line: if you can get a card-free S3-compatible provider working,
// great. If not, do nothing extra — Firebase Storage just works using the
// same FIREBASE_* credentials you already set up for Auth/Firestore.

const SIGNED_URL_TTL_MINUTES = 15;

export function getConfiguredDownloadBackend(): "s3" | "firebase" | "none" {
  if (isS3Configured()) return "s3";
  return "firebase"; // adminStorage() only actually works once Firebase Admin creds are set; caller already checks isAdminConfigured() first
}

/**
 * Mint a short-lived signed download URL for a private object, using
 * whichever backend is configured. `storagePath` is the same either way:
 * `products/{productId}/original/{fileName}`.
 */
export async function getSignedDownloadUrl(storagePath: string): Promise<string> {
  if (isS3Configured()) {
    return getS3SignedUrl(storagePath);
  }

  // Fall back to Firebase Storage — no separate signup, no card, uses the
  // same service account already configured for Firestore/Auth.
  const [url] = await adminStorage()
    .file(storagePath)
    .getSignedUrl({ action: "read", expires: Date.now() + SIGNED_URL_TTL_MINUTES * 60 * 1000 });
  return url;
}
