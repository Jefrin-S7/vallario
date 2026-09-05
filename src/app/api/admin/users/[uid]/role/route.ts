import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { requireUser, UnauthenticatedError } from "@/lib/server/auth";
import { writeAuditLog } from "@/lib/server/audit";

const STAFF_ROLES = [
  "customer",
  "support",
  "editor",
  "sales",
  "finance",
  "inventory_manager",
  "manager",
  "admin",
  "super_admin",
] as const;

// POST /api/admin/users/{uid}/role
// Headers: Authorization: Bearer <Firebase ID token belonging to an admin/super_admin>
// Body: { role: string }
//
// The only path by which a user's role ever changes after account creation.
// Updates Firestore and the Auth custom claim in the same request (so
// Storage rules stay in sync — Storage rules can't read Firestore), and
// writes an audit log entry. This replaces what would otherwise be a
// Firestore `onUpdate` trigger, so it runs free on Vercel instead of
// requiring Firebase's paid Blaze plan.
export async function POST(req: NextRequest, { params }: { params: Promise<{ uid: string }> }) {
  try {
    const caller = await requireUser(req);
    const { uid: targetUid } = await params;

    const callerDoc = await adminDb().collection("users").doc(caller.uid).get();
    const callerRole = callerDoc.data()?.role;
    if (!["admin", "super_admin"].includes(callerRole)) {
      return NextResponse.json({ message: "Admin access required." }, { status: 403 });
    }

    const body = await req.json();
    const newRole = body.role;
    if (!STAFF_ROLES.includes(newRole)) {
      return NextResponse.json({ message: "Invalid role." }, { status: 400 });
    }

    const targetRef = adminDb().collection("users").doc(targetUid);
    const targetSnap = await targetRef.get();
    if (!targetSnap.exists) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }
    const previousRole = targetSnap.data()?.role;

    await targetRef.update({
      role: newRole,
      lastModifiedBy: caller.uid,
      updatedAt: FieldValue.serverTimestamp(),
    });
    await adminAuth().setCustomUserClaims(targetUid, { role: newRole });

    await writeAuditLog({
      action: "role_change",
      actorUid: caller.uid,
      targetId: targetUid,
      targetType: "user",
      metadata: { from: previousRole, to: newRole },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    console.error(err);
    return NextResponse.json({ message: "Could not update role." }, { status: 500 });
  }
}
