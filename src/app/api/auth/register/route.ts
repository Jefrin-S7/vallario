import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { requireUser, UnauthenticatedError } from "@/lib/server/auth";

// POST /api/auth/register
// Headers: Authorization: Bearer <Firebase ID token>
//
// Creates the `users/{uid}` Firestore profile for a just-registered (or
// first-time Google sign-in) user, with role hard-coded to "customer" —
// this is the ONLY place a role is ever set on account creation, and the
// client has no way to influence it. Mirrors the role onto the Auth custom
// claim so Storage rules (which can't read Firestore) can check it too.
//
// This replaces what would otherwise be a Cloud Functions `onUserCreate`
// trigger, so the project can run entirely on Firebase's free Spark plan.
// It's idempotent — safe to call on every sign-in, not just the first one.
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser(req);
    const db = adminDb();
    const ref = db.collection("users").doc(user.uid);
    const snap = await ref.get();

    if (!snap.exists) {
      const authUser = await adminAuth().getUser(user.uid);
      await ref.set({
        email: authUser.email ?? user.email,
        displayName: authUser.displayName ?? null,
        role: "customer",
        disabled: false,
        emailVerified: authUser.emailVerified,
        createdAt: FieldValue.serverTimestamp(),
      });
      await adminAuth().setCustomUserClaims(user.uid, { role: "customer" });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ message: "Could not provision user profile." }, { status: 500 });
  }
}
