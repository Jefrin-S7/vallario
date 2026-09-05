import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { requireStaff, UnauthenticatedError, ForbiddenError } from "@/lib/server/auth";
import { writeAuditLog } from "@/lib/server/audit";

// GET /api/admin/orders
export async function GET(req: NextRequest) {
  try {
    await requireStaff(req);

    if (!isAdminConfigured()) {
      return NextResponse.json({ orders: [], connected: false });
    }

    const db = adminDb();
    const snap = await db.collection("orders").orderBy("createdAt", "desc").limit(50).get();
    const orders = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        customerName: data.customerName || data.customer?.name || "Customer",
        customerEmail: data.customerEmail || data.customer?.email || data.userId || "",
        items: Array.isArray(data.items)
          ? data.items.map((i: { name?: string; productId?: string }) => i.name || i.productId || "Product")
          : [],
        total: Number(data.total) || 0,
        provider: data.provider || "cashfree",
        status: data.status || "pending",
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
      };
    });

    return NextResponse.json({ orders, connected: true });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ message: err.message }, { status: 403 });
    }
    console.error("Admin orders error:", err);
    return NextResponse.json({ message: "Failed to load orders." }, { status: 500 });
  }
}

// PATCH /api/admin/orders
// Body: { orderId, status }
// Note: this only changes the status label — it does NOT grant/revoke
// entitlements. Real "paid" transitions happen via the verified payment
// webhooks (src/app/api/payments/*/webhook); this exists for corrections
// (e.g. marking a stuck order "cancelled"), not as a payment bypass.
export async function PATCH(req: NextRequest) {
  try {
    const caller = await requireStaff(req);
    if (!["sales", "manager", "admin", "super_admin"].includes(caller.role)) {
      return NextResponse.json({ message: "Access required." }, { status: 403 });
    }

    if (!isAdminConfigured()) {
      return NextResponse.json(
        { message: "Firebase Admin isn't configured yet — see DEPLOYMENT.md." },
        { status: 503 }
      );
    }

    const db = adminDb();
    const body = await req.json();
    const { orderId, status } = body;

    if (!orderId || !status) {
      return NextResponse.json({ message: "orderId and status are required." }, { status: 400 });
    }

    const validStatuses = ["pending", "paid", "refunded", "cancelled", "failed"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid order status." }, { status: 400 });
    }

    const orderRef = db.collection("orders").doc(orderId);
    const snap = await orderRef.get();
    if (!snap.exists) {
      return NextResponse.json({ message: "Order not found." }, { status: 404 });
    }

    const prevStatus = snap.data()?.status;
    await orderRef.update({ status, updatedAt: FieldValue.serverTimestamp(), updatedBy: caller.uid });

    await writeAuditLog({
      action: "order_status_updated",
      actorUid: caller.uid,
      targetId: orderId,
      targetType: "order",
      metadata: { from: prevStatus, to: status },
    });

    return NextResponse.json({ ok: true, orderId, status });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    if (err instanceof ForbiddenError) {
      return NextResponse.json({ message: err.message }, { status: 403 });
    }
    console.error("Admin update order error:", err);
    return NextResponse.json({ message: "Failed to update order status." }, { status: 500 });
  }
}
