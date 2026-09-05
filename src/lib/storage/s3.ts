import "server-only";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Digital product FILES (the actual purchasable zips/PDFs) live in
// S3-compatible object storage — NOT Firebase Storage. Firebase Storage's
// free tier is tiny (5GB storage / 1GB-per-day download) and the paid tier
// bills per GB served, which adds up fast for a digital-download store
// where every sale is itself a file download. This client instead points
// at whichever S3-compatible provider you configure — Cloudflare R2
// (free egress, no bandwidth charges — the best fit for this use case),
// Backblaze B2, or Supabase Storage's S3-compatible endpoint all work
// unmodified, since they all speak the same API.
//
// Firebase (Spark/free plan) is still used for Auth + Firestore, which is
// where it actually shines for a $0 deployment. Just not for file storage.

export function isStorageConfigured(): boolean {
  return Boolean(
    process.env.S3_ENDPOINT &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY &&
      process.env.S3_BUCKET_NAME
  );
}

let client: S3Client | null = null;

function getClient(): S3Client {
  if (client) return client;

  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      "Object storage is not configured. Set S3_ENDPOINT, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, " +
        "and S3_BUCKET_NAME (see .env.example / DEPLOYMENT.md for free Cloudflare R2 setup)."
    );
  }

  client = new S3Client({
    region: process.env.S3_REGION || "auto", // R2 uses "auto"; B2 wants its actual region
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
  return client;
}

const SIGNED_URL_TTL_SECONDS = 15 * 60; // 15 minutes, matches the old Firebase Storage TTL

/**
 * Mint a short-lived signed download URL for a private object. This is the
 * only way a digital product file is ever reachable — there is no
 * permanent public URL for a purchasable file anywhere in this system.
 */
export async function getSignedDownloadUrl(key: string): Promise<string> {
  const bucket = process.env.S3_BUCKET_NAME;
  if (!bucket) {
    throw new Error("S3_BUCKET_NAME is not set.");
  }
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(getClient(), command, { expiresIn: SIGNED_URL_TTL_SECONDS });
}

/**
 * Mint a short-lived signed UPLOAD url, for the admin media manager to
 * upload a product's real deliverable file directly from the browser to
 * storage without the file passing through a Vercel serverless function
 * (which has a request-size limit unsuitable for large zips).
 */
export async function getSignedUploadUrl(key: string, contentType: string): Promise<string> {
  const bucket = process.env.S3_BUCKET_NAME;
  if (!bucket) {
    throw new Error("S3_BUCKET_NAME is not set.");
  }
  const command = new PutObjectCommand({ Bucket: bucket, Key: key, ContentType: contentType });
  return getSignedUrl(getClient(), command, { expiresIn: SIGNED_URL_TTL_SECONDS });
}

export { SIGNED_URL_TTL_SECONDS };
