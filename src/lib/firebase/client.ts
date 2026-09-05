"use client";

// Firebase client SDK — safe to import from client components. Only the
// public web config goes here (NEXT_PUBLIC_*); never a service-account key.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check";

function cleanPublicEnv(val?: string): string {
  if (!val) return "";
  return val.trim().replace(/^["']|["']$/g, "");
}

const firebaseConfig = {
  apiKey: cleanPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: cleanPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: cleanPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: cleanPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: cleanPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: cleanPublicEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId
);

export const firebaseApp = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : undefined;

export const auth = isFirebaseConfigured && firebaseApp ? getAuth(firebaseApp) : undefined;
export const db = isFirebaseConfigured && firebaseApp ? getFirestore(firebaseApp) : undefined;
/** @deprecated Product file downloads use S3-compatible storage (src/lib/storage/s3.ts) to avoid Firebase Storage's costs. Exported for completeness; nothing in this app currently reads or writes through it. */
export const storage = isFirebaseConfigured && firebaseApp ? getStorage(firebaseApp) : undefined;

export function initAppCheck() {
  if (typeof window === "undefined") return;
  if (!isFirebaseConfigured || !firebaseApp) return;
  const recaptchaKey = cleanPublicEnv(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);
  if (!recaptchaKey) return;
  initializeAppCheck(firebaseApp, {
    provider: new ReCaptchaV3Provider(recaptchaKey),
    isTokenAutoRefreshEnabled: true,
  });
}
