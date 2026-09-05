import "server-only";
import { getApps, initializeApp, cert, App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

// Firebase Admin SDK — server only (Next.js API routes / server actions).
// Uses a service-account key and bypasses Firestore/Storage security rules
// entirely, which is exactly why credentials come ONLY from environment
// variables (set in Vercel's dashboard, or .env.local for local dev) —
// never from a JSON key file sitting in the repo. A key file in the repo
// gets committed sooner or later; env vars don't.

function cleanEnv(val?: string): string {
  if (!val) return "";
  return val.trim().replace(/^["']|["']$/g, "");
}

function credentialsFromEnv() {
  return {
    projectId: cleanEnv(process.env.FIREBASE_PROJECT_ID),
    clientEmail: cleanEnv(process.env.FIREBASE_CLIENT_EMAIL),
    privateKey: cleanEnv(process.env.FIREBASE_PRIVATE_KEY).replace(/\\n/g, "\n"),
    storageBucket:
      cleanEnv(process.env.FIREBASE_STORAGE_BUCKET) ||
      cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  };
}

// Check this before calling adminDb()/adminAuth() in any route that should
// degrade gracefully (return real data if connected, a clear "not
// connected yet" response otherwise) instead of throwing a raw 500.
export function isAdminConfigured(): boolean {
  const { projectId, clientEmail, privateKey } = credentialsFromEnv();
  return Boolean(projectId && clientEmail && privateKey);
}

function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  const { projectId, clientEmail, privateKey, storageBucket } = credentialsFromEnv();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, " +
        "and FIREBASE_PRIVATE_KEY as environment variables (Vercel dashboard in production, " +
        ".env.local for local dev) — see .env.example. Check isAdminConfigured() before " +
        "calling this in routes that should degrade gracefully instead of throwing."
    );
  }

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }), storageBucket });
}

export function adminDb() {
  return getFirestore(getAdminApp());
}

export function adminAuth() {
  return getAuth(getAdminApp());
}

/** @deprecated Product downloads now use S3-compatible storage (see src/lib/storage) — Firebase Storage costs money past its small free tier. Kept only for anyone still using Firebase Storage for something else. */
export function adminStorage() {
  return getStorage(getAdminApp()).bucket();
}
