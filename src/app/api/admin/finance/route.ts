import { NextRequest, NextResponse } from "next/server";
import { adminDb, isAdminConfigured } from "@/lib/firebase/admin";
import { requireUser, UnauthenticatedError } from "@/lib/server/auth";

// GET /api/admin/finance
export async function GET(req: NextRequest) {
  try {
    const caller = await requireUser(req);

    if (!isAdminConfigured()) {
      return NextResponse.json({ finance: null, connected: false });
    }

    const db = adminDb();

    const callerDoc = await db.collection("users").doc(caller.uid).get();
    const role = callerDoc.data()?.role || "customer";
    if (!["finance", "manager", "admin", "super_admin"].includes(role)) {
      return NextResponse.json({ message: "Staff access required." }, { status: 403 });
    }

    const snap = await db.collection("orders").get();

    let grossRevenue = 0;
    let refunds = 0;
    let cashfreeRevenue = 0;
    let paypalRevenue = 0;
    const discounts = 0;
    const taxes = 0;

    for (const doc of snap.docs) {
      const data = doc.data();
      const total = Number(data.total) || 0;
      if (data.status === "paid") {
        grossRevenue += total;
        if (data.provider === "cashfree") cashfreeRevenue += total;
        else if (data.provider === "paypal") paypalRevenue += total;
      } else if (data.status === "refunded") {
        refunds += total;
      }
    }

    const paymentFees = Math.round(grossRevenue * 0.029 * 100) / 100;
    const net = grossRevenue - discounts - refunds - paymentFees;

    return NextResponse.json({
      finance: {
        grossRevenue,
        discounts,
        refunds,
        taxes,
        paymentFees,
        netRevenue: net,
        cashfreeRevenue,
        paypalRevenue,
        totalOrders: snap.size,
      },
    });
  } catch (err) {
    if (err instanceof UnauthenticatedError) {
      return NextResponse.json({ message: err.message }, { status: 401 });
    }
    console.error("Admin finance error:", err);
    return NextResponse.json({ message: "Failed to load finance data." }, { status: 500 });
  }
}
