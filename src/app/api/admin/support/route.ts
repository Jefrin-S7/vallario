import { NextRequest, NextResponse } from "next/server";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { requireUser, UnauthenticatedError } from "@/lib/server/auth";

// GET /api/admin/support
export async function GET(req: NextRequest) {
  try {
    const caller = await requireUser(req);

    if (!isAdminConfigured()) {
      return NextResponse.json({ tickets: [], connected: false });
    }

    const db = adminDb();

    const callerDoc = await db.collection("users").doc(caller.uid).get();
    const role = callerDoc.data()?.role || "customer";
    if (!["support", "manager", "admin", "super_admin"].includes(role)) {
      return NextResponse.json({ message: "Staff access required." }, { status: 403 });
    }

    const snap = await db.collection("supportTickets").orderBy("createdAt", "desc").limit(50).get();
    const tickets = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ tickets });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    console.error("Admin support error:", err);
    return NextResponse.json({ message: "Failed to load support tickets." }, { status: 500 });
  }
}

// PATCH /api/admin/support
export async function PATCH(req: NextRequest) {
  try {
    const caller = await requireUser(req);

    if (!isAdminConfigured()) {
      return NextResponse.json({ message: "Firebase Admin isn't configured yet." }, { status: 503 });
    }

    const db = adminDb();

    const callerDoc = await db.collection("users").doc(caller.uid).get();
    const role = callerDoc.data()?.role || "customer";
    if (!["support", "manager", "admin", "super_admin"].includes(role)) {
      return NextResponse.json({ message: "Staff access required." }, { status: 403 });
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ message: "id and status are required." }, { status: 400 });
    }

    await db.collection("supportTickets").doc(id).update({
      status,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ ok: true, id, status });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    console.error("Admin update support ticket error:", err);
    return NextResponse.json({ message: "Failed to update ticket." }, { status: 500 });
  }
}
