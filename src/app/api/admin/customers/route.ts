import { NextRequest, NextResponse } from "next/server";
import { adminDb, adminAuth, isAdminConfigured } from "@/lib/firebase/admin";
import { requireStaff, UnauthenticatedError, ForbiddenError } from "@/lib/server/auth";
import { writeAuditLog } from "@/lib/server/audit";

// GET /api/admin/customers
export async function GET(req: NextRequest) {
  try {
    await requireStaff(req);

    if (!isAdminConfigured()) {
      return NextResponse.json({ customers: [], connected: false });
    }

    const db = adminDb();
    const [usersSnap, ordersSnap] = await Promise.all([
      db.collection("users").get(),
      db.collection("orders").get(),
    ]);

    const orderStats: Record<string, { count: number; spent: number }> = {};
    for (const doc of ordersSnap.docs) {
      const data = doc.data();
      const userId = data.userId || data.customer?.email;
      if (userId) {
        if (!orderStats[userId]) orderStats[userId] = { count: 0, spent: 0 };
        orderStats[userId].count += 1;
        if (data.status === "paid") {
          orderStats[userId].spent += Number(data.total) || 0;
        }
      }
    }

    const customers = usersSnap.docs.map((doc) => {
      const data = doc.data();
      const stats = orderStats[doc.id] || orderStats[data.email] || { count: 0, spent: 0 };
      return {
        uid: doc.id,
        name: data.displayName || data.name || "Customer",
        email: data.email || "No email",
        role: data.role || "customer",
        disabled: Boolean(data.disabled),
        orders: stats.count,
        totalSpent: stats.spent,
        joined: data.createdAt?.toDate ? data.createdAt.toDate().toISOString().slice(0, 10) : "",
      };
    });

    return NextResponse.json({ customers, connected: true });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ message: err.message }, { status: 403 });
    }
    console.error("Admin customers error:", err);
    return NextResponse.json({ message: "Failed to load customers." }, { status: 500 });
  }
}

// PATCH /api/admin/customers
// Body: { uid, disabled?, role? }
// Disabling accounts and changing roles are sensitive enough that only
// admin/super_admin (not every staff role) may do it — mirrors
// /api/admin/users/[uid]/role, which this could arguably delegate to, but
// is kept self-contained here since it also handles account disable.
export async function PATCH(req: NextRequest) {
  try {
    const caller = await requireStaff(req);
    if (!["admin", "super_admin"].includes(caller.role)) {
      return NextResponse.json({ message: "Admin access required." }, { status: 403 });
    }

    if (!isAdminConfigured()) {
      return NextResponse.json(
        { message: "Firebase Admin isn't configured yet — see DEPLOYMENT.md." },
        { status: 503 }
      );
    }

    const db = adminDb();
    const body = await req.json();
    const { uid, disabled, role: newRole } = body;

    if (!uid) {
      return NextResponse.json({ message: "User uid is required." }, { status: 400 });
    }
    if (uid === caller.uid && (typeof disabled === "boolean" || newRole)) {
      return NextResponse.json({ message: "You can't change your own role or disable your own account." }, { status: 400 });
    }

    const userRef = db.collection("users").doc(uid);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (typeof disabled === "boolean") {
      updates.disabled = disabled;
      await adminAuth().updateUser(uid, { disabled });
    }
    if (newRole) {
      updates.role = newRole;
      await adminAuth().setCustomUserClaims(uid, { role: newRole });
    }

    await userRef.update(updates);

    await writeAuditLog({
      action: newRole ? "role_change" : "customer_account_updated",
      actorUid: caller.uid,
      targetId: uid,
      targetType: "user",
      metadata: updates,
    });

    return NextResponse.json({ ok: true, uid, updates });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ message: err.message }, { status: 403 });
    }
    console.error("Admin update customer error:", err);
    return NextResponse.json({ message: "Failed to update customer." }, { status: 500 });
  }
}
