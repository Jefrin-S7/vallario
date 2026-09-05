import { NextRequest, NextResponse } from "next/server";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { requireUser, UnauthenticatedError } from "@/lib/server/auth";
import { writeAuditLog } from "@/lib/server/audit";

// GET /api/admin/coupons
export async function GET(req: NextRequest) {
  try {
    const caller = await requireUser(req);

    if (!isAdminConfigured()) {
      return NextResponse.json({ coupons: [], connected: false });
    }

    const db = adminDb();

    const callerDoc = await db.collection("users").doc(caller.uid).get();
    const role = callerDoc.data()?.role || "customer";
    if (!["sales", "marketing", "manager", "admin", "super_admin"].includes(role)) {
      return NextResponse.json({ message: "Staff access required." }, { status: 403 });
    }

    const snap = await db.collection("coupons").get();
    const coupons = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        code: doc.id,
        type: data.type || "percentage",
        value: data.value ?? 10,
        usageLimit: data.usageLimit ?? 100,
        timesUsed: data.timesUsed ?? 0,
        status: data.status || "active",
        expiresAt: data.expiresAt || "2026-12-31",
      };
    });

    return NextResponse.json({ coupons });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    console.error("Admin coupons error:", err);
    return NextResponse.json({ message: "Failed to load coupons." }, { status: 500 });
  }
}

// POST /api/admin/coupons
// Body: { code, type, value, usageLimit, expiresAt }
export async function POST(req: NextRequest) {
  try {
    const caller = await requireUser(req);

    if (!isAdminConfigured()) {
      return NextResponse.json({ message: "Firebase Admin isn't configured yet." }, { status: 503 });
    }

    const db = adminDb();

    const callerDoc = await db.collection("users").doc(caller.uid).get();
    const role = callerDoc.data()?.role || "customer";
    if (!["marketing", "manager", "admin", "super_admin"].includes(role)) {
      return NextResponse.json({ message: "Staff access required." }, { status: 403 });
    }

    const body = await req.json();
    const { code, type, value, usageLimit, expiresAt } = body;

    if (!code || !value) {
      return NextResponse.json({ message: "Code and value are required." }, { status: 400 });
    }

    const cleanCode = String(code).trim().toUpperCase();
    const couponRef = db.collection("coupons").doc(cleanCode);

    await couponRef.set({
      code: cleanCode,
      type: type === "fixed" ? "fixed" : "percentage",
      value: Number(value),
      usageLimit: Number(usageLimit) || 100,
      timesUsed: 0,
      status: "active",
      expiresAt: expiresAt || "2026-12-31",
      createdAt: new Date().toISOString(),
      createdBy: caller.uid,
    });

    await writeAuditLog({
      action: "coupon_created",
      actorUid: caller.uid,
      targetId: cleanCode,
      targetType: "coupon",
      metadata: { type, value },
    });

    return NextResponse.json({ ok: true, code: cleanCode });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    console.error("Admin create coupon error:", err);
    return NextResponse.json({ message: "Failed to create coupon." }, { status: 500 });
  }
}

// DELETE /api/admin/coupons?code=...
export async function DELETE(req: NextRequest) {
  try {
    const caller = await requireUser(req);

    if (!isAdminConfigured()) {
      return NextResponse.json({ message: "Firebase Admin isn't configured yet." }, { status: 503 });
    }

    const db = adminDb();

    const callerDoc = await db.collection("users").doc(caller.uid).get();
    const role = callerDoc.data()?.role || "customer";
    if (!["marketing", "manager", "admin", "super_admin"].includes(role)) {
      return NextResponse.json({ message: "Staff access required." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code")?.trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ message: "Coupon code is required." }, { status: 400 });
    }

    await db.collection("coupons").doc(code).delete();

    await writeAuditLog({
      action: "coupon_deleted",
      actorUid: caller.uid,
      targetId: code,
      targetType: "coupon",
    });

    return NextResponse.json({ ok: true, code });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    console.error("Admin delete coupon error:", err);
    return NextResponse.json({ message: "Failed to delete coupon." }, { status: 500 });
  }
}
