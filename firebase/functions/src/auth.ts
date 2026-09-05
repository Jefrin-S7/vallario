import { auth } from "firebase-functions/v1";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Fires on every new Firebase Auth user (email/password or Google). This is
// the ONLY place a user's role is ever set to something other than what an
// admin explicitly changes it to later — the client can never set its own
// role (see firestore.rules `users/{userId}` create rule, which requires
// role == 'customer' and is otherwise redundant with this trigger).
export const onUserCreate = auth.user().onCreate(async (user) => {
  const db = getFirestore();

  await db
    .collection("users")
    .doc(user.uid)
    .set({
      email: user.email ?? null,
      displayName: user.displayName ?? null,
      role: "customer",
      disabled: false,
      emailVerified: user.emailVerified,
      createdAt: FieldValue.serverTimestamp(),
    });

  // Custom claims mirror the Firestore role onto the ID token so Storage
  // rules (which can't read Firestore) and fast client-side checks can rely
  // on `request.auth.token.role` without an extra round trip.
  await getAuth().setCustomUserClaims(user.uid, { role: "customer" });
});

// Keep custom claims in sync whenever an admin changes a user's role in
// Firestore. Listens on the `users/{uid}` doc rather than trusting any
// client to call this directly.
