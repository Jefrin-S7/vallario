import { NextRequest, NextResponse } from "next/server";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { requireUser, UnauthenticatedError } from "@/lib/server/auth";

// GET /api/admin/audit-logs
export async function GET(req: NextRequest) {
  try {
    const caller = await requireUser(req);

    if (!isAdminConfigured()) {
      return NextResponse.json({ logs: [], connected: false });
    }

    const db = adminDb();

    const callerDoc = await db.collection("users").doc(caller.uid).get();
    const role = callerDoc.data()?.role || "customer";
    if (!["manager", "admin", "super_admin"].includes(role)) {
      return NextResponse.json({ message: "Staff access required." }, { status: 403 });
    }

    const snap = await db.collection("auditLogs").orderBy("createdAt", "desc").limit(100).get();
    const logs = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        action: data.action || "action",
        actor: data.actorUid || "system",
        target: data.targetId ? `${data.targetType || "target"}:${data.targetId}` : "-",
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      };
    });

    return NextResponse.json({ logs });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    console.error("Admin audit logs error:", err);
    return NextResponse.json({ message: "Failed to load audit logs." }, { status: 500 });
  }
}
