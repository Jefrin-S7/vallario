import { NextRequest, NextResponse } from "next/server";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { requireUser, UnauthenticatedError } from "@/lib/server/auth";
import { writeAuditLog } from "@/lib/server/audit";

const DEFAULT_SETTINGS = {
  storeName: "VALLARIO",
  supportEmail: "support@vallario.com",
  currency: "USD",
  taxRate: 0,
  enableCashfree: true,
  enablePaypal: true,
  maintenanceMode: false,
  allowGuestCheckout: false,
  signedUrlExpiryMinutes: 15,
};

// GET /api/admin/settings
export async function GET(req: NextRequest) {
  // Computed server-side because these check server-only secrets — the
  // client has no way to know if e.g. CASHFREE_CLIENT_SECRET is set, and
  // shouldn't be sent the value, only whether it's present.
  const environment = {
    firebaseAdmin: isAdminConfigured(),
    cashfree: Boolean(
      process.env.CASHFREE_CLIENT_ID && process.env.CASHFREE_CLIENT_SECRET && process.env.CASHFREE_WEBHOOK_SECRET
    ),
    paypal: Boolean(
      process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET && process.env.PAYPAL_WEBHOOK_ID
    ),
    objectStorage: Boolean(
      process.env.S3_ENDPOINT && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY && process.env.S3_BUCKET_NAME
    ),
    email: Boolean(process.env.EMAIL_PROVIDER_API_KEY),
  };

  try {
    const caller = await requireUser(req);

    if (!isAdminConfigured()) {
      return NextResponse.json({ settings: DEFAULT_SETTINGS, connected: false, environment });
    }

    const db = adminDb();

    const callerDoc = await db.collection("users").doc(caller.uid).get();
    const role = callerDoc.data()?.role || "customer";
    if (!["admin", "super_admin"].includes(role)) {
      return NextResponse.json({ message: "Staff access required." }, { status: 403 });
    }

    const docRef = db.collection("settings").doc("store_config");
    const snap = await docRef.get();

    if (!snap.exists) {
      return NextResponse.json({ settings: DEFAULT_SETTINGS, connected: true, environment });
    }

    return NextResponse.json({
      settings: {
        ...DEFAULT_SETTINGS,
        ...snap.data(),
      },
      connected: true,
      environment,
    });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    console.error("Admin settings error:", err);
    return NextResponse.json({ message: "Failed to load store settings." }, { status: 500 });
  }
}

// POST /api/admin/settings
export async function POST(req: NextRequest) {
  try {
    const caller = await requireUser(req);

    if (!isAdminConfigured()) {
      return NextResponse.json({ message: "Firebase Admin isn't configured yet." }, { status: 503 });
    }

    const db = adminDb();

    const callerDoc = await db.collection("users").doc(caller.uid).get();
    const role = callerDoc.data()?.role || "customer";
    if (!["admin", "super_admin"].includes(role)) {
      return NextResponse.json({ message: "Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const docRef = db.collection("settings").doc("store_config");

    const newSettings = {
      ...DEFAULT_SETTINGS,
      ...body,
      updatedAt: new Date().toISOString(),
      updatedBy: caller.uid,
    };

    await docRef.set(newSettings, { merge: true });

    await writeAuditLog({
      action: "store_settings_updated",
      actorUid: caller.uid,
      targetId: "store_config",
      targetType: "settings",
      metadata: body,
    });

    return NextResponse.json({ ok: true, settings: newSettings });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    console.error("Admin update settings error:", err);
    return NextResponse.json({ message: "Failed to save store settings." }, { status: 500 });
  }
}
