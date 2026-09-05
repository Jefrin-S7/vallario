import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { requireUser, UnauthenticatedError } from "@/lib/server/auth";

// GET /api/user/profile
// Headers: Authorization: Bearer <Firebase ID token>
export async function GET(req: NextRequest) {
  try {
    const user = await requireUser(req);

    if (!isAdminConfigured()) {
      return NextResponse.json(
        { message: "Firebase Admin isn't configured yet — see DEPLOYMENT.md." },
        { status: 503 }
      );
    }

    const db = adminDb();
    const userRef = db.collection("users").doc(user.uid);
    const snap = await userRef.get();

    const authUser = await adminAuth().getUser(user.uid);

    if (!snap.exists) {
      // Auto-provision basic profile if missing
      const initialProfile = {
        email: authUser.email ?? user.email,
        displayName: authUser.displayName ?? null,
        role: "customer",
        disabled: false,
        emailVerified: authUser.emailVerified,
        createdAt: FieldValue.serverTimestamp(),
      };
      await userRef.set(initialProfile);
      return NextResponse.json({
        uid: user.uid,
        ...initialProfile,
        provider: authUser.providerData?.[0]?.providerId ?? "password",
      });
    }

    const data = snap.data()!;
    return NextResponse.json({
      uid: user.uid,
      email: authUser.email ?? data.email,
      displayName: authUser.displayName ?? data.displayName,
      role: data.role ?? "customer",
      disabled: Boolean(data.disabled),
      emailVerified: authUser.emailVerified,
      company: data.company ?? "",
      bio: data.bio ?? "",
      phoneNumber: data.phoneNumber ?? authUser.phoneNumber ?? "",
      notifications: data.notifications ?? {
        productUpdates: true,
        securityAlerts: true,
        marketing: false,
      },
      createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : null,
      provider: authUser.providerData?.[0]?.providerId ?? "password",
    });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ message: "Could not fetch profile." }, { status: 500 });
  }
}

// PATCH /api/user/profile
// Headers: Authorization: Bearer <Firebase ID token>
// Body: { displayName?, company?, bio?, phoneNumber?, notifications? }
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser(req);

    if (!isAdminConfigured()) {
      return NextResponse.json(
        { message: "Firebase Admin isn't configured yet — see DEPLOYMENT.md." },
        { status: 503 }
      );
    }

    const body = await req.json();

    const updates: Record<string, unknown> = {
      updatedAt: FieldValue.serverTimestamp(),
    };

    const authUpdates: { displayName?: string } = {};

    if (typeof body.displayName === "string") {
      const trimmed = body.displayName.trim();
      updates.displayName = trimmed;
      authUpdates.displayName = trimmed;
    }

    if (typeof body.company === "string") {
      updates.company = body.company.trim().slice(0, 100);
    }

    if (typeof body.bio === "string") {
      updates.bio = body.bio.trim().slice(0, 500);
    }

    if (typeof body.phoneNumber === "string") {
      updates.phoneNumber = body.phoneNumber.trim().slice(0, 30);
    }

    if (body.notifications && typeof body.notifications === "object") {
      updates.notifications = {
        productUpdates: Boolean(body.notifications.productUpdates),
        securityAlerts: Boolean(body.notifications.securityAlerts),
        marketing: Boolean(body.notifications.marketing),
      };
    }

    const db = adminDb();
    const userRef = db.collection("users").doc(user.uid);
    await userRef.set(updates, { merge: true });

    if (Object.keys(authUpdates).length > 0) {
      await adminAuth().updateUser(user.uid, authUpdates);
    }

    const snap = await userRef.get();
    const updatedData = snap.data()!;

    return NextResponse.json({
      ok: true,
      profile: {
        uid: user.uid,
        ...updatedData,
      },
    });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ message: "Could not update profile." }, { status: 500 });
  }
}
