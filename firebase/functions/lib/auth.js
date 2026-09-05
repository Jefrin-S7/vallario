"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserCreate = void 0;
const v1_1 = require("firebase-functions/v1");
const firestore_1 = require("firebase-admin/firestore");
const auth_1 = require("firebase-admin/auth");
// Fires on every new Firebase Auth user (email/password or Google). This is
// the ONLY place a user's role is ever set to something other than what an
// admin explicitly changes it to later — the client can never set its own
// role (see firestore.rules `users/{userId}` create rule, which requires
// role == 'customer' and is otherwise redundant with this trigger).
exports.onUserCreate = v1_1.auth.user().onCreate(async (user) => {
    const db = (0, firestore_1.getFirestore)();
    await db
        .collection("users")
        .doc(user.uid)
        .set({
        email: user.email ?? null,
        displayName: user.displayName ?? null,
        role: "customer",
        disabled: false,
        emailVerified: user.emailVerified,
        createdAt: firestore_1.FieldValue.serverTimestamp(),
    });
    // Custom claims mirror the Firestore role onto the ID token so Storage
    // rules (which can't read Firestore) and fast client-side checks can rely
    // on `request.auth.token.role` without an extra round trip.
    await (0, auth_1.getAuth)().setCustomUserClaims(user.uid, { role: "customer" });
});
// Keep custom claims in sync whenever an admin changes a user's role in
// Firestore. Listens on the `users/{uid}` doc rather than trusting any
// client to call this directly.
